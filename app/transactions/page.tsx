"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CalendarIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import type { Transaction } from "@/app/types/transaction"
import { DateRange } from "react-day-picker"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { listenToTransactionsByUserId, deleteTransaction } from "@/app/utils/transactions"
import { getCategoriesArray, Option } from "@/app/utils/categories"
import { listenToAllAccounts } from "@/app/utils/accounts"
import { getStatusArray } from "@/app/utils/status"
import { Account } from "../types/Account"
import { useAuth } from "../context/AuthContext"

type SortField = "date" | "amount" | "description" | "category"
type SortOrder = "asc" | "desc"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [status, setStatus] = useState<string[]>([])
  const  { user } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const stopListening = listenToTransactionsByUserId(user.uid, setTransactions);
        return stopListening;
      }
    });

    const fetchData = async () => {
      const categoriesData = await getCategoriesArray(user.uid);
      listenToAllAccounts(user.uid, setAccounts);
      const statusData = await getStatusArray();
      setCategories(categoriesData);
      setStatus(statusData);
    };

    if(user) {  
      fetchData();
    }


    return () => {
      unsubscribe(); // Cancela onAuthStateChanged
    };
  }, [user]);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.label.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || transaction.category?.label === selectedCategory
      const matchesType = selectedType === "all" || transaction.type === selectedType
      const matchesAccount = selectedAccount === "all" || transaction.account?.value === selectedAccount
      const matchesStatus = selectedStatus === "all" || transaction.status?.label === selectedStatus

      let matchesDate = true
      if (dateRange.from && dateRange.to) {
        const transactionDate = new Date(transaction.date)
        matchesDate = transactionDate >= dateRange.from && transactionDate <= dateRange.to
      }

      return matchesSearch && matchesCategory && matchesType && matchesAccount && matchesStatus && matchesDate
    })
    .sort((a, b) => {
      let aValue: string | number | Date | Option | null = a[sortField]
      let bValue: string | number | Date | Option | null = b[sortField]

      if (sortField === "date" && typeof aValue === "string" && typeof bValue === "string") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else if (sortField === "amount" && typeof aValue === "number" && typeof bValue === "number") {
        aValue = Math.abs(aValue)
        bValue = Math.abs(bValue)
      }

      if (aValue && bValue && aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue && bValue && aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleDeleteTransaction = async (id: string, categoryId: string, accountId: string) => {
    try {
      await deleteTransaction(id, categoryId, accountId)
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsDialog(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowEditDialog(true)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  const handleDateRangeSelect = (range: DateRange | undefined) => {
  if (range) {
    setDateRange(range);
  }
};

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Manage and track all your financial transactions</p>
          </div>
          <Button className="cursor-pointer" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[140px] cursor-pointer">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
                    <SelectItem value="income" className="cursor-pointer">Income</SelectItem>
                    <SelectItem value="expense" className="cursor-pointer">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[160px] cursor-pointer">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="cursor-pointer">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-full sm:w-[160px] cursor-pointer">
                    <SelectValue placeholder="Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="cursor-pointer">
                        <span style={{ color: account.color, fontWeight: "semi-bold" }}>
                          {account.institution} - {account.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[140px] cursor-pointer">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                    {status.map((stat) => (
                      <SelectItem key={stat} value={stat} className="cursor-pointer">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-max justify-start text-left font-normal cursor-pointer">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("date")} className="h-auto p-0 font-semibold">
                        Date
                        {getSortIcon("date")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("description")}
                        className="h-auto p-0 font-semibold"
                      >
                        Description
                        {getSortIcon("description")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("category")}
                        className="h-auto p-0 font-semibold"
                      >
                        Category
                        {getSortIcon("category")}
                      </Button>
                    </TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                        Amount
                        {getSortIcon("amount")}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category?.label || "Not Found"}</Badge>
                      </TableCell>
                      <TableCell style={{ color: transaction.account?.color }}>{transaction.account?.institution + " - " + transaction.account?.label || "Not Found"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.status?.label === "completed" ? "default" : "secondary"}
                          className={
                            transaction.status?.label === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {transaction.status && transaction.status.label.charAt(0).toUpperCase() + transaction.status?.label.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTransaction(transaction.id, transaction.category?.value || "", transaction.account?.value || "")}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddTransactionDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <TransactionDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        transaction={selectedTransaction}
      />
      <EditTransactionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        transaction={selectedTransaction}
      />
    </div>
  )
}
