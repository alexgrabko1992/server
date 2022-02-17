const express = require("express");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const cors = require("cors");
const request = require("request");
const axios = require("axios").default;

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://beautifulapp.eu.auth0.com/.well-known/jwks.json",
  }),
  audience: process.env.AUDIENCE,
  issuer: `https://beautifulapp.eu.auth0.com/`,
  algorithms: ["RS256"],
});

app.use(jwtCheck);

const getManagementApiJwt = () => {
  return new Promise(function (resolve, reject) {
    const options = {
      method: "POST",
      url: "https://beautifulapp.eu.auth0.com/oauth/token",
      headers: { "content-type": "application/json" },
      body: '{"client_id":"3gFwcogFVz8RId8vFNMexZlNXHShwXmH","client_secret":"z2T6Zyisr79D-xkvbyIZEE9ZcCWWG6gotdaQVTHD2WEpQUO9QwXQ2t5ptpWOISt8","audience":"https://beautifulapp.eu.auth0.com/api/v2/","grant_type":"client_credentials"}',
    };
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
};

// ========================== get users info ==================

app.get("/users", async (req, res) => {
  const managementApiJwt = await getManagementApiJwt();
  const token = managementApiJwt.access_token;

  const options = {
    method: "GET",
    url: "https://beautifulapp.eu.auth0.com/api/v2/users",
    params: { search_engine: "v3" },
    headers: { authorization: `Bearer ${token}` },
  };

  axios
    .request(options)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

// ============================= delete users ===============================

app.post("/delete-users", async (req, res) => {
  const managementApiJwt = await getManagementApiJwt();
  const token = managementApiJwt.access_token;
  const userId = JSON.parse(req.headers.body);

  const options = {
    method: "DELETE",
    url: `https://beautifulapp.eu.auth0.com/api/v2/users/${userId}`,
    params: { search_engine: "v3" },
    headers: { authorization: `Bearer ${token}` },
  };

  axios
    .request(options)
    .then(function (response) {
      response.data = "Users was deleted";
      res.json(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

// =======================  block users =====================

app.post("/block-users", async (req, res) => {
  const managementApiJwt = await getManagementApiJwt();
  const token = managementApiJwt.access_token;
  const userId = JSON.parse(req.headers.body);
  // console.log(userId);
  const block = { blocked: true };

  const options = {
    method: "PATCH",
    url: `https://beautifulapp.eu.auth0.com/api/v2/users/${userId}`,
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(block),
  };

  axios
    .request(options)
    .then(function (response) {
      response.data = "Users was blocked";
      res.json(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

// ============================== unblock users ====================

app.post("/unblock-users", async (req, res) => {
  const managementApiJwt = await getManagementApiJwt();
  const token = managementApiJwt.access_token;
  const userId = JSON.parse(req.headers.body);
  // console.log(userId);
  const block = { blocked: false };

  const options = {
    method: "PATCH",
    url: `https://beautifulapp.eu.auth0.com/api/v2/users/${userId}`,
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(block),
  };

  axios
    .request(options)
    .then(function (response) {
      response.data = "Users was unblocked";
      res.json(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.listen(port, console.log(`Server listen on port: ${port}`));
