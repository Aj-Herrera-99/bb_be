const Groq = require("groq-sdk");
const CustomError = require("../classes/CustomError");
const mysql = require("mysql2");
const { getPropertyDetailsQuery } = require("../sql/queries");

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateResponse = async (req, res, next) => {
  try {
    const { prompt, propertyId } = req.body;

    if (!prompt) {
      throw new CustomError("Prompt is required", 400);
    }

    let propertyInfo = "";
    if (propertyId) {
      try {
        const [rows] = await pool.promise().query(getPropertyDetailsQuery, [propertyId]);
        
        if (rows && rows[0]) {
          propertyInfo = `
            Consider this property information while answering:
            Title: ${rows[0].title}
            Description: ${rows[0].description}
            City: ${rows[0].city}
            Type: ${rows[0].property_type}
            Bedrooms: ${rows[0].n_bedrooms}
            Bathrooms: ${rows[0].n_bathrooms}
            Square meters: ${rows[0].square_meters}
          `;
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw new CustomError("Failed to fetch property details", 500);
      }
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: propertyInfo + prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2048,
    });

    res.json({
      success: true,
      response: chatCompletion.choices[0]?.message?.content || "",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateResponse }; 