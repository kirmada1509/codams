import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeCourier,
  makeAdmin,
  makeAccessToken,
} from '@/test/factories/index.js'

describe('Profile (E2E)', () => {
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

  test('[GET] /me as courier', async () => {
    const courier = await makeCourier(prisma, { cpf: '57414331202' })

    const accessToken = await makeAccessToken(jwt, {
      sub: courier.id,
      role: courier.role,
    })

    const response = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.user.id).toBe(courier.id)
    expect(response.body.user.role).toBe('COURIER')
  })

  test('[GET] /me as admin', async () => {
    const admin = await makeAdmin(prisma, { cpf: '11122233396' })

    const accessToken = await makeAccessToken(jwt, {
      sub: admin.id,
      role: admin.role,
    })

    const response = await request(app.getHttpServer())
      .get('/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.user.id).toBe(admin.id)
    expect(response.body.user.role).toBe('ADMIN')
  })

  test('[GET] /me without auth returns 401', async () => {
    const response = await request(app.getHttpServer()).get('/me')

    expect(response.statusCode).toBe(401)
  })
})
