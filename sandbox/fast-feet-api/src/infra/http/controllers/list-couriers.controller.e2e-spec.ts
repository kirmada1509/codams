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

describe('List Couriers (E2E)', () => {
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

  test('[GET] /couriers', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '70135775450' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    await makeCourier(prisma, { cpf: '59613902252', name: 'Courier One' })
    await makeCourier(prisma, { cpf: '55052209401', name: 'Courier Two' })
    await makeCourier(prisma, { cpf: '30174152442', name: 'Courier Three' })

    const response = await request(app.getHttpServer())
      .get('/couriers?page=1&perPage=2')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.couriers).toHaveLength(2)
    expect(
      response.body.couriers.every(
        (courier: { role: string }) => courier.role === 'COURIER'
      )
    ).toBe(true)
  })
})
