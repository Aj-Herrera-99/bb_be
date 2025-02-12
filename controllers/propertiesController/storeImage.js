const path = require("path");
const connection = require("../../data/db");
const {
    storePropertyShowLastProperty,
    storePropertyStoreImg,
} = require("../../sql/queries");

const storeImage = (req, res) => {
    // prima query: ricavo l'ultima proprieta creata
    connection.query(storePropertyShowLastProperty, (err, result) => {
        if (err || result.length === 0) {
            return res
                .status(500)
                .json({ error: "Property not found or database query failed" });
        }
        // ricavo l'id dell'ultima proprieta creata
        const { id } = result[0];
        // ricavo il nome del file da req.file.path
        let fileEndpoint = req.file.path
            .replaceAll("\\", "/")
            .replace("public/uploads", "");
        // seconda query: image store in property_images
        connection.query(storePropertyStoreImg, [id, fileEndpoint], (err) => {
            if (err) {
                return res.status(500).json({ error: "Database query failed" });
            }
            // creo una var che contiene la root directory
            const rootPath = path.resolve(__dirname, "..");
            // ricavo la path originale del file
            const oldPath = path.join(rootPath, req.file.path);
            // creo la nuova path per il file dentro images in corrispondenza dell'id
            const newPath = path.join(
                rootPath,
                "public",
                "images",
                id.toString(),
                fileEndpoint
            );
            // funzione asincrona che mi sposta i file
            moveFileAsync(oldPath, newPath);
            // risposta con successo
            return res.status(201).json(result[0]);
        });
    });
};

module.exports = storeImage;
