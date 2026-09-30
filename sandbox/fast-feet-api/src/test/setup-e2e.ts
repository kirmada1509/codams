import { config } from 'dotenv'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client.js'

config({ path: '.env', override: true, quiet: true })
config({ path: '.env.test', override: true, quiet: true })

const schemaId = randomUUID()
let prisma: PrismaClient

function getDatabaseUrlWithSchema(databaseUrl: string, schema: string) {
  const url = new URL(databaseUrl)
  url.searchParams.set('schema', schema)
  return url.toString()
}

async function truncateAllTables() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = ${schemaId}
    AND tablename != '_prisma_migrations'
  `

  if (tables.length === 0) return

  const tableNames = tables
    .map((t) => `"${schemaId}"."${t.tablename}"`)
    .join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`)
}

beforeAll(async () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }

  console.log(`\n[E2E Setup] Schema: ${schemaId}\n`)

  // Prisma CLI migrations need schema in DATABASE_URL query param
  const databaseUrlWithSchema = getDatabaseUrlWithSchema(databaseUrl, schemaId)
  process.env.DATABASE_URL = databaseUrlWithSchema

  // Runtime app uses DATABASE_SCHEMA (validated by env schema)
  process.env.DATABASE_SCHEMA = schemaId

  execSync('npx prisma migrate deploy')

  const adapter = new PrismaPg(
    { connectionString: databaseUrlWithSchema },
    { schema: schemaId }
  )

  prisma = new PrismaClient({ adapter })

  await prisma.$connect()
})

afterEach(async () => {
  await truncateAllTables()
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
