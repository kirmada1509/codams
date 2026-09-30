import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import { makeAdmin, makeAccessToken } from '@/test/factories/index.js'

describe('Create Courier (E2E)', () => {
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

  test('[POST] /couriers', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '30505660270' })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .post('/couriers')
      .send({
        name: 'Courier One',
        cpf: '918.464.484-25',
        password: '123456',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(201)

    const courierOnDatabase = await prisma.user.findUnique({
      where: {
        cpf: '91846448425',
      },
    })

    expect(courierOnDatabase).toBeTruthy()
    expect(courierOnDatabase?.role).toBe('COURIER')
  })
})
