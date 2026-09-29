import { Expense, Project, Sale, Split } from "./types";

export const money = (value: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(value);
export const validSplit = (split: Split) => Object.values(split).every((v) => Number.isFinite(v) && v >= 0 && v <= 100) && Object.values(split).reduce((a, b) => a + b, 0) === 100;

export function commissionFor(amount: number, split: Split): Split {
  const pool = Math.round(amount * 10) / 100;
  const people = ["richard", "anastasia", "jean_claude"] as const;
  const result = Object.fromEntries(people.map((person) => [person, Math.floor(pool * split[person]) / 100])) as Split;
  const difference = Math.round((pool - Object.values(result).reduce((a, b) => a + b, 0)) * 100) / 100;
  if (difference) {
    const winner = people.sort((a, b) => split[b] - split[a] || people.indexOf(a) - people.indexOf(b))[0];
    result[winner] = Math.round((result[winner] + difference) * 100) / 100;
  }
  return result;
}

export function totals(sales: Sale[], expenses: Expense[]) {
  const approved = sales.filter((sale) => sale.status === "approved");
  const earned = (role: keyof Split) => approved.reduce((sum, sale) => sum + (sale.commissions?.[role] ?? 0), 0);
  const project = (key: Project) => {
    const projectSales = approved.filter((sale) => sale.project === key);
    const income = projectSales.reduce((sum, sale) => sum + sale.amount, 0);
    const commissions = projectSales.reduce((sum, sale) => sum + Object.values(sale.commissions ?? {}).reduce((a, b) => a + b, 0), 0);
    const allocatedExpenses = expenses.filter((expense) => expense.final_allocation === key).reduce((sum, expense) => sum + expense.amount, 0);
    return { income, commissions, allocatedExpenses, result: income - commissions - allocatedExpenses };
  };
  const commissionTotal = approved.reduce((sum, sale) => sum + Object.values(sale.commissions ?? {}).reduce((a, b) => a + b, 0), 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return { A: project("A"), B: project("B"), overhead: expenses.filter((e) => e.final_allocation === "overhead").reduce((sum, e) => sum + e.amount, 0), awaiting: expenses.filter((e) => e.status === "awaiting_allocation").reduce((sum, e) => sum + e.amount, 0), company: approved.reduce((sum, sale) => sum + sale.amount, 0) - commissionTotal - expenseTotal, commissions: { richard: earned("richard"), anastasia: earned("anastasia"), jean_claude: earned("jean_claude"), total: commissionTotal } };
}
