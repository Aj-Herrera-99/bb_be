const express = require("express");
const router = express.Router();
const {
    index,
    destroy,
    showByPropertyId,
    store,
    showNew,
} = require("../controllers/reviewsController");

// index
router.get("/", index);

// show by property id
router.get("/:id", showByPropertyId);

// show new
router.get("/:id/new", showNew);

// store
router.post("/", store);

// destroy
router.delete("/:id", destroy);

module.exports = router;
