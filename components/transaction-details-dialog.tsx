"use client"

import { Transaction } from "@/app/types/transaction"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Calendar, CreditCard, Tag, FileText, DollarSign } from "lucide-react"

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>Complete information about this transaction</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount and Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Amount</span>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </div>
              <Badge
                variant={transaction.type === "income" ? "default" : "secondary"}
                className={transaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {transaction.type}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{transaction.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">{format(new Date(transaction.date), "EEEE, MMMM dd, yyyy")}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="outline">{transaction.category}</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Account</p>
                <p className="text-sm">{transaction.account}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status and Tags */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
              <Badge
                variant={transaction.status === "completed" ? "default" : "secondary"}
                className={
                  transaction.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }
              >
                {transaction.status}
              </Badge>
            </div>
          </div>

          {/* Transaction ID */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">Transaction ID: {transaction.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
