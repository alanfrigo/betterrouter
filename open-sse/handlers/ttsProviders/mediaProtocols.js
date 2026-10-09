import { handleAwsPollySpeech } from "../../executors/awsPollyTts.js";
import { handleSyntxSpeech } from "../syntxAudio.js";
import { SPEECH_PROTOCOLS } from "../../config/audioSearchProtocols.js";

export function createMediaSpeechAdapter(provider) {
  return {
    async synthesize(input, model, credentials, responseFormat, {language} = {}) {
      const [modelId, voice] = String(model || "").split(":");
      const body = {input,voice,response_format:responseFormat,language_code:language};
      const response = provider === "syntx"
        ? await handleSyntxSpeech({model:modelId,body,credentials})
        : await handleAwsPollySpeech(SPEECH_PROTOCOLS[provider],body,modelId,credentials?.apiKey,credentials);
      return {success:response.ok,response,status:response.status};
    },
  };
}
