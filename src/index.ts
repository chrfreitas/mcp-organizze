import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

const ORGANIZZE_API_BASE = "https://api.organizze.com.br/rest/v2";

const server = new McpServer({
  name: "organizze",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});


async function makeRequest<Account>(url: string) {
  const credentials = `${process.env.ORGANIZZE_USERNAME}:${process.env.ORGANIZZE_PASSWORD}`;
  const encodedCredentials = btoa(credentials);

  if(!process.env.ORGANIZZE_USER_AGENT){
    throw new Error('USER_AGENT is required');
  }

  const headers = {
      "User-Agent": process.env.ORGANIZZE_USER_AGENT,
      "Authorization": `Basic ${encodedCredentials}`
  };
  try {
      const response = await fetch(url, { method: 'GET', headers });
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json());
  }
  catch (error) {
      console.log(error);
      return null;
  }
}

interface Account {
  id: number;
  name: string;
  description: string;
  archived: boolean;
  institution_id: string;
  created_at: string; 
  updated_at: string;
  default: boolean;
  type: string; 
}

const formatData = (account: Account) => {
  return `ID:${account.id}, Name: ${account.name}, Description: ${account.description}, InstitutionID: ${account.institution_id}`
}

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


    const text = data.map(formatData).join("\n")

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

server.tool(
  "get_goals",
  "Get goals of yearn and month",
  {
    year: z.string().length(4).regex(/^\d{4}$/).describe("Four-digit year (e.g. '2025')"),
    month: z.string().length(2).regex(/^(0[1-9]|1[0-2])$/).describe("Two-digit month (e.g. '01' for January, '12' for December)")
  },
  async ({year, month}) => {
    const url = `${ORGANIZZE_API_BASE}/budgets/${year}/${month}`;
    const data = await makeRequest<Account[]>(url);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve data",
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Organizze MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});