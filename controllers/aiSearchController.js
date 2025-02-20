const Groq = require("groq-sdk");
const CustomError = require("../classes/CustomError");
const { searchProperties } = require('../services/embeddingService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const searchChat = async (req, res, next) => {
  try {
    const { query, language = 'it' } = req.body;

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

    const systemPrompt = `Sei un esperto agente immobiliare italiano. 
    Il tuo compito è:
    1. Analizzare attentamente le proprietà fornite
    2. Confrontarle con la richiesta dell'utente
    3. Fornire una risposta dettagliata che includa:
       - Proprietà che corrispondono esattamente ai criteri
       - Alternative interessanti simili
       - Dettagli su prezzo/mq se rilevanti
       - Suggerimenti sulla zona
    4. Organizzare la risposta in sezioni chiare
    5. Usare un tono professionale ma amichevole
    
    Rispondi sempre in italiano a meno che non sia specificato diversamente.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
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
        description: match.metadata.description,
        city: match.metadata.city,
        propertyType: match.metadata.propertyType,
        nBedrooms: match.metadata.nBedrooms,
        nBathrooms: match.metadata.nBathrooms,
        nBeds: match.metadata.nBeds,
        squareMeters: match.metadata.squareMeters,
        address: match.metadata.address,
        zipcode: match.metadata.zipcode,
        hostDescription: match.metadata.hostDescription,
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