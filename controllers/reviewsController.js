const connection = require("../data/db");

const index = (req, res) => {
    // prepariamo la query
    const sql = "SELECT * FROM reviews";
    // eseguiamo la query!
    connection.query(sql, (err, results) => {
        if (err)
            return res.status(500).json({ error: "Database query failed" });
        res.json({
            success: true,
            total_res: results.length,
            results,
        });
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
        res.json({
            success: true,
            total_res: reviewsResults.length,
            results: reviewsResults,
        });
    });
};

const store = (req, res) => {
    const review = req.body;

    // Controlla se il body è vuoto
    if (!review) {
        return res.status(400).json({ success: false, message: "Bad Request" });
    }
    console.log(review);

    // Validazione dei campi della review
    if (
        !isNaN(review.property_id) &&
        typeof review.title === "string" &&
        review.title.length > 0 &&
        typeof review.description === "string" &&
        review.description.length > 0
    ) {
        console.log("Validazione passata");

        // Prepariamo la query per l'aggiunta di una nuova review
        const sql = `
            INSERT INTO reviews (user_id, property_id, title, description)
            VALUES (?, ?, ?, ?);
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
                if (err) {
                    // Risposta in caso di errore nella query
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Database query failed",
                    });
                }

                // Risposta in caso di successo
                return res
                    .status(201)
                    .json({
                        success: true,
                        message: "review created successfully",
                        review,
                    });
            }
        );

        // Fermiamo l'esecuzione qui dopo aver avviato la query asincrona
        return;
    }

    // Risposta in caso di validazione fallita
    return res.status(400).json({
        success: false,
        message: "Bad Request: Validazione fallita",
    });
};

const destroy = (req, res) => {
    // recuperiamo l'id dall' URL
    const { id } = req.params;
    //Eliminiamo il post dal blog
    connection.query("DELETE FROM reviews WHERE id = ?", [id], (err) => {
        if (err)
            return res.status(500).json({ error: "Failed to delete post" });
        res.sendStatus(204);
    });
};

module.exports = { index, destroy, show, store };
