const connection = require("../data/db");

const index = (req, res) => {
    // prepariamo la query
    const sql = "SELECT * FROM properties";
    // eseguiamo la query!
    connection.query(sql, (err, results) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });

        res.json(results);
    });
};

const show = (req, res) => {
    // recuperiamo l'id dall' URL
    const id = req.params.id;
    // prepariamo la query per il post
    const propertySql = ` 
        SELECT * FROM properties 
        WHERE id = ? 
    `;
    // eseguiamo la prima query per il post
    connection.query(propertySql, [id], (err, propertyResults) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        if (propertyResults.length === 0)
            return res.status(404).json({ error: "post not found" });

        const likesSql = `
            SELECT COUNT(id) AS total_likes FROM likes
            WHERE property_id = ?
        `;

        connection.query(likesSql, [id], (err, likesResults) => {
            if (err)
                return res.status(500).json({ error: "Database query failed" });
            if (likesResults.length === 0)
                return res.status(404).json({ error: "post not found" });

            const imagesSql = `
                SELECT * FROM property_images
                WHERE property_id = ?
            `;

            connection.query(imagesSql, [id], (err, imagesResults) => {
                if (err)
                    return res
                        .status(500)
                        .json({ error: "Database query failed" });

                // recuperiamo il post
                const property = propertyResults[0];
                property.total_likes = likesResults[0].total_likes;
                property.img_endpoints = imagesResults.map((res) => res.url);
                res.json(property);
            });
        });
    });
};

const store = (req, res) => {
    const property = req.body
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

    if (
        !title.length ||
        !description.length ||
        !address.length ||
        !city.length ||
        !property_type.length
    ) {
        return res.status(400).json({ success: false, message: "Bad Request" });
    }


    if (
        (n_bedrooms <= 0,
        n_bathrooms <= 0,
        n_beds <= 0,
        square_meters <= 0,
        address_number <= 0,
        zipcode <= 0)
    ) {
        return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const sql = `
                    INSERT INTO properties (user_id, title, description, n_bedrooms, n_bathrooms, n_beds, square_meters, address, address_number, zipcode, city,property_type)
                    VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

    connection.query(
        sql,
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
        (err, sqlResult) => {
            if (err)
                return res.status(500).json({ error: "Database query failed" });
        }
    );

    res.status(201).json(property);
};

const destroy = (req, res) => {
    // recuperiamo l'id dall' URL
    const { id } = req.params;
    //Eliminiamo il post dal blog
    connection.query("DELETE FROM posts WHERE id = ?", [id], (err) => {
        if (err)
            return res.status(500).json({ error: "Failed to delete post" });
        res.sendStatus(204);
    });
};

module.exports = { index, destroy, show, store };
