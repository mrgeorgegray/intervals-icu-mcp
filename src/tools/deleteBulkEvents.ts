import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { deleteEventsBulk } from "../client/generated/sdk.gen";

export const DeleteBulkEventsInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
  events: z
    .array(
      z.object({
        id: z
          .number()
          .optional()
          .describe(
            "Event ID (optional, required if external_id not provided)"
          ),
        external_id: z
          .string()
          .optional()
          .describe("External ID (optional, required if id not provided)"),
      })
    )
    .min(1, "At least one event is required.")
    .describe(
      "Array of events to delete, each with id or external_id (minimum 1)"
    ),
});

export type DeleteBulkEventsInput = z.infer<typeof DeleteBulkEventsInputSchema>;

export const deleteBulkEvents = (server: McpServer) =>
  server.tool(
    "deleteBulkEvents",
    "Delete multiple events from the athlete's calendar by id or external_id.",
    DeleteBulkEventsInputSchema.shape,
    async (input: DeleteBulkEventsInput) => {
      const athleteId = input.athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      // Call the API
      const response = await deleteEventsBulk({
        path: { id: athleteId },
        body: input.events,
      });
      const deleted = response.data?.eventsDeleted;
      if (typeof deleted !== "number") {
        return {
          content: [
            {
              type: "text",
              text: `Bulk event deletion failed for athlete ${athleteId}.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted ${deleted} events for athlete ${athleteId}.`,
          },
        ],
      };
    }
  );
