import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { fakerPT_BR as faker } from '@faker-js/faker'

faker.seed(12345)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SEED_CONFIG = {
  couriers: 2,
  recipients: 2,
  orders: {
    PENDING: 2,
    WAITING: 2,
    WITHDRAWN: 2,
    DELIVERED: 2,
    RETURNED: 2,
  },
} as const

type OrderStatus = keyof typeof SEED_CONFIG.orders

// ---------------------------------------------------------------------------
// CPF Generator — computes valid mod-11 check digits from a 9-digit base
// ---------------------------------------------------------------------------

function generateValidCpf(base9: string): string {
  const digits = base9.split('').map(Number)

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }
  let remainder = sum % 11
  digits.push(remainder < 2 ? 0 : 11 - remainder)

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i)
  }
  remainder = sum % 11
  digits.push(remainder < 2 ? 0 : 11 - remainder)

  return digits.join('')
}

// ---------------------------------------------------------------------------
// Database clearing
// ---------------------------------------------------------------------------

async function clearDatabase() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != '_prisma_migrations'
  `

  if (tables.length === 0) return

  const tableNames = tables.map((t) => `"public"."${t.tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const CURATED_ADDRESSES = [
  {
    street: 'Avenida Paulista',
    number: '1578',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310200',
    latitude: -23.5632,
    longitude: -46.6542,
    country: 'Brasil',
  },
  {
    street: 'Rua Barata Ribeiro',
    number: '320',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip: '22040002',
    latitude: -22.9661,
    longitude: -43.1784,
    country: 'Brasil',
  },
  {
    street: 'Rua Pernambuco',
    number: '1000',
    neighborhood: 'Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    zip: '30130150',
    latitude: -19.9352,
    longitude: -43.9378,
    country: 'Brasil',
  },
  {
    street: 'Rua XV de Novembro',
    number: '450',
    neighborhood: 'Centro',
    city: 'Curitiba',
    state: 'PR',
    zip: '80020310',
    latitude: -25.4296,
    longitude: -49.2713,
    country: 'Brasil',
  },
  {
    street: 'SQS 308 Bloco A',
    number: '12',
    neighborhood: 'Asa Sul',
    city: 'Brasília',
    state: 'DF',
    zip: '70356080',
    latitude: -15.8267,
    longitude: -47.9218,
    country: 'Brasil',
  },
  {
    street: 'Avenida Sete de Setembro',
    number: '890',
    neighborhood: 'Vitória',
    city: 'Salvador',
    state: 'BA',
    zip: '40080001',
    latitude: -12.9894,
    longitude: -38.5106,
    country: 'Brasil',
  },
  {
    street: 'Rua Padre Chagas',
    number: '200',
    neighborhood: 'Moinhos de Vento',
    city: 'Porto Alegre',
    state: 'RS',
    zip: '90570080',
    latitude: -30.0248,
    longitude: -51.2005,
    country: 'Brasil',
  },
  {
    street: 'Avenida Boa Viagem',
    number: '1500',
    neighborhood: 'Boa Viagem',
    city: 'Recife',
    state: 'PE',
    zip: '51011000',
    latitude: -8.1186,
    longitude: -34.8953,
    country: 'Brasil',
  },
  {
    street: 'Avenida Beira Mar',
    number: '3100',
    neighborhood: 'Meireles',
    city: 'Fortaleza',
    state: 'CE',
    zip: '60165121',
    latitude: -3.7253,
    longitude: -38.4897,
    country: 'Brasil',
  },
  {
    street: 'Rua Ramos Ferreira',
    number: '750',
    neighborhood: 'Centro',
    city: 'Manaus',
    state: 'AM',
    zip: '69010120',
    latitude: -3.1316,
    longitude: -60.0212,
    country: 'Brasil',
  },
]

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedUsers(
  adminCpf: string,
  adminPasswordHash: string,
  defaultPasswordHash: string
) {
  await prisma.user.upsert({
    where: { cpf: adminCpf },
    update: { passwordHash: adminPasswordHash },
    create: {
      id: randomUUID(),
      name: 'Admin',
      cpf: adminCpf,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  const courier1Cpf = generateValidCpf('123456789')
  const courier2Cpf = generateValidCpf('987654321')

  const couriers = [
    {
      id: randomUUID(),
      name: 'Entregador Um',
      cpf: courier1Cpf,
      passwordHash: defaultPasswordHash,
      role: 'COURIER' as const,
    },
    {
      id: randomUUID(),
      name: 'Entregador Dois',
      cpf: courier2Cpf,
      passwordHash: defaultPasswordHash,
      role: 'COURIER' as const,
    },
  ]

  await prisma.user.createMany({ data: couriers })

  return couriers
}

async function seedRecipients() {
  const recipients = [
    {
      id: randomUUID(),
      name: 'Destinatário Um',
      email: 'destinatario.um@example.com',
      phone: '11999999999',
    },
    {
      id: randomUUID(),
      name: 'Destinatário Dois',
      email: 'destinatario.dois@example.com',
      phone: '11888888888',
    },
  ]

  await prisma.recipient.createMany({ data: recipients })

  return recipients.map((r) => r.id)
}

interface OrderRecord {
  id: string
  title: string
  status: OrderStatus
  recipientId: string
}

async function seedOrders(courierIds: string[], recipientIds: string[]) {
  const allOrders: Prisma.OrderCreateManyInput[] = []
  const ordersByStatus: Record<OrderStatus, OrderRecord[]> = {
    PENDING: [],
    WAITING: [],
    WITHDRAWN: [],
    DELIVERED: [],
    RETURNED: [],
  }

  let globalIndex = 0

  const statusEntries = Object.entries(SEED_CONFIG.orders) as [
    OrderStatus,
    number,
  ][]

  for (const [status, count] of statusEntries) {
    for (let i = 0; i < count; i++) {
      const id = randomUUID()
      const title = faker.commerce.productName()
      const recipientId = recipientIds[i]
      const address = CURATED_ADDRESSES[globalIndex]
      const hasDescription = i === 0

      const order: Prisma.OrderCreateManyInput = {
        id,
        title,
        description: hasDescription ? faker.commerce.productDescription() : null,
        status,
        recipientId,
        ...address,
      }

      if (status === 'WITHDRAWN') {
        order.courierId = courierIds[i]
        order.pickupDate = daysAgo(2)
      } else if (status === 'DELIVERED') {
        order.courierId = courierIds[i]
        order.pickupDate = daysAgo(6)
        order.deliveryDate = daysAgo(2)
      } else if (status === 'RETURNED') {
        order.courierId = courierIds[i]
        order.pickupDate = daysAgo(6)
        order.returnDate = daysAgo(2)
      }

      allOrders.push(order)
      ordersByStatus[status].push({ id, title, status, recipientId })
      globalIndex++
    }
  }

  await prisma.order.createMany({ data: allOrders })

  return ordersByStatus
}

async function seedAttachments(deliveredOrders: OrderRecord[]) {
  await prisma.attachment.createMany({
    data: deliveredOrders.map((order) => ({
      id: randomUUID(),
      title: 'comprovante-entrega.jpg',
      url: `attachments/${randomUUID()}-comprovante-entrega.jpg`,
      orderId: order.id,
    })),
  })
}

const NOTIFICATION_TEMPLATES: Record<
  Exclude<OrderStatus, 'PENDING'>,
  { title: string; content: (orderTitle: string) => string }
> = {
  WAITING: {
    title: 'Encomenda aguardando retirada',
    content: (t) =>
      `Sua encomenda "${t}" está aguardando retirada pelo entregador.`,
  },
  WITHDRAWN: {
    title: 'Encomenda retirada',
    content: (t) =>
      `Sua encomenda "${t}" foi retirada pelo entregador e está a caminho.`,
  },
  DELIVERED: {
    title: 'Encomenda entregue',
    content: (t) => `Sua encomenda "${t}" foi entregue com sucesso.`,
  },
  RETURNED: {
    title: 'Encomenda devolvida',
    content: (t) =>
      `Sua encomenda "${t}" foi devolvida. Motivo: destinatário não encontrado.`,
  },
}

async function seedNotifications(
  ordersByStatus: Record<OrderStatus, OrderRecord[]>
) {
  const notifications: Prisma.NotificationCreateManyInput[] = []

  for (const [status, orders] of Object.entries(ordersByStatus)) {
    if (status === 'PENDING') continue

    const template =
      NOTIFICATION_TEMPLATES[status as Exclude<OrderStatus, 'PENDING'>]

    orders.forEach((order, index) => {
      const isFirstOrder = index === 0
      const readAt = isFirstOrder ? daysAgo(1) : null

      notifications.push({
        id: randomUUID(),
        recipientId: order.recipientId,
        title: template.title,
        content: template.content(order.title),
        status: 'SENT',
        readAt,
      })
    })
  }

  await prisma.notification.createMany({ data: notifications })

  return notifications.length
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is not allowed in production')
  }

  const adminPassword = process.env.ADMIN_DEV_SEED_PASSWORD
  if (!adminPassword) {
    throw new Error(
      'ADMIN_DEV_SEED_PASSWORD environment variable is required for seeding'
    )
  }
  const adminCpf = process.env.ADMIN_DEV_SEED_CPF
  if (!adminCpf) {
    throw new Error(
      'ADMIN_DEV_SEED_CPF environment variable is required for seeding'
    )
  }

  const adminPasswordHash = await hash(adminPassword, 8)
  const defaultPasswordHash = await hash('123456', 8)

  const totalOrders = Object.values(SEED_CONFIG.orders).reduce(
    (sum, n) => sum + n,
    0
  )

  console.log('Clearing database...')
  await clearDatabase()

  console.log('Seeding users...')
  const couriers = await seedUsers(
    adminCpf,
    adminPasswordHash,
    defaultPasswordHash
  )
  const courierIds = couriers.map((c) => c.id)

  console.log('Seeding recipients...')
  const recipientIds = await seedRecipients()

  console.log('Seeding orders...')
  const ordersByStatus = await seedOrders(courierIds, recipientIds)

  console.log('Seeding attachments...')
  await seedAttachments(ordersByStatus.DELIVERED)

  console.log('Seeding notifications...')
  const notificationCount = await seedNotifications(ordersByStatus)

  console.log('Seed completed successfully!')
  console.log(
    `  - ${1 + SEED_CONFIG.couriers} users (1 admin, ${SEED_CONFIG.couriers} couriers)`
  )
  console.log(`  - ${SEED_CONFIG.recipients} recipients`)
  console.log(
    `  - ${totalOrders} orders (${Object.entries(SEED_CONFIG.orders)
      .map(([s, n]) => `${n} ${s}`)
      .join(', ')})`
  )
  console.log(`  - ${ordersByStatus.DELIVERED.length} attachments`)
  console.log(`  - ${notificationCount} notifications\n`)

  console.log('=========================================')
  console.log('Credentials for local development:')
  console.log('-----------------------------------------')
  console.log('🔑 ADMIN:')
  console.log(`  - CPF: ${adminCpf}`)
  console.log('  - Senha: (definida no arquivo .env)')
  console.log('')
  couriers.forEach((courier) => {
    console.log(`🔑 ENTREGADOR (${courier.name}):`)
    console.log(`  - CPF: ${courier.cpf}`)
    console.log('  - Senha: 123456')
    console.log('')
  })
  console.log('=========================================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
