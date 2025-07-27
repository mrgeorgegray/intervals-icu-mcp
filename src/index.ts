import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// @NOTE !important, this must be imported before
// the routes to ensure client is configured before
// calling loaders etc.
import "./client/index";

import { createBulkEvents } from "./tools/createBulkEvents";
import { createEvent } from "./tools/createEvent";
import { deleteBulkEvents } from "./tools/deleteBulkEvents";
import { deleteEvent } from "./tools/deleteEvent";
import { getActivities } from "./tools/getActivities";
import { getActivityDetails } from "./tools/getActivityDetails";
import { getAthleteDetails } from "./tools/getAthleteDetails";
import { getEventDetails } from "./tools/getEventDetails";
import { getEvents } from "./tools/getEvents";
import { getWellnessData } from "./tools/getWellnessData";

const debug = process.env.DEBUG === "true";

// Create an MCP server
const server = new McpServer({
  name: "Intervals.icu MCP Server",
  version: "1.0.0",
});

// Add tools
getAthleteDetails(server);
getActivities(server);
getActivityDetails(server);
getEvents(server);
getEventDetails(server);
getWellnessData(server);
createEvent(server);
createBulkEvents(server);
deleteEvent(server);
deleteBulkEvents(server);

async function startServer() {
  try {
    if (debug) {
      console.error("Starting Intervals MCP Server...");
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
    if (debug) {
      console.error(
        `Intervals MCP Server connected via Stdio. Tools registered.`
      );
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
