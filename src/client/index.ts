import { client } from "./generated/client.gen";

const debug = process.env.DEBUG === "true";
const baseURL = process.env.INTERVALS_API_BASE_URL;
const apiKey = process.env.INTERVALS_API_KEY;
const athleteId = process.env.INTERVALS_ATHLETE_ID;

if (!baseURL) {
  throw new Error("INTERVALS_API_BASE_URL environment variable is not set");
}
if (!apiKey) {
  throw new Error("INTERVALS_API_KEY environment variable is not set");
}
if (!athleteId) {
  throw new Error("INTERVALS_ATHLETE_ID environment variable is not set");
}
if (!/^i?\d+$/.test(athleteId)) {
  throw new Error(
    "INTERVALS_ATHLETE_ID must be all digits (e.g. 123456) or start with 'i' followed by digits (e.g. i123456)"
  );
}

// configure internal service client
client.setConfig({
  baseURL,
  auth: (auth) => {
    if (auth.scheme === "basic") {
      return `${"API_KEY"}:${apiKey}`;
    }
    return apiKey;
  },
  headers: {
    "User-Agent": "intervals-icu-mcp/1.0",
    Accept: "application/json",
  },
  throwOnError: true,
});

client.instance.interceptors.request.use((request) => {
  if (debug) {
    console.error("[Axios][Request]", {
      method: request.method,
      url: `${request.baseURL ?? ""}${request.url ?? ""}`,
      headers: request.headers,
      data: request.data,
    });
  }
  return request;
});

client.instance.interceptors.response.use(
  (response) => {
    if (debug) {
      console.error("[Axios][Response]", {
        status: response.status,
        url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (debug) {
      if (error.response) {
        console.error("[Axios][Error Response]", {
          status: error.response.status,
          url: `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`,
          data: error.response.data,
        });
      } else {
        console.error("[Axios][Network/Error]", error.message);
      }
    }
    return Promise.reject(error);
  }
);

export { client };
export * from "../tools/createEvent";
