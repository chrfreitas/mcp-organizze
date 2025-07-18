import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";

interface CreditCardInvoice {
  id: number;
  date: string;
  starting_date: string;
  closing_date: string;
  amount_cents: number;
  payment_amount_cents: number;
  balance_cents: number;
  previous_balance_cents: number;
  credit_card_id: number;
}

const formatInvoice = (invoice: CreditCardInvoice) => {
  const amountFormatted = `R$ ${(invoice.amount_cents / 100).toFixed(2)}`;
  const paymentFormatted = `R$ ${(invoice.payment_amount_cents / 100).toFixed(2)}`;
  const balanceFormatted = `R$ ${(invoice.balance_cents / 100).toFixed(2)}`;
  const previousBalanceFormatted = `R$ ${(invoice.previous_balance_cents / 100).toFixed(2)}`;
  
  return `Invoice #${invoice.id} - ${invoice.date}\n   Period: ${invoice.starting_date} to ${invoice.closing_date}\n   Amount: ${amountFormatted} | Payment: ${paymentFormatted}\n   Balance: ${balanceFormatted} | Previous Balance: ${previousBalanceFormatted}`;
};

export const registerListCreditCardInvoices = (server: McpServer) => {
  server.tool(
    "list_credit_card_invoices",
    "List invoices for a specific credit card",
    {
      credit_card_id: z.number().describe("Credit card ID to get invoices for"),
    },
    async ({ credit_card_id }) => {
      const url = `${ORGANIZZE_API_BASE}/credit_cards/${credit_card_id}/invoices`;
      const data = await makeRequest<CreditCardInvoice[]>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve credit card invoices data.",
            },
          ],
        };
      }

      if (data.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No invoices found for credit card ID ${credit_card_id}.`,
            },
          ],
        };
      }

      const text = data.map(formatInvoice).join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Credit Card Invoices (Card ID: ${credit_card_id})\n\n${text}`,
          },
        ],
      };
    },
  );
} 