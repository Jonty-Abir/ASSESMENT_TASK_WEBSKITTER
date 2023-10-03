const jwt = require("jsonwebtoken");

async function signToken(tokenPayload) {
  return await jwt.sign(tokenPayload, process.env.USER_TOKEN_SECRET, {expiresIn: "24h",});
}

async function verifyToken(token) {
  return await jwt.verify(token, process.env.USER_TOKEN_SECRET);
}
module.exports = { signToken, verifyToken };
