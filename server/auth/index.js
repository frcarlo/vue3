import { Issuer, Strategy } from "openid-client";
import passport from "passport";
import User from "../lib/User.js";

const oAuth = async ({
  client_id,
  client_secret,
  redirect_uris,
  post_logout_redirect_uris,
} = {}) => {
  const issuer = await Issuer.discover(process.env.OAUTH_ISSUER);
  const client = new issuer.Client({
    client_id: "pdac",
    client_secret: "2DbzDQyktN8zQDk2MoxJN1XgrhTXOWPq",

    redirect_uris: ["/auth/callback"],
    post_logout_redirect_uris: ["/logout/callback"],
    response_types: ["code"],
  });
  return client;
};

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/authenticate");
};

export default async (app, opts) => {
  const client = await oAuth(opts);
  app.use(passport.initialize());
  app.use(passport.authenticate("session"));
  passport.use(
    "oidc",
    new Strategy(
      {
        client,
      },
      (tokenSet, userinfo, done) => {
        console.log(userinfo);
        new User(userinfo).putUser();

        return done(null, tokenSet.claims());
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  return { client, checkAuthenticated, passport };
};
