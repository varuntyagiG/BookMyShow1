const express = require('express');
const router = express.Router();
const {
  getAllHomeData,
  getMovieById,
  getCategoryItems,
  getPublicCities,
  getPublicCinemas,
  getPublicOffers
} = require('../controllers/movieController');

router.get('/home', getAllHomeData);
router.get('/movies', (req, res, next) => {
  req.params.category = 'movies';
  return getCategoryItems(req, res, next);
});
router.get('/movies/:id', getMovieById);
router.get('/categories/:category', getCategoryItems);
router.get('/cities', getPublicCities);
router.get('/cinemas', getPublicCinemas);
router.get('/offers', getPublicOffers);

module.exports = router;
