"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Briefcase,
  Heart,
  GraduationCap,
  Gamepad2,
  Activity,
  Cake,
  Dog,
  House,
  Hospital,
  School,
  Store,
  Wifi,
  Smartphone,
  ChartLine,
} from "lucide-react"
import { AddCategory, Category } from "../types/Category"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { addCategory, deleteCategory, listenToAllCategories, updateCategory } from "../utils/categories"
import { useAuth } from "../context/AuthContext"

const iconMap = {
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Briefcase,
  Heart,
  GraduationCap,
  Gamepad2,
  Activity,
  Cake,
  Dog,
  House,
  Hospital,
  School,
  Store,
  Wifi,
  Smartphone,
  ChartLine,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<AddCategory>({
    name: "",
    type: "expense",
    icon: "ShoppingCart",
    color: "#8884d8",
    transactions: 0,
    user_id: ""
  })
  const { user } = useAuth();

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const stopListening = listenToAllCategories(user.uid, setCategories);
          return stopListening;
        }
      });
  
      return () => {
        unsubscribe();
      };
    }, []);

  const handleAddCategory = async () => {
    newCategory.user_id = user.uid
    await addCategory(newCategory)
    setNewCategory({ name: "", type: "expense", icon: "ShoppingCart", color: "#8884d8", transactions: 0, user_id: "" })
    setShowAddDialog(false)
  }

  const handleDeleteCategory = async (id: string) => {
      try {
        await deleteCategory(id)
      } catch (error) {
        console.error("Error deleting category:", error)
      }
    }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      transactions: category.transactions,
      user_id: user.uid
    })
    setShowAddDialog(true)
  }

  const handleUpdateCategory = () => {
    setCategories(categories.map((cat) => (cat.id === editingCategory?.id ? { ...cat, ...newCategory } : cat)))
    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: newCategory.name,
        type: newCategory.type,
        icon: newCategory.icon,
        color: newCategory.color,
        transactions: newCategory.transactions,
        user_id: user.uid
      })
    }
    setEditingCategory(null)
    setNewCategory({ name: "", type: "expense", icon: "ShoppingCart", color: "#8884d8", transactions: 0, user_id: "" })
    setShowAddDialog(false)
  }

  const incomeCategories = categories.filter((cat) => cat.type === "income")
  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage your income and expense categories</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Update the category details below."
                    : "Create a new category to organize your transactions."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={newCategory.icon}
                    onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(iconMap).map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          {iconName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingCategory(null)
                    setNewCategory({ name: "", type: "expense", icon: "ShoppingCart", color: "#8884d8", transactions: 0, user_id: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  {editingCategory ? "Update" : "Add"} Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Income Categories</CardTitle>
              <CardDescription>Categories for tracking your income sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomeCategories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap]
                return (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-green-600">
                        Income
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {incomeCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No income categories yet. Add one to get started!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Expense Categories</CardTitle>
              <CardDescription>Categories for tracking your expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseCategories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap]
                return (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-red-600">
                        Expense
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {expenseCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No expense categories yet. Add one to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
