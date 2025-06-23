"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StatsCards from "@/components/stats-cards";
import { RecentTransactions } from "@/components/recent-transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";

export default function Home() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <div className="flex flex-col gap-y-4 items-center justify-start min-h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center px-8 justify-between w-full h-full mt-4">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-xl">Welcome back {user?.displayName}! Here&apos;s your financial overview.</p>
        </div>
        <Button className="cursor-pointer" onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <StatsCards />

      <div className="flex flex-col items-start px-8 justify-center w-full h-full">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Recent Transactions</CardTitle>
                <CardDescription className="text-md">Your latest financial activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>

      <AddTransactionDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
