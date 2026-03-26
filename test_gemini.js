import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json",
  }
});

async function test() {
  try {
    const result = await model.generateContent("hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
