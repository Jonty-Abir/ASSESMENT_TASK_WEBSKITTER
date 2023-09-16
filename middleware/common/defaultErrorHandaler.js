const multer = require("multer");

function defaultErrorHandler(err, req, res, next) {
  if (err) {
    if (err instanceof multer.MulterError) {
      console.log("*========= Multer Error.... =========*");
      return res.status(500).json({ error: err });
    }
    return res.status(500).json({ error: err.message });
  }
}
function notFoundHandler(req, res, next) {
  console.log("*========= NOT FOUND 404 .... =========*");

  res.status(404).json({ 404: "Not Found!" });
}
module.exports = { defaultErrorHandler, notFoundHandler };
