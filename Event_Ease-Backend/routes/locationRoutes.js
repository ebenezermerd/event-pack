const express = require("express")
const router = express.Router()
const locationController = require("../controllers/locationController")

// Public routes
router.get("/", locationController.getLocations)
router.get("/popular-cities", locationController.getPopularCities)
router.get("/city/:city", locationController.getLocationsByCity)
router.get("/:id", locationController.getLocationById)

module.exports = router 