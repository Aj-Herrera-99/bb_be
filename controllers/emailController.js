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
        
        // Get IP address handles proxy and direct connections
        let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        
        // For localhost testing
        if (ip === '::1') {
            ip = '127.0.0.1';
        }

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

        // Validate
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

        // Create HTML template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Contact Email - Bool BeB</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                <table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center">
                            <table width="600" bgcolor="#ffffff" cellpadding="20" cellspacing="0" border="0" style="margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                
                                <!-- Header Image -->
                                <tr>
                                    <td align="center" style="padding: 10px;">
                                        <img src="https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?cs=srgb&dl=pexels-pixabay-290595.jpg&fm=jpg" alt="Bool BeB Logo" style="max-width: 100%; height: auto; border-radius: 5px;">
                                    </td>
                                </tr>
                                
                                <!-- Introduction -->
                                <tr>
                                    <td align="center" style="font-size: 18px; color: #333; font-weight: bold;">
                                        Bool BeB - A place where comfort meets elegance.
                                    </td>
                                </tr>
                                
                                <!-- Message Info -->
                                <tr>
                                    <td>
                                        <p style="font-size: 16px; color: #333;"><strong>A message has been sent from:</strong> ${userMail}</p>
                                        <p style="font-size: 16px; color: #333;"><strong>To:</strong> ${hostEmail}</p>
                                    </td>
                                </tr>
                                
                                <!-- Message Box -->
                                <tr>
                                    <td style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                                        <p style="font-size: 16px; color: #333;"><strong>Subject:</strong> ${subject}</p>
                                        <p style="font-size: 14px; color: #555; line-height: 1.5;">${text.replace(/\n/g, '<br>')}</p>
                                    </td>
                                </tr>
                                
                                <!-- Reply Instruction -->
                                <tr>
                                    <td align="center" style="font-size: 16px; color: #0073e6; padding-top: 20px;">
                                        Reply to this email to continue the conversation.
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="font-size: 14px; color: #777; padding-top: 20px;">
                                        &copy; ${new Date().getFullYear()} Bool BeB. All rights reserved.
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        // Email options with HTML
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: hostEmail,
            cc: userMail,
            subject: subject,
            text: text, // Fallback plain text
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