import kiro from "./kiro.js";

export default {
  ...kiro,
  id: "amazon-q",
  alias: "aq",
  uiAlias: "aq",
  category: "oauth",
  authType: "oauth",
  hasOAuth: true,
  authModes: ["oauth"],
  display: { name: "Amazon Q", icon: "cloud", color: "#FF9900", textIcon: "AQ", website: "https://aws.amazon.com/q/developer/", notice: { text: "AWS Builder ID or imported refresh-token flow; Amazon Q connections stay separate from Kiro." } },
};
