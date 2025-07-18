import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";

interface TransactionDetails {
  id: number;
  description: string;
  date: string;
  paid: boolean;
  amount_cents: number;
  total_installments: number;
  installment: number;
  recurring: boolean;
  account_id: number;
  category_id: number;
  contact_id: number | null;
  notes: string;
  attachments_count: number;
  credit_card_id: number | null;
  credit_card_invoice_id: number | null;
  paid_credit_card_id: number | null;
  paid_credit_card_invoice_id: number | null;
  oposite_transaction_id: number | null;
  oposite_account_id: number | null;
  created_at: string;
  updated_at: string;
}

const formatTransactionDetails = (transaction: TransactionDetails) => {
  const amountFormatted = `R$ ${(transaction.amount_cents / 100).toFixed(2)}`;
  const paidStatus = transaction.paid ? "Paid" : "Pending";
  const recurringStatus = transaction.recurring ? "Yes" : "No";
  const installmentInfo = transaction.total_installments > 1 
    ? ` (${transaction.installment}/${transaction.total_installments})` 
    : "";
  
  return `Transaction #${transaction.id} - ${transaction.description}${installmentInfo}
   Date: ${transaction.date} | Amount: ${amountFormatted} | Status: ${paidStatus}
   Account ID: ${transaction.account_id} | Category ID: ${transaction.category_id}
   Recurring: ${recurringStatus} | Attachments: ${transaction.attachments_count}
   Credit Card ID: ${transaction.credit_card_id || "N/A"} | Invoice ID: ${transaction.credit_card_invoice_id || "N/A"}
   Notes: ${transaction.notes || "None"}
   Created: ${transaction.created_at} | Updated: ${transaction.updated_at}`;
};

export const registerGetTransactionDetails = (server: McpServer) => {
  server.tool(
    "get_transaction_details",
    "Get detailed information about a specific transaction",
    {
      transaction_id: z.number().describe("Transaction ID to get details for"),
    },
    async ({ transaction_id }) => {
      const url = `${ORGANIZZE_API_BASE}/transactions/${transaction_id}`;
      const data = await makeRequest<TransactionDetails>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve transaction details.",
            },
          ],
        };
      }

      const text = formatTransactionDetails(data);

      return {
        content: [
          {
            type: "text",
            text: `Transaction Details\n\n${text}`,
          },
        ],
      };
    },
  );
} 