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

describe('Update Courier (E2E)', () => {
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

  test('[PATCH] /couriers/:id', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '75229495642' })

    const courier = await makeCourier(prisma, { cpf: '88337422459' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/couriers/${courier.id}`)
      .send({
        name: 'Updated Courier',
        cpf: '100.000.000-19',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    const courierOnDatabase = await prisma.user.findUnique({
      where: {
        id: courier.id,
      },
    })

    expect(courierOnDatabase?.cpf).toBe('10000000019')
  })
})
