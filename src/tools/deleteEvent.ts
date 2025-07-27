import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { deleteEvent as deleteEventApi } from "../client/generated/sdk.gen";

export const DeleteEventInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
  event_id: z.number().describe("The event ID to delete (required)"),
  others: z
    .boolean()
    .optional()
    .describe(
      "If true, also delete other events added at the same time (optional)"
    ),
  not_before: z
    .string()
    .optional()
    .describe(
      "Do not delete other events before this local date (ISO-8601, optional)"
    ),
});

export type DeleteEventInput = z.infer<typeof DeleteEventInputSchema>;

export const deleteEvent = (server: McpServer) =>
  server.tool(
    "deleteEvent",
    "Delete an event for the current athlete by event ID.",
    DeleteEventInputSchema.shape,
    async (input: DeleteEventInput) => {
      const athleteId = input.athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      const query: Record<string, unknown> = {};
      if (input.others !== undefined) query.others = input.others;
      if (input.not_before !== undefined) query.notBefore = input.not_before;
      const response = await deleteEventApi({
        path: { id: athleteId, eventId: input.event_id },
        query: Object.keys(query).length ? query : undefined,
      });
      if (!response.data || typeof response.data !== "object") {
        return {
          content: [
            {
              type: "text",
              text: `Event deletion failed for athlete ${athleteId}, event ${input.event_id}.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Event ${input.event_id} deleted for athlete ${athleteId}.`,
          },
        ],
      };
    }
  );
