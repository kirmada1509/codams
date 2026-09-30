import { TokenHasher } from '@/domain/cryptography/token-hasher.js'
import { randomUUID } from 'node:crypto'

export class FakeTokenHasher implements TokenHasher {
  generate(): string {
    return randomUUID()
  }

  hash(token: string): string {
    return `${token}-hashed`
  }
}
