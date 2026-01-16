
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Fast Response for general chat using gemini-3-flash-preview
 */
export async function askFastResponse(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
 * Generate images using Gemini 3 Pro Image Preview
 */
export async function generateImage(prompt: string, aspectRatio: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: "1K"
        }
      },
    });

    let imageUrl = '';
    let textOutput = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }
    }

    return { imageUrl, text: textOutput || 'สร้างรูปภาพสำเร็จ' };
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}

/**
 * Edit images using Gemini 2.5 Flash Image (Nano Banana)
 */
export async function editImage(prompt: string, base64ImageData: string, mimeType: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
            text: `Act as a professional photo editor. Apply this instruction to the image: ${prompt}. Return the modified image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let imageUrl = '';
    let textOutput = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }
    }

    return { imageUrl, text: textOutput || 'การแก้ไขภาพเสร็จสมบูรณ์' };
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
}

export async function askSearchGrounding(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
