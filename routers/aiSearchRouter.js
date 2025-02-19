const express = require("express");
const router = express.Router();
const { searchChat } = require("../controllers/aiSearchController");

router.post("/search", searchChat);

module.exports = router; 