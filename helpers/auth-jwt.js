//const expressJwt = require("express-jwt");
const {expressjwt : expressJwt} = require("express-jwt");
const secret = Buffer.from(process.env.SECRET, "base64").toString("ascii");

function authJwt() {
  const api = process.env.API_PATH;
  return expressJwt({
    secret: secret,
    algorithms: ["HS256"],
    isRevoked: isRevokedCallback,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/groups(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/locations(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/regions(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/users\/profile(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/info(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,
      // { url: /(.*)/ },
    ],
  });
}

// Version 6
async function isRevoked(req, payload, done) {
  if (payload.isAdmin === false) {
    done(null, true);
  }
  done();
}

// Version 7
const isRevokedCallback = async (req, token) => {
  //await new Promise(resolve => setTimeout(resolve, 100));
  return (token.payload.isAdmin === false);
};

module.exports = authJwt;
