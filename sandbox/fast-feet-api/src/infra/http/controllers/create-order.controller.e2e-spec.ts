import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeAdmin,
  makeAccessToken,
  makeRecipient,
} from '@/test/factories/index.js'

describe('Create Order (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const { AppModule } = await import('@/infra/app.module.js')

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /orders', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })
    const recipient = await makeRecipient(prisma, {
      email: 'recipient@example.com',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        recipientId: recipient.id,
        title: 'Pacote frágil',
        latitude: -23.55052,
        longitude: -46.633308,
        street: 'Av Paulista',
        number: '1000',
        city: 'São Paulo',
        neighborhood: 'Centro',
        state: 'SP',
        zip: '01310100',
        country: 'Brasil',
        complement: 'Apto 101',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(201)

    const orderOnDatabase = await prisma.order.findFirst({
      where: {
        recipientId: recipient.id,
      },
    })

    expect(orderOnDatabase).toBeTruthy()
    expect(orderOnDatabase?.status).toBe('PENDING')
    expect(orderOnDatabase?.street).toBe('Av Paulista')
  })
})
