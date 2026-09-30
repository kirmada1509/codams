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

describe('Update Recipient (E2E)', () => {
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

  test('[PATCH] /recipients/:id', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '65719483205' })

    const recipient = await makeRecipient(prisma, {
      email: 'recipient.update.before@example.com',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/recipients/${recipient.id}`)
      .send({
        name: 'Recipient Updated',
        email: 'recipient.update.after@example.com',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    const recipientOnDatabase = await prisma.recipient.findUnique({
      where: {
        id: recipient.id,
      },
    })

    expect(recipientOnDatabase?.email).toBe('recipient.update.after@example.com')
  })
})
