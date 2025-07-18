import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";

export const registerGetTransactions = (server: McpServer) => {
  server.tool(
    "get_transactions",
    "List transactions of a given month and optional account",
    {
      year: z.string().length(4).regex(/^\d{4}$/).describe("Four-digit year (e.g. '2025')"),
      month: z.string().length(2).regex(/^(0[1-9]|1[0-2])$/).describe("Two-digit month (e.g. '01' for January, '12' for December)"),
      account_id: z.string().optional().describe("Account ID to filter transactions (optional)"),
    },
    async ({ year, month, account_id }) => {
      const start_date = `${year}-${month}-01`;
      const end_date = new Date(Number(year), Number(month), 0)
        .toISOString()
        .split("T")[0];

      const query = new URLSearchParams({ start_date, end_date });
      if (account_id) {
        query.append("account_id", account_id);
      }

      const url = `${ORGANIZZE_API_BASE}/transactions?${query.toString()}`;
      const data = await makeRequest(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve transactions.",
            },
          ],
        };
      }

      if (data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No transactions found for ${month}/${year}.`,
            },
          ],
        };
      }

      const text = data.map((t: any) => {
        return `📅 ${t.date} | 💬 ${t.description} | 💰 ${(t.amount_cents / 100).toFixed(2)} | ✅ ${t.paid ? "Paid" : "Pending"}`;
      }).join("\n");

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    }
  );
} 