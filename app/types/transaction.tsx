import { DocumentReference } from "firebase/firestore"
import { Option } from "@/app/utils/categories"

export type Transaction = {
  id: string
  date: Date
  description: string
  category: Option | null
  type: string
  amount: number
  account: Option | null
  status: Option | null
  user_id: string
}

export type AddTransaction = {
  date: Date
  description: string
  category: DocumentReference
  type: string
  amount: number
  account: DocumentReference
  status: DocumentReference
  user_id: string
}