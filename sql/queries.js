function addPropertiesWhereClause(p) {
    // Creoun array di condizioni valide
    const conditions = [];

    if (p.n_bedrooms > 0) conditions.push("p.n_bedrooms >= ?");
    if (p.n_bathrooms > 0) conditions.push("p.n_bathrooms >= ?");
    if (p.n_beds > 0) conditions.push("p.n_beds >= ?");
    if (p.square_meters > 0) conditions.push("p.square_meters >= ?");
    if (p.property_type && p.property_type !== "%")
        conditions.push("LOWER(p.property_type) LIKE ?");
    if (p.city && p.city !== "%") conditions.push("LOWER(p.city) LIKE ?");

    // Se ci sono condizioni, unione con "AND", altrimenti stringa vuota
    return conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
}

const indexPropertiesQuery = (p) => {
    // paginazione
    const resultsPerPage = 4;
    let pagination = "";
    if (p?.page && p.page > 0) {
        pagination = `LIMIT ${resultsPerPage} OFFSET ${
            p.page * resultsPerPage - resultsPerPage
        }`;
    } else {
        pagination = `LIMIT ${resultsPerPage} OFFSET 0`;
    }

    const whereClause = addPropertiesWhereClause(p);

    return `
    SELECT p.id, p.user_id, p.title, p.description, p.n_bedrooms,
    p.n_bathrooms, p.n_beds, p.square_meters, p.address, p.zipcode,
    p.city, p.property_type,
    GROUP_CONCAT(DISTINCT pi.url ORDER BY pi.id ASC) AS img_endpoints,
    COUNT(DISTINCT l.id) as total_likes
    FROM properties AS p
    LEFT JOIN property_images AS pi
    ON p.id = pi.property_id
    LEFT JOIN likes AS l
    ON p.id = l.property_id
    ${whereClause}
    GROUP BY p.id
    ORDER BY total_likes DESC
    ${pagination}
    `;
};

const getPropertiesCountQuery = (p) => {
    const whereClause = addPropertiesWhereClause(p);

    return `
        SELECT COUNT(*) AS total_properties FROM properties AS p
        ${whereClause}
    `;
};

const showPropertyQuery = ` 
    SELECT * FROM properties 
    WHERE id = ? 
`;

const showPropertyUserQuery = `
    SELECT * FROM users
    WHERE id = ?
`;

const showPropertyLikesQuery = `
    SELECT COUNT(id) AS total_likes FROM likes
    WHERE property_id = ?
`;

const showPropertyImagesQuery = `
    SELECT * FROM property_images
    WHERE property_id = ?
`;

const storePropertyQuery = `
    INSERT INTO properties (user_id, title, description, n_bedrooms, n_bathrooms, n_beds, square_meters, address, zipcode, city, property_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

const storePropertyShowLastProperty = `
    SELECT * FROM properties ORDER BY id DESC LIMIT 1;
`;

const storePropertyStoreImg = `INSERT INTO property_images(property_id, url) VALUES (?, ?);`;

const deletePropertyQuery = "DELETE FROM properties WHERE id = ?";

// Email related queries
const checkIpContactQuery = `
    SELECT id, datetime 
    FROM contacts 
    WHERE contact_ip = ? AND property_id = ?
    ORDER BY datetime DESC 
    LIMIT 1
`;

const updateContactTimeQuery = `
    UPDATE contacts 
    SET datetime = NOW()
    WHERE id = ?
`;

const insertContactQuery = `
    INSERT INTO contacts (property_id, contact_ip, datetime)
    VALUES (?, ?, NOW())
`;

const getHostEmailQuery = `
    SELECT users.email 
    FROM users 
    JOIN properties ON properties.user_id = users.id 
    WHERE properties.id = ?
`;

const storeLikeQuery = `
    INSERT INTO likes (property_id, user_id)
    VALUES(?, NULL)
`;

const showLikesByPropertyId = `
    SELECT * FROM likes
    WHERE property_id = ?
`;

const getPropertyDetailsQuery = `
    SELECT p.*, GROUP_CONCAT(pi.url) as images
    FROM properties p
    LEFT JOIN property_images pi ON p.id = pi.property_id
    WHERE p.id = ?
    GROUP BY p.id
`;

const showRevsByPropertyIdQuery = (page) => {
    const reviewsPerPage = 4;
    let pagination = "";
    if (page) {
        pagination = `LIMIT ${reviewsPerPage} OFFSET ${
            page * reviewsPerPage - reviewsPerPage
        }`;
    } else {
        pagination = `LIMIT ${reviewsPerPage}  OFFSET 0 `;
    }

    return `SELECT * FROM reviews 
        WHERE property_id = ?
        ${pagination}
        `;
};

module.exports = {
    indexPropertiesQuery,
    getPropertiesCountQuery,
    showPropertyQuery,
    showPropertyUserQuery,
    showPropertyLikesQuery,
    showPropertyImagesQuery,
    storePropertyQuery,
    storePropertyShowLastProperty,
    storePropertyStoreImg,
    deletePropertyQuery,
    // Add new email queries
    checkIpContactQuery,
    updateContactTimeQuery,
    insertContactQuery,
    getHostEmailQuery,
    // likes queries
    storeLikeQuery,
    showLikesByPropertyId,
    getPropertyDetailsQuery,
    showRevsByPropertyIdQuery,
};
