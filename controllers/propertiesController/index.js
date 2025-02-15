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
        property_type: propertyObj.property_type.length
            ? propertyObj.property_type.trim() + "%"
            : "",
        city: propertyObj.city.length ? propertyObj.city.trim() + "%" : "",
    };

    // creo un array fitrato senza valori falsy a partire dai values di propertyObj
    const propertyArray = Object.values(propertyObj).filter((val) => {
        if (!isNaN(val) && Number(val) > 0) {
            return true;
        }
        if (typeof val === "string" && val.length && val !== "0") {
            return true;
        }
        return false;
    });
    console.log(propertyArray);
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
