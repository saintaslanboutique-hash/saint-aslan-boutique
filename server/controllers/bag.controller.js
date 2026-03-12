const Bag = require('../model/bag.model');

const getBagHandler = async (req, res) => {
    try {
        const bags = await Bag.find();
        res.status(200).json({ data: bags });
    } catch (error) {
        console.error('Error getting bags', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const postBagHandler = async (req, res) => {
    try {
        const { name, price, description, image, category, quantity } = req.body;

        if (!name || !price || !description || !category || !quantity) {
            return res.status(400).json({ message: 'Name, price, description, and category are required' });
        }

        const bag = await Bag.create({ name, price, description, image, category, quantity });
        res.status(201).json({ data: bag });
    } catch (error) {
        console.error('Error creating bag', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getBagByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const bag = await Bag.findById(id);
        if (!bag) {
            return res.status(404).json({ message: 'Bag not found' });
        }
        res.status(200).json({ data: bag });
    } catch (error) {
        console.error('Error getting bag by id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const patchBagHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, price, description, image, category, quantity } = req.body;
        
        if (!name || !price || !description || !category || !quantity) {
            return res.status(400).json({ message: 'Name, price, description, and category are required' });
        }

        const bag = await Bag.findByIdAndUpdate(id, { name, price, description, image, category }, { new: true });
        if (!bag) {
            return res.status(404).json({ message: 'Bag not found' });
        }
        res.status(200).json({ data: bag });
    } catch (error) {
        console.error('Error updating bag', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const deleteBagHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const bag = await Bag.findByIdAndDelete(id);
        if (!bag) {
            return res.status(404).json({ message: 'Bag not found' });
        }
        res.status(200).json({ message: 'Bag deleted successfully' });
    } catch (error) {
        console.error('Error deleting bag', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const sortBagsHandler = async (req, res) => {
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
        
        const bags = await Bag.find().sort(sortObject);
        res.status(200).json({ data: bags });
    } catch (error) {
        console.error('Error sorting bags', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const searchBagsHandler = async (req, res) => {
    try {
        const { search } = req.query;
        const bags = await Bag.find({ name: { $regex: search, $options: 'i' } });
        res.status(200).json({ data: bags });
    } catch (error) {
        console.error('Error searching bags', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getCategoryCountsHandler = async (req, res) => {
    try {
        const categories = ['handbags', 'shoulder-bags', 'crossbody-bags', 'tote-bags', 'clutches'];
        const counts = await Promise.all(
            categories.map(async (category) => {
                const count = await Bag.countDocuments({ category });
                return { category, count };
            })
        );
        
        const totalCount = await Bag.countDocuments();
        
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

const getBagsByCategoryHandler = async (req, res) => {
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
        
        const bags = await Bag.find(query).sort(sortObject);
        res.status(200).json({ data: bags });
    } catch (error) {
        console.error('Error getting bags by category', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getBagHandler,
    postBagHandler,
    getBagByIdHandler,
    patchBagHandler,
    deleteBagHandler,
    sortBagsHandler,
    searchBagsHandler,
    getCategoryCountsHandler,
    getBagsByCategoryHandler,
}

