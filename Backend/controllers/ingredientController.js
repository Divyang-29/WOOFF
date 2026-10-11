const {
  getAllIngredients,
  getIngredientByIdOrSlug,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../models/ingredientModel");
const { logAdminAction } = require("../services/auditService");

// GET /api/ingredients (Public)
const getAllIngredientsHandler = async (req, res) => {
  try {
    const onlyActive = req.query.all !== "true";
    const ingredients = await getAllIngredients(onlyActive);
    return res.status(200).json({
      success: true,
      count: ingredients.length,
      ingredients,
    });
  } catch (error) {
    console.error("Get Ingredients Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ingredients.",
    });
  }
};

// GET /api/ingredients/:idOrSlug (Public)
const getIngredientDetailsHandler = async (req, res) => {
  try {
    const ingredient = await getIngredientByIdOrSlug(req.params.idOrSlug);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }
    return res.status(200).json({
      success: true,
      ingredient,
    });
  } catch (error) {
    console.error("Get Ingredient Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ingredient details.",
    });
  }
};

// POST /api/ingredients (Admin Only)
const createIngredientHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Ingredient name and description are required.",
      });
    }

    const newIngredient = await createIngredient(req.body);

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "INGREDIENT_CREATED",
      entityType: "INGREDIENT",
      entityId: newIngredient.id,
      details: { name: newIngredient.name, slug: newIngredient.slug },
      req,
    });

    return res.status(201).json({
      success: true,
      message: `Ingredient "${newIngredient.name}" created successfully.`,
      ingredient: newIngredient,
    });
  } catch (error) {
    console.error("Create Ingredient Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create ingredient.",
    });
  }
};

// PUT /api/ingredients/:id (Admin Only)
const updateIngredientHandler = async (req, res) => {
  try {
    const updated = await updateIngredient(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found or no changes made.",
      });
    }

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "INGREDIENT_UPDATED",
      entityType: "INGREDIENT",
      entityId: updated.id,
      details: { name: updated.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Ingredient "${updated.name}" updated successfully.`,
      ingredient: updated,
    });
  } catch (error) {
    console.error("Update Ingredient Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update ingredient.",
    });
  }
};

// DELETE /api/ingredients/:id (Admin Only)
const deleteIngredientHandler = async (req, res) => {
  try {
    const deleted = await deleteIngredient(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "INGREDIENT_DELETED",
      entityType: "INGREDIENT",
      entityId: deleted.id,
      details: { name: deleted.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Ingredient "${deleted.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete Ingredient Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete ingredient.",
    });
  }
};

module.exports = {
  getAllIngredientsHandler,
  getIngredientDetailsHandler,
  createIngredientHandler,
  updateIngredientHandler,
  deleteIngredientHandler,
};
