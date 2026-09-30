import { Injectable } from '@nestjs/common'
import { createHash, randomUUID } from 'node:crypto'
import { TokenHasher } from '@/domain/cryptography/token-hasher.js'

@Injectable()
export class Sha256TokenHasher implements TokenHasher {
  generate(): string {
    return randomUUID()
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
