const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  addAddressHandler,
  getUserAddressesHandler,
  updateAddressHandler,
  setDefaultAddressHandler,
  deleteAddressHandler,
} = require("../controllers/addressController");

const router = express.Router();

// Protected user address routes
router.post("/", authMiddleware, addAddressHandler);
router.get("/", authMiddleware, getUserAddressesHandler);
router.put("/:id", authMiddleware, updateAddressHandler);
router.put("/:id/default", authMiddleware, setDefaultAddressHandler);
router.delete("/:id", authMiddleware, deleteAddressHandler);

module.exports = router;
