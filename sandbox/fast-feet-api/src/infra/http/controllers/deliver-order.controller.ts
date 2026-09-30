import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  ForbiddenException,
  HttpCode,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Roles } from '@/infra/auth/roles.decorator.js'
import { CurrentUser } from '@/infra/auth/current-user.decorator.js'
import type { TokenPayload } from '@/infra/auth/jwt.strategy.js'
import { DeliverOrderUseCase } from '@/domain/use-cases/deliver-order-use-case.js'
import { ResourceNotFoundError } from '@/domain/errors/resource-not-found-error.js'
import { InvalidOrderStatusError } from '@/domain/errors/invalid-order-status-error.js'
import { NotOrderCourierError } from '@/domain/errors/not-order-courier-error.js'
import { AttachmentRequiredError } from '@/domain/errors/attachment-required-error.js'

@Controller('/orders')
@Roles('COURIER')
export class DeliverOrderController {
  constructor(private readonly deliverOrder: DeliverOrderUseCase) {}

  @Patch(':orderId/deliver')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @CurrentUser() user: TokenPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({
            fileType: /^(image\/(png|jpeg|jpg))$/,
            skipMagicNumbersValidation: true,
          }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    const result = await this.deliverOrder.execute({
      orderId,
      courierId: user.sub,
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidOrderStatusError:
        case AttachmentRequiredError:
          throw new BadRequestException(error.message)
        case NotOrderCourierError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return { attachmentUrl: result.value.attachmentUrl }
  }
}
