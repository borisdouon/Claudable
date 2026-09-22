const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = [
  "node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-server.node.development.js",
  "node_modules/next/dist/compiled/react-server-dom-webpack/cjs/react-server-dom-webpack-server.node.production.js",
  "node_modules/next/dist/compiled/react-server-dom-webpack-experimental/cjs/react-server-dom-webpack-server.node.development.js",
  "node_modules/next/dist/compiled/react-server-dom-webpack-experimental/cjs/react-server-dom-webpack-server.node.production.js",
  "node_modules/next/dist/compiled/next-server/app-page-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js"
];

for (const f of files) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) continue;
  let code = fs.readFileSync(full, "utf8");
  let mod = false;
  if (code.includes("resolvedModuleData=config[modulePath];") && !code.includes("replace(/#/g")) {
    code = code.replace("resolvedModuleData=config[modulePath];", "resolvedModuleData=config[modulePath]||config[modulePath.replace(/#/g,"\\0#")];");
    mod = true;
  }
  if (code.includes("resolvedModuleData = config[modulePath];") && !code.includes("replace(/#/g")) {
    code = code.replace("resolvedModuleData = config[modulePath];", "resolvedModuleData = config[modulePath] || config[modulePath.replace(/#/g, "\\0#")];");
    mod = true;
  }
  if (code.includes("resolvedModuleData=config[modulePath.slice(0,idx)]") && !code.includes("replace(/#/g")) {
    code = code.replace("resolvedModuleData=config[modulePath.slice(0,idx)]", "resolvedModuleData=config[modulePath.slice(0,idx)]||config[modulePath.slice(0,idx).replace(/#/g,"\\0#")]");
    mod = true;
  }
  if (code.includes("resolvedModuleData = config[modulePath.slice(0, idx)]") && !code.includes("replace(/#/g")) {
    code = code.replace("resolvedModuleData = config[modulePath.slice(0, idx)]", "resolvedModuleData = config[modulePath.slice(0, idx)] || config[modulePath.slice(0, idx).replace(/#/g, "\\0#")]");
    mod = true;
  }
  if (mod) fs.writeFileSync(full, code, "utf8");
}
module.exports = { patchHashPath: () => {} };
