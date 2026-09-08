const express = require('express');
const router = express.Router();
const { getAllHomeData, getMovieById, getCategoryItems } = require('../controllers/movieController');

router.get('/home', getAllHomeData);
router.get('/movies/:id', getMovieById);
router.get('/categories/:category', getCategoryItems);

module.exports = router;
