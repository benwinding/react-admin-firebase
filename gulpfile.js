const del = require("del");
const gulp = require("gulp");
const gulpSequence = require("gulp-sequence");
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
  copyFrom: ["./src/**/*", "./package.json", "./dist/**/*"],
  copyTo: "./src-demo/node_modules/react-admin-firebase",
  output: {
    dir: `./dist`
  },
  demo: {
    root: "./src-demo"
  }
};

gulp.task("clean", function() {
  return del([conf.output.dir]);
});

gulp.task("build", function() {
  return execCmd("yarn build");
});

gulp.task("prepare-demo", function() {
  return execCmd("yarn", './src-demo');
});

gulp.task("copy-to-demo", function() {
  return gulp.src(conf.copyFrom, { base: "." }).pipe(gulp.dest(conf.copyTo));
});

gulp.task("watch-and-copy-to-demo", function() {
  // Execute commands in series
  execCmd("yarn watch", '.');
  gulp.watch(conf.output.dir, ["copy-to-demo"]);
  execCmd("yarn start", 'src-demo');
});

gulp.task("start-demo", gulpSequence("prepare-demo", "watch-and-copy-to-demo"));
