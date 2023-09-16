const express = require("express");
const { create, getAllEmploy } = require("../../controller/api/employController");

const apiRoutes = express.Router();

apiRoutes.get("/employ", getAllEmploy);
apiRoutes.post("/employ", create);

module.exports = { apiRoutes };
