const CustomError = require("../classes/CustomError");
const connection = require("../data/db");
const {
    showPropertyQuery,
    storeLikeQuery,
    showLikesByPropertyId,
} = require("../sql/queries");

const showByPropertyId = (req, res) => {
    const { property_id } = req.params;
    if (!property_id) throw new CustomError("Not found", 404);
    // query: likes in base a property_id
    connection.query(
        showLikesByPropertyId,
        [property_id],
        (err, likesResults) => {
            if (err) {
                return res.status(500).json({ error: "Database query failed" });
            }
            res.json({
                success: true,
                total_res: likesResults.length,
                results: likesResults,
            });
        }
    );
};

const store = (req, res) => {
    const { property_id } = req.body;
    if (!property_id) throw new CustomError("Not found", 404);
    // query: controllare se esiste una proprieta con id property_id
    connection.query(showPropertyQuery, [property_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        }
        if (!results.length)
            return res.status(404).json({ error: "Property not found" });
        // query: aggiungere like a property_id
        connection.query(storeLikeQuery, [property_id], (err) => {
            if (err) {
                return res.status(500).json({ error: "Database query failed" });
            }
            res.json({ success: true, message: "Like added" });
        });
    });
};

module.exports = { store, showByPropertyId };
