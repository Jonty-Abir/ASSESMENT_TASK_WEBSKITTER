const express = require("express");
const { createEmploy, getAllEmploy } = require("../../controller/api/employController");
const { createProduct, getAllProduct , getSingleProduct} = require("../../controller/api/productsController");
const {login, register, verifyToken, dashboard, resetPassword, confirmationToLogin, updatedPassword} = require("../../controller/api/authController");
const { isAuthorized } = require("../../middleware/auth/authorized");

const apiRoutes = express.Router();

/*============== EMPLOY ================*/
apiRoutes.get("/employ", getAllEmploy);
apiRoutes.post("/employ", createEmploy);

/*============== PRODUCT ================*/
apiRoutes.post("/product", createProduct);
apiRoutes.get("/product", getAllProduct); 
apiRoutes.get("/product/:slug", getSingleProduct);

/*============== Auth Routes ================*/
apiRoutes.post("/login", login); // Login
apiRoutes.post("/reg", register); // Register
apiRoutes.get("/verify-token", verifyToken); // Verify-Token

/*============== Conformation To Login ================*/
apiRoutes.get("/confirmation/:email/:token", confirmationToLogin);

/*============== DashBoard ================*/
apiRoutes.get("/dashboard", isAuthorized, dashboard );

/*============== Updated Password ================*/
apiRoutes.patch("/updated-password", isAuthorized, updatedPassword);

/*============== Reset Password ================*/
apiRoutes.patch("/reset-password", resetPassword);

module.exports = { apiRoutes };
