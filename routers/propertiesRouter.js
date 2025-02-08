const express = require("express");
const router = express.Router();
const {
    index,
    destroy,
    store,
    show,
} = require("../controllers/propertiesController");

// index
router.get("/", index);

// show
router.get("/:id", show);

// store
router.post("/", store);

// destroy
router.delete("/:id", destroy);

module.exports = router;
