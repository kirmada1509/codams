import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { AuthenticateUserUseCase } from '@/domain/use-cases/authenticate-user-use-case.js'
import { CreateCourierUseCase } from '@/domain/use-cases/create-courier-use-case.js'
import { CreateUserUseCase } from '@/domain/use-cases/create-user-use-case.js'
import { CreateRecipientUseCase } from '@/domain/use-cases/create-recipient-use-case.js'
import { DeleteCourierUseCase } from '@/domain/use-cases/delete-courier-use-case.js'
import { DeleteRecipientUseCase } from '@/domain/use-cases/delete-recipient-use-case.js'
import { GetCourierUseCase } from '@/domain/use-cases/get-courier-use-case.js'
import { GetRecipientUseCase } from '@/domain/use-cases/get-recipient-use-case.js'
import { ListCouriersUseCase } from '@/domain/use-cases/list-couriers-use-case.js'
import { ListRecipientsUseCase } from '@/domain/use-cases/list-recipients-use-case.js'
import { UpdateCourierUseCase } from '@/domain/use-cases/update-courier-use-case.js'
import { UpdateRecipientUseCase } from '@/domain/use-cases/update-recipient-use-case.js'
import { UpdateUserPasswordUseCase } from '@/domain/use-cases/update-user-password-use-case.js'
import { CreateOrderUseCase } from '@/domain/use-cases/create-order-use-case.js'
import { GetOrderUseCase } from '@/domain/use-cases/get-order-use-case.js'
import { GetCourierOrderUseCase } from '@/domain/use-cases/get-courier-order-use-case.js'
import { ListOrdersUseCase } from '@/domain/use-cases/list-orders-use-case.js'
import { ListAvailableOrdersUseCase } from '@/domain/use-cases/list-available-orders-use-case.js'
import { ListCourierOrdersUseCase } from '@/domain/use-cases/list-courier-orders-use-case.js'
import { CountCourierOrdersUseCase } from '@/domain/use-cases/count-courier-orders-use-case.js'
import { UpdateOrderUseCase } from '@/domain/use-cases/update-order-use-case.js'
import { DeleteOrderUseCase } from '@/domain/use-cases/delete-order-use-case.js'
import { MarkOrderAsWaitingUseCase } from '@/domain/use-cases/mark-order-as-waiting-use-case.js'
import { WithdrawOrderUseCase } from '@/domain/use-cases/withdraw-order-use-case.js'
import { DeliverOrderUseCase } from '@/domain/use-cases/deliver-order-use-case.js'
import { ReturnOrderUseCase } from '@/domain/use-cases/return-order-use-case.js'
import { SendNotificationUseCase } from '@/domain/use-cases/send-notification-use-case.js'
import { GetProfileUseCase } from '@/domain/use-cases/get-profile-use-case.js'
import { RefreshTokenUseCase } from '@/domain/use-cases/refresh-token-use-case.js'
import { RevokeUserSessionsUseCase } from '@/domain/use-cases/revoke-user-sessions-use-case.js'
import { EnvModule } from '@/infra/env/env.module.js'
import { DatabaseModule } from '@/infra/database/database.module.js'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module.js'
import { StorageModule } from '@/infra/storage/storage.module.js'
import { MessagingModule } from '@/infra/messaging/messaging.module.js'
import { CreateUserController } from '@/infra/http/controllers/create-user.controller.js'
import { AuthenticateController } from '@/infra/http/controllers/authenticate.controller.js'
import { ProfileController } from '@/infra/http/controllers/profile.controller.js'
import { CreateCourierController } from '@/infra/http/controllers/create-courier.controller.js'
import { CreateRecipientController } from '@/infra/http/controllers/create-recipient.controller.js'
import { DeleteCourierController } from '@/infra/http/controllers/delete-courier.controller.js'
import { DeleteRecipientController } from '@/infra/http/controllers/delete-recipient.controller.js'
import { GetCourierController } from '@/infra/http/controllers/get-courier.controller.js'
import { GetRecipientController } from '@/infra/http/controllers/get-recipient.controller.js'
import { ListCouriersController } from '@/infra/http/controllers/list-couriers.controller.js'
import { ListRecipientsController } from '@/infra/http/controllers/list-recipients.controller.js'
import { UpdateCourierController } from '@/infra/http/controllers/update-courier.controller.js'
import { UpdateRecipientController } from '@/infra/http/controllers/update-recipient.controller.js'
import { UpdateUserPasswordController } from '@/infra/http/controllers/update-user-password.controller.js'
import { CreateOrderController } from '@/infra/http/controllers/create-order.controller.js'
import { GetOrderController } from '@/infra/http/controllers/get-order.controller.js'
import { GetCourierOrderController } from '@/infra/http/controllers/get-courier-order.controller.js'
import { ListOrdersController } from '@/infra/http/controllers/list-orders.controller.js'
import { ListAvailableOrdersController } from '@/infra/http/controllers/list-available-orders.controller.js'
import { ListCourierOrdersController } from '@/infra/http/controllers/list-courier-orders.controller.js'
import { CountCourierOrdersController } from '@/infra/http/controllers/count-courier-orders.controller.js'
import { UpdateOrderController } from '@/infra/http/controllers/update-order.controller.js'
import { DeleteOrderController } from '@/infra/http/controllers/delete-order.controller.js'
import { MarkOrderAsWaitingController } from '@/infra/http/controllers/mark-order-as-waiting.controller.js'
import { WithdrawOrderController } from '@/infra/http/controllers/withdraw-order.controller.js'
import { DeliverOrderController } from '@/infra/http/controllers/deliver-order.controller.js'
import { ReturnOrderController } from '@/infra/http/controllers/return-order.controller.js'
import { RefreshTokenController } from '@/infra/http/controllers/refresh-token.controller.js'
import { LogoutController } from '@/infra/http/controllers/logout.controller.js'
import { HealthController } from '@/infra/http/controllers/health.controller.js'

