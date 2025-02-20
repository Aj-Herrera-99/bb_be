const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX);

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

async function createPropertyDocument(property) {
  const propertyText = `
    Title: ${property.title}
    Description: ${property.description}
    City: ${property.city}
    Type: ${property.property_type}
    Bedrooms: ${property.n_bedrooms}
    Bathrooms: ${property.n_bathrooms}
    Beds: ${property.n_beds}
    Square meters: ${property.square_meters}
    Address: ${property.address}
    Zipcode: ${property.zipcode}
    Host Description: ${property.host_description || ''}
  `;

  const embedding = await generateEmbedding(propertyText);
  
  return {
    id: `property-${property.id}`,
    values: embedding,
    metadata: {
      propertyId: property.id,
      title: property.title,
      description: property.description,
      city: property.city,
      propertyType: property.property_type,
      nBedrooms: property.n_bedrooms,
      nBathrooms: property.n_bathrooms,
      nBeds: property.n_beds,
      squareMeters: property.square_meters,
      address: property.address,
      zipcode: property.zipcode,
      hostDescription: property.host_description
    }
  };
}

async function upsertProperty(property) {
  const document = await createPropertyDocument(property);
  await index.upsert([document]);
}

async function initializePineconeFromDB(connection) {
  const [properties] = await connection.promise().query('SELECT * FROM properties');
  
  for (const property of properties) {
    await upsertProperty(property);
  }
}

async function searchProperties(query) {
  const queryEmbedding = await generateEmbedding(query);
  
  const searchResults = await index.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true
  });

  return searchResults.matches;
}

module.exports = {
  upsertProperty,
  initializePineconeFromDB,
  searchProperties
}; 