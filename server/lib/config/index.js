import Ajv from "ajv";
import addFormats from "ajv-formats";
import _ from "lodash";
import fs from "fs";
const ajv = new Ajv({ allErrors: true, strictRequired: true });
addFormats(ajv);

const print = (key, value) => {
  logger.info(`${key} : ${JSON.stringify(value)}`);
};

const printHidden = (key, value) => {
  logger.info(`${key} : ******`);
};

const VARS = [
  {
    key: "OAUTH_ISSUER",
    convert: (value) => value,
    print: function (value) {
      print(this.key, value);
    },
  },
  {
    key: "OAUTH_CLIENT_ID",
    convert: (value) => value,
    print: function (value) {
      print(this.key, value);
    },
  },
  {
    key: "OAUTH_CLIENT_SECRET",
    convert: (value) => value,
    print: function (value) {
      printHidden(this.key, value);
    },
  },
  {
    key: "OAUTH_POST_LOGOUT_REDIRECT_URIS",
    convert: (value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(e.message);
        return null;
      }
    },
    print: function (value) {
      print(this.key, value);
    },
  },
  {
    key: "OUTH_REDIRECT_URIS",
    convert: (value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return null;
        return parsed;
      } catch (e) {
        console.error(e.message);
        return null;
      }
    },
    print: function (value) {
      print(this.key, value);
    },
  },
];

const configSchema = {
  type: "object",
  properties: {
    OAUTH_ISSUER: { type: "string", format: "uri" },
    OAUTH_CLIENT_SECRET: { type: "string", minLength: 10 },
    OAUTH_CLIENT_ID: { type: "string", minLength: 2 },
    OAUTH_POST_LOGOUT_REDIRECT_URIS: { type: "array", minItems: 1 },
    OUTH_REDIRECT_URIS: { type: "array", minItems: 1 },
  },
  required: [
    "OAUTH_ISSUER",
    "OAUTH_CLIENT_ID",
    "OAUTH_CLIENT_SECRET",
    "OAUTH_POST_LOGOUT_REDIRECT_URIS",
    "OUTH_REDIRECT_URIS",
  ],
};

const validate = ajv.compile(configSchema);

const getFileContent = (file) => {
  return fs.readFileSync(file, "utf8");
};

export const config = () => {
  const runtimeConfig = {};
  logger.info("#".repeat(80));
  logger.info("Load config ....");
  VARS.forEach((item) => {
    if (_.has(process.env, item.key)) {
      const v = item.convert(_.get(process.env, item.key));
      runtimeConfig[item.key] = v;
      item.print(v);
    } else if (_.has(process.env, `${item.key}_FILE`)) {
      const file = _.get(process.env, `${item.key}_FILE`);
      const v = item.convert(getFileContent(file));
      runtimeConfig[item.key] = v;
      item.print(v);
    }
  });

  const valid = validate(runtimeConfig);

  if (!valid) {
    const error = new Error("Config Validation Error");
    error.meta = validate.errors;
    throw error;
  }
  logger.info("#".repeat(80));
  return runtimeConfig;
};
