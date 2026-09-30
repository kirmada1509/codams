import { HashGenerator } from '@/domain/cryptography/hash-generator.js'

export class FakeHashGenerator implements HashGenerator {
  hash(plain: string): Promise<string> {
    return Promise.resolve(plain.concat('-hashed'))
  }
}
