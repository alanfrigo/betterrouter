import { BaseExecutor } from "./base.js";
import { SYNTX_API_BASE } from "../services/syntxAuth.js";
import { SYNTX_REQUEST_TIMEOUT_MS, runSyntxExecute } from "./syntxExecute.js";
export {
  mapSyntxModel,
  stripSyntxModelPrefix,
  SYNTX_DEFAULT_MODEL
} from "../services/syntxModels.js";
export { looksLikeJwt, resolveSyntxToken } from "../services/syntxAuth.js";
export {
  SYNTX_ACCOUNT_SYSTEM_PROMPT_MAX_CHARS,
  SYNTX_CHATS_URL,
  SYNTX_FILE_COMPACT_PROMPT,
  SYNTX_GENERATE_PATH,
  SYNTX_MAX_GENERATE_CHARS,
  SYNTX_NATIVE_TOOLS,
  SYNTX_REQUEST_TIMEOUT_MS,
  SYNTX_ROLLOVER_LAST_USER_CHARS,
  SYNTX_ROLLOVER_TOOL_CHARS,
  SYNTX_ROLLOVER_TRANSCRIPT_CHARS,
  SYNTX_SETTINGS_URL,
  SYNTX_UPLOAD_URL,
  buildSyntxFollowUpDelta,
  buildSyntxGenerateBody,
  buildSyntxGenerateText,
  buildSyntxThreadRolloverText,
  capSyntxGenerateText,
  chatTitleFromText,
  collectSyntxImageSources,
  collectSyntxTopLevelSystem,
  encodeSyntxUploadMultipart,
  extractSyntxSseEvent,
  flattenSyntxMessages,
  flattenSyntxMessagesForRollover,
  formatSyntxToolDefs,
  isSyntxStreamUrl,
  lastUserText,
  listSyntxToolNames,
  looksLikeSyntxRefusal,
  messagesHaveSyntxToolTraffic,
  normalizeSyntxRequestMessages,
  parseSyntxToolCalls,
  syntxToolCatalogFingerprint,
  trailingSyntxToolResults,
  wantSyntxThinking
} from "./syntxChat.js";

export class SyntxExecutor extends BaseExecutor {
  constructor() {
    super("syntx", { id: "syntx", baseUrl: SYNTX_API_BASE, timeoutMs: SYNTX_REQUEST_TIMEOUT_MS });
  }
  getTimeoutMs() {
    return SYNTX_REQUEST_TIMEOUT_MS;
  }
  async execute(input) {
    return runSyntxExecute(input);
  }
}
