export type Category = {
  id: string
  name: string
  icon: string
  color: string
  type: string
  transactions: number
  user_id: string
}

export type AddCategory = {
  name: string
  icon: string
  color: string
  type: string
  transactions: number
  user_id: string
}
