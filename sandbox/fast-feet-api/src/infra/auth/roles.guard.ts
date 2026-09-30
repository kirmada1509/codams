import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Role } from '@/domain/entities/role.js'
import { ROLES_KEY } from '@/infra/auth/roles.decorator.js'
import { TokenPayload } from '@/infra/auth/jwt.strategy.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: TokenPayload | undefined }>()

    if (!user) {
      return false
    }

    return requiredRoles.some((role) => user.role === role)
  }
}
