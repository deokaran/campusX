
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FeeService, FeeReceipt } from '../../services/fee.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

declare var html2canvas: any;
declare var jspdf: any;

@Component({
  selector: 'app-dues-approvals',
  imports: [CommonModule],
  templateUrl: './dues-approvals.component.html',
  styleUrls: ['./dues-approvals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuesApprovalsComponent implements OnInit {
  authService = inject(AuthService);
  feeService = inject(FeeService);
  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);
  
  student: User | null = null;
  receipts: FeeReceipt[] = [];
  
  selectedReceipt: FeeReceipt | null = null;

  ngOnInit() {
    this.student = this.authService.currentUserValue;
    if (this.student) {
      this.userService.fetchUserById(this.student.id).subscribe({
        next: (student) => {
          this.student = student;
          this.authService.updateCurrentUser(student);
          this.cdr.markForCheck();
        },
        error: (error) => console.error('Error refreshing student fees:', error)
      });

      this.feeService.fetchReceiptsForStudent(this.student.id).subscribe({
        next: (receipts) => {
          this.receipts = receipts;
          this.cdr.markForCheck();
        },
        error: (error) => console.error('Error loading student receipts:', error)
      });
    }
  }

  viewReceipt(receipt: FeeReceipt) {
    this.selectedReceipt = receipt;
  }

  downloadReceipt() {
    const receiptElement = document.getElementById('receipt-content');
    if (receiptElement) {
      html2canvas(receiptElement, { scale: 2 }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Fee-Receipt-${this.selectedReceipt?.receiptNumber}.pdf`);
      });
    }
  }
}
