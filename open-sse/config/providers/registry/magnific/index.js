export const MAGNIFIC_IMAGE_PROVIDER = {
  id: "magnific",
  alias: "freepik",
  baseUrl: "https://api.magnific.com/v1/ai/mystic",
  statusUrl: "https://api.magnific.com/v1/ai/mystic",
  authType: "apikey",
  authHeader: "x-magnific-api-key",
  format: "magnific-image",
  models: [
    { id: "realism", name: "Mystic Realism" },
    { id: "fluid", name: "Mystic Fluid (Imagen 3)" },
    { id: "zen", name: "Mystic Zen" },
    { id: "flexible", name: "Mystic Flexible" },
    { id: "super_real", name: "Mystic Super Real" },
    { id: "editorial_portraits", name: "Mystic Editorial Portraits" }
  ],
  supportedSizes: ["1024x1024", "1024x1792", "1792x1024"]
};
