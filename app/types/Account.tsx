export type Account = {
  id: string
  name: string
  color: string
  institution: string
  transactions: number
  user_id: string
}

export type AddAccount = {
  name: string
  color: string
  institution: string
  transactions: number
  user_id: string
}