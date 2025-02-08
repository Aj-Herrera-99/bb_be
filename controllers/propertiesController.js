const connection = require("../data/db");

const index = (req, res) => {
    // prepariamo la query
    const sql = "SELECT * FROM properties";
    // eseguiamo la query!
    connection.query(sql, (err, results) => {
        console.log(results)
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        res.json(results);
    });
};

const show = (req, res) => {
    // recuperiamo l'id dall' URL
    const id = req.params.id;
    // prepariamo la query per il post
    const postSql = ` 
        SELECT * FROM properties 
        WHERE id = ? 
    `;
    // eseguiamo la prima query per il post
    connection.query(postSql, [id], (err, propertyResults) => {
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

            // recuperiamo il post
            const property = propertyResults[0];
            property.total_likes = likesResults[0].total_likes;
            res.json(property);
        });
    });
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

module.exports = { index, destroy, show };
