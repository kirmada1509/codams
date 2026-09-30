import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeAdmin,
  makeCourier,
  makeAccessToken,
} from '@/test/factories/index.js'

describe('Get Courier (E2E)', () => {
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

  test('[GET] /couriers/:id', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '92106781415' })

    const courier = await makeCourier(prisma, { cpf: '86577694842' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .get(`/couriers/${courier.id}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.courier.id).toBe(courier.id)
  })
})
