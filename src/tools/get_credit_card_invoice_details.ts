import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ORGANIZZE_API_BASE, makeRequest } from "../api.js";

interface InvoiceTransaction {
  id: number;
  description: string;
  date: string;
  paid: boolean;
  amount_cents: number;
  total_installments: number;
  installment: number;
  recurring: boolean;
  account_id: number;
  account_type: string;
  category_id: number;
  contact_id: number | null;
  notes: string;
  attachments_count: number;
  created_at: string;
  updated_at: string;
}

interface CreditCardInvoiceDetails {
  id: number;
  date: string;
  starting_date: string;
  closing_date: string;
  amount_cents: number;
  payment_amount_cents: number;
  balance_cents: number;
  previous_balance_cents: number;
  credit_card_id: number;
  transactions: InvoiceTransaction[];
  payments: InvoiceTransaction[];
}

const formatTransaction = (transaction: InvoiceTransaction) => {
  const amountFormatted = `R$ ${(transaction.amount_cents / 100).toFixed(2)}`;
  const paidStatus = transaction.paid ? "Paid" : "Pending";
  const installmentInfo = transaction.total_installments > 1 
    ? ` (${transaction.installment}/${transaction.total_installments})` 
    : "";
  
  return `  ${transaction.description}${installmentInfo}
    Date: ${transaction.date} | Amount: ${amountFormatted} | Status: ${paidStatus}
    Account Type: ${transaction.account_type} | Category ID: ${transaction.category_id}
    Notes: ${transaction.notes || "None"}`;
};

const formatInvoiceDetails = (invoice: CreditCardInvoiceDetails) => {
  const amountFormatted = `R$ ${(invoice.amount_cents / 100).toFixed(2)}`;
  const paymentFormatted = `R$ ${(invoice.payment_amount_cents / 100).toFixed(2)}`;
  const balanceFormatted = `R$ ${(invoice.balance_cents / 100).toFixed(2)}`;
  const previousBalanceFormatted = `R$ ${(invoice.previous_balance_cents / 100).toFixed(2)}`;
  
  let result = `Invoice #${invoice.id} - ${invoice.date}
   Period: ${invoice.starting_date} to ${invoice.closing_date}
   Amount: ${amountFormatted} | Payment: ${paymentFormatted}
   Balance: ${balanceFormatted} | Previous Balance: ${previousBalanceFormatted}
   Credit Card ID: ${invoice.credit_card_id}`;

  if (invoice.transactions.length > 0) {
    result += `\n\nTransactions (${invoice.transactions.length}):\n`;
    result += invoice.transactions.map(formatTransaction).join("\n\n");
  }

  if (invoice.payments.length > 0) {
    result += `\n\nPayments (${invoice.payments.length}):\n`;
    result += invoice.payments.map(formatTransaction).join("\n\n");
  }

  return result;
};

export const registerGetCreditCardInvoiceDetails = (server: McpServer) => {
  server.tool(
    "get_credit_card_invoice_details",
    "Get detailed information about a specific credit card invoice",
    {
      credit_card_id: z.number().describe("Credit card ID"),
      invoice_id: z.number().describe("Invoice ID to get details for"),
    },
    async ({ credit_card_id, invoice_id }) => {
      const url = `${ORGANIZZE_API_BASE}/credit_cards/${credit_card_id}/invoices/${invoice_id}`;
      const data = await makeRequest<CreditCardInvoiceDetails>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve credit card invoice details.",
            },
          ],
        };
      }

      const text = formatInvoiceDetails(data);

      return {
        content: [
          {
            type: "text",
            text: `Credit Card Invoice Details\n\n${text}`,
          },
        ],
      };
    },
  );
} 