const express = require("express");
const router = express.Router();
// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files
const multer = require("multer");
// full control on storing uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

const index = require("../controllers/propertiesController/index");
const show = require("../controllers/propertiesController/show");
const store = require("../controllers/propertiesController/store");
const storeImage = require("../controllers/propertiesController/storeImage");
const destroy = require("../controllers/propertiesController/destroy");

// index
router.get("/", index);

// show
router.get("/:id", show);

// store multi images
router.post("/", upload.array('files', 7), store, storeImage);

// destroy
router.delete("/:id", destroy);

module.exports = router;
