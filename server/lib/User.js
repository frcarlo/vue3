import { getEsClient, indices } from "./elasticsearch/index.js";

export default class User {
  constructor({
    id,
    email,
    name,
    roles,
    resource_access,
    preferred_username,
  } = {}) {
    if (!id) id = preferred_username;
    this.user = { id, email, name, roles, resource_access, preferred_username };
    this.index = indices.users;
    return this;
  }

  async init() {}

  async putUser() {
    try {
      const result = await getEsClient().index({
        index: this.index,
        id: this.user.id || this.user.preferred_username,
        document: {
          ...this.user,
        },
      });
      return true;
    } catch (error) {
      throw Error(error.message);
    }
  }
}
