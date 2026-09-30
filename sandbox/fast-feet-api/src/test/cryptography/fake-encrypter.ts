import { Encrypter } from '@/domain/cryptography/encrypter.js'

export class FakeEncrypter implements Encrypter {
  encrypt(payload: Record<string, unknown>): Promise<string> {
    return Promise.resolve(JSON.stringify(payload))
  }
}
