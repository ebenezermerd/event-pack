const { Op } = require("sequelize")
const Event = require("../models/event")
const sequelize = require("../config/database")

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    // Get all categories with count
    const categories = await Event.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      where: { 
        category: { [Op.ne]: null },
        approvalStatus: "approved" 
      },
      group: ["category"],
      order: [[sequelize.literal("count"), "DESC"]],
      raw: true
    })

    // Format categories
    const formattedCategories = categories.map((category, index) => ({
      id: index + 1,
      name: category.category,
      slug: category.category.toLowerCase().replace(/\s+/g, "-"),
      eventCount: parseInt(category.count)
    }))

    res.status(200).json({
      success: true,
      categories: formattedCategories
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params

    // Get all categories
    const categories = await Event.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      where: { 
        category: { [Op.ne]: null },
        approvalStatus: "approved" 
      },
      group: ["category"],
      order: [[sequelize.literal("count"), "DESC"]],
      raw: true
    })

    if (id > categories.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      })
    }

    const category = categories[id - 1]
    const formattedCategory = {
      id: parseInt(id),
      name: category.category,
      slug: category.category.toLowerCase().replace(/\s+/g, "-"),
      eventCount: parseInt(category.count)
    }

    res.status(200).json({
      success: true,
      category: formattedCategory
    })
  } catch (error) {
    console.error("Get category by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    // Get all categories
    const categories = await Event.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"]
      ],
      where: { 
        category: { [Op.ne]: null },
        approvalStatus: "approved" 
      },
      group: ["category"],
      raw: true
    })

    // Find the category with the matching slug
    const category = categories.find(
      cat => cat.category.toLowerCase().replace(/\s+/g, "-") === slug
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      })
    }

    const index = categories.indexOf(category)
    const formattedCategory = {
      id: index + 1,
      name: category.category,
      slug: slug,
      eventCount: parseInt(category.count)
    }

    res.status(200).json({
      success: true,
      category: formattedCategory
    })
  } catch (error) {
    console.error("Get category by slug error:", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
} 