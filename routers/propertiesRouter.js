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
router.post("/", upload.single("file"), store);

// destroy
router.delete("/:id", destroy);

module.exports = router;
