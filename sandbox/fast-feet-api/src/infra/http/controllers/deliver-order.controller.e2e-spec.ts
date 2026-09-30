import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { Test } from '@nestjs/testing'
import { PrismaService } from '@/infra/database/prisma/prisma.service.js'
import { JwtService } from '@nestjs/jwt'
import {
  makeAccessToken,
  makeRecipient,
  makeOrder,
  makeCourier,
} from '@/test/factories/index.js'

describe('Deliver Order (E2E)', () => {
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

  test('[PATCH] /orders/:orderId/deliver - should deliver an order with photo', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '38937165474' })
    const recipient = await makeRecipient(prisma, {
      email: 'deliver-test@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courierUser.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/deliver`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', 'src/test/e2e/sample-upload.png')

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('attachmentUrl')

    const orderOnDatabase = await prisma.order.findUnique({
      where: { id: order.id },
      include: { attachments: true },
    })

    expect(orderOnDatabase?.status).toBe('DELIVERED')
    expect(orderOnDatabase?.deliveryDate).toBeTruthy()
    expect(orderOnDatabase?.attachments).toHaveLength(1)
  })

  test('[PATCH] /orders/:orderId/deliver - should return 403 when courier is not the owner', async () => {
    const ownerCourier = await makeCourier(prisma, { cpf: '48937165474' })
    const otherCourier = await makeCourier(prisma, { cpf: '58937165474' })
    const recipient = await makeRecipient(prisma, {
      email: 'deliver-test2@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: ownerCourier.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: otherCourier.id,
      role: otherCourier.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/deliver`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('fake-image-content'), {
        filename: 'delivery-photo.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.statusCode).toBe(403)
  })

  test('[PATCH] /orders/:orderId/deliver - should return 400 when order is not withdrawn', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '68937165474' })
    const recipient = await makeRecipient(prisma, {
      email: 'deliver-test3@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WAITING',
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/deliver`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('fake-image-content'), {
        filename: 'delivery-photo.jpg',
        contentType: 'image/jpeg',
      })

    expect(response.statusCode).toBe(400)
  })

  test('[PATCH] /orders/:orderId/deliver - should return 400 when no file attached', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '78937165474' })
    const recipient = await makeRecipient(prisma, {
      email: 'deliver-test4@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courierUser.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/deliver`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(400)
  })

  test('[PATCH] /orders/:orderId/deliver - should return 400 when file type is invalid', async () => {
    const courierUser = await makeCourier(prisma, { cpf: '88937165474' })
    const recipient = await makeRecipient(prisma, {
      email: 'deliver-test5@example.com',
    })
    const order = await makeOrder(prisma, {
      recipientId: recipient.id,
      status: 'WITHDRAWN',
      courierId: courierUser.id,
    })

    const accessToken = await makeAccessToken(jwt, {
      sub: courierUser.id,
      role: courierUser.role,
    })

    const response = await request(app.getHttpServer())
      .patch(`/orders/${order.id}/deliver`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('fake-pdf-content'), {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      })

    expect(response.statusCode).toBe(400)
  })
})
