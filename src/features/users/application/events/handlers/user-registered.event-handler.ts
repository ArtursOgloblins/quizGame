import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../user-registered.event';
import { EmailService } from '../../../../../base/email/email.service';

@EventsHandler(UserRegisteredEvent)
export class SendRegistrationConfirmationCodeByEmail
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(private readonly emailService: EmailService) {}

  async handle(event: UserRegisteredEvent) {
    try {
      await this.emailService.sendRegistrationConfirmationEmail(
        event.confirmationCode,
        event.email,
      );
    } catch (error) {
      console.log(`Error when sending confirmation code by email`, error);
    }
  }
}
