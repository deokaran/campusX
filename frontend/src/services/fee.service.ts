import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FeeItem {
  description: string;
  amount: number;
}

export interface FeeReceipt {
  _id?: string;
  id?: string;
  studentId: string;
  invoiceNumber: string;
  receiptNumber: string;
  class: string;
  name: string;
  academicYear: string;
  date: string;
  paymentMode: string;
  items: FeeItem[];
  total: number;
  totalInWords: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  private apiUrl = 'http://localhost:5000/api/receipts';
  private receiptsSubject = new BehaviorSubject<FeeReceipt[]>([]);
  public receipts$ = this.receiptsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadReceipts();
  }

  private loadReceipts(): void {
    this.http.get<FeeReceipt[]>(this.apiUrl).subscribe(
      receipts => this.receiptsSubject.next(receipts),
      error => console.error('Error loading receipts:', error)
    );
  }

  // BACKWARD COMPATIBLE SYNCHRONOUS METHOD
  getReceiptsForStudent(studentId: string): FeeReceipt[] {
    return this.receiptsSubject.getValue().filter(r => r.studentId === studentId);
  }

  // OBSERVABLE METHOD FOR REACTIVE COMPONENTS
  getReceiptsForStudentObservable(studentId: string): Observable<FeeReceipt[]> {
    return this.receipts$.pipe(
      map(receipts => receipts.filter(r => r.studentId === studentId))
    );
  }

  addReceipt(receiptData: FeeReceipt): void {
    this.http.post<FeeReceipt>(this.apiUrl, receiptData).subscribe({
      next: (newReceipt) => {
        const currentReceipts = this.receiptsSubject.getValue();
        this.receiptsSubject.next([...currentReceipts, newReceipt]);
      },
      error: (error) => console.error('Error adding receipt:', error)
    });
  }

  updateReceipt(receiptId: string, updatedData: Partial<FeeReceipt>): void {
    this.http.put<FeeReceipt>(`${this.apiUrl}/${receiptId}`, updatedData).subscribe({
      next: (receipt) => {
        const currentReceipts = this.receiptsSubject.getValue();
        const index = currentReceipts.findIndex(r => (r._id || r.id) === receiptId);
        if (index !== -1) {
          currentReceipts[index] = receipt;
          this.receiptsSubject.next([...currentReceipts]);
        }
      },
      error: (error) => console.error('Error updating receipt:', error)
    });
  }

  deleteReceipt(receiptId: string): void {
    this.http.delete<void>(`${this.apiUrl}/${receiptId}`).subscribe({
      next: () => {
        const currentReceipts = this.receiptsSubject.getValue();
        this.receiptsSubject.next(currentReceipts.filter(r => (r._id || r.id) !== receiptId));
      },
      error: (error) => console.error('Error deleting receipt:', error)
    });
  }

  getAllReceipts(): FeeReceipt[] {
    return this.receiptsSubject.getValue();
  }
}
