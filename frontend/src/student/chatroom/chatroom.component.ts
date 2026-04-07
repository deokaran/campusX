import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../models/user';

@Component({
  selector: 'app-chatroom',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatroomComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  messages$!: Observable<ChatMessage[]>;
  currentUser: User | null = null;
  newMessage = '';
  classId = '';
  loading = true;

  private userSub!: Subscription;
  private messagesSub!: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
      this.cdr.markForCheck();
    }, 1000); // Simulate 1 second load time

    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.details && user.details.classId) {
        this.classId = user.details.classId;
        this.messages$ = this.chatService.getMessages(this.classId);

        // Subscribe to messages to scroll down when new ones arrive
        this.messagesSub = this.messages$.subscribe(() => {
          // Defer scrolling to after the view has been updated
          setTimeout(() => this.scrollToBottom(), 0);
        });
      }
      this.cdr.markForCheck();
    });
  }
  
  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.classId) {
      this.chatService.sendMessage(this.classId, this.newMessage);
      this.newMessage = '';
      this.cdr.markForCheck();
    }
  }
  
  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      // scrollContainer might not be available yet
    }
  }
}
