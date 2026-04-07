import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { NoticeService } from '../../services/notice.service';
import { Notice } from '../../models/notice';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-notices',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-notices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageNoticesComponent implements OnInit {
  noticeService = inject(NoticeService);
  cdr = inject(ChangeDetectorRef);
  
  notices: Notice[] = [];
  isModalOpen = false;
  isEditMode = false;
  
  currentNotice: Notice = this.resetCurrentNotice();
  originalNoticeTitle = '';

  minDate: string;
  maxDate: string;

  constructor() {
    const today = new Date();
    this.minDate = formatDate(today, 'yyyy-MM-dd', 'en-US');
    const maxYear = new Date();
    maxYear.setFullYear(maxYear.getFullYear() + 10);
    this.maxDate = formatDate(maxYear, 'yyyy-MM-dd', 'en-US');
  }

  ngOnInit() {
    // Fixed: Use synchronous method to get notices
    this.notices = this.noticeService.getNotices();
    
    // Subscribe to updates
    this.noticeService.notices$.subscribe(notices => {
      this.notices = notices;
      this.cdr.markForCheck();
    });
  }

  resetCurrentNotice(): Notice {
    const today = new Date();
    const formattedDate = formatDate(today, 'yyyy-MM-dd', 'en-US');
    return { date: formattedDate, title: '', category: 'Academic' };
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentNotice = this.resetCurrentNotice();
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }
  
  openEditModal(notice: Notice) {
    this.isEditMode = true;
    this.currentNotice = { ...notice };
    this.originalNoticeTitle = notice.title;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.markForCheck();
  }

  saveNotice() {
    if (this.isEditMode) {
      this.noticeService.updateNotice(this.originalNoticeTitle, this.currentNotice);
    } else {
      this.noticeService.addNotice(this.currentNotice);
    }
    
    // Refresh after short delay
    setTimeout(() => {
      this.notices = this.noticeService.getNotices();
      this.cdr.markForCheck();
    }, 200);
    
    this.closeModal();
  }

  deleteNotice(title: string) {
    if (confirm(`Are you sure you want to delete the notice "${title}"?`)) {
      this.noticeService.deleteNotice(title);
      
      // Refresh after short delay
      setTimeout(() => {
        this.notices = this.noticeService.getNotices();
        this.cdr.markForCheck();
      }, 200);
    }
  }
}
