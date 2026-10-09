import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/constants.js";

export class PollinationsExecutor extends BaseExecutor {
  constructor() { super("pollinations", PROVIDERS.pollinations); }
  buildHeaders(credentials, stream = true) {
    const headers = { "Content-Type": "application/json" };
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
    if (stream) headers.Accept = "text/event-stream";
    return headers;
  }
  transformRequest(model, body, stream) {
    const payload = { ...body, model, stream };
    if (["json_object", "json_schema"].includes(body.response_format?.type)) payload.jsonMode = true;
    return payload;
  }
}
export default PollinationsExecutor;
