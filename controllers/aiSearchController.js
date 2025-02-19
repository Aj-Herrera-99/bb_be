const Groq = require("groq-sdk");
const CustomError = require("../classes/CustomError");
const { searchProperties } = require('../services/embeddingService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const searchChat = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      throw new CustomError("Search query is required", 400);
    }

    // Search for relevant properties using embeddings
    const relevantProperties = await searchProperties(query);
    
    let contextPrompt = "";
    if (relevantProperties.length > 0) {
      contextPrompt = "Based on the following properties:\n" + 
        relevantProperties.map(match => `
          Property: ${match.metadata.title}
          Description: ${match.metadata.description}
          City: ${match.metadata.city}
          Type: ${match.metadata.propertyType}
          Score: ${match.score}
        `).join("\n");
    } else {
      contextPrompt = "I couldn't find any properties matching your query exactly, but I'll try to help with general information.";
    }

    const finalPrompt = `${contextPrompt}\n\nUser Query: ${query}\n\nPlease provide a helpful response about these properties, addressing the user's query. If relevant, include specific details from the properties shown.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable real estate assistant. Provide clear, concise answers about properties, focusing on the most relevant details for the user's query. If suggesting properties, explain why they match the user's needs."
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2048,
    });

    res.json({
      success: true,
      response: chatCompletion.choices[0]?.message?.content || "",
      relevantProperties: relevantProperties.map(match => ({
        propertyId: match.metadata.propertyId,
        title: match.metadata.title,
        city: match.metadata.city,
        propertyType: match.metadata.propertyType,
        score: match.score
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchChat
}; 