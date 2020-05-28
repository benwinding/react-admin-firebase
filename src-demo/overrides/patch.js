const path = require("path");
const fs = require("fs");

const destDir = path.join(__dirname, "../node_modules/react-scripts/config");

console.log(
  'patching webpack so "react-firebase-admin" is watched for changes'
);

// fs.copyFileSync(
//   path.join(__dirname, "./webpack.config.prod.js"),
//   path.join(destDir, "./webpack.config.prod.js")
// );
fs.copyFileSync(
  path.join(__dirname, "./webpack.config.dev.js"),
  path.join(destDir, "./webpack.config.dev.js")
);
fs.copyFileSync(
  path.join(__dirname, "./webpackDevServer.config.js"),
  path.join(destDir, "./webpackDevServer.config.js")
);
