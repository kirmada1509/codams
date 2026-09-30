export abstract class TokenHasher {
  abstract generate(): string
  abstract hash(token: string): string
}
