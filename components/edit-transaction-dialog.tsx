"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Transaction } from "@/app/types/transaction"
import { getCategories } from "@/app/utils/categories"
import { listenToAllAccounts } from "@/app/utils/accounts"
import { getStatus } from "@/app/utils/status"
import { Option } from "@/app/utils/categories"
import { useAuth } from "@/app/context/AuthContext"
import { updateTransaction } from "@/app/utils/transactions"
import { Account } from "@/app/types/Account"

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function EditTransactionDialog({ open, onOpenChange, transaction }: EditTransactionDialogProps) {
  const [formData, setFormData] = useState<Transaction>({
    description: "",
    category: {
      label: "",
      value: "",
    },
    type: "expense",
    amount: 0.0,
    account: {
      label: "",
      value: "",
    },
    status: {
      label: "",
      value: "",
    },
    date: new Date(),
    id: "",
    user_id: "",
  })

  const [categories, setCategories] = useState<{ income: Option[]; expense: Option[] }>({ income: [], expense: [] })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [status, setStatus] = useState<Option[]>([])
  const [initialCategory, setInitialCategory] = useState<Option | null>(null)
  const [initialAccount, setInitialAccount] = useState<Option | null>(null)

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await getCategories(user.uid);
      listenToAllAccounts(user.uid, setAccounts);
      const statusData = await getStatus();
      setCategories(categoriesData);
      setStatus(statusData);
    };

    fetchData();

    if (transaction) {
      setFormData({
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        amount: Math.abs(transaction.amount),
        account: transaction.account,
        status: transaction.status,
        date: new Date(transaction.date),
        id: transaction.id,
        user_id: user.uid
      })
      setInitialCategory(transaction.category)
      setInitialAccount(transaction.account)
    }
  }, [transaction, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedTransaction = {
      ...transaction,
      ...formData,
      amount: formData.type === "income" ? formData.amount : formData.amount,
      date: formData.date,
    }

    if (transaction && transaction.id){
      updateTransaction(updatedTransaction, initialCategory?.value, initialAccount?.value)
    }

    onOpenChange(false)
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update the transaction details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value, category: { label: "", value: "" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category?.value}
                onValueChange={(value) => setFormData({ ...formData, category: { label: "", value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.type as "expense" | "income"].map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select value={formData.account?.value} onValueChange={(value) => setFormData({ ...formData, account: { label: "", value }})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span style={{ color: acc.color, fontWeight: "semi-bold" }}>
                        {acc.institution} - {acc.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status?.value} onValueChange={(value) => setFormData({ ...formData, status: { label: "", value} })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {status.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label.charAt(0).toUpperCase() + status.label.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
