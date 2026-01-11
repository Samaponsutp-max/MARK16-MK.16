
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fast Response for general chat using gemini-2.5-flash-lite-latest
 */
export async function askFastResponse(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: prompt,
    });

    return {
      text: response.text,
      grounding: []
    };
  } catch (error) {
    console.error("Fast Response Error:", error);
    throw error;
  }
}

/**
 * Edit images using Gemini 2.5 Flash Image
 */
export async function editImage(prompt: string, base64ImageData: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let imageUrl = '';
    let textOutput = '';

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textOutput = part.text;
      }
    }

    return { imageUrl, text: textOutput };
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
}

export async function askSearchGrounding(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    throw error;
  }
}

export async function askMapsGrounding(prompt: string, latitude?: number, longitude?: number) {
  try {
    const config: any = {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
    };

    if (latitude && longitude) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: { latitude, longitude }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    throw error;
  }
}
