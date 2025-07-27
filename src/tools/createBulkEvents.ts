import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { CreateEventInputSchema } from "./createEvent";
import { createMultipleEvents } from "../client/generated/sdk.gen";

export const CreateBulkEventsInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
  upsert: z
    .boolean()
    .optional()
    .describe(
      "Update events with matching external_id and created by the same OAuth application instead of creating new ones (optional)"
    ),
  events: z
    .array(CreateEventInputSchema)
    .min(1, "At least one event is required.")
    .describe("Array of events to create (minimum 1)"),
});

export type CreateBulkEventsInput = z.infer<typeof CreateBulkEventsInputSchema>;

export const createBulkEvents = (server: McpServer) =>
  server.tool(
    "createBulkEvents",
    "Create multiple events for the current athlete in bulk. Uses the same schema as createEvent for each event.",
    CreateBulkEventsInputSchema.shape,
    async (input: CreateBulkEventsInput) => {
      const athleteId = input.athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      // Map training_load to icu_training_load for each event
      const events = input.events.map((event) => ({
        ...event,
        icu_training_load: event.training_load,
      }));
      // Call the API
      const response = await createMultipleEvents({
        path: { id: athleteId },
        body: events,
        query:
          input.upsert !== undefined ? { upsert: input.upsert } : undefined,
      });
      if (!response.data || !Array.isArray(response.data)) {
        return {
          content: [
            {
              type: "text",
              text: `Bulk event creation failed for athlete ${athleteId}.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Successfully created ${response.data.length} events for athlete ${athleteId}.`,
          },
        ],
      };
    }
  );
