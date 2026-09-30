import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import { makeAdmin, makeAccessToken } from '@/test/factories/index.js'

describe('Create User (E2E)', () => {
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

  test('[POST] /users', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '52998224725' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        cpf: '987.654.321-00',
        password: '123456',
        role: 'ADMIN',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: '98765432100',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
