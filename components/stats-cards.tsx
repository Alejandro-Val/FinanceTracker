import {
  ArrowDownRight,
  ArrowUpRight,
  // DollarSign,
  // TrendingDown,
  // TrendingUp,
  // Wallet
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from "react";
import { Stat } from "@/app/types/Stat";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getMonthlyStats } from "@/app/utils/stats";

// const icons = {
//   income: Wallet,
//   expense: DollarSign,
//   trendUp: TrendingUp,
//   trendDown: TrendingDown,
// };


export default function StatsCards() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const stopListening = getMonthlyStats(user.uid, setStats);
          return stopListening;
        }
      });
  
      return () => {
        unsubscribe();
      };
    }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-8 w-full px-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
              <span className="ml-1">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}