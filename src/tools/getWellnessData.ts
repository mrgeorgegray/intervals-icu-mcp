import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { listWellnessRecords } from "../client/generated/sdk.gen";
import type { Wellness } from "../client/generated/types.gen";
import { formatWellnessEntry } from "../utils/formatting";

export const GetWellnessDataInputSchema = z.object({
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
});

export type GetWellnessDataInput = z.infer<typeof GetWellnessDataInputSchema>;

export const getWellnessData = (server: McpServer) =>
  server.tool(
    "getWellnessData",
    "Get wellness data for an athlete from Intervals.icu.",
    GetWellnessDataInputSchema.shape,
    async ({ athlete_id, start_date, end_date }: GetWellnessDataInput) => {
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

      // Fetch wellness data
      const response = await listWellnessRecords({
        path: { id: athleteId, ext: "" },
        query: { oldest: start, newest: end },
      });
      const data = response.data || [];
      if (!data.length) {
        return {
          content: [
            {
              type: "text",
              text: `No wellness data found for athlete ${athleteId} in the specified date range.`,
            },
          ],
        };
      }
      // Format the output
      const wellness_summary =
        "Wellness Data:\n\n" +
        data.map((entry: Wellness) => formatWellnessEntry(entry)).join("\n\n");
      return {
        content: [
          {
            type: "text",
            text: wellness_summary,
          },
        ],
      };
    }
  );
