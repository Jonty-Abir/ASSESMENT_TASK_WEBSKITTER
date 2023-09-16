const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const { notFoundHandler, defaultErrorHandler} = require("./middleware/common/defaultErrorHandaler");
const { connection } = require("./connection");
const cors = require("cors");
const { routes } = require("./routes/routes");

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/uploads")));

// ROUTE
app.use(routes);

// Connected to DB
connection();

// Not Found Handler
app.use(notFoundHandler);
// Error Handler
app.use(defaultErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT: http://localhost/${process.env.PORT}`);
});
