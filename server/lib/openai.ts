import OpenAI from "openai";
import { CareerRecommendation } from "@shared/schema";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "",
});

// Function to format user responses into a prompt for OpenAI
function formatPrompt(
  formResponses: Record<string, string | string[]>,
): string {
  let prompt =
    "Una persona ha risposto alle seguenti domande sui suoi interessi e preferenze:\n\n";

  // Format each response as a bullet point with the question and answer
  for (const [key, value] of Object.entries(formResponses)) {
    // Format the key into a more readable question
    let formattedKey = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // Format arrays as comma-separated lists
    const formattedValue = Array.isArray(value) ? value.join(", ") : value;

    prompt += `• '${formattedKey}' → '${formattedValue}'\n`;
  }

  prompt +=
    "\nBasandoti su queste risposte, qual è la carriera più adatta per questa persona? Fornisci una spiegazione dettagliata e ponderata in italiano.\n\n";
  prompt +=
    "Restituisci la tua risposta come un oggetto JSON con la seguente struttura:\n";
  prompt += "{\n";
  prompt += '  "careerTitle": "Il titolo della carriera consigliata",\n';
  prompt +=
    '  "explanation": "Una spiegazione dettagliata del perché questa carriera è un buon abbinamento",\n';
  prompt +=
    '  "matchPercentage": 85, // Un numero tra 1-100 che indica la confidenza\n';
  prompt += '  "alternativeCareers": [\n';
  prompt +=
    '    { "title": "Carriera Alternativa 1", "description": "Breve spiegazione" },\n';
  prompt +=
    '    { "title": "Carriera Alternativa 2", "description": "Breve spiegazione" }\n';
  prompt += "  ],\n";
  prompt +=
    '  "nextSteps": ["Passo 1", "Passo 2", "Passo 3"] // Passaggi successivi consigliati\n';
  prompt += "}";

  return prompt;
}

// Main function to generate career recommendation
export async function generateCareerRecommendation(
  formResponses: Record<string, string | string[]>,
): Promise<CareerRecommendation> {
  try {
    if (!openai.apiKey || openai.apiKey.length === 0) {
      throw new Error("Chiave API OpenAI mancante");
    }

    const prompt = formatPrompt(formResponses);

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content:
            "Sei un consulente di carriera che fornisce consigli su qualsiasi tipo di professione. Offri suggerimenti personalizzati basati sugli interessi, abilità e preferenze delle persone. Rispondi sempre in italiano con un linguaggio professionale ma accessibile.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("Risposta vuota da OpenAI");
    }

    try {
      const recommendation = JSON.parse(content) as CareerRecommendation;
      return recommendation;
    } catch (error) {
      console.error("Impossibile analizzare la risposta di OpenAI:", content);
      throw new Error("Impossibile analizzare la consulenza di carriera");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}
