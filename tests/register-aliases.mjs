import { registerHooks } from "node:module";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith("@/") ? `../src/${specifier.slice(2)}`
      : specifier.startsWith("open-sse/") ? `../${specifier}` : null;
    if (!relative) return nextResolve(specifier, context);
    const target = new URL(relative, import.meta.url);
    if (!existsSync(fileURLToPath(target)) && existsSync(fileURLToPath(`${target.href}.js`))) target.pathname += ".js";
    if (existsSync(fileURLToPath(target)) && statSync(fileURLToPath(target)).isDirectory()) target.pathname += "/index.js";
    return nextResolve(target.href, context);
  },
});
