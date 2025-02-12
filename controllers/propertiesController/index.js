const connection = require("../../data/db");
const { indexPropertyQuery } = require("../../sql/queries");

const defaultPropertyObj = {
    n_bedrooms: null,
    n_bathrooms: null,
    n_beds: null,
    square_meters: null,
};

const index = (req, res) => {
    // spread query params con propertyObj (valori default)
    const propertyObj = { ...defaultPropertyObj, ...req.query };
    // creo un array a partire dai values di propertyObj
    const propertyArray = Object.values(propertyObj).map((val) => val);
    // per i valori null converti in 0, per gli altri gli fai un parseInt
    for (let i = 0; i < propertyArray.length; i++) {
        if (propertyArray[i] !== null) {
            propertyArray[i] = parseInt(propertyArray[i]);
        } else {
            propertyArray[i] = 0;
        }
    }
    // query: properties (con filtro)
    connection.query(indexPropertyQuery, propertyArray, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        }

        results.forEach((result) => {
            const imgEndpoints = result.img_endpoints?.split(",");
            if (imgEndpoints) {
                result.img_endpoints = imgEndpoints;
            } else {
                result.img_endpoints = [];
            }
        });
        // risposta con successo
        res.json(results);
    });
};

module.exports = index;
