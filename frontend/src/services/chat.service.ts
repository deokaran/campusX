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

  constructor() {
    this.loadMessages();
  }

  private loadMessages(): void {
    this.http.get<ChatMessage[]>(this.apiUrl).subscribe(
      messages => this.messagesSubject.next(messages),
      error => console.error('Error loading chat messages:', error)
    );
  }

  getMessages(classId: string): Observable<ChatMessage[]> {
    return this.messages$.pipe(
      map(messages => messages
        .filter(m => m.classId === classId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      )
    );
  }

  sendMessage(classId: string, text: string): Observable<ChatMessage> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !text.trim()) {
      throw new Error('Invalid message or user');
    }

    const newMessage = {
      classId,
      senderId: currentUser.id,
      senderName: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`,
      senderAvatar: currentUser.details?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`,
      text: text.trim(),
      timestamp: new Date()
    };

    return this.http.post<ChatMessage>(this.apiUrl, newMessage).pipe(
      map(message => {
        const currentMessages = this.messagesSubject.getValue();
        this.messagesSubject.next([...currentMessages, message]);
        return message;
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
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/class/${classId}`);
  }
}
