import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let bcryptHasher: BcryptHasher
  let jwt: JwtService

  beforeAll(async () => {
    const { AppModule } = await import('@/infra/app.module.js')

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    bcryptHasher = new BcryptHasher()

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /sessions', async () => {
    await prisma.user.create({
      data: {
        name: 'Admin User',
        cpf: '12345678909',
        passwordHash: await bcryptHasher.hash('123456'),
        role: 'ADMIN',
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      cpf: '123.456.789-09',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      user: expect.objectContaining({
        id: expect.any(String),
        name: 'Admin User',
        cpf: '12345678909',
        role: 'ADMIN',
      }),
    })

    const payload = await jwt.verifyAsync(response.body.access_token)
    expect(payload).toEqual(
      expect.objectContaining({
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    )
    expect(payload.exp).toBeGreaterThan(payload.iat)

    // Verify refresh token was persisted
    const refreshTokens = await prisma.refreshToken.findMany()
    expect(refreshTokens).toHaveLength(1)
    expect(refreshTokens[0].revoked).toBe(false)
  })
})
