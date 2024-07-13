import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegistrationCodeUpdatedEvent } from '../registration-code-updated.event';
import { EmailService } from '../../../../../base/email/email.service';

@EventsHandler(UserRegistrationCodeUpdatedEvent)
export class SendUpdatedRegistrationCodeByEmail
    implements IEventHandler<UserRegistrationCodeUpdatedEvent>
{
    constructor(private readonly emailService: EmailService) {}

    async handle(event: UserRegistrationCodeUpdatedEvent) {
        try {
            await this.emailService.sendRegistrationConfirmationEmail(
                event.newCode,
                event.email,
            );
        } catch (error) {
            console.log(`Error when sending confirmation code by email`, error);
        }
    }
}
