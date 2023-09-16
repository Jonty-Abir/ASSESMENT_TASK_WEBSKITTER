const { unlink } = require("fs");

function destroyFile(path) {
  unlink(path, (err) => err && console.log("Deleteing File...", err));
}

module.exports = { destroyFile };
