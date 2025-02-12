const nodemailer = require("nodemailer");
const CustomError = require("../classes/CustomError");
const connection = require("../data/db.js");

// Create transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendEmail = async (req, res, next) => {
    try {
        const { propertyId, userMail, subject, text } = req.body;
        
        // Get IP address - handles both proxy and direct connections
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

        // Check if IP exists and last contact time
        const checkIpSql = `
            SELECT id, datetime 
            FROM contacts 
            WHERE contact_ip = ? AND property_id = ?
            ORDER BY datetime DESC 
            LIMIT 1
        `;

        const [ipResult] = await connection.promise().query(checkIpSql, [ip, propertyId]);

        if (ipResult.length > 0) {
            const lastDateTime = new Date(ipResult[0].datetime);
            const now = new Date();
            const hoursDiff = (now - lastDateTime) / (1000 * 60 * 60); // Convert to hours

            if (hoursDiff < 24) {
                throw new CustomError("Please wait 24 hours before sending another email", 429);
            }

            // Update record if more than 24 hours
            const updateTimeSql = `
                UPDATE contacts 
                SET datetime = NOW()
                WHERE id = ?
            `;
            await connection.promise().query(updateTimeSql, [ipResult[0].id]);
        } else {
            // Insert new contact record if IP not found
            const insertContactSql = `
                INSERT INTO contacts (property_id, contact_ip, datetime)
                VALUES (?, ?, NOW())
            `;
            await connection.promise().query(insertContactSql, [propertyId, ip]);
        }

        // Validate fields
        if (!propertyId || !subject || !userMail || !text) {
            throw new CustomError("Missing required fields", 400);
        }

        // Get host email from db
        const sql = `
            SELECT users.email 
            FROM users 
            JOIN properties ON properties.user_id = users.id 
            WHERE properties.id = ?
        `;

        const [result] = await connection.promise().query(sql, [propertyId]);

        if (!result || result.length === 0) {
            throw new CustomError("Property or host not found", 404);
        }

        const hostEmail = result[0].email;

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: hostEmail,
            cc: userMail,
            subject: subject,
            text: text
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: "success",
            message: "Email sent successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { sendEmail }; 