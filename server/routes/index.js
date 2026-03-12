const express = require("express");

const router = express.Router();

const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const cardRouter = require("./card.route");
// const accessoryRouter = require("./accessory.route");
// const bagRouter = require("./bag.route");
const orderRouter = require("./order.route");
const authMiddleware = require("../middleware/auth.middleware");
const productsRouter = require("./products.route");
const categoryRouter = require("./category.route");
const subcategoryRouter = require("./subcategory.route");

router.use("/api/auth", authRouter);
router.use("/api/users", authMiddleware, userRouter);
router.use("/cart", authMiddleware, cardRouter);
// router.use("/accessories", accessoryRouter);
// router.use("/bags", bagRouter);
router.use("/orders", authMiddleware, orderRouter);
router.use("/api/products", productsRouter);
router.use("/api/categories", categoryRouter);
router.use("/api/subcategories", subcategoryRouter);

module.exports = router;
