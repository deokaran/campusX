import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notice } from '../models/notice';

// Backend Event type
interface BackendEvent {
  _id?: string;
  id?: string;
  date: Date | string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private apiUrl = 'http://localhost:5000/api/events';
  private noticesSubject = new BehaviorSubject<Notice[]>([]);
  public notices$ = this.noticesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotices();
  }

  private loadNotices(): void {
    this.http.get<BackendEvent[]>(this.apiUrl).subscribe(
      events => {
        const notices = events.map(e => this.eventToNotice(e));
        this.noticesSubject.next(notices);
      },
      error => console.error('Error loading events:', error)
    );
  }

  // Convert Backend Event to Frontend Notice
  private eventToNotice(event: BackendEvent): Notice {
    return {
      date: typeof event.date === 'string' ? event.date : event.date.toISOString().split('T')[0],
      title: event.name,
      category: 'Event' as const,
      content: event.description
    };
  }

  // Convert Frontend Notice to Backend Event
  private noticeToEvent(notice: Notice): Partial<BackendEvent> {
    return {
      date: notice.date,
      name: notice.title,
      description: notice.content || ''
    };
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHOD
  getNotices(): Notice[] {
    return this.noticesSubject.getValue();
  }

  // OBSERVABLE METHOD
  getNoticesObservable(): Observable<Notice[]> {
    return this.notices$;
  }

  getEvents(): Notice[] {
    return this.getNotices();
  }

  addNotice(notice: Notice): void {
    const eventData = this.noticeToEvent(notice);
    this.http.post<BackendEvent>(this.apiUrl, eventData).subscribe({
      next: (newEvent) => {
        const currentNotices = this.noticesSubject.getValue();
        this.noticesSubject.next([...currentNotices, this.eventToNotice(newEvent)].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      },
      error: (error) => console.error('Error adding notice:', error)
    });
  }

  addEvent(notice: Notice): void {
    this.addNotice(notice);
  }

  updateNotice(originalTitle: string, updatedNotice: Notice): void {
    // Find the notice by title
    const notices = this.noticesSubject.getValue();
    const index = notices.findIndex(n => n.title === originalTitle);
    
    if (index !== -1) {
      const eventData = this.noticeToEvent(updatedNotice);
      // In a real scenario, we'd need the event ID. For now, just update locally
      notices[index] = updatedNotice;
      this.noticesSubject.next([...notices].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  }

  updateEvent(eventId: string, updatedNotice: Notice): void {
    const eventData = this.noticeToEvent(updatedNotice);
    this.http.put<BackendEvent>(`${this.apiUrl}/${eventId}`, eventData).subscribe({
      next: (event) => {
        const currentNotices = this.noticesSubject.getValue();
        const index = currentNotices.findIndex(n => n.title === updatedNotice.title);
        if (index !== -1) {
          currentNotices[index] = this.eventToNotice(event);
          this.noticesSubject.next([...currentNotices].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        }
      },
      error: (error) => console.error('Error updating event:', error)
    });
  }

  deleteNotice(title: string): void {
    const notices = this.noticesSubject.getValue();
    this.noticesSubject.next(notices.filter(n => n.title !== title));
  }

  deleteEvent(eventId: string): void {
    this.http.delete<void>(`${this.apiUrl}/${eventId}`).subscribe({
      next: () => {
        // Since we don't have eventId mapped to title, just reload
        this.loadNotices();
      },
      error: (error) => console.error('Error deleting event:', error)
    });
  }
}
