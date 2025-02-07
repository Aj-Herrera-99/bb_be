const connection = require("../data/db");

const index = (req, res) => {
    // prepariamo la query
    const sql = "SELECT * FROM posts";
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
    const postSql = ` 
        SELECT posts.* FROM posts 
        WHERE id = ? 
    `;
    // prepariamo la query per i tags del post con join 
    const tagsSql = `
        SELECT tags.* FROM tags 
        JOIN post_tag ON tags.id = post_tag.tag_id
        JOIN posts ON post_tag.post_id = posts.id
        WHERE posts.id = ?
    `;
    // eseguiamo la prima query per il post
    connection.query(postSql, [id], (err, pizzaResults) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        if (pizzaResults.length === 0)
            return res.status(404).json({ error: "post not found" });

        // recuperiamo il post
        const post = pizzaResults[0];

        // se è andata bene, eseguaimo la seconda query per i tags
        connection.query(tagsSql, [id], (err, tagsResults) => {
            if (err)
                return res.status(500).json({ error: "Database query failed" });
            // aggiungiamo i tags del post
            post.tags = tagsResults;
            res.json(post);
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
