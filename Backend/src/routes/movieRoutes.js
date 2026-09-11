const express = require('express');
const router = express.Router();
const {
  getAllHomeData,
  getMovieById,
  getCategoryItems,
  getPublicCities,
  getPublicOffers
} = require('../controllers/movieController');

router.get('/home', getAllHomeData);
router.get('/movies/:id', getMovieById);
router.get('/categories/:category', getCategoryItems);
router.get('/cities', getPublicCities);
router.get('/offers', getPublicOffers);

module.exports = router;
