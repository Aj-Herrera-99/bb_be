const connection = require("../../data/db");
const { deletePropertyQuery } = require("../../sql/queries");

const destroy = (req, res) => {
    // recuperiamo l'id dall' URL
    const { id } = req.params;
    //Eliminiamo il post dal blog
    connection.query(deletePropertyQuery, [id], (err, results) => {
        if (err)
            return res.status(500).json({ error: "Failed to delete post" });
        if(!results.length)
            return res.status(500).json({ error: "Property not found" });
        res.sendStatus(204);
    });
};

module.exports = destroy;
