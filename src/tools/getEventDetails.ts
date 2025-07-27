import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { showEvent } from "../client/generated/sdk.gen";
import { formatEventDetails } from "../utils/formatting";

export const GetEventDetailsInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
  event_id: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .describe("The Intervals.icu event ID (required)"),
});

export type GetEventDetailsInput = z.infer<typeof GetEventDetailsInputSchema>;

export const getEventDetails = (server: McpServer) =>
  server.tool(
    "getEventDetails",
    "Get detailed information for a specific event from Intervals.icu.",
    GetEventDetailsInputSchema.shape,
    async ({ athlete_id, event_id }: GetEventDetailsInput) => {
      const athleteId = athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      if (!event_id && event_id !== 0) {
        throw new Error("event_id is required");
      }
      const response = await showEvent({
        path: { id: athleteId, eventId: Number(event_id) },
      });
      const result = response.data;
      if (!result || typeof result !== "object") {
        return {
          content: [
            {
              type: "text",
              text: `No details found for event ${event_id} (athlete ${athleteId}).`,
            },
          ],
        };
      }
      const detailed_view = formatEventDetails(result);
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
