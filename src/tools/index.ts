import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetCategories } from "./get_categories.js";
import { registerGetGoals } from "./get_goals.js";
import { registerGetTransactions } from "./get_transactions.js";
import { registerListAccount } from "./list_accounts.js";

export function registerTools(server: McpServer) {
  registerListAccount(server);
  registerGetGoals(server);
  registerGetCategories(server);
  registerGetTransactions(server);
}
