const express = require("express");
const router = express.Router();
const { store, showByPropertyId } = require("../controllers/likesController");

// showByPropertyId
router.get("/:property_id", showByPropertyId);
// store
router.post("/", store);

module.exports = router;
