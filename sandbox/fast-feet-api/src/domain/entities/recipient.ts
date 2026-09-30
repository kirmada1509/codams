export interface Recipient {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateRecipientData {
  id?: string
  name: string
  email: string
  phone?: string | null
}
