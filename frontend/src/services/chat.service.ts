import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ChatMessage {
  _id?: string;
  id?: string;
  classId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/chat';
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private currentClassId: string | null = null;

  private normalizeMessage(message: ChatMessage): ChatMessage {
    return {
      ...message,
      id: message.id || message._id || '',
      _id: message._id || message.id || '',
      timestamp: new Date(message.timestamp)
    };
  }

  getMessages(classId: string): Observable<ChatMessage[]> {
    if (this.currentClassId !== classId) {
      this.currentClassId = classId;
      this.refreshMessages(classId);
    }

    return this.messages$.pipe(
      map(messages => messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()))
    );
  }

  refreshMessages(classId: string): void {
    this.http.get<ChatMessage[]>(`${this.apiUrl}/class/${classId}`).subscribe({
      next: (messages) => this.messagesSubject.next(messages.map(message => this.normalizeMessage(message))),
      error: (error) => console.error('Error loading chat messages:', error)
    });
  }

  sendMessage(classId: string, text: string): Observable<ChatMessage> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !text.trim()) {
      throw new Error('Invalid message or user');
    }

    const newMessage = {
      classId,
      senderId: currentUser.id || currentUser._id || '',
      senderName: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`,
      senderAvatar: currentUser.details?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id || currentUser._id || ''}`,
      text: text.trim(),
      timestamp: new Date()
    };

    return this.http.post<ChatMessage>(this.apiUrl, newMessage).pipe(
      map(message => {
        const currentMessages = this.messagesSubject.getValue();
        const normalizedMessage = this.normalizeMessage(message);
        this.messagesSubject.next([...currentMessages, normalizedMessage]);
        return normalizedMessage;
      })
    );
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`).pipe(
      map(() => {
        const currentMessages = this.messagesSubject.getValue();
        this.messagesSubject.next(currentMessages.filter(m => (m._id || m.id) !== messageId));
      })
    );
  }

  getMessagesByClass(classId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/class/${classId}`).pipe(
      map(messages => messages.map(message => this.normalizeMessage(message)))
    );
  }
}
