require("dotenv/config");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  path: process.env.SIO_PATH,
});
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/auth-jwt");
const errorHandler = require("./helpers/error-handler");
const logger = require("./helpers/logger");
require("./helpers/socket-handler")(io);

//CORS
app.use(cors());
app.options("*", cors());

//Middleware
app.use(express.json());
app.use(morgan("tiny", { stream: logger.stream }));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//nodejs-express-cache-and-304-status-code
app.disable("etag");

app.io = io;

//Routers
const groupsRoutes = require("./routes/groups");
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const locationRoutes = require("./routes/locations");
const regionRoutes = require("./routes/regions");
const infoRoutes = require("./routes/info");

const api = process.env.API_PATH;

app.use(`${api}/groups`, groupsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/locations`, locationRoutes);
app.use(`${api}/regions`, regionRoutes);
app.use(`${api}/info`, infoRoutes);

//Database
mongoose
  .connect(
    Buffer.from(process.env.CONNECTION_STRING, "base64").toString("ascii"),
    { dbName: "trashme-database" }
  )
  .then(() => {
    logger.info("Database connection is ready");
  })
  .catch((err) => {
    logger.error(err);
  });

//Production
server.listen(process.env.PORT || 3000, () => {
  var port = server.address().port;
  logger.info(`Server running at ${port}`);
});
