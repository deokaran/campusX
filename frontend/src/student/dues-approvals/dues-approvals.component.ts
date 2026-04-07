
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FeeService, FeeReceipt } from '../../services/fee.service';
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
  
  student: User | null = null;
  receipts: FeeReceipt[] = [];
  
  selectedReceipt: FeeReceipt | null = null;

  ngOnInit() {
    this.student = this.authService.currentUserValue;
    if (this.student) {
      this.receipts = this.feeService.getReceiptsForStudent(this.student.id);
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