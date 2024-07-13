import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request): boolean {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({ objectOrError: 'Basic auth' });
    }

    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic' || !this.validateCredentials(credentials)) {
      throw new UnauthorizedException({ objectOrError: 'Basic auth' });
    }

    return true;
  }

  private validateCredentials(credentials: string): boolean {
    const [username, password] = Buffer.from(credentials, 'base64')
      .toString()
      .split(':');

    return username === 'admin' && password === 'qwerty';
  }
}
