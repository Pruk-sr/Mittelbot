/* eslint-disable no-self-assign */
/* eslint-disable no-inline-comments */
const ejs = require("ejs");
const path = require("path");
const chalk = require("chalk");
const express = require("express");
const config = require("./config");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require('cookie-parser');
require('dotenv').config()
const {
  boxConsole
} = require("./functions/boxConsole");



const app = express();
const MemoryStore = require("memorystore")(session);

module.exports = async (bot) => {
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`); // The absolute path of current this directory.

  // Deserializing and serializing users without any additional logic.
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  let domain;
  let callbackUrl;

  try {
    const domainUrl = new URL(config.domain);
    domain = {
      host: domainUrl.hostname,
      protocol: domainUrl.protocol,
    };
  } catch (e) {
    console.log(e);
    throw new TypeError("Invalid domain specific in the config file.");
  }

  if (config.usingCustomDomain) {
    callbackUrl = `${domain.protocol}//${domain.host}/callback`;
  } else {
    callbackUrl = `${domain.protocol}//${domain.host}${
      config.port == 80 ? "" : `:${config.port}`
    }/callback`;
  }

  boxConsole([
    `
    ${chalk.red.bold("DASHBOARD STARTING...")}
    ${chalk.red.bold("Callback URL:")} ${chalk.white.bold.italic.underline(
      callbackUrl,
    )}`,
    `${chalk.red.bold(
      "Discord Developer Portal:",
    )} ${chalk.white.bold.italic.underline(
      `https://discord.com/developers/applications/${config.id}/oauth2`,
    )}`
  ]);

  // We initialize the memorystore middleware with our express app.
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000
      }),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // We initialize passport middleware.
  app.use(passport.initialize());
  app.use(passport.session());

  // We bind the domain.
  app.locals.domain = config.domain.split("//")[1];

  // We set out templating engine.
  app.engine("ejs", ejs.renderFile);
  app.set("view engine", "ejs");

  // We initialize body-parser middleware to be able to read forms.
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  // We host all of the files in the assets using their name in the root address.
  // A style.css file will be located at http://<your url>/style.css
  // You can link it in any template using src="/assets/filename.extension"
  app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));

  //Add Custom vars to the app
  app.set('config', config);
  app.set('bot', bot);
  app.set('callbackUrl', callbackUrl)

  bot.callbackUrl = callbackUrl;

  require('./server/route/main-route')(app);

  app.listen(config.port, null, null, () =>
    console.log(`Dashboard is up and running on port ${config.port}.`),
  );
};