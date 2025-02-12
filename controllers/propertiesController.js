const path = require("path");
const connection = require("../data/db");
const fs = require("fs");

const index = (req, res) => {
    // prepariamo la query
    const sql = `
        SELECT p.id, p.user_id, p.title, p.description, p.n_bedrooms,
        p.n_bathrooms, p.n_beds, p.square_meters, p.address, p.zipcode, p.city, p.property_type,
        GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.id ASC) AS img_endpoints,
        COUNT(DISTINCT l.id) as total_likes
    FROM 
        properties AS p
    LEFT JOIN 
        property_images AS pi
    ON 
        p.id = pi.property_id
    LEFT JOIN
        likes AS l
    ON
        p.id = l.property_id
    GROUP BY 
        p.id;
    `;

    // eseguiamo la query!
    connection.query(sql, (err, results) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });

        results.forEach((res) => {
            imgEndpoints = res.img_endpoints?.split(",");
            if (imgEndpoints) {
                res.img_endpoints = imgEndpoints;
            } else {
                res.img_endpoints = [];
            }
        });
        res.json(results);
    });
};

const show = (req, res) => {
    // recuperiamo l'id dall' URL
    const id = req.params.id;
    // prepariamo la query per la property
    const propertySql = ` 
        SELECT * FROM properties 
        WHERE id = ? 
    `;
    // eseguiamo la prima query per la property
    connection.query(propertySql, [id], (err, propertyResults) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        if (propertyResults.length === 0)
            return res.status(404).json({ error: "Property not found" });

        // prepariamo la query per il conteggio dei likes
        const likesSql = `
            SELECT COUNT(id) AS total_likes FROM likes
            WHERE property_id = ?
        `;

        connection.query(likesSql, [id], (err, likesResults) => {
            if (err)
                return res.status(500).json({ error: "Database query failed" });
            if (likesResults.length === 0)
                return res.status(404).json({ error: "No likes found" });

            // prepariamo la query per i percorsi immagine
            const imagesSql = `
                SELECT * FROM property_images
                WHERE property_id = ?
            `;

            connection.query(imagesSql, [id], (err, imagesResults) => {
                if (err)
                    return res
                        .status(500)
                        .json({ error: "Database query failed" });

                // recuperiamo la property
                const property = propertyResults[0];
                // Agganciamo i likes e i percorsi immagine
                property.total_likes = likesResults[0].total_likes;
                property.img_endpoints = imagesResults.map((res) => res.url);
                res.json(property);
            });
        });
    });
};

const store = (req, res) => {
    if (!req.body)
        return res.status(400).json({ success: false, message: "Bad Request" });

    const property = req.body;

    // Destrutturazione new property
    const {
        user_id,
        title,
        description,
        n_bedrooms,
        n_bathrooms,
        n_beds,
        square_meters,
        address,
        address_number,
        zipcode,
        city,
        property_type,
    } = property;

    // Validazione campi della new property
    if (
        n_bedrooms <= 0 ||
        n_bathrooms <= 0 ||
        n_beds <= 0 ||
        square_meters <= 0 ||
        address_number < 0 ||
        zipcode < 0
    ) {
        return res.status(400).json({ success: false, message: "Bad Request" });
    }

    // prepariamo la query per l'add di una nuova property
    const propertySql = `
        INSERT INTO properties (user_id, title, description, n_bedrooms, n_bathrooms, n_beds, square_meters, address, address_number, zipcode, city,property_type)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    connection.query(
        propertySql,
        [
            user_id,
            title,
            description,
            n_bedrooms,
            n_bathrooms,
            n_beds,
            square_meters,
            address,
            address_number,
            zipcode,
            city,
            property_type,
        ],
        (err, _res) => {
            if (err) {
                return res
                    .status(500)
                    .json({ error: "Database query failed 1" });
            }
            // mi salvo la root
            const rootPath = path.resolve(__dirname, "..");
            let filePath, oldPath;
            if (req.file) {
                filePath = req.file.path.replaceAll(`\\`, "/");
                // oldPath contiene il percorso default (./uploads/...)
                oldPath = path.join(rootPath, filePath);
                filePath = filePath.replace("public/uploads", "");
            }
            // fermati se non ce upload di immagine
            if (!filePath) return res.status(201).json(property);

            // ricaviamo l'ultima proprieta creata
            const propertySql = `SELECT * 
                FROM properties
                ORDER BY id DESC
                LIMIT 1;
                `;
            connection.query(propertySql, (err, result) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Database query failed 1" });
                }
                if (result.length === 0) {
                    return res
                        .status(500)
                        .json({ error: "Property not found" });
                }
                // dall'ultima proprieta creata, mi ricavo l'id
                const { id } = result[0];
                // preparo la query per salvare la nuova url in corrispondenza dell'id della proprieta
                const propImageSql = `
                        INSERT INTO property_images(property_id, url)
                        VALUES (?, ?);
                    `;
                connection.query(propImageSql, [id, filePath], (err) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Database query failed" });
                    }
                    // la newPath ha l'id come sottocartella corrispondente
                    const newPath = path.join(
                        rootPath,
                        "public",
                        "images",
                        id.toString(),
                        filePath
                    );
                    console.log(newPath);
                    // funzione che mi sposta i file in modo asincrono
                    moveFileAsync(oldPath, newPath);
                    return res.status(201).json(result[0]);
                });
            });
        }
    );
    return;
};

const destroy = (req, res) => {
    // recuperiamo l'id dall' URL
    const { id } = req.params;
    //Eliminiamo il post dal blog
    connection.query("DELETE FROM properties WHERE id = ?", [id], (err) => {
        if (err)
            return res.status(500).json({ error: "Failed to delete post" });
        res.sendStatus(204);
    });
};

function moveFileAsync(oldPath, newPath) {
    fs.mkdir(path.dirname(newPath), { recursive: true }, (err) => {
        if (err) {
            console.error("Errore nella creazione della cartella:", err);
            return;
        }

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error("Errore nello spostamento del file:", err);
            } else {
                console.log("File spostato con successo!");
            }
        });
    });
}

module.exports = { index, destroy, show, store };
