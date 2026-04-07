import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notice } from '../models/notice';

// Backend Event type
interface BackendEvent {
  _id: string;
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
    this.http.get<BackendEvent[]>(this.apiUrl).subscribe({
      next: (events) => {
        const notices = events.map(e => this.eventToNotice(e));
        this.noticesSubject.next(notices);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.noticesSubject.next([]);
      }
    });
  }

  // Convert Backend Event to Frontend Notice
  private eventToNotice(event: BackendEvent): Notice {
    return {
      _id: event._id,
      date: typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0],
      title: event.name,
      category: 'Event' as const,
      description: event.description
    };
  }

  // Convert Frontend Notice to Backend Event
  private noticeToEvent(notice: Notice): Partial<BackendEvent> {
    // Generate a unique ID for new notices
    const id = notice._id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      _id: id,
      date: notice.date,
      name: notice.title,
      description: notice.description
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
        console.log('Notice added successfully:', newEvent);
        // Reload all notices to get fresh data
        this.loadNotices();
      },
      error: (error) => {
        console.error('Error adding notice:', error);
        alert('Failed to add notice. Please try again.');
      }
    });
  }

  addEvent(notice: Notice): void {
    this.addNotice(notice);
  }

  updateNotice(originalTitle: string, updatedNotice: Notice): void {
    // Find the notice by title to get its ID
    const notices = this.noticesSubject.getValue();
    const existingNotice = notices.find(n => n.title === originalTitle);
    
    if (existingNotice && existingNotice._id) {
      const eventData = this.noticeToEvent(updatedNotice);
      this.http.put<BackendEvent>(`${this.apiUrl}/${existingNotice._id}`, eventData).subscribe({
        next: (event) => {
          console.log('Notice updated successfully:', event);
          // Reload all notices to get fresh data
          this.loadNotices();
        },
        error: (error) => {
          console.error('Error updating notice:', error);
          alert('Failed to update notice. Please try again.');
        }
      });
    } else {
      console.error('Cannot update notice: ID not found');
      alert('Failed to update notice. Please try again.');
    }
  }

  updateEvent(eventId: string, updatedNotice: Notice): void {
    const eventData = this.noticeToEvent(updatedNotice);
    this.http.put<BackendEvent>(`${this.apiUrl}/${eventId}`, eventData).subscribe({
      next: (event) => {
        console.log('Event updated successfully:', event);
        this.loadNotices();
      },
      error: (error) => {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
      }
    });
  }

  deleteNotice(title: string): void {
    // Find the notice by title to get its ID
    const notices = this.noticesSubject.getValue();
    const noticeToDelete = notices.find(n => n.title === title);
    
    if (noticeToDelete && noticeToDelete._id) {
      this.http.delete<void>(`${this.apiUrl}/${noticeToDelete._id}`).subscribe({
        next: () => {
          console.log('Notice deleted successfully');
          // Reload all notices to get fresh data
          this.loadNotices();
        },
        error: (error) => {
          console.error('Error deleting notice:', error);
          alert('Failed to delete notice. Please try again.');
        }
      });
    } else {
      console.error('Cannot delete notice: ID not found');
      alert('Failed to delete notice. Please try again.');
    }
  }

  deleteEvent(eventId: string): void {
    this.http.delete<void>(`${this.apiUrl}/${eventId}`).subscribe({
      next: () => {
        console.log('Event deleted successfully');
        this.loadNotices();
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    });
  }
}
