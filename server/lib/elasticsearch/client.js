import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "Enigma17",
  },
  ssl: {
    rejectUnauthorized: false,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
