import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import { makeAdmin, makeAccessToken } from '@/test/factories/index.js'

describe('Create Recipient (E2E)', () => {
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

  test('[POST] /recipients', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '28937165470' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .post('/recipients')
      .send({
        name: 'Recipient One',
        email: 'recipient.create@example.com',
        phone: '11999999999',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(201)

    const recipientOnDatabase = await prisma.recipient.findUnique({
      where: {
        email: 'recipient.create@example.com',
      },
    })

    expect(recipientOnDatabase).toBeTruthy()
  })
})
