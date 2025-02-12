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