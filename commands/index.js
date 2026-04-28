const fs = require("fs");
const path = require("path");

function loadCommands(dir, getName) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".js"))
    .reduce((cmds, file) => {
      const cmd = require(path.join(dir, file));
      const name = getName(cmd);
      if (name && cmd.execute) cmds[name] = cmd;
      return cmds;
    }, {});
}

const slashcmds = loadCommands(
  path.join(__dirname, "slashcommands"),
  cmd => cmd.data?.name
);

const textcmds = loadCommands(
  path.join(__dirname, "textcommands"),
  cmd => cmd.name
);

module.exports = { slashcmds, textcmds };