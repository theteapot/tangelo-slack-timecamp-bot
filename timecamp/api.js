const fetch = require("node-fetch");
const querystring = require("querystring");

async function getTimeEntries({ userId, from, to }) {
  let timeEntries = await makeAPIRequest({
    requestMethod: "GET",
    endpoint: "entries",
    params: { from, to, user_ids: userId },
  });
  return timeEntries;
}

async function updateTimeEntry(id, params = {}) {
  let task = await makeAPIRequest({
    requestMethod: "PUT",
    endpoint: "entries",
    params: { id, ...params },
  });
  return task;
}

async function getTasks() {
  let tasks = await makeAPIRequest({ endpoint: "tasks" });
  return tasks;
}

async function getUsers() {
  let users = await makeAPIRequest({
    requestMethod: "GET",
    endpoint: "users",
  });

  return users;
}

async function getUser({ fullName }) {
  let users = await getUsers();
  if (!Array.isArray(users))
    throw new Error(`Expected users to be array, got ${typeof users}`);
  return users.find((user) => {
    return user.display_name === fullName;
  });
}

async function makeAPIRequest({
  requestMethod = "GET",
  endpoint = "",
  params = {},
}) {
  let sending = false;
  let data = params;
  let response = null;

  if (!process.env.API_TOKEN) {
    throw Error("Must provide an API_TOKEN in .env file");
  }

  if (requestMethod == "POST" || requestMethod == "PUT") sending = true;

  let url = `https://www.timecamp.com/third_party/api/${endpoint}/format/json/api_token/${process.env.API_TOKEN}`;

  if (sending) {
    response = await fetch(`${url}`, {
      method: requestMethod,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  } else {
    response = await fetch(`${url}${serialize(params)}`, {
      method: requestMethod,
    });
  }

  if (!response.ok) {
    console.log(await response.text());
  }

  response = await response.json();

  return response;
}

function serialize(params) {
  let paramString = "";

  if (typeof params !== "object")
    throw Error(`params must be object, got ${typeof params}`);

  Object.keys(params).map((key) => {
    paramString += `/${key}`;
    paramString += `/${params[key]}`;
  });

  return paramString;
}

module.exports = {
  getTasks,
  getTimeEntries,
  getUsers,
  getUser,
  updateTimeEntry,
};
