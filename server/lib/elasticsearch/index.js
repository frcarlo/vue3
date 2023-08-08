import { esClient } from "./client.js";
import _ from "lodash";

const ACTION_TYPES = [
  "component_templates",
  "index_templates",
  "create_indices",
  "enrich_policies",
  "ingest_pipelines",
];

export const indices = {
  users: "pdac-users",
};

const exists = async (tpl, action) => {
  const type = _.get(tpl, "api.type");
  const method = _.get(tpl, "api.exists");
  const api = _.get(esClient, `${[type, method].join(".")}`);

  if (!api) throw new Error("Exists API not configured!");
  try {
    if (type) {
      return await esClient[type][method]({
        name: tpl.name,
      });
    } else {
      return await esClient[method]({
        name: tpl.name,
      });
    }
  } catch (error) {
    logger.error(`[${action}] EXISTS-ERROR: ${error.message}`);
  }
};

const put = async (tpl, action) => {
  const type = _.get(tpl, "api.type");
  const method = _.get(tpl, "api.put");
  const api = _.get(esClient, `${[type, method].join(".")}`);

  if (!api) throw new Error("PUT API not configured!");
  try {
    if (type) {
      return await esClient[type][method]({
        name: tpl.name,
        body: tpl.body,
      });
    } else {
      return await esClient[method]({
        name: tpl.name,
        body: tpl.body,
      });
    }
  } catch (error) {
    logger.error(`[${action}] PUT-ERROR: ${error.message}`);
  }
};

export const init = async () => {
  const actions = _.get(gElasticConfig, "action_order", []);
  for (const action of actions) {
    logger.info(`RUN INIT action: ${action}`);

    try {
      const done = await Promise.allSettled(
        _.get(gElasticConfig, `templates.${action}`, []).map(
          async (template) => {
            const { body: checkExists } = await exists(template, action);
            logger.info(
              `${template.name} ${
                checkExists
                  ? "exists, no action needed"
                  : "not exists, go to put template..."
              }`
            );
            if (!checkExists) {
              const { error, response } = await put(template, action);
              if (error) throw error;
              if (!error) logger.info(`${template.name} created ...`);
            }
          }
        )
      );
      const resjected = done.some((d) => d.status == "rejected");
      if (resjected) {
        const e = new Error("some initial actions were completed with error");
        e._meta = done.filter((d) => d.status == "rejected");

        throw e;
      }
    } catch (e) {
      logger.error(e);
      process.exit(1);
    }
  }
};

export const getEsClient = () => esClient;
