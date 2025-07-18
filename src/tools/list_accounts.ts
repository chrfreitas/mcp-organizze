import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";
import { Account } from "../types.js";

const formatData = (account: Account) => {
  return `ID:${account.id}, Name: ${account.name}, Description: ${account.description}, InstitutionID: ${account.institution_id}`
}

export const registerListAccount = (server: McpServer) => {
  server.tool(
    "list_accounts",
    "Get list of all accounts in a period",
    async () => {
      const url = `${ORGANIZZE_API_BASE}/accounts`;
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

      const text = data.map(formatData).join("\n");

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
