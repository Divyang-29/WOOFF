const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAllIngredientsHandler,
  getIngredientDetailsHandler,
  createIngredientHandler,
  updateIngredientHandler,
  deleteIngredientHandler,
} = require("../controllers/ingredientController");

const router = express.Router();

// Public routes
router.get("/", getAllIngredientsHandler);
router.get("/:idOrSlug", getIngredientDetailsHandler);

// Protected Admin CRUD routes
router.post("/", authMiddleware, adminMiddleware, createIngredientHandler);
router.put("/:id", authMiddleware, adminMiddleware, updateIngredientHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteIngredientHandler);

module.exports = router;
