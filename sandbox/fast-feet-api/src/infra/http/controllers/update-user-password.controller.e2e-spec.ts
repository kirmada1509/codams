import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'
import {
  makeAdmin,
  makeCourier,
  makeAccessToken,
} from '@/test/factories/index.js'

describe('Update User Password (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let bcryptHasher: BcryptHasher

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

  test('[PATCH] /users/:id/password', async () => {
    const adminUser = await makeAdmin(prisma, { cpf: '62143827911' })

    const courier = await makeCourier(prisma, {
      cpf: '99073268281',
      password: 'old-password',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: adminUser.id,
      role: adminUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/users/${courier.id}/password`)
      .send({
        password: 'new-password',
      })
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(204)

    const courierOnDatabase = await prisma.user.findUnique({
      where: {
        id: courier.id,
      },
    })

    expect(courierOnDatabase).toBeTruthy()
    expect(
      await bcryptHasher.compare(
        'new-password',
        courierOnDatabase?.passwordHash ?? ''
      )
    ).toBe(true)
  })
})
