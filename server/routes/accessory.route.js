const express = require('express');
const router = express.Router();

const {
    getAccessoryHandler,
    postAccessoryHandler,
    getAccessoryByIdHandler,
    patchAccessoryHandler,
    deleteAccessoryHandler,
    sortAccessoriesHandler,
    searchAccessoriesHandler,
    getCategoryCountsHandler,
    getAccessoriesByCategoryHandler
} = require('../controllers/accessory.controller');



router.route('/').get(getAccessoryHandler).post(postAccessoryHandler);
router.route('/sort').get(sortAccessoriesHandler);
router.route('/search').get(searchAccessoriesHandler);
router.route('/categories/counts').get(getCategoryCountsHandler);
router.route('/category/:category').get(getAccessoriesByCategoryHandler);
router.route('/:id').get(getAccessoryByIdHandler).put(patchAccessoryHandler).delete(deleteAccessoryHandler);
module.exports = router;

