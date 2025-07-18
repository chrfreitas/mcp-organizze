import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";
import { Account } from "../types.js";

export const registerGetGoals = (server: McpServer) => {
  server.tool(
    "get_goals",
    "Get goals of yearn and month",
    {
      year: z.string().length(4).regex(/^\d{4}$/).describe("Four-digit year (e.g. '2025')"),
      month: z.string().length(2).regex(/^(0[1-9]|1[0-2])$/).describe("Two-digit month (e.g. '01' for January, '12' for December)")
    },
    async ({year, month}) => {
      const url = `${ORGANIZZE_API_BASE}/budgets/${year}/${month}`;
      const data = await makeRequest<Account[]>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve data",
            },
          ],
        };
      }

      if (data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No accounts`,
            },
          ],
        };
      }

      const text = JSON.stringify(data);

      return {
        content: [
          {
            type: "text",
            text: text,
          },
        ],
      };
    },
  );
} 