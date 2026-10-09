import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/constants.js";
import { buildClovaPayload } from "../translator/request/openai-to-clova.js";
import { convertClovaToOpenAI } from "../translator/response/clova-to-openai.js";
import { buildErrorBody } from "../utils/mediaProtocolErrors.js";

export class ClovaStudioExecutor extends BaseExecutor {
  constructor() { super("clova-studio", PROVIDERS["clova-studio"]); }
  buildUrl(model) { return `${this.config.baseUrl}/${encodeURIComponent(model)}`; }
  transformRequest(model,body) { return buildClovaPayload(model,body,true); }
  async execute(input) {
    const result=await super.execute({...input,stream:true});
    if (!result.response.ok || !result.response.body) return result;
    const upstream=result.response.body.getReader();
    const decoder=new TextDecoder();
    const encoder=new TextEncoder();
    const state={model:input.model};
    let buffer="";
    const converted=new ReadableStream({
      async start(controller) {
        try {
          for (;;) {
            const {done,value}=await upstream.read();
            buffer+=done?decoder.decode():decoder.decode(value,{stream:true});
            let end;
            while ((end=buffer.search(/\r?\n\r?\n/))>=0) {
              const frame=buffer.slice(0,end);
              buffer=buffer.slice(end+(buffer[end]==="\r"?4:2));
              const chunks=convertClovaToOpenAI(frame,state);
              if (state.upstreamError) throw Object.assign(new Error(state.upstreamError.message),{status:state.upstreamError.status});
              for (const chunk of chunks?(Array.isArray(chunks)?chunks:[chunks]):[]) controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            if(done)break;
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch(error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(buildErrorBody(error.status||502,error.message))}\n\n`));
          controller.close();
          await upstream.cancel(error).catch(()=>{});
        } finally {upstream.releaseLock();}
      },
      cancel(reason) { return upstream.cancel(reason); },
    });
    if(input.stream)return {...result,response:new Response(converted,{headers:{"Content-Type":"text/event-stream"}})};
    const text=await new Response(converted).text();
    const message={role:"assistant",content:""};
    let usage,finishReason="stop";
    for(const line of text.split("\n")) {
      if(!line.startsWith("data: ")||line==="data: [DONE]")continue;
      const chunk=JSON.parse(line.slice(6));
      if(chunk.error)return {...result,response:Response.json(chunk,{status:502})};
      const choice=chunk.choices?.[0],delta=choice?.delta;
      if(delta?.content)message.content+=delta.content;
      if(delta?.reasoning_content)message.reasoning_content=(message.reasoning_content||"")+delta.reasoning_content;
      if(delta?.tool_calls)for(const call of delta.tool_calls){message.tool_calls ||= [];let target=message.tool_calls[call.index];if(!target)target=message.tool_calls[call.index]={id:call.id,type:"function",function:{name:call.function?.name,arguments:""}};target.function.arguments+=call.function?.arguments||"";}
      if(choice?.finish_reason)finishReason=choice.finish_reason;
      if(chunk.usage)usage=chunk.usage;
    }
    return {...result,response:Response.json({id:state.responseId,created:state.created,model:input.model,object:"chat.completion",choices:[{index:0,message,finish_reason:finishReason}],...(usage?{usage}:{})})};
  }
}
export default ClovaStudioExecutor;
