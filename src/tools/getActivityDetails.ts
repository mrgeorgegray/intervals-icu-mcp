import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getActivity, getIntervals } from "../client/generated/sdk.gen";
import type {
  Activity,
  ActivityWithIntervals,
  Hidden,
} from "../client/generated/types.gen";
import {
  formatActivitySummary,
  formatIntervalsTable,
} from "../utils/formatting";

export const GetActivityDetailsInputSchema = z.object({
  activity_id: z.string().describe("The Intervals.icu activity ID (required)"),
  intervals: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include intervals analysis (default true)"),
});

export type GetActivityDetailsInput = z.infer<
  typeof GetActivityDetailsInputSchema
>;

type ActivityResult = Activity | ActivityWithIntervals | Hidden;

export const getActivityDetails = (server: McpServer) =>
  server.tool(
    "getActivityDetails",
    "Get detailed information for a specific activity from Intervals.icu.",
    GetActivityDetailsInputSchema.shape,
    async ({ activity_id, intervals = true }: GetActivityDetailsInput) => {
      if (!activity_id) {
        throw new Error("activity_id is required");
      }
      // Fetch activity details
      const response = await getActivity({
        path: { id: activity_id },
      });
      const result = response.data as ActivityResult | undefined;
      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `No details found for activity ${activity_id}.`,
            },
          ],
        };
      }
      if (typeof result !== "object") {
        return {
          content: [
            {
              type: "text",
              text: `Invalid activity format for activity ${activity_id}.`,
            },
          ],
        };
      }
      // Format the detailed view
      let detailed_view = formatActivitySummary(result);

      // Add zones if available (non-standard, so check for property existence)
      if (
        "zones" in result &&
        result.zones &&
        typeof result.zones === "object"
      ) {
        const zones = result.zones as {
          power?: Array<{ number?: number; secondsInZone?: number }>;
          hr?: Array<{ number?: number; secondsInZone?: number }>;
        };
        if (Array.isArray(zones.power) && zones.power.length > 0) {
          detailed_view += "\nPower Zones:\n";
          for (const zone of zones.power) {
            detailed_view += `Zone ${zone.number}: ${zone.secondsInZone} seconds\n`;
          }
        }
        if (Array.isArray(zones.hr) && zones.hr.length > 0) {
          detailed_view += "\nHeart Rate Zones:\n";
          for (const zone of zones.hr) {
            detailed_view += `Zone ${zone.number}: ${zone.secondsInZone} seconds\n`;
          }
        }
      }

      // Fetch and append intervals if requested
      if (intervals) {
        const intervalsResponse = await getIntervals({
          path: { id: activity_id },
        });
        if (intervalsResponse && intervalsResponse.data) {
          detailed_view +=
            "\n\n" + formatIntervalsTable(intervalsResponse.data);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: detailed_view,
          },
        ],
      };
    }
  );
