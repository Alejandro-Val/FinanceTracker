import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useEffect, useState } from "react";
import { Transaction } from "@/app/types/transaction";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getLatestTransactions } from "@/app/utils/transactions";
import { format } from "date-fns"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const stopListening = getLatestTransactions(user.uid, setTransactions);
          return stopListening;
        }
      });
  
      return () => {
        unsubscribe(); // Cancela onAuthStateChanged
      };
    }, []);

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div>
              <p className="font-medium">{transaction.description}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {transaction.category?.label}
                </Badge>
                <span className="text-sm text-muted-foreground">{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
            </span>
            {transaction.type === "income" ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
