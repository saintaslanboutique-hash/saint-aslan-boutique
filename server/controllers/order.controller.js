const mongoose = require("mongoose");
const Order = require("../model/order.model");
const User = require("../model/user.model");
const Product = require("../model/products.model");

const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

async function restoreInventoryForCancelledOrder(order) {
  for (const item of order.items) {
    const pid = item.product;
    if (item.variantId) {
      await Product.updateOne(
        { _id: pid, "variants._id": item.variantId },
        {
          $inc: {
            quantity: item.quantity,
            "variants.$.stock": item.quantity,
          },
        }
      );
    } else {
      await Product.findByIdAndUpdate(pid, {
        $inc: { quantity: item.quantity },
      });
    }
  }
}

const createOrderHandler = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    let calculatedTotalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: "Each item must have a valid product id" });
      }

      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "Each item must have a positive integer quantity" });
      }

      let variant = null;
      if (hasVariants) {
        if (!item.variantId || !mongoose.Types.ObjectId.isValid(item.variantId)) {
          return res.status(400).json({
            message: `Variant is required for product "${product.name.en}"`,
          });
        }
        variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(400).json({ message: "Variant not found for this product" });
        }
        if (variant.stock < qty) {
          return res.status(400).json({
            message: `Not enough stock for ${product.name.en} (${variant.color} / ${variant.size})`,
          });
        }
        if (product.quantity < qty) {
          return res.status(400).json({ message: `Not enough total stock for ${product.name.en}` });
        }
      } else {
        if (item.variantId) {
          return res.status(400).json({
            message: `Product "${product.name.en}" has no variants; do not send variantId`,
          });
        }
        if (product.quantity < qty) {
          return res.status(400).json({ message: `Not enough stock for ${product.name.en}` });
        }
      }

      const sale = product.sale != null ? product.sale : 0;
      const currentPrice = sale > 0 ? product.price * (1 - sale / 100) : product.price;
      const lineTotal = currentPrice * qty;
      calculatedTotalAmount += lineTotal;

      if (variant) {
        variant.stock -= qty;
      }
      product.quantity -= qty;

      const productData = {
        name: product.name,
        image: product.image,
        images: product.images,
      };
      if (variant) {
        productData.variant = { color: variant.color, size: variant.size };
      }

      processedItems.push({
        product: product._id,
        ...(variant && { variantId: variant._id }),
        productData,
        quantity: qty,
        price: roundMoney(currentPrice),
      });

      await product.save();
    }

    const order = await Order.create({
      user: req.user.userId,
      items: processedItems,
      totalAmount: roundMoney(calculatedTotalAmount),
      shippingAddress,
      paymentMethod: paymentMethod || "cash",
      notes: notes || "",
      status: "pending",
      paymentStatus: "unpaid",
    });

    await User.findByIdAndUpdate(req.user.userId, { cart: [] });

    await order.populate("user", "username email");
    res.status(201).json({ data: order });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserOrdersHandler = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("items.product");
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("getUserOrdersHandler", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPendingOrdersHandler = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("items.product");
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("getPendingOrdersHandler", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    const order = await Order.findById(id).populate("user", "username email").populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const isOwner = order.user._id
      ? order.user._id.toString() === req.user.userId
      : order.user.toString() === req.user.userId;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    console.error("getOrderByIdHandler", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllOrdersHandler = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "username email")
      .populate("items.product");
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("getAllOrdersHandler", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteOrderHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const isOwner = order.user.toString() === req.user.userId;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const restockable = ["pending", "processing"].includes(order.status);
    if (order.status !== "cancelled" && restockable) {
      await restoreInventoryForCancelledOrder(order);
      order.status = "cancelled";
      await order.save();
    } else if (order.status !== "cancelled") {
      order.status = "cancelled";
      await order.save();
    }

    res.status(200).json({ data: order });
  } catch (error) {
    console.error("deleteOrderHandler", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateOrderStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const isOwner = order.user.toString() === req.user.userId;

    if (!isAdmin && !isOwner) return res.status(403).json({ message: "Access denied" });

    const restockable = ["pending", "processing"].includes(order.status);
    if (status === "cancelled" && order.status !== "cancelled" && restockable) {
      await restoreInventoryForCancelledOrder(order);
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
};

module.exports = {
  createOrderHandler,
  getUserOrdersHandler,
  getPendingOrdersHandler,
  getOrderByIdHandler,
  getAllOrdersHandler,
  deleteOrderHandler,
  updateOrderStatusHandler,
};
