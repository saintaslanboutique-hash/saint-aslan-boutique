const Accessory = require('../model/accessory.model');

const getAccessoryHandler = async (req, res) => {
    try {
        const accessories = await Accessory.find();
        res.status(200).json({ data: accessories });
    } catch (error) {
        console.error('Error getting accessories', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const postAccessoryHandler = async (req, res) => {
    try {
        const { name, price, description, image, category, quantity } = req.body;

        if (!name || !price || !description || !category || !quantity) {
            return res.status(400).json({ message: 'Name, price, description, and category are required' });
        }

        const accessory = await Accessory.create({ name, price, description, image, category, quantity });
        res.status(201).json({ data: accessory });
    } catch (error) {
        console.error('Error creating accessory', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getAccessoryByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const accessory = await Accessory.findById(id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }
        res.status(200).json({ data: accessory });
    } catch (error) {
        console.error('Error getting accessory by id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const patchAccessoryHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, price, description, image, category, quantity } = req.body;
        
        if (!name || !price || !description || !category || !quantity) {
            return res.status(400).json({ message: 'Name, price, description, and category are required' });
        }

        const accessory = await Accessory.findByIdAndUpdate(id, { name, price, description, image, category, quantity }, { new: true });
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }
        res.status(200).json({ data: accessory });
    } catch (error) {
        console.error('Error updating accessory', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const deleteAccessoryHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const accessory = await Accessory.findByIdAndDelete(id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accessory not found' });
        }
        res.status(200).json({ message: 'Accessory deleted successfully' });
    } catch (error) {
        console.error('Error deleting accessory', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const sortAccessoriesHandler = async (req, res) => {
    try {
        const { sortBy } = req.query;
        
        // Map sortBy values to MongoDB sort objects
        let sortObject = {};
        switch (sortBy) {
            case 'latest':
                sortObject = { createdAt: -1 }; // newest first
                break;
            case 'price-low':
                sortObject = { price: 1 }; // ascending
                break;
            case 'price-high':
                sortObject = { price: -1 }; // descending
                break;
            case 'name':
                sortObject = { name: 1 }; // A to Z
                break;
            default:
                sortObject = { createdAt: -1 }; // default to latest
        }
        
        const accessories = await Accessory.find().sort(sortObject);
        res.status(200).json({ data: accessories });
    } catch (error) {
        console.error('Error sorting accessories', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const searchAccessoriesHandler = async (req, res) => {
    try {
        const { search } = req.query;
        const accessories = await Accessory.find({ name: { $regex: search, $options: 'i' } });
        res.status(200).json({ data: accessories });
    } catch (error) {
        console.error('Error searching accessories', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getCategoryCountsHandler = async (req, res) => {
    try {
        const categories = ['earrings', 'necklaces', 'bracelets', 'rings', 'jewellery-sets'];
        const counts = await Promise.all(
            categories.map(async (category) => {
                const count = await Accessory.countDocuments({ category });
                return { category, count };
            })
        );
        
        const totalCount = await Accessory.countDocuments();
        
        res.status(200).json({ 
            data: {
                categories: counts,
                total: totalCount
            }
        });
    } catch (error) {
        console.error('Error getting category counts', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getAccessoriesByCategoryHandler = async (req, res) => {
    try {
        const { category } = req.params;
        const { sortBy } = req.query;
        
        let query = {};
        if (category !== 'all') {
            query.category = category;
        }
        
        // Map sortBy values to MongoDB sort objects
        let sortObject = {};
        switch (sortBy) {
            case 'latest':
                sortObject = { createdAt: -1 };
                break;
            case 'price-low':
                sortObject = { price: 1 };
                break;
            case 'price-high':
                sortObject = { price: -1 };
                break;
            case 'name':
                sortObject = { name: 1 };
                break;
            default:
                sortObject = { createdAt: -1 };
        }
        
        const accessories = await Accessory.find(query).sort(sortObject);
        res.status(200).json({ data: accessories });
    } catch (error) {
        console.error('Error getting accessories by category', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getAccessoryHandler,
    postAccessoryHandler,
    getAccessoryByIdHandler,
    patchAccessoryHandler,
    deleteAccessoryHandler,
    sortAccessoriesHandler,
    searchAccessoriesHandler,
    getCategoryCountsHandler,
    getAccessoriesByCategoryHandler,
}

