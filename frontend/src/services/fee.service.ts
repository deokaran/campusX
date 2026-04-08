import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

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
      receipts => this.receiptsSubject.next(receipts.map(receipt => this.normalizeReceipt(receipt))),
      error => console.error('Error loading receipts:', error)
    );
  }

  private normalizeReceipt(receipt: FeeReceipt): FeeReceipt {
    const normalizedId = receipt._id || receipt.id || '';

    return {
      ...receipt,
      _id: normalizedId,
      id: normalizedId
    };
  }

  fetchReceiptsForStudent(studentId: string): Observable<FeeReceipt[]> {
    return this.http.get<FeeReceipt[]>(`${this.apiUrl}/student/${studentId}`).pipe(
      map(receipts => receipts.map(receipt => this.normalizeReceipt(receipt))),
      tap(receipts => {
        const currentReceipts = this.receiptsSubject
          .getValue()
          .filter(receipt => receipt.studentId !== studentId);
        this.receiptsSubject.next([...currentReceipts, ...receipts]);
      })
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

  addReceipt(receiptData: Partial<FeeReceipt>): Observable<FeeReceipt> {
  console.log('reached services');

  if (!receiptData.studentId) {
    throw new Error('Student is required for receipt');
  }

  const payload = {
    ...receiptData,
    date:
      (receiptData.date as any) instanceof Date
        ? (receiptData.date as any).toISOString()
        : receiptData.date
  };

  return this.http.post<FeeReceipt>(this.apiUrl, payload).pipe(
    tap((newReceipt) => {
      const currentReceipts = this.receiptsSubject.getValue();
      this.receiptsSubject.next([...currentReceipts, newReceipt]);
    })
  );
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
