const htmlContactEmail = (userMail, hostEmail, text, subject) => `
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

module.exports = { htmlContactEmail };