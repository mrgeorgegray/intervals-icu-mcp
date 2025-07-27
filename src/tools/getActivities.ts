import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { listActivities } from "../client/generated/sdk.gen";
import { formatActivitySummary } from "../utils/formatting";

export const GetActivitiesInputSchema = z.object({
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
    .describe(
      "Maximum number of activities to return (optional, defaults to 10)"
    ),
  include_unnamed: z
    .boolean()
    .optional()
    .describe(
      "Whether to include unnamed activities (optional, defaults to False)"
    ),
});

export type GetActivitiesInput = z.infer<typeof GetActivitiesInputSchema>;

export const getActivities = (server: McpServer) =>
  server.tool(
    "getActivities",
    "Get a list of activities for an athlete from Intervals.icu.",
    GetActivitiesInputSchema.shape,
    async ({
      athlete_id,
      start_date,
      end_date,
      limit,
      include_unnamed,
    }: GetActivitiesInput) => {
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
      const response = await listActivities({
        path: { id: athleteId },
        query: { oldest: start, newest: end, limit: apiLimit },
      });

      let activities = response.data || [];
      if (!includeUnnamed) {
        activities = activities.filter((a) => a.name && a.name.trim() !== "");
      }
      activities = activities.slice(0, max);
      if (!activities.length) {
        return {
          content: [
            {
              type: "text",
              text: includeUnnamed
                ? `No valid activities found for athlete ${athleteId} in the specified date range.`
                : `No named activities found for athlete ${athleteId} in the specified date range. Try with include_unnamed=True to see all activities.`,
            },
          ],
        };
      }
      // Format the output
      const activities_summary =
        "Activities:\n\n" +
        activities
          .map((activity) =>
            typeof activity === "object"
              ? formatActivitySummary(activity)
              : `Invalid activity format: ${activity}\n\n`
          )
          .join("\n");
      return {
        content: [
          {
            type: "text",
            text: activities_summary,
          },
        ],
      };
    }
  );
