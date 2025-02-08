const express = require("express");
const router = express.Router();
const { index, destroy, show } = require("../controllers/reviewsController");

// index
router.get("/", index);

// show
router.get("/:id", show);

// destroy
router.delete("/:id", destroy);

module.exports = router;
