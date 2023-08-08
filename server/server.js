import "dotenv/config";
import path from "path";
import _ from "lodash";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import expressSession from "express-session";
const memoryStore = new expressSession.MemoryStore();
import { createRequire } from "module";
const require = createRequire(import.meta.url);
global.gElasticConfig = require("./config/elasticsearch.json");
import proxy from "express-http-proxy";
import pino from "pino";
import express from "express";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./graphql/index.js";
import { getEsClient, init } from "./lib/elasticsearch/index.js";
import auth from "./auth/index.js";
import { config } from "./lib/config/index.js";
import history from "connect-history-api-fallback";
import User from "./lib/User.js";

const logger = pino({
  level: "info",
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd"T"hh:MM:ss.l  Z',
    },
  },
});

global.logger = logger;

global.gRunTimeConfig = config();

// elastic init ...
await init();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "yz9KCnNh4GMjBwkjTKmsVma5hr3QEky",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);
const { client, checkAuthenticated, passport } = await auth(app, {});

app.use(async (req, res, next) => {
  req.esClient = getEsClient();
  req.logger = logger;
  logger.info(req.url);
  next();
});

app.get("/api/is_authenticated", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.json({
      status: true,
      message: "Authenicated",
    });
  } else {
    res.redirect("/auth/authenticate");
  }
});

app.get("/auth/authenticate", async (req, res, next) => {
  const x = passport.authenticate("oidc")(req, res, next);
  console.log("authenticate", req.session);
});

// callback always routes to test

app.get("/auth/callback", (req, res, next) => {
  const r = passport.authenticate("oidc", {
    successRedirect: "/app",
    failureRedirect: "/app/error",

    callback: (v) => console.log(v),
  })(req, res, next);
  console.log("auth callback", req.session);
});

app.get("/logout/callback", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.UserService = null;
    res.redirect("/");
  });
});

app.get("/logout", (req, res) => {
  res.redirect(client.endSessionUrl());
});

app.use(
  history({
    index: `/app/index.html`,
  })
);

//app.use("/app", proxy("http:"));

app.use(
  "/app/",
  checkAuthenticated,
  express.static(path.join(__dirname, "ui"))
);

app.all(
  "/api/graphql",

  checkAuthenticated,
  createHandler({ schema, grgraphiql: true, context: (req) => req.raw })
);

app.use((err, req, res, next) => {
  // console.log(req);
  if (err) res.redirect(`/app/error?message=${err.message}`);
});

app.listen(port, () => {
  logger.info(`Server is up, listening on  http://localhost:${port}`);
});
