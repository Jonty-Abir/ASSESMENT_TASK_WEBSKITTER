const bcrypt = require("bcrypt");

async function createHash(plainTextPw) {
  return await bcrypt.hash(plainTextPw, 10);
};

async function compareHash(plainTextPw, hashPw) {
  return await bcrypt.compare(plainTextPw, hashPw);
};

module.exports = { createHash,compareHash };
