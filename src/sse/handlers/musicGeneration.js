import { getProviderCredentials, extractApiKey, isValidApiKey } from "../services/auth.js";
import { getSettings } from "@/lib/db/index.js";
import { getModelInfo } from "../services/model.js";
import { getKeyAccessContext, enforceKeyAccessResolved } from "../services/keyAccess.js";
import { errorResponse } from "open-sse/utils/error.js";
import { MUSIC_PROTOCOLS } from "open-sse/config/mediaProtocols.js";
import { handleKieMusicGeneration, handleUdioMusicGeneration } from "open-sse/handlers/imageProtocolHelpers.js";
import { handleSyntxMusicGeneration } from "open-sse/handlers/syntxAudio.js";
import * as log from "../utils/logger.js";
const HANDLERS = {kie:handleKieMusicGeneration,udio:handleUdioMusicGeneration,syntx:handleSyntxMusicGeneration};
export async function handleMusicGeneration(request) {
  const settings = await getSettings();
  if (settings.requireApiKey) {
    const key = extractApiKey(request);
    if (!key || !(await isValidApiKey(key))) return errorResponse(401, "Invalid or missing API key");
  }
  let body;
  try {body=await request.json();} catch {return errorResponse(400,"Invalid JSON body");}
  if (typeof body.model !== "string" || typeof body.prompt !== "string" || !body.prompt.trim()) return errorResponse(400,"model and prompt required");
  const {provider,model}=await getModelInfo(body.model);
  if (!HANDLERS[provider]) return errorResponse(400,"Provider does not support music generation");
  const denied=await enforceKeyAccessResolved(await getKeyAccessContext(request),body.model,provider,model);
  if (denied) return denied;
  const credentials=await getProviderCredentials(provider,new Set(),model,{preferredConnectionId:request.headers.get("x-connection-id")||null});
  if (!credentials || credentials.allRateLimited) return errorResponse(503,"Music provider credentials unavailable");
  try {
    const result=await HANDLERS[provider]({provider,model,body,credentials,log,providerConfig:MUSIC_PROTOCOLS[provider]});
    if (!result.success) return errorResponse(result.status||502,result.error||"Music generation failed");
    if (!result.data?.data?.length) return errorResponse(502,"Provider returned no music");
    return Response.json(result.data,{headers:{"Access-Control-Allow-Origin":"*"}});
  } catch (error) {return errorResponse(error.status||502,`Music generation failed: ${error.message}`);}
}
