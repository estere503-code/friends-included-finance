import { google } from "googleapis";
import type { Expense, Sale } from "./types";

const sheets = () => google.sheets({ version: "v4", auth: new google.auth.JWT({ email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets"] }) });
const id = () => process.env.GOOGLE_SHEETS_ID!;
const split = (value: Record<string, number> | null) => value ? `${value.richard} / ${value.anastasia} / ${value.jean_claude}` : "";

async function upsert(tab: "Sales" | "Expenses", reference: string, values: (string | number)[]) {
  const client = sheets();
  const existing = await client.spreadsheets.values.get({ spreadsheetId: id(), range: `${tab}!A:A` });
  const row = (existing.data.values ?? []).findIndex((v) => v[0] === reference) + 1;
  const range = `${tab}!A${row || (existing.data.values?.length ?? 0) + 1}`;
  await client.spreadsheets.values.update({ spreadsheetId: id(), range, valueInputOption: "USER_ENTERED", requestBody: { values: [values] } });
}

export async function syncSale(sale: Sale) {
  await upsert("Sales", sale.reference, [sale.reference, sale.submitted_at, sale.salesperson, sale.customer, sale.project, sale.description, sale.amount, split(sale.proposed_split), split(sale.approved_split), sale.commissions?.richard ?? 0, sale.commissions?.anastasia ?? 0, sale.commissions?.jean_claude ?? 0, sale.status]);
}
export async function syncExpense(expense: Expense) {
  await upsert("Expenses", expense.reference, [expense.reference, expense.submitted_at, expense.reporter, expense.description, expense.category, expense.amount, expense.proposed_allocation, expense.final_allocation ?? "", expense.status]);
}
