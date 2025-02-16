const express = require("express");
const router = express.Router();
const { store } = require("../controllers/likesController");

// store
router.post("/", store);

module.exports = router;
