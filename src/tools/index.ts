import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGetCategories } from "./get_categories.js";
import { registerGetCreditCardInvoiceDetails } from "./get_credit_card_invoice_details.js";
import { registerGetGoals } from "./get_goals.js";
import { registerGetTransactionDetails } from "./get_transaction_details.js";
import { registerGetTransactions } from "./get_transactions.js";
import { registerListAccount } from "./list_accounts.js";
import { registerListCreditCardInvoices } from "./list_credit_card_invoices.js";
import { registerListCreditCards } from "./list_credit_cards.js";

export function registerTools(server: McpServer) {
  registerListAccount(server);
  registerGetGoals(server);
  registerGetCategories(server);
  registerGetTransactions(server);
  registerListCreditCards(server);
  registerListCreditCardInvoices(server);
  registerGetTransactionDetails(server);
  registerGetCreditCardInvoiceDetails(server);
}
