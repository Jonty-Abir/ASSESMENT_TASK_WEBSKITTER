const express = require("express");
const {apiRoutes}= require("./api/apiRoutes");

const routes = express.Router();

const defaultRouter = [
  {
    path: "/api",
    route: apiRoutes,
  },
];

defaultRouter.forEach((route) => {
  routes.use(route.path, route.route);
});

module.exports = { routes };
