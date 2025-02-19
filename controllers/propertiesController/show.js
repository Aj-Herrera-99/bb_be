const connection = require("../../data/db");
const {
    showPropertyQuery,
    showPropertyLikesQuery,
    showPropertyImagesQuery,
    showPropertyUserQuery,
} = require("../../sql/queries");

const show = (req, res) => {
    // recuperiamo l'id dall' URL
    const id = req.params.id;
    // prima query: property by id
    connection.query(showPropertyQuery, [id], (err, propertyResults) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        if (propertyResults.length === 0)
            return res.status(404).json({ error: "Property not found" });
        // recuperiamo la property dal risultato del db (sempre array)
        const property = propertyResults[0];
        if (property.user_id) {
            // query: recupero nome e cognome di user_id
            connection.query(
                showPropertyUserQuery,
                [property.user_id],
                (err, userResults) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ error: "Database query failed" });
                    }
                    if (userResults.length !== 0) {
                        const host = userResults[0]
                        property.first_name = host.first_name;
                        property.last_name = host.last_name
                    }
                }
            );
        }
        // seconda query: likes by property_id
        connection.query(showPropertyLikesQuery, [id], (err, likesResults) => {
            if (err)
                return res.status(500).json({ error: "Database query failed" });
            if (likesResults.length === 0) return res.json(property);
            // agganciamo i likes a property
            property.total_likes = likesResults[0].total_likes;
            // terza query: images by property_id
            connection.query(
                showPropertyImagesQuery,
                [id],
                (err, imagesResults) => {
                    if (err)
                        return res
                            .status(500)
                            .json({ error: "Database query failed" });
                    if (imagesResults.length === 0) return res.json(property);
                    // agganciamo i percorsi immagine a property
                    property.img_endpoints = imagesResults.map(
                        (res) => res.url
                    );
                    // risposta con successo
                    res.json({
                        success: true,
                        total_res: propertyResults.length,
                        results: propertyResults,
                    });
                }
            );
        });
    });
};

module.exports = show;
