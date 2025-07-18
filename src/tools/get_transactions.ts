import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";

export const registerGetTransactions = (server: McpServer) => {
  server.tool(
    "get_transactions",
    "List transactions of a given month and optional account",
    {
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Start date in 'YYYY-MM-DD' format (e.g. '2025-01-01')"),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("End date in 'YYYY-MM-DD' format (e.g. '2025-01-31')"),
      account_id: z.string().optional().describe("Account ID to filter transactions (optional)"),
    },
    async ({ start_date, end_date, account_id }) => {
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
              text: `No transactions found for ${start_date}/${end_date}.`,
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