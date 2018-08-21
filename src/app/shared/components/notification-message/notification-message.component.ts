import { Component } from '@angular/core';
import { NotifyService } from '@lor/core/services';

@Component({
  selector: 'lor-notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss']
})
export class NotificationMessageComponent {

  constructor(public notify: NotifyService) { }
}
