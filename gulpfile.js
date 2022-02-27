const { series, watch } = require('gulp');
const gulp = require("gulp");
const exec = require("child_process").exec;

const execCmd = (cmd, directory) => {
  console.log(`running $ "${cmd}" in dir: [${directory}]`);
  const child = exec(cmd, { cwd: directory });

  child.stdout.on("data", function(data) {
    console.log(data);
  });
  child.stderr.on("data", function(data) {
    console.error(data);
  });
  return new Promise((resolve, reject) => {
    child.on("close", resolve);
  });
};

const conf = {
  watchSrc: "./src/**/*",
  copyFrom: ["./src/**/*", "./package.json", "./dist/**/*"],
  copyTo: "./src-demo/node_modules/react-admin-firebase",
  output: {
    dir: `./dist/**/*`
  },
  demo: {
    root: "./src-demo"
  }
};

async function prepareDemo(cb) {
  await execCmd("yarn", './src-demo')
  cb();
}

function copyToDemo() {
  return gulp.src(conf.copyFrom, { base: "." }).pipe(gulp.dest(conf.copyTo))
}

function watchAndCopy(cb) {
  // body omitted
  execCmd("yarn watch", '.');
  watch(conf.output.dir, copyToDemo);
  execCmd("sleep 10 && yarn start", 'src-demo');
}

exports['start-demo'] = series(prepareDemo, watchAndCopy);