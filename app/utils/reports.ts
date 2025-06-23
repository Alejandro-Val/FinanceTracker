import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DateRange, ReportsData } from "../types/Reports";
import { Category } from "../types/Category";

export const getFinancialOverview = async (uid: string, dateRange: DateRange): Promise<ReportsData> => {
  const financialOverview: ReportsData = {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    largestExpense: { name: "", amount: 0 }
  };

  const q = query(collection(db, "transaction"), where("user_id", "==", uid), where("date", ">=", dateRange.from), where("date", "<=", dateRange.to));

  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      const amount = data.amount || 0;
      const type = data.type;

      if (type === "income") {
        financialOverview.totalIncome += amount;
      } else if (type === "expense") {
        financialOverview.totalExpense += amount;

        if (financialOverview.largestExpense && amount > financialOverview.largestExpense.amount) {
          const categoryData = (await getDoc(data.category)).data() as Category;
          financialOverview.largestExpense.name = categoryData.name;
          financialOverview.largestExpense.amount = amount;
        }
      }
    });

    if(financialOverview && financialOverview.totalIncome && financialOverview.totalExpense) {
      financialOverview.netSavings = financialOverview.totalIncome - financialOverview.totalExpense;
    }

    return financialOverview;
  } catch (error) {
    console.error("Error getting financial overview:", error);
    return financialOverview;
  }
};

export const getIncomeAnalysis = async (uid: string, dateRange: DateRange): Promise<ReportsData> => {
  const financialOverview: ReportsData = {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    largestExpense: { name: "", amount: 0 }
  };

  const q = query(collection(db, "transaction"), where("user_id", "==", uid), where("date", ">=", dateRange.from), where("date", "<=", dateRange.to));

  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount || 0;
      const type = data.type;

      if (type === "income") {
        financialOverview.totalIncome += amount;
      } else if (type === "expense") {
        financialOverview.totalExpense += amount;

        if (financialOverview.largestExpense && amount > financialOverview.largestExpense.amount) {
          financialOverview.largestExpense.name = data.category;
          financialOverview.largestExpense.amount = amount;
        }
      }
    });

    if(financialOverview && financialOverview.totalIncome && financialOverview.totalExpense) {
      financialOverview.netSavings = financialOverview.totalIncome - financialOverview.totalExpense;
    }

    return financialOverview;
  } catch (error) {
    console.error("Error getting financial overview:", error);
    return financialOverview;
  }
};

export const getExpenseAnalysis = async (uid: string, dateRange: DateRange): Promise<ReportsData> => {
  const financialOverview: ReportsData = {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    largestExpense: { name: "", amount: 0 }
  };

  const q = query(collection(db, "transaction"), where("user_id", "==", uid), where("date", ">=", dateRange.from), where("date", "<=", dateRange.to));

  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = data.amount || 0;
      const type = data.type;

      if (type === "income") {
        financialOverview.totalIncome += amount;
      } else if (type === "expense") {
        financialOverview.totalExpense += amount;

        if (financialOverview.largestExpense && amount > financialOverview.largestExpense.amount) {
          financialOverview.largestExpense.name = data.category;
          financialOverview.largestExpense.amount = amount;
        }
      }
    });

    if(financialOverview && financialOverview.totalIncome && financialOverview.totalExpense) {
      financialOverview.netSavings = financialOverview.totalIncome - financialOverview.totalExpense;
    }

    return financialOverview;
  } catch (error) {
    console.error("Error getting financial overview:", error);
    return financialOverview;
  }
};