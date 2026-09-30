import { RecipientsRepository } from '@/domain/repositories/recipients-repository.js'
import type { CreateRecipientData } from '@/domain/entities/recipient.js'
import type { Recipient } from '@/domain/entities/recipient.js'
import { randomUUID } from 'node:crypto'

export class InMemoryRecipientsRepository implements RecipientsRepository {
  public items: Recipient[] = []

  async create(data: CreateRecipientData): Promise<void> {
    const recipient: Recipient = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(recipient)

    return Promise.resolve()
  }

  findByEmail(email: string): Promise<Recipient | null> {
    const recipient = this.items.find((item) => item.email === email)

    if (!recipient) {
      return Promise.resolve(null)
    }

    return Promise.resolve(recipient)
  }

  findById(id: string): Promise<Recipient | null> {
    const recipient = this.items.find((item) => item.id === id)

    if (!recipient) {
      return Promise.resolve(null)
    }

    return Promise.resolve(recipient)
  }

  findMany({
    page,
    perPage,
  }: {
    page: number
    perPage: number
  }): Promise<Recipient[]> {
    const start = (page - 1) * perPage
    const recipients = this.items
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(start, start + perPage)

    return Promise.resolve(recipients)
  }

  save(recipient: Recipient): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === recipient.id)

    if (itemIndex >= 0) {
      this.items[itemIndex] = {
        ...recipient,
        updatedAt: new Date(),
      }
    }

    return Promise.resolve()
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
    return Promise.resolve()
  }
}