@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    CryptographyModule,
    StorageModule,
    MessagingModule,
    TerminusModule,
  ],
  exports: [],
  controllers: [
    CreateUserController,
    AuthenticateController,
    CreateCourierController,
    ProfileController,
    ListCouriersController,
    GetCourierController,
    UpdateCourierController,
    DeleteCourierController,
    CreateRecipientController,
    ListRecipientsController,
    GetRecipientController,
    UpdateRecipientController,
    DeleteRecipientController,
    UpdateUserPasswordController,
    CreateOrderController,
    ListOrdersController,
    ListAvailableOrdersController,
    ListCourierOrdersController,
    CountCourierOrdersController,
    GetOrderController,
    GetCourierOrderController,
    UpdateOrderController,
    DeleteOrderController,
    MarkOrderAsWaitingController,
    WithdrawOrderController,
    DeliverOrderController,
    ReturnOrderController,
    RefreshTokenController,
    LogoutController,
    HealthController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUserUseCase,
    CreateCourierUseCase,
    ListCouriersUseCase,
    GetCourierUseCase,
    UpdateCourierUseCase,
    DeleteCourierUseCase,
    CreateRecipientUseCase,
    ListRecipientsUseCase,
    GetRecipientUseCase,
    UpdateRecipientUseCase,
    DeleteRecipientUseCase,
    UpdateUserPasswordUseCase,
    CreateOrderUseCase,
    GetOrderUseCase,
    GetCourierOrderUseCase,
    ListOrdersUseCase,
    ListAvailableOrdersUseCase,
    ListCourierOrdersUseCase,
    CountCourierOrdersUseCase,
    UpdateOrderUseCase,
    DeleteOrderUseCase,
    MarkOrderAsWaitingUseCase,
    WithdrawOrderUseCase,
    DeliverOrderUseCase,
    ReturnOrderUseCase,
    SendNotificationUseCase,
    GetProfileUseCase,
    RefreshTokenUseCase,
    RevokeUserSessionsUseCase,
  ],
})
export class HttpModule {}
