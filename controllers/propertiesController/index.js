const connection = require("../../data/db");
const { indexPropertiesQuery } = require("../../sql/queries");

const defaultPropertyObj = {
    n_bedrooms: 0,
    n_bathrooms: 0,
    n_beds: 0,
    square_meters: 0,
    property_type: "",
    city: "",
};

const index = (req, res) => {
    // spread query params con propertyObj (valori default)
    let propertyObj = { ...defaultPropertyObj, ...req.query };
    propertyObj = {
        ...propertyObj,
        property_type: propertyObj.property_type + "%",
        city: propertyObj.city + "%",
    };

    // creo un array fitrato senza valori falsy a partire dai values di propertyObj
    const propertyArray = Object.values(propertyObj).filter((val) => {
        if (!isNaN(val) && val > 0) return true;
        if (val && typeof val === "string") return true;
    });
    // query: properties (con filtro)
    connection.query(
        indexPropertiesQuery(propertyObj),
        propertyArray,
        (err, results) => {
            if (err) {
                console.log(err);
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
        }
    );
};

module.exports = index;
