const connection = require("../../data/db");
const { storePropertyQuery } = require("../../sql/queries");
const { validateProperty } = require("../../utils/utils");

let defaultPropertyStoredObj = {
    user_id: null,
    title: null,
    description: null,
    n_bedrooms: null,
    n_bathrooms: null,
    n_beds: null,
    square_meters: null,
    address: null,
    zipcode: null,
    city: null,
    property_type: null,
};

const store = (req, res, next) => {
    console.log("Store middleware started");
    if (!req.body) {
        return res.status(400).json({ success: false, message: "Bad Request" });
    }
    // spread body params con defaultPropStoredObj(valori default)
    const propertyStoredObj = { ...defaultPropertyStoredObj, ...req.body };
    // validazione proprieta della property
    const validationErrors = validateProperty(propertyStoredObj);
    // entra qui se l'array degli errori non è vuoto
    if (validationErrors.length) {
        return res.status(400).json({
            success: false,
            message:
                validationErrors.length === 1
                    ? validationErrors[0]
                    : "Hai inserito campi multipli errati!",
        });
    }
    // creo un array a partire dai values di propertyStoredObj
    const propertyStoredArr = Object.values(propertyStoredObj).map(
        (val) => val
    );
    // query: property (insert into)
    connection.query(storePropertyQuery, propertyStoredArr, (err, _res) => {
        if (err) {
            return res.status(500).json({ error: "Database query failed" });
        }
        console.log("Store middleware - DB query completed");
        // Check if we have files
        if (!req.files || req.files.length === 0) {
            console.log("No files found in request");
            return res
                .status(201)
                .json({ success: true, message: "Property created" });
        }
        console.log("Calling next middleware (storeImage)");
        next();
    });
};

module.exports = store;
