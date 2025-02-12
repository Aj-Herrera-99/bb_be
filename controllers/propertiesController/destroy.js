const connection = require("../../data/db");
const { deletePropertyQuery } = require("../../sql/queries");

const destroy = (req, res) => {
    // recuperiamo l'id dall' URL
    const { id } = req.params;
    //Eliminiamo il post dal blog
    connection.query(deletePropertyQuery, [id], (err) => {
        if (err)
            return res.status(500).json({ error: "Failed to delete post" });
        res.sendStatus(204);
    });
};

module.exports = destroy;
