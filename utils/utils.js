const fs = require("fs");
const path = require("path");

function moveFileAsync(oldPath, newPath) {
    fs.mkdir(path.dirname(newPath), { recursive: true }, (err) => {
        if (err) {
            console.error("Errore nella creazione della cartella:", err);
            return;
        }

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                console.error("Errore nello spostamento del file:", err);
            } else {
                console.log("File spostato con successo!");
            }
        });
    });
}

function validateProperty(propertyObj) {
    const {
        title,
        description,
        n_bedrooms,
        n_bathrooms,
        n_beds,
        square_meters,
        address,
        zipcode,
        city,
        property_type,
    } = propertyObj;
    console.log(property_type)
    const errors = [];
    if (!title || !title.trim().length)
        errors.push("Il titolo dell'inserzione non può essere vuoto!");
    if (!address || !address.trim().length)
        errors.push("L'indirizzo non può essere vuoto!");
    if (!zipcode || (!isNaN(zipcode) && Number(zipcode) <= 0) || !zipcode.trim().length)
        errors.push("Il codice postale non può essere vuoto o negativo!");
    if (!property_type || !property_type.trim().length)
        errors.push("Il tipo di proprietà non può essere vuoto!");
    if (!city || !city.trim().length)
        errors.push("La città non può essere vuota!");
    if (n_bedrooms && n_bedrooms <= 0)
        errors.push("Il numero delle camere da letto non può essere negativo!");
    if (n_bathrooms && n_bathrooms <= 0)
        errors.push("Il numero dei bagni non può essere negativo!");
    if (n_beds && n_beds <= 0)
        errors.push("Il numero dei letti non può essere negativo!");
    if (square_meters && square_meters <= 0)
        errors.push("La metratura non può essere negativa!");
    return errors;
}

module.exports = { moveFileAsync, validateProperty };
