export type ReportsData = {
  totalIncome?: number;
  totalExpense?: number;
  netSavings?: number;
  largestExpense?: { name: string; amount: number };
};

export type DateRange = {
  from: Date;
  to: Date;
};

export type ReportType = "overview" | "income" | "expenses" | "categories" | "accounts";

export type TimePeriod = "mtd" | "ytd" | "all";