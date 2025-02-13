const nodemailer = require("nodemailer");
const CustomError = require("../classes/CustomError");
const connection = require("../data/db.js");
const { htmlContactEmail } = require("../email_templates/contactEmail");
const { 
    checkIpContactQuery, 
    updateContactTimeQuery, 
    insertContactQuery, 
    getHostEmailQuery 
} = require("../sql/queries");

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
        
        // Get IP address handles proxy and direct connections
        let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        
        // For localhost testing
        if (ip === '::1') {
            ip = '127.0.0.1';
        }

        // Check if IP exists and last contact time
        const [ipResult] = await connection.promise().query(checkIpContactQuery, [ip, propertyId]);

        if (ipResult.length > 0) {
            const lastDateTime = new Date(ipResult[0].datetime);
            const now = new Date();
            const hoursDiff = (now - lastDateTime) / (1000 * 60 * 60); // Convert to hours

            if (hoursDiff < 24) {
                throw new CustomError("Please wait 24 hours before sending another email", 429);
            }

            // Update record if more than 24 hours
            await connection.promise().query(updateContactTimeQuery, [ipResult[0].id]);
        } else {
            // Insert new contact record if IP not found
            await connection.promise().query(insertContactQuery, [propertyId, ip]);
        }

        // Validate
        if (!propertyId || !subject || !userMail || !text) {
            throw new CustomError("Missing required fields", 400);
        }

        // Get host email from db
        const [result] = await connection.promise().query(getHostEmailQuery, [propertyId]);

        if (!result || result.length === 0) {
            throw new CustomError("Property or host not found", 404);
        }

        const hostEmail = result[0].email;

        // Create HTML template
        const htmlContent = htmlContactEmail(userMail, hostEmail, text, subject);

        // Email options with HTML
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: hostEmail,
            cc: userMail,
            subject: subject,
            text: text, // Fallback
            html: htmlContent // Add HTML content
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