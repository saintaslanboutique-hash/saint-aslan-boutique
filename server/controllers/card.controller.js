const mongoose = require("mongoose");
const userModel = require("../model/user.model");
const Product = require("../model/products.model");

function cartLineKey(productId, variantId) {
  const v = variantId ? String(variantId) : "";
  return `${String(productId)}:${v}`;
}

/**
 * Ensures cart line matches Product schema: variant required iff product has variants.
 */
async function validateProductVariantLine(productId, variantId) {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return { ok: false, message: "Invalid product id" };
  }
  const hasVariantInRequest =
    variantId !== undefined && variantId !== null && variantId !== "";

  if (hasVariantInRequest && !mongoose.Types.ObjectId.isValid(String(variantId))) {
    return { ok: false, message: "Invalid variantId" };
  }

  const product = await Product.findById(productId);
  if (!product) {
    return { ok: false, message: "Product not found" };
  }

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  if (hasVariants) {
    if (!hasVariantInRequest) {
      return { ok: false, message: "Variant is required for this product" };
    }
    const v = product.variants.id(variantId);
    if (!v) {
      return { ok: false, message: "Variant not found for this product" };
    }
  } else if (hasVariantInRequest) {
    return { ok: false, message: "This product has no variants" };
  }

  return { ok: true, variantId: hasVariantInRequest ? variantId : undefined };
}

const getCartHandler = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("cart");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ data: user.cart || [] });
  } catch (error) {
    console.error("Can't get cart", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCartHandler = async (req, res) => {
  try {
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: "Cart must be an array" });
    }

    for (const line of cart) {
      if (!line.product || !mongoose.Types.ObjectId.isValid(line.product)) {
        return res.status(400).json({ message: "Each cart item needs a valid product id" });
      }
      const check = await validateProductVariantLine(line.product, line.variantId);
      if (!check.ok) {
        return res.status(400).json({ message: check.message });
      }
    }

    const normalizedCart = cart.map((line) => {
      const hasV =
        line.variantId !== undefined &&
        line.variantId !== null &&
        line.variantId !== "";
      const entry = {
        product: line.product,
        quantity: line.quantity >= 1 ? line.quantity : 1,
        productData: line.productData ?? null,
      };
      if (hasV) entry.variantId = line.variantId;
      return entry;
    });

    const user = await userModel
      .findByIdAndUpdate(
        req.user.userId,
        { cart: normalizedCart, updatedAt: Date.now() },
        { new: true }
      )
      .select("-password");

    res.json({ data: user.cart });
  } catch (error) {
    console.error("Can't update cart", error);
    res.status(500).json({ message: "Server error" });
  }
};

const clearCartHandler = async (req, res) => {
  try {
    const user = await userModel
      .findByIdAndUpdate(
        req.user.userId,
        { cart: [], updatedAt: Date.now() },
        { new: true }
      )
      .select("cart");

    res.json({ data: user.cart });
  } catch (error) {
    console.error("Can't clear cart", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add a single item to the cart (or increment quantity if already present).
 * Body: { product, variantId?, quantity?, productData? }
 */
const addItemHandler = async (req, res) => {
  try {
    const { product, quantity = 1, productData, variantId } = req.body;

    if (!product) {
      return res.status(400).json({ message: "Product is required" });
    }

    const lineCheck = await validateProductVariantLine(product, variantId);
    if (!lineCheck.ok) {
      return res.status(400).json({ message: lineCheck.message });
    }

    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const key = cartLineKey(product, lineCheck.variantId);
    const cart = Array.isArray(user.cart) ? [...user.cart] : [];
    const existingIndex = cart.findIndex(
      (item) => cartLineKey(item.product, item.variantId) === key
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity =
        (cart[existingIndex].quantity || 1) + (quantity >= 1 ? quantity : 1);
      if (productData) cart[existingIndex].productData = productData;
    } else {
      const newLine = {
        product,
        quantity: quantity >= 1 ? quantity : 1,
        productData: productData || null,
      };
      if (lineCheck.variantId) {
        newLine.variantId = lineCheck.variantId;
      }
      cart.push(newLine);
    }

    const updated = await userModel
      .findByIdAndUpdate(
        req.user.userId,
        { cart, updatedAt: Date.now() },
        { new: true }
      )
      .select("cart");

    res.json({ data: updated.cart });
  } catch (error) {
    console.error("Can't add item to cart", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCartHandler,
  updateCartHandler,
  clearCartHandler,
  addItemHandler,
};
