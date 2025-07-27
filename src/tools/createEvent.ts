import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createEvent as createEventApi } from "../client/generated/sdk.gen";
import type { EventEx } from "../client/generated/types.gen";
import { formatEventDetails } from "../utils/formatting";

export const CreateEventInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
  start_date_local: z
    .string()
    .describe(
      "Start date and time in ISO-8601 format (required, local time, e.g. 2024-07-01T09:00:00)"
    )
    .min(1),
  name: z.string().describe("Event name (required)").min(1),
  type: z
    .enum([
      "Ride",
      "MTB",
      "Gravel Ride",
      "Track Cycling",
      "Run",
      "Trail Run",
      "Swim",
      "Virtual Ride",
      "Virtual Run",
      "Weight Training",
      "Hike",
      "Walk",
      "Alpine Ski",
      "Badminton",
      "Backcountry Ski",
      "Canoeing",
      "Crossfit",
      "E-Bike Ride",
      "E-MTB Ride",
      "Elliptical",
      "Golf",
      "Handcycle",
      "HIIT",
      "Hockey",
      "Ice Skate",
      "Inline Skate",
      "Kayaking",
      "Kitesurf",
      "Nordic Ski",
      "Open Water Swim",
      "Pilates",
      "Padel",
      "Pickleball",
      "Racquetball",
      "Rock Climbing",
      "Roller Ski",
      "Rowing",
      "Virtual Rowing",
      "Rugby",
      "Sail",
      "Skateboard",
      "Snowboard",
      "Snowshoe",
      "Soccer",
      "Squash",
      "Stair-Stepper",
      "Stand Up Paddling",
      "Surfing",
      "Table Tennis",
      "Tennis",
      "Transition",
      "Velomobile",
      "Water Sport",
      "Wheelchair",
      "Windsurf",
      "Workout",
      "Yoga",
      "Other",
    ])
    .describe("Activity type (required)"),
  category: z
    .enum([
      "WORKOUT",
      "RACE_A",
      "RACE_B",
      "RACE_C",
      "NOTE",
      "HOLIDAY",
      "SICK",
      "INJURED",
      "SET_EFTP",
      "FITNESS_DAYS",
      "SEASON_START",
      "TARGET",
      "SET_FITNESS",
    ])
    .default("WORKOUT"),
  description: z
    .string()
    .optional()
    .describe(
      "Event description. For workouts with intervals, use the Native Intervals.icu Workout Format. IMPORTANT: Use specific target values (pace, percentage, watts) rather than descriptive terms like 'hard effort' or 'easy pace'.\n\nCreate workout steps by starting a line with a '-' and using the following constructs:\n• Duration: '30s', '10m', '1m30' etc.\n• Intensity: 100w, 80% (of FTP), 60% HR (of max heart rate), 100% LTHR (of threshold HR), 90 rpm (cadence)\n• Ranges: 100-140w, 80-90% (of FTP) etc.\n• Ramps: 'Ramp 100-200w' or 'Ramp 60-80%' (of FTP)\n• Distance: '3km 80% Pace'\n\nCreate repeats by including '6x' or whatever in the line before a set of steps.\n\nExample:\nWarmup\n- 20m 60% 90-100rpm\n\nMain set 6x\n- 4m 100% 40-50 rpm, power is less important than getting the torque\n- 5m recovery at 40%\n\nCooldown\n- 20m 60% 90-100rpm\n\nRun example:\nWarmup\n- 10m 65% HR\n\nMain set 15x\n- 30s 90% HR\n- 30s 60% HR\n\nCooldown\n- 5m 65% HR"
    ),
  indoor: z.boolean().optional().describe("Is the event indoor? (optional)"),
  color: z.string().optional().describe("Event color (optional)"),
  moving_time: z
    .number()
    .optional()
    .describe("Planned moving time in seconds (optional)"),
  distance: z
    .number()
    .optional()
    .describe("Planned distance in meters (optional)"),
  tags: z
    .array(z.string())
    .optional()
    .describe("Tags for the event (optional)"),
  target: z
    .enum(["AUTO", "POWER", "HR", "PACE"])
    .default("AUTO")
    .describe("Target type for workout intensities (default: AUTO)"),
  training_load: z
    .number()
    .optional()
    .describe("Planned training load (optional)"),
});

export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const createEvent = (server: McpServer) =>
  server.tool(
    "createEvent",
    "Create an event for the current athlete, optionally including intervals in the Native Intervals.icu Workout Format.",
    CreateEventInputSchema.shape,
    async (input: CreateEventInput) => {
      const athleteId = input.athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      // Prepare the event body
      const event: EventEx = {
        start_date_local: input.start_date_local,
        name: input.name,
        type: input.type,
        category: input.category,
        indoor: input.indoor,
        color: input.color,
        moving_time: input.moving_time,
        distance: input.distance,
        tags: input.tags,
        athlete_id: athleteId,
        description: input.description,
        target: input.target,
        icu_training_load: input.training_load,
      };
      // Call the API
      const response = await createEventApi({
        path: { id: athleteId },
        body: event,
      });
      const result = response.data;
      if (!result || typeof result !== "object") {
        return {
          content: [
            {
              type: "text",
              text: `Event creation failed for athlete ${athleteId}.`,
            },
          ],
        };
      }
      // Format and return the created event details
      const details = formatEventDetails(result);
      return {
        content: [
          {
            type: "text",
            text: details,
          },
        ],
      };
    }
  );
