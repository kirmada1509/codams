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

describe('List Recipients (E2E)', () => {
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

  test('[GET] /recipients', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '59130468722' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    await makeRecipient(prisma, {
      name: 'Recipient One',
      email: 'recipient.list.one@example.com',
      phone: '11999999999',
    })
    await makeRecipient(prisma, {
      name: 'Recipient Two',
      email: 'recipient.list.two@example.com',
      phone: '11888888888',
    })
    await makeRecipient(prisma, {
      name: 'Recipient Three',
      email: 'recipient.list.three@example.com',
      phone: '11777777777',
    })

    const response = await request(app.getHttpServer())
      .get('/recipients?page=1&perPage=2')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recipients).toHaveLength(2)
  })
})
