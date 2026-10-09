import { fetchPublic } from "../../shared/utils/ssrfGuard.js";
import { signAwsRequest } from "../../../open-sse/utils/awsSigv4.js";
import { sanitizeErrorMessage } from "../../../open-sse/utils/mediaProtocolErrors.js";
import { ensureAdobeFireflySession } from "../../../open-sse/services/adobeFireflySession.js";
import { fetchAdobeCreditsBalance } from "../../../open-sse/services/adobeFireflyAccount.js";
const PROBES={
  soniox:["https://api.soniox.com/v1/transcriptions","Authorization","Bearer "],
  "rev-ai":["https://api.rev.ai/speechtotext/v1/jobs?limit=1","Authorization","Bearer "],
  speechmatics:["https://asr.api.speechmatics.com/v2/jobs","Authorization","Bearer "],
  leonardo:["https://cloud.leonardo.ai/api/rest/v1/me","Authorization","Bearer "],
  magnific:["https://api.magnific.com/v1/ai/flows","x-magnific-api-key",""],
  kie:["https://api.kie.ai/api/v1/chat/credit","Authorization","Bearer "],
};
export async function validateMediaProtocol({provider,apiKey,providerSpecificData={}}) {
  if (['ideogram','haiper','segmind','deepai','gladia','udio'].includes(provider)) return {valid:false,error:'This provider exposes no documented auth-only credential probe; credentials are checked by its real generation/transcription endpoint',unsupported:true};
  if(!PROBES[provider]&&!['aws-polly','nlpcloud','adobe-firefly','oneminai'].includes(provider))return null;
  try {
    if(provider==='adobe-firefly') {
      const session=await ensureAdobeFireflySession({credentials:{apiKey,providerSpecificData}});
      await fetchAdobeCreditsBalance(session.accessToken);
      return {valid:true,error:null};
    }
    let url,init;
    if(provider==='aws-polly') {
      const region=providerSpecificData.region||providerSpecificData.awsRegion||'us-east-1';
      url=`${providerSpecificData.baseUrl||`https://polly.${region}.amazonaws.com`}/v1/voices`;
      init={method:'GET',headers:signAwsRequest({method:'GET',url,region,service:'polly',credentials:{accessKeyId:providerSpecificData.accessKeyId||providerSpecificData.awsAccessKeyId,secretAccessKey:apiKey,sessionToken:providerSpecificData.sessionToken||providerSpecificData.awsSessionToken}})};
    }else if(provider==='nlpcloud') {
      const model=providerSpecificData.validationModelId||'chatdolphin';
      url=`https://api.nlpcloud.io/v1/gpu/${encodeURIComponent(model)}/chatbot`;
      init={method:'POST',headers:{Authorization:`Token ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({input:'test',context:'You are a concise assistant.',history:[]})};
    }else if(provider==='oneminai') {
      url='https://api.1min.ai/api/chat-with-ai';
      init={method:'POST',headers:{'Content-Type':'application/json','API-KEY':apiKey},body:JSON.stringify({type:'UNIFY_CHAT_WITH_AI',model:providerSpecificData.validationModelId||'gpt-4o-mini',promptObject:{prompt:'test'}})};
    }else {
      const [endpoint,header,prefix]=PROBES[provider];url=endpoint;init={method:'GET',headers:{[header]:prefix+apiKey}};
    }
    const response=await fetchPublic(url,{...init,signal:AbortSignal.timeout(15000)});
    return {valid:response.ok,error:response.ok?null:`Credential validation returned HTTP ${response.status}`,status:response.status};
  }catch(error){return {valid:false,error:sanitizeErrorMessage(error.message||error)};}
}
