import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { listEvents } from "../client/generated/sdk.gen";
import { formatEventSummary } from "../utils/formatting";

export const GetEventsInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
  start_date: z
    .string()
    .optional()
    .describe(
      "Start date in YYYY-MM-DD format (optional, defaults to 30 days ago)"
    ),
  end_date: z
    .string()
    .optional()
    .describe("End date in YYYY-MM-DD format (optional, defaults to today)"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of events to return (optional, defaults to 10)"),
  include_unnamed: z
    .boolean()
    .optional()
    .describe(
      "Whether to include unnamed events (optional, defaults to False)"
    ),
});

export type GetEventsInput = z.infer<typeof GetEventsInputSchema>;

export const getEvents = (server: McpServer) =>
  server.tool(
    "getEvents",
    "Get a list of events for an athlete from Intervals.icu.",
    GetEventsInputSchema.shape,
    async ({
      athlete_id,
      start_date,
      end_date,
      limit,
      include_unnamed,
    }: GetEventsInput) => {
      const athleteId = athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      // Default values
      const now = new Date();
      const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const start = start_date || defaultStart.toISOString().slice(0, 10);
      const end = end_date || now.toISOString().slice(0, 10);
      const max = typeof limit === "number" ? limit : 10;
      const includeUnnamed = !!include_unnamed;
      // If filtering unnamed, fetch more to ensure enough named
      const apiLimit = includeUnnamed ? max : max * 3;
      const response = await listEvents({
        path: { id: athleteId, format: "" },
        query: { oldest: start, newest: end, limit: apiLimit },
      });

      let events = response.data || [];
      if (!includeUnnamed) {
        events = events.filter((e) => e.name && e.name.trim() !== "");
      }
      events = events.slice(0, max);
      if (!events.length) {
        return {
          content: [
            {
              type: "text",
              text: includeUnnamed
                ? `No valid events found for athlete ${athleteId} in the specified date range.`
                : `No named events found for athlete ${athleteId} in the specified date range. Try with include_unnamed=True to see all events.`,
            },
          ],
        };
      }
      // Format the output
      const events_summary =
        "Events:\n\n" +
        events
          .map((event) =>
            typeof event === "object"
              ? formatEventSummary(event)
              : `Invalid event format: ${event}\n\n`
          )
          .join("\n");
      return {
        content: [
          {
            type: "text",
            text: events_summary,
          },
        ],
      };
    }
  );
