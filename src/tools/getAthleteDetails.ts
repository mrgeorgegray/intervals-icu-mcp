import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getAthleteProfile } from "../client/generated/sdk.gen";

export const GetAthleteDetailsInputSchema = z.object({
  athlete_id: z
    .string()
    .optional()
    .describe(
      "The Intervals.icu athlete ID (optional, will use ATHLETE_ID from .env if not provided)"
    ),
});

export type GetAthleteDetailsInput = z.infer<
  typeof GetAthleteDetailsInputSchema
>;

export const getAthleteDetails = (server: McpServer) =>
  server.tool(
    "getAthleteDetails",
    "Get athlete details.",
    GetAthleteDetailsInputSchema.shape,
    async ({ athlete_id }: GetAthleteDetailsInput) => {
      const athleteId = athlete_id || process.env.INTERVALS_ATHLETE_ID;
      if (!athleteId) {
        throw new Error(
          "INTERVALS_ATHLETE_ID environment variable is not set and no athlete_id provided"
        );
      }
      const response = await getAthleteProfile({
        path: {
          id: athleteId,
        },
      });
      return {
        content: [
          {
            type: "text",
            text: response.data
              ? JSON.stringify(response.data?.athlete)
              : "No data",
          },
        ],
      };
    }
  );
