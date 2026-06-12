type ProductImageAnalysisInput = {
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string | null;
};

type ProductImageAnalysisResult = {
  approved: boolean;
  confidence: number;
  reason: string;
  detectedItem?: string;
  titleMatchesImage: boolean;
  unsafeContent: boolean;
};

const parseBoolean = (value?: string) => value === "true";

const getFallbackResult = (reason: string): ProductImageAnalysisResult => ({
  approved: true,
  confidence: 1,
  reason,
  detectedItem: undefined,
  titleMatchesImage: true,
  unsafeContent: false,
});

const extractJson = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : JSON.parse(text);
};

const genericProductWords = new Set([
  "producto",
  "item",
  "cosa",
  "varios",
  "ropa",
  "zapato",
  "zapatos",
  "zapatilla",
  "zapatillas",
  "tenis",
  "celular",
  "telefono",
  "laptop",
  "computadora",
  "mueble",
  "silla",
  "mesa",
  "accesorio",
  "accesorios",
]);

const normalizeText = (value?: string) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const validateProductTextQuality = (input: ProductImageAnalysisInput) => {
  const title = normalizeText(input.title);
  const description = normalizeText(input.description);
  const words = title.split(" ").filter(Boolean);

  if (words.length < 2) {
    throw new Error(
      "Revision IA rechazada: el titulo es muy generico. Escribe marca, modelo, tipo o caracteristica principal.",
    );
  }

  if (words.length === 2 && words.every((word) => genericProductWords.has(word))) {
    throw new Error(
      "Revision IA rechazada: el titulo necesita mas detalle para validar la imagen.",
    );
  }

  if (words.length === 1 && genericProductWords.has(words[0])) {
    throw new Error(
      "Revision IA rechazada: el titulo es demasiado generico.",
    );
  }

  if (description && description.length < 12) {
    throw new Error(
      "Revision IA rechazada: la descripcion es muy corta para validar el producto.",
    );
  }
};

export const analyzeProductImageMatch = async (
  input: ProductImageAnalysisInput,
): Promise<ProductImageAnalysisResult> => {
  validateProductTextQuality(input);

  const apiKey = process.env.GEMINI_API_KEY;
  const required = parseBoolean(process.env.PRODUCT_AI_REQUIRED);
  const enabled = process.env.PRODUCT_AI_ENABLED !== "false";
  const minConfidence = Number(process.env.PRODUCT_AI_MIN_CONFIDENCE || 0.65);
  const model = process.env.PRODUCT_AI_MODEL || "gemini-2.0-flash";

  if (!enabled) {
    return getFallbackResult("Revision de IA desactivada por configuracion.");
  }

  if (!input.imageUrl) {
    if (required) {
      throw new Error(
        "La imagen del producto es obligatoria para la revision IA",
      );
    }

    return getFallbackResult(
      "Revision de IA omitida porque el producto no tiene imagen.",
    );
  }

  if (!apiKey) {
    throw new Error(
      "La revision IA esta activa pero falta GEMINI_API_KEY. Reinicia el backend despues de actualizar el .env.",
    );
  }

  const imageResponse = await fetch(input.imageUrl);

  if (!imageResponse.ok) {
    if (required) {
      throw new Error("No pude descargar la imagen para revision IA");
    }

    return getFallbackResult("No pude descargar la imagen para revision IA.");
  }

  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const imageBase64 = imageBuffer.toString("base64");
  const prompt = [
    "Eres un moderador de marketplace.",
    "Analiza si la imagen coincide con el producto que el vendedor intenta publicar.",
    "Compara titulo, descripcion, categoria e imagen.",
    "Tambien detecta contenido riesgoso, prohibido o claramente enganoso.",
    "Se estricto si el titulo es generico, ambiguo o no describe el objeto principal.",
    "Rechaza si la imagen muestra otro tipo de articulo, varios productos confusos o si no se puede identificar claramente el producto.",
    "No rechaces por diferencias menores de color, fondo o angulo si el tipo de articulo coincide claramente.",
    "Responde solo JSON valido con esta forma exacta:",
    '{ "approved": boolean, "confidence": number, "reason": string, "detectedItem": string, "titleMatchesImage": boolean, "unsafeContent": boolean }',
    `Titulo: ${input.title}`,
    `Descripcion: ${input.description || ""}`,
    `Categoria: ${input.category || ""}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: contentType,
                  data: imageBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();

    if (required) {
      throw new Error(`No pude completar la revision IA: ${body}`);
    }

    return getFallbackResult("Revision IA omitida por error temporal.");
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = extractJson(rawContent);
  const result: ProductImageAnalysisResult = {
    approved: Boolean(parsed.approved),
    confidence: Number(parsed.confidence || 0),
    reason: String(parsed.reason || "Revision IA sin detalle"),
    detectedItem: parsed.detectedItem ? String(parsed.detectedItem) : undefined,
    titleMatchesImage: Boolean(parsed.titleMatchesImage),
    unsafeContent: Boolean(parsed.unsafeContent),
  };

  if (result.unsafeContent) {
    return {
      ...result,
      approved: false,
      reason: result.reason || "La imagen contiene contenido no permitido.",
    };
  }

  if (!result.titleMatchesImage || result.confidence < minConfidence) {
    return {
      ...result,
      approved: false,
      reason:
        result.reason ||
        "La imagen no parece coincidir con el titulo del producto.",
    };
  }

  return result;
};

export const ensureProductImageMatchesTitle = async (
  input: ProductImageAnalysisInput,
) => {
  const result = await analyzeProductImageMatch(input);

  if (!result.approved) {
    throw new Error(`Revision IA rechazada: ${result.reason}`);
  }

  return result;
};
