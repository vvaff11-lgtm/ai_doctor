import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDoctorResponse(doctorName: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], prompt: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: `你是${doctorName}，一位专业的AI医生。你的回复应该严谨、专业且富有同理心。
      如果用户描述了症状，请提供初步的分析和建议（如休息、补水、冷敷等）。
      必须包含一个风险提示，告知用户如果症状加重应及时就医。
      请以JSON格式返回，包含以下字段：
      - text: 主要回复文本
      - recommendations: 建议列表，每个包含 title, content, icon (lucide icon name)
      - riskWarning: 风险提示文本
      - suggestions: 3个后续追问或建议的短语
      `,
      responseMimeType: "application/json",
    },
  });

  const response = await model;
  return JSON.parse(response.text || '{}');
}
