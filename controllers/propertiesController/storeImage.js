const path = require("path");
const connection = require("../../data/db");
const { moveFileAsync } = require("../../utils/utils");
const {
    storePropertyShowLastProperty,
    storePropertyStoreImg,
} = require("../../sql/queries");

const storeImage = (req, res) => {
    console.log("StoreImage");

    connection.query(storePropertyShowLastProperty, (err, result) => {
        if (err || result.length === 0) {
            console.error("Database query error:", err);
            return res
                .status(500)
                .json({ error: "Property not found or database query failed" });
        }

        const { id } = result[0];
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(201).json({
                success: true,
                message: "Property created without images",
                property: result[0],
            });
        }

        console.log("Starting n.", files.length, "files");
        let processedFiles = 0;

        files.forEach((file) => {
            connection.query(
                storePropertyStoreImg,
                [id, `/${file.originalname}`],
                (err) => {
                    if (err) {
                        console.error("Error storing image reference:", err);
                        return res
                            .status(500)
                            .json({ error: "Failed to store image reference" });
                    }

                    // path finder
                    const rootPath = path.resolve(__dirname, "../../");
                    const oldPath = path.join(
                        rootPath,
                        "public",
                        "uploads",
                        file.originalname
                    );
                    const newPath = path.join(
                        rootPath,
                        "public",
                        "images",
                        id.toString(),
                        file.originalname
                    );

                    console.log("Moving file from:", oldPath);
                    console.log("Moving file to:", newPath);

                    moveFileAsync(oldPath, newPath);
                }
            );
            processedFiles++;
        });
        if (processedFiles === files.length) {
            console.log("All files processed successfully");
            return res.status(201).json({
                success: true,
                message: "Property and images created successfully",
                property: result[0],
            });
        } else {
            console.log("Some files failed processing");
            return res.status(201).json({
                success: true,
                message:
                    "Property created successfully, some images are corrupted",
                property: result[0],
            });
        }
    });
};

module.exports = storeImage;
