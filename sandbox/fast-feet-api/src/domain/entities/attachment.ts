export interface Attachment {
  id: string
  title: string
  url: string
  orderId: string
  createdAt: Date
}

export interface CreateAttachmentData {
  id?: string
  title: string
  url: string
  orderId: string
}
