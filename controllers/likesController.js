const CustomError = require("../classes/CustomError");
const connection = require("../data/db");
const { showPropertyQuery, storeLikeQuery } = require("../sql/queries");

const store = (req, res) => {
    console.log(req.body);
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

module.exports = { store };
