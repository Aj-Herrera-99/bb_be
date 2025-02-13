const indexPropertyQuery = `
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
    WHERE p.n_bedrooms >= ?
        AND p.n_bathrooms >= ?
        AND p.n_beds >= ?
        AND p.square_meters >= ?
    GROUP BY p.id;
`;

const showPropertyQuery = ` 
    SELECT * FROM properties 
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

module.exports = {
    indexPropertyQuery,
    showPropertyQuery,
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
};
