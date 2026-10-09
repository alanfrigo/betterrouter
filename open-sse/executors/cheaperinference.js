import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/constants.js";
import { getModelTargetFormat, PROVIDER_ID_TO_ALIAS } from "../config/providerModels.js";

export class CheaperInferenceExecutor extends BaseExecutor {
  constructor(provider = "cheaperinference") {
    super(provider, PROVIDERS[provider]);
  }
  usesResponsesEndpoint(model) {
    const alias = PROVIDER_ID_TO_ALIAS[this.provider] || this.provider;
    return getModelTargetFormat(alias, model) === "openai-responses";
  }
  buildUrl(model, _stream, _urlIndex = 0) {
    if (this.usesResponsesEndpoint(model)) {
      return this.config.responsesBaseUrl || this.config.baseUrl;
    }
    return this.config.baseUrl;
  }
  transformRequest(model, body, stream, credentials) {
    const cleanedBody = super.transformRequest(model, body, stream, credentials);
    if (!cleanedBody || typeof cleanedBody !== "object" || Array.isArray(cleanedBody)) {
      return cleanedBody;
    }
    if (!this.usesResponsesEndpoint(model)) {
      return cleanedBody;
    }
    return { ...cleanedBody, store: false };
  }
}
export default CheaperInferenceExecutor;
