import { bearerAuth } from "./_base.js";

export default {
  buildUrl: () => "https://api-atlas.nomic.ai/v1/embedding/text",
  buildHeaders: (credentials) => ({ "Content-Type": "application/json", ...bearerAuth(credentials) }),
  buildBody: (model, { input, dimensions, encoding_format }) => {
    if (encoding_format !== "float") throw new Error("Nomic supports float embeddings only");
    const texts = typeof input === "string" ? [input] : input;
    if (!Array.isArray(texts) || texts.some((text) => typeof text !== "string")) throw new Error("Nomic input must be text or an array of text");
    const body = { model, texts, task_type: "search_document" };
    if (dimensions !== undefined && dimensions !== "") {
      const dimension = Number(dimensions);
      if (!Number.isInteger(dimension) || dimension < 1 || dimension > 768) throw new Error("Nomic dimensions must be an integer from 1 to 768");
      body.dimensionality = dimension;
    }
    return body;
  },
  normalize: (response, model) => ({ object: "list", model: response.model || model, data: (response.embeddings || []).map((embedding, index) => ({ object: "embedding", index, embedding })), usage: response.usage }),
};
