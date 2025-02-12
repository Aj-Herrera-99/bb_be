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
        // entra qui se non ce stato upload di file immagine
        if (!req.file) {
            return res
                .status(201)
                .json({ success: true, message: "Property created" });
        }
        // prossimo middleware: storeImage
        next();
    });
};

module.exports = store;
