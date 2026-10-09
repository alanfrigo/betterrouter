import { VIDEO_PROTOCOLS } from "../../config/mediaProtocols.js";
import { handleKieVideoGeneration, handleHaiperVideoGeneration } from "../imageProtocolHelpers.js";
import { handleLeonardoVideoGeneration } from "../videoGeneration/leonardoHandler.js";
import { handleSegmindVideoGeneration } from "../videoGeneration/providers/segmind.js";
import { handleSyntxVideoGeneration } from "../videoGeneration/syntxHandler.js";
import { EXTRA_VIDEOS } from "../../config/extraMediaProtocols.js";
import { handleAdobeFireflyVideoGeneration } from "../videoGeneration/adobeFireflyHandler.js";
import { handleNovitaVideoGeneration } from "../videoGeneration/novitaHandler.js";
import { handleVeoAiFreeVideoGeneration } from "../videoGeneration/veoFreeHandler.js";
const HANDLERS = { kie: handleKieVideoGeneration, haiper: handleHaiperVideoGeneration, leonardo: handleLeonardoVideoGeneration, segmind: handleSegmindVideoGeneration, syntx: handleSyntxVideoGeneration, "adobe-firefly":handleAdobeFireflyVideoGeneration,novita:handleNovitaVideoGeneration };
export async function runMediaVideoProtocol({provider,action,requestId,rawBody,credentials,log}) {
  if (provider === "veoaifree-web" && !requestId && action === "generations") {
    let body; try {body=JSON.parse(String(rawBody));} catch {return {success:false,status:400,response:Response.json({error:{message:"JSON body required"}},{status:400})};}
    const result=await handleVeoAiFreeVideoGeneration({provider,model:body.model,body,credentials,log});
    return {...result,response:Response.json(result.success?result.data:{error:{message:typeof result.error==='string'?result.error:'Video artifact unavailable'}},{status:result.success?200:result.status||502})};
  }
  if (!HANDLERS[provider]) return null;
  if (requestId || action !== "generations") return { success:false,status:400,error:`${provider} supports synchronous generations only`,response:Response.json({error:{message:`${provider} supports synchronous generations only`}},{status:400}) };
  let body;
  try { body=JSON.parse(String(rawBody)); } catch { return {success:false,status:400,error:"JSON body required",response:Response.json({error:{message:"JSON body required"}},{status:400})}; }
  const result=await HANDLERS[provider]({provider,model:body.model,body,credentials,log,providerConfig:VIDEO_PROTOCOLS[provider] || EXTRA_VIDEOS[provider]});
  if (result.success && !result.data?.data?.length) return {success:false,status:502,error:"Provider returned no video",response:Response.json({error:{message:"Provider returned no video"}},{status:502})};
  return {...result,response:Response.json(result.success?result.data:{error:{message:result.error}},{status:result.success?200:result.status||502})};
}
