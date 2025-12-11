import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Examination } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const diagnosisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sira: { type: Type.STRING, description: "Tanı sıra numarası" },
    konu: { type: Type.STRING, description: "Tanı konusu (ICD kodu vs.)" },
    taniTuru: { type: Type.STRING, description: "Tanı türü (Örn: Ön Tanı, Kesin Tanı)" },
    taniAdi: { type: Type.STRING, description: "Tanının tam adı" },
  },
  required: ["taniAdi"],
};

const examinationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    yas: { type: Type.STRING, description: "Hastanın yaşı" },
    muayeneSaati: { type: Type.STRING, description: "Muayene saati" },
    uzmanlikServis: { type: Type.STRING, description: "Uzmanlık dalı ve servis bilgisi" },
    sikayet: { type: Type.STRING, description: "Hastanın şikayetleri" },
    tanilar: {
      type: Type.ARRAY,
      items: diagnosisSchema,
      description: "Bu muayeneye ait tanılar listesi",
    },
  },
  required: ["tanilar"],
};

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: examinationSchema,
  description: "Dökümanda bulunan tüm muayene kayıtlarının listesi. Aynı hastaya ait birden fazla muayene olabilir.",
};

export async function analyzeMedicalDocument(
  fileBase64: string,
  mimeType: string
): Promise<Examination[]> {
  try {
    const modelId = "gemini-2.5-flash"; // Efficient for text extraction from images/pdfs

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64,
            },
          },
          {
            text: `Sen uzman bir tıbbi veri analistisin. 
            Bu dökümandaki (PDF veya Resim) sağlık bilgilerini analiz et.
            Döküman aynı hastaya ait bir veya birden fazla muayene kaydı içerebilir. Her muayeneyi ayrı ayrı tespit et.
            
            Aşağıdaki bilgileri her muayene için çıkar:
            1. Hastanın yaşı (Yas)
            2. Muayene saati
            3. Uzmanlık Dalı / Servis Bilgisi
            4. Şikayet Bilgileri
            5. Tanı Bilgileri (Sıra, Konu, Tanı Türü, Tanı Adı). Bir muayenede birden fazla tanı olabilir.
            
            Eğer bir bilgi dökümanda açıkça yoksa, boş string ("") döndür. Asla bilgi uydurma.
            Çıktıyı kesinlikle JSON formatında ver.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text) as Examination[];
      return parsedData;
    }

    throw new Error("Veri çıkarılamadı.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}