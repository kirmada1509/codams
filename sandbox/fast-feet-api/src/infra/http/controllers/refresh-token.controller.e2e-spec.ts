import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'

describe('Refresh Token (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let bcryptHasher: BcryptHasher

  beforeAll(async () => {
    const { AppModule } = await import('@/infra/app.module.js')

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    bcryptHasher = new BcryptHasher()

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PATCH] /sessions/refresh', async () => {
    await prisma.user.create({
      data: {
        name: 'Courier User',
        cpf: '12345678909',
        passwordHash: await bcryptHasher.hash('123456'),
        role: 'COURIER',
      },
    })

    // Login to get initial tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        cpf: '123.456.789-09',
        password: '123456',
      })

    const { refresh_token: initialRefreshToken } = loginResponse.body

    // Refresh the token
    const refreshResponse = await request(app.getHttpServer())
      .patch('/sessions/refresh')
      .send({
        refresh_token: initialRefreshToken,
      })

    expect(refreshResponse.statusCode).toBe(200)
    expect(refreshResponse.body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    })
    expect(refreshResponse.body.refresh_token).not.toBe(initialRefreshToken)
  })

  test('[PATCH] /sessions/refresh - reuse detection', async () => {
    await prisma.user.create({
      data: {
        name: 'Courier User',
        cpf: '12345678909',
        passwordHash: await bcryptHasher.hash('123456'),
        role: 'COURIER',
      },
    })

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        cpf: '123.456.789-09',
        password: '123456',
      })

    const { refresh_token: initialRefreshToken } = loginResponse.body

    // Legitimate rotation
    await request(app.getHttpServer())
      .patch('/sessions/refresh')
      .send({ refresh_token: initialRefreshToken })

    // Attacker reuses the old token
    const reuseResponse = await request(app.getHttpServer())
      .patch('/sessions/refresh')
      .send({ refresh_token: initialRefreshToken })

    expect(reuseResponse.statusCode).toBe(401)

    // All tokens in the family should be revoked
    const tokens = await prisma.refreshToken.findMany()
    expect(tokens.every((t) => t.revoked)).toBe(true)
  })
})
