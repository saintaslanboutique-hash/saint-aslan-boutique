const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        az: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        ru: {
            type: String,
            required: true,
        },
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        az: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        ru: {
            type: String,
            required: true,
        },
    },
    image: {
        type: String,
        required: false,
    },
    images:{
        type: [String],
        required: false,
    },
    colors:{
        type: [String],
        required: false,
    },
    sizes:{
        type: [String],
        required: false,
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;