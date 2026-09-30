export const NotificationStatus = { SENT: 'SENT', FAILED: 'FAILED' } as const
export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus]

export interface Notification {
  id: string
  recipientId: string
  title: string
  content: string
  status: NotificationStatus
  readAt: Date | null
  createdAt: Date
}

export interface CreateNotificationData {
  recipientId: string
  title: string
  content: string
  status: NotificationStatus
}
