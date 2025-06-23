"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

import {
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { listenToAllAccounts, addAccount, deleteAccount, updateAccount } from "../utils/accounts"
import { Account, AddAccount } from "../types/Account"
import { useAuth } from "../context/AuthContext"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState<AddAccount>({
    name: "",
    institution: "",
    color: "#8884d8",
    transactions: 0,
    user_id: ""
  })
  const { user } = useAuth();

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const stopListening = listenToAllAccounts(user.uid, setAccounts);
          return stopListening;
        }
      });
  
      return () => {
        unsubscribe();
      };
    }, []);

  const handleAddAccount = async () => {
    newAccount.user_id = user.uid
    await addAccount(newAccount)
    setNewAccount({ name: "", institution: "", color: "#8884d8", transactions: 0, user_id: "" })
    setShowAddDialog(false)
  }

  const handleDeleteAccount = async (id: string) => {
      try {
        await deleteAccount(id)
      } catch (error) {
        console.error("Error deleting account:", error)
      }
    }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setNewAccount({
      name: account.name,
      institution: account.institution,
      color: account.color,
      transactions: account.transactions,
      user_id: user.uid
    })
    setShowAddDialog(true)
  }

  const handleUpdateAccount = () => {
    setAccounts(accounts.map((acc) => (acc.id === editingAccount?.id ? { ...acc, ...newAccount } : acc)))
    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: newAccount.name,
        institution: newAccount.institution,
        color: newAccount.color,
        transactions: newAccount.transactions,
        user_id: user.uid
      })
    }
    setEditingAccount(null)
    setNewAccount({ name: "", institution: "", color: "#8884d8", transactions: 0, user_id: "" })
    setShowAddDialog(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground">Manage your financial accounts</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAccount ? "Edit Account" : "Add New Account"}</DialogTitle>
                <DialogDescription>
                  {editingAccount
                    ? "Update the account details below."
                    : "Create a new account to organize your transactions."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="Enter account name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Institution</Label>
                  <Input
                    id="institution"
                    value={newAccount.institution}
                    onChange={(e) => setNewAccount({ ...newAccount, institution: e.target.value })}
                    placeholder="Enter account institution"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={newAccount.color}
                    onChange={(e) => setNewAccount({ ...newAccount, color: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingAccount(null)
                    setNewAccount({ name: "", institution: "", color: "#8884d8", transactions: 0, user_id: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingAccount ? handleUpdateAccount : handleAddAccount}>
                  {editingAccount ? "Update" : "Add"} Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Accounts */}
          {
            accounts.map((account) => {
              return (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2 justify-between">
                      <div>
                        <CardTitle style={{ color: account.color, fontSize: "1.5rem" }}>{account.name}</CardTitle>
                        <CardDescription><strong>Institution:</strong> {account.institution}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleEditAccount(account)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => handleDeleteAccount(account.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{account.transactions} transactions</p>
                  </CardContent>
                </Card>
              )
            })
          }
        </div>
      </main>
    </div>
  )
}
