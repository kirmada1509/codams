import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'

describe('Logout (E2E)', () => {
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

  test('[DELETE] /sessions', async () => {
    await prisma.user.create({
      data: {
        name: 'Courier User',
        cpf: '12345678909',
        passwordHash: await bcryptHasher.hash('123456'),
        role: 'COURIER',
      },
    })

    // Login to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        cpf: '123.456.789-09',
        password: '123456',
      })

    const { access_token, refresh_token } = loginResponse.body

    // Logout
    const logoutResponse = await request(app.getHttpServer())
      .delete('/sessions')
      .set('Authorization', `Bearer ${access_token}`)

    expect(logoutResponse.statusCode).toBe(204)

    // All refresh tokens should be revoked
    const tokens = await prisma.refreshToken.findMany()
    expect(tokens.every((t) => t.revoked)).toBe(true)

    // Trying to refresh should fail
    const refreshResponse = await request(app.getHttpServer())
      .patch('/sessions/refresh')
      .send({ refresh_token })

    expect(refreshResponse.statusCode).toBe(401)
  })
})
