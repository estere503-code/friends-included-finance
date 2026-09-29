export type Role = "svetlana" | "richard" | "anastasia" | "jean_claude" | "kevin";
export type Project = "A" | "B";
export type Allocation = Project | "overhead";
export type SaleStatus = "pending" | "approved";
export type ExpenseStatus = "awaiting_allocation" | "allocated";

export const PEOPLE: Record<Role, { name: string; title: string }> = {
  svetlana: { name: "Svetlana de Monte Carlo", title: "Manager" },
  richard: { name: "Richard Darling", title: "Sales" },
  anastasia: { name: "Anastasia Ferrari", title: "Sales" },
  jean_claude: { name: "Jean-Claude Bērziņš", title: "Sales" },
  kevin: { name: "Kevin von Whatever", title: "Expenses" }
};

export type Split = { richard: number; anastasia: number; jean_claude: number };
export type Sale = { id: string; reference: string; submitted_at: string; salesperson: Exclude<Role, "svetlana" | "kevin">; customer: string; project: Project; description: string; amount: number; proposed_split: Split; approved_split: Split | null; commissions: Split | null; status: SaleStatus; notification_chat_id: string | null; sync_status: string; notification_status: string };
export type Expense = { id: string; reference: string; submitted_at: string; reporter: "kevin"; description: string; category: "Materials" | "Travel" | "Other"; amount: number; proposed_allocation: Allocation; final_allocation: Allocation | null; status: ExpenseStatus; notification_chat_id: string | null; sync_status: string; notification_status: string };
