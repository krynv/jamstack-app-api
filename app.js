require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const routes = require("./routes");

const port = process.env.PORT || 1337;

app.use(cors()); // don't leave this in prod

const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: `${err.name}: ${err.message}` });
  }
};

const auth = jwt(
  {
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_API_IDENTIFIER,
    issuer: `https://${process.env.AUTH0_DOMAIN}`,
    algorithms: ["RS256"]
  },
  errorHandler
);

app.get("/api/characters", routes.characters);
app.get("/api/characters/:id", routes.character);
app.get("/api/favourites", auth, routes.favourites);

app.listen(port, () => {
  console.log(`API running on port: ${port}`);
});
