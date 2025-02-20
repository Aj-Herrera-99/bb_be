const connection = require("../../data/db");
const {
    indexPropertiesQuery,
    getPropertiesCountQuery,
} = require("../../sql/queries");

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
    // query: properties (con filtro)
    connection.query(
        indexPropertiesQuery(propertyObj),
        propertyArray,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database query failed" });
            }
            console.log(getPropertiesCountQuery(propertyObj));
            console.log(propertyArray);
            // query per il conteggio totale
            connection.query(
                getPropertiesCountQuery(propertyObj),
                propertyArray,
                (err, countResults) => {
                    if (err) {
                        console.log(err);
                        return res
                            .status(500)
                            .json({ error: "Database query failed" });
                    }
                    const total_quantity = countResults[0].total_properties;
                    results.forEach((result) => {
                        const imgEndpoints = result.img_endpoints?.split(",");
                        if (imgEndpoints) {
                            result.img_endpoints = imgEndpoints;
                        } else {
                            result.img_endpoints = [];
                        }
                    });
                    // risposta con successo
                    res.json({
                        success: true,
                        total_quantity,
                        total_res: results.length,
                        results,
                    });
                }
            );
        }
    );
};

module.exports = index;
