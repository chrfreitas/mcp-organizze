import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";
import { Account } from "../types.js";

export const registerGetCategories = (server: McpServer) => {
  server.tool(
    "get_categories",
    "List categories",
    async () => {
      const url = `${ORGANIZZE_API_BASE}/categories`;
      const data = await makeRequest<Account[]>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to retrieve data ${JSON.stringify(data)}`,
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