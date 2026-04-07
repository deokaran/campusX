import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NoticeService } from '../../services/notice.service';
import { Notice } from '../../models/notice';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events',
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsComponent {
  noticeService = inject(NoticeService);
  // Fixed: Use notices$ observable from service
  notices$: Observable<Notice[]> = this.noticeService.notices$;
}
