import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";

interface CreditCard {
  id: number;
  name: string;
  description: string | null;
  card_network: string | null;
  closing_day: number;
  due_day: number;
  limit_cents: number;
  kind: string;
  archived: boolean;
  default: boolean;
  created_at: string;
  updated_at: string;
}

const formatCreditCard = (card: CreditCard) => {
  const defaultStatus = card.default ? " (Default)" : "";
  const archivedStatus = card.archived ? " (Archived)" : "";
  const limitFormatted = card.limit_cents > 0 ? `R$ ${(card.limit_cents / 100).toFixed(2)}` : "Sem limite";
  
  return `${card.name}${defaultStatus}${archivedStatus}\n   ID: ${card.id} | Network: ${card.card_network || "N/A"} | Limit: ${limitFormatted}\n   Closing: Day ${card.closing_day} | Due: Day ${card.due_day}`;
};

export const registerListCreditCards = (server: McpServer) => {
  server.tool(
    "list_credit_cards",
    "Get list of all credit cards",
    async () => {
      const url = `${ORGANIZZE_API_BASE}/credit_cards`;
      const data = await makeRequest<CreditCard[]>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve credit cards data.",
            },
          ],
        };
      }

      if (data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No credit cards found.",
            },
          ],
        };
      }

      const text = data.map(formatCreditCard).join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Credit Cards\n\n${text}`,
          },
        ],
      };
    },
  );
} 