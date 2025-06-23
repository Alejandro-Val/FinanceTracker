"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { BarChart, ResponsiveContainer, Bar, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../context/AuthContext"
import { ReportsData } from "../types/Reports"
import { getFinancialOverview } from "../utils/reports"

export default function ReportsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })
  const [selectedPeriod, setSelectedPeriod] = useState("mtd")
  const [selectedReport, setSelectedReport] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  const [financialOverview, setFinancialOverview] = useState<ReportsData>({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    largestExpense: { name: "", amount: 0 }
  })

  // Función para cargar datos financieros
  const loadFinancialData = useCallback(async () => {
    if (!user?.uid) return
    
    setIsLoading(true)
    try {
      const data = await getFinancialOverview(user.uid, dateRange)
      setFinancialOverview(data)
    } catch (error) {
      console.error('Error loading financial data:', error)
      // Mantener el estado anterior en caso de error
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, dateRange])

  // Efecto para cargar datos cuando cambia el usuario o el rango de fechas
  useEffect(() => {
    if (selectedReport === "overview") {
      loadFinancialData()
    }
  }, [user.uid, dateRange, selectedReport, loadFinancialData])

  const handleSelectedReport = async (report: string) => {
    setSelectedReport(report)

    switch (report) {
      case "overview":
        await loadFinancialData()
        break
      case "income":
        // Implementar lógica para income
        break
      case "expenses":
        // Implementar lógica para expenses
        break
      case "categories":
        // Implementar lógica para categories
        break
      case "accounts":
        // Implementar lógica para accounts
        break
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const now = new Date()

    switch (period) {
      case "ytd":
        setDateRange({ from: startOfYear(now), to: now })
        break
      case "mtd":
        setDateRange({ from: startOfMonth(now), to: now })
        break
      case "lastmonth":
        const lastMonth = subMonths(now, 1)
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        })
        break
      case "lastyear":
        const lastYear = subYears(now, 1)
        setDateRange({
          from: startOfYear(lastYear),
          to: endOfYear(lastYear),
        })
        break
    }
  }

  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">Analyze your financial data and track your progress</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedReport} onValueChange={handleSelectedReport}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Financial Overview</SelectItem>
                <SelectItem value="income">Income Analysis</SelectItem>
                <SelectItem value="expenses">Expense Analysis</SelectItem>
                <SelectItem value="categories">Category Analysis</SelectItem>
                <SelectItem value="accounts">Account Analysis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtd">Month to Date</SelectItem>
                <SelectItem value="lastmonth">Last Month</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {selectedPeriod === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
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
                    onSelect={(range) =>
                      range && range.from && range.to && setDateRange(range as { from: Date; to: Date })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-8">
          {/* Report Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    {selectedReport === "overview" && "Financial Overview"}
                    {selectedReport === "income" && "Income Analysis"}
                    {selectedReport === "expenses" && "Expense Analysis"}
                    {selectedReport === "categories" && "Category Analysis"}
                    {selectedReport === "accounts" && "Account Analysis"}
                    {selectedReport === "budget" && "Budget Analysis"}
                    {selectedReport === "savings" && "Savings & Goals"}
                  </CardTitle>
                  <CardDescription>
                    {format(dateRange.from, "MMMM d, yyyy")} - {format(dateRange.to, "MMMM d, yyyy")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Report Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {selectedReport === "overview" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">
                        {isLoading ? "Loading..." : `$${financialOverview.totalIncome}`}
                      </p>
                      <p className="text-xs text-muted-foreground">+8.2% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        {isLoading ? "Loading..." : `$${financialOverview.totalExpense}`}
                      </p>
                      <p className="text-xs text-muted-foreground">-3.5% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Net Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        {isLoading ? "Loading..." : `$${financialOverview.netSavings}`}
                      </p>
                      <p className="text-xs text-muted-foreground">33.2% of income</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Largest Expense</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "Loading..." : (financialOverview.largestExpense?.name || "N/A")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isLoading ? "" : `$${financialOverview.largestExpense?.amount || 0} (28.8% of expenses)`}
                      </p>
                    </div>
                  </>
                )}

                {selectedReport === "income" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">$12,450.00</p>
                      <p className="text-xs text-muted-foreground">+8.2% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Primary Source</p>
                      <p className="text-2xl font-bold">Salary</p>
                      <p className="text-xs text-muted-foreground">$10,500.00 (84.3% of income)</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Secondary Source</p>
                      <p className="text-2xl font-bold">Freelance</p>
                      <p className="text-xs text-muted-foreground">$1,450.00 (11.6% of income)</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Monthly</p>
                      <p className="text-2xl font-bold text-green-600">$2,075.00</p>
                      <p className="text-xs text-muted-foreground">Based on 6 month average</p>
                    </div>
                  </>
                )}

                {selectedReport === "expenses" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">$8,320.45</p>
                      <p className="text-xs text-muted-foreground">-3.5% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Top Category</p>
                      <p className="text-2xl font-bold">Housing</p>
                      <p className="text-xs text-muted-foreground">$2,400.00 (28.8% of expenses)</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Fixed Expenses</p>
                      <p className="text-2xl font-bold text-red-600">$5,120.00</p>
                      <p className="text-xs text-muted-foreground">61.5% of total expenses</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Daily</p>
                      <p className="text-2xl font-bold text-red-600">$45.82</p>
                      <p className="text-xs text-muted-foreground">Based on 6 month average</p>
                    </div>
                  </>
                )}

                {selectedReport === "categories" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Categories</p>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">8 expense, 4 income</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Top Expense</p>
                      <p className="text-2xl font-bold">Housing</p>
                      <p className="text-xs text-muted-foreground">$2,400.00 (28.8% of expenses)</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Fastest Growing</p>
                      <p className="text-2xl font-bold">Entertainment</p>
                      <p className="text-xs text-muted-foreground">+24.5% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Most Transactions</p>
                      <p className="text-2xl font-bold">Food & Dining</p>
                      <p className="text-xs text-muted-foreground">42 transactions</p>
                    </div>
                  </>
                )}

                {selectedReport === "accounts" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Accounts</p>
                      <p className="text-2xl font-bold">6</p>
                      <p className="text-xs text-muted-foreground">4 assets, 2 liabilities</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Net Worth</p>
                      <p className="text-2xl font-bold text-green-600">$54,865.60</p>
                      <p className="text-xs text-muted-foreground">+12.3% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Most Active</p>
                      <p className="text-2xl font-bold">Chase Checking</p>
                      <p className="text-xs text-muted-foreground">86 transactions</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Largest Balance</p>
                      <p className="text-2xl font-bold">Savings</p>
                      <p className="text-xs text-muted-foreground">$25,680.45</p>
                    </div>
                  </>
                )}

                {selectedReport === "budget" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Budget Status</p>
                      <p className="text-2xl font-bold text-green-600">On Track</p>
                      <p className="text-xs text-muted-foreground">3.2% under budget</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Over Budget</p>
                      <p className="text-2xl font-bold text-red-600">2 Categories</p>
                      <p className="text-xs text-muted-foreground">Entertainment, Shopping</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Under Budget</p>
                      <p className="text-2xl font-bold text-green-600">6 Categories</p>
                      <p className="text-xs text-muted-foreground">Food, Transportation, etc.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Largest Variance</p>
                      <p className="text-2xl font-bold">Entertainment</p>
                      <p className="text-xs text-muted-foreground">+18.5% over budget</p>
                    </div>
                  </>
                )}

                {selectedReport === "savings" && (
                  <>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Savings Rate</p>
                      <p className="text-2xl font-bold text-green-600">33.2%</p>
                      <p className="text-xs text-muted-foreground">+5.4% from previous period</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Active Goals</p>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-xs text-muted-foreground">Vacation, Emergency Fund, Car</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Goal Progress</p>
                      <p className="text-2xl font-bold">68.5%</p>
                      <p className="text-xs text-muted-foreground">Average across all goals</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Time to Goal</p>
                      <p className="text-2xl font-bold">4.2 months</p>
                      <p className="text-xs text-muted-foreground">At current savings rate</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pv" fill="#8884d8" />
                <Bar dataKey="uv" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  )
}