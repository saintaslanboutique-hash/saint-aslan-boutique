const express = require('express');
const router = express.Router();

const {
    getBagHandler,
    postBagHandler,
    getBagByIdHandler,
    patchBagHandler,
    deleteBagHandler,
    sortBagsHandler,
    searchBagsHandler,
    getCategoryCountsHandler,
    getBagsByCategoryHandler
} = require('../controllers/bag.controller');



router.route('/').get(getBagHandler).post(postBagHandler);
router.route('/sort').get(sortBagsHandler);
router.route('/search').get(searchBagsHandler);
router.route('/categories/counts').get(getCategoryCountsHandler);
router.route('/category/:category').get(getBagsByCategoryHandler);
router.route('/:id').get(getBagByIdHandler).put(patchBagHandler).delete(deleteBagHandler);
module.exports = router;

