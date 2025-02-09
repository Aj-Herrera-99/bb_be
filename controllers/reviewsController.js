const connection = require("../data/db");

const index = (req, res) => {
    // prepariamo la query
    const sql = "SELECT * FROM reviews";
    // eseguiamo la query!
    connection.query(sql, (err, results) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        res.json(results);
    });
};

const show = (req, res) => {
    // recuperiamo l'id della proprieta dall' URL
    const id = req.params.id;
    // prepariamo la query per le reviews di una proprieta
    const reviewsSql = `
        SELECT * FROM reviews 
        WHERE property_id = ?
    `;
    // eseguiamo la prima query per le reviews
    connection.query(reviewsSql, [id], (err, reviewsResults) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        if (!reviewsResults.length) {
            return res.json([]);
        }
        res.json(reviewsResults);
    });
};

const store = (req, res) => {
    const review = req.body;
    if (!review)
        res.status(400).json({ success: false, message: "Bad Request" });

    // validazione campi della new review
    if (
        typeof review.property_id === "number" &&
        typeof review.title === "string" &&
        review.title.length &&
        typeof review.description === "string" &&
        review.description.length
    ) {
        // prepariamo la query per l'add di una nuova review
        const sql = `
            INSERT INTO reviews (user_id, property_id, title, description)
            VALUES 
            (?, ?, ?, ?);
        `;

        connection.query(
            sql,
            [
                review.user_id,
                review.property_id,
                review.title,
                review.description,
            ],
            (err, sqlResult) => {
                if (err)
                    return res
                        .status(500)
                        .json({ error: "Database query failed" });
                return res.status(201).json(review);
            }
        );
    }
    res.status(400).json({ success: false, message: "Bad Request" });
};

const destroy = (req, res) => {
    // // recuperiamo l'id dall' URL
    // const { id } = req.params;
    // //Eliminiamo il post dal blog
    // connection.query("DELETE FROM posts WHERE id = ?", [id], (err) => {
    //     if (err)
    //         return res.status(500).json({ error: "Failed to delete post" });
    //     res.sendStatus(204);
    // });
};

module.exports = { index, destroy, show, store };
