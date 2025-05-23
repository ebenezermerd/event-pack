const { Op } = require("sequelize")
const Event = require("../models/event")
const sequelize = require("../config/database")

// Get all locations
exports.getLocations = async (req, res) => {
  try {
    // Get all locations from events
    const locations = await Event.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("location")), "name"],
        "region"
      ],
      where: {
        location: { [Op.ne]: null }
      },
      raw: true
    })

    // Format locations
    const formattedLocations = locations.map(location => ({
      id: locations.indexOf(location) + 1, // Generate an ID based on index
      name: location.name,
      city: location.name,
      region: location.region || "Unknown"
    }))

    res.status(200).json({
      success: true,
      locations: formattedLocations
    })
  } catch (error) {
    console.error("Get locations error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get popular cities
exports.getPopularCities = async (req, res) => {
  try {
    // Get cities with event counts
    const cities = await Event.findAll({
      attributes: [
        "location",
        [sequelize.fn("COUNT", sequelize.col("id")), "eventCount"]
      ],
      where: {
        location: { [Op.ne]: null },
        approvalStatus: "approved"
      },
      group: ["location"],
      order: [[sequelize.literal("eventCount"), "DESC"]],
      limit: 10,
      raw: true
    })

    // Format cities
    const formattedCities = cities.map(city => ({
      city: city.location,
      country: "Ethiopia", // Default country
      eventCount: parseInt(city.eventCount)
    }))

    res.status(200).json({
      success: true,
      cities: formattedCities
    })
  } catch (error) {
    console.error("Get popular cities error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params

    // Since we don't have a separate locations table,
    // we're using the index-based ID from getLocations
    const locations = await Event.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("location")), "name"],
        "region"
      ],
      where: {
        location: { [Op.ne]: null }
      },
      raw: true
    })

    if (id > locations.length) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      })
    }

    const location = locations[id - 1]
    const formattedLocation = {
      id: parseInt(id),
      name: location.name,
      city: location.name,
      region: location.region || "Unknown",
      country: "Ethiopia" // Default country
    }

    res.status(200).json({
      success: true,
      location: formattedLocation
    })
  } catch (error) {
    console.error("Get location by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get locations by city
exports.getLocationsByCity = async (req, res) => {
  try {
    const { city } = req.params

    // Get locations matching the city name
    const locations = await Event.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("location")), "name"],
        "region"
      ],
      where: {
        location: { [Op.like]: `%${city}%` }
      },
      raw: true
    })

    // Format locations
    const formattedLocations = locations.map((location, index) => ({
      id: index + 1,
      name: location.name,
      city: location.name,
      region: location.region || "Unknown",
      country: "Ethiopia" // Default country
    }))

    res.status(200).json({
      success: true,
      locations: formattedLocations
    })
  } catch (error) {
    console.error("Get locations by city error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
} 