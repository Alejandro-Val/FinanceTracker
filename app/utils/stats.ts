import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Stat } from "@/app/types/Stat";

export const getMonthlyStats = async (
  userId: string,
  onUpdate: (stats: Stat[]) => void
) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const q = query(
    collection(db, "transaction"),
    where("user_id", "==", userId),
    where("date", ">=", Timestamp.fromDate(startOfMonth)),
    where("date", "<=", Timestamp.fromDate(endOfMonth))
  );

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    let totalIncome = 0;
    let totalExpense = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.type === "income") {
        totalIncome += data.amount;
      } else if (data.type === "expense") {
        totalExpense += data.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    const stats: Stat[] = [
      {
        title: "Monthly Balance",
        value: `$${balance.toFixed(2)}`,
        change: "0%",
        trend: balance >= 0 ? "up" : "down",
        icon: "DollarSign",
        description: "Current account balance",
      },
      {
        title: "Monthly Income",
        value: `$${totalIncome.toFixed(2)}`,
        change: "0%", // Puedes implementar un cálculo de cambio si quieres comparar con el mes anterior
        trend: "up",
        icon: "ArrowUpRight",
        description: "This month's income",
      },
      {
        title: "Monthly Expenses",
        value: `$${totalExpense.toFixed(2)}`,
        change: "0%",
        trend: "down",
        icon: "ArrowDownLeft",
        description: "This month's expenses",
      },
    ];

    onUpdate(stats);
  });

  return unsubscribe;
};
