import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FeeService, FeeReceipt, FeeItem } from '../../services/fee.service';
import { User } from '../../models/user';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-fees',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-fees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageFeesComponent implements OnInit {
  userService = inject(UserService);
  feeService = inject(FeeService);
  cdr = inject(ChangeDetectorRef);

  students: User[] = [];
  filteredStudents: User[] = [];
  searchTerm = '';
  selectedStudent: User | null = null;
  studentReceipts: FeeReceipt[] = [];
  
  isModalOpen = false;
  newReceipt: any;
  error = '';
  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  ngOnInit() {
    this.students = this.userService.getStudents();
    this.filteredStudents = this.students;
  }

  filterStudents() {
    if (!this.searchTerm) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectStudent(student: User) {
    this.selectedStudent = student;
    this.studentReceipts = this.feeService.getReceiptsForStudent(student.id);
    this.cdr.markForCheck();
  }
  
  clearSelection() {
    this.selectedStudent = null;
    this.cdr.markForCheck();
  }

  openAddReceiptModal() {
    if (!this.selectedStudent) return;
    this.error = '';
    this.resetNewReceipt();
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.markForCheck();
  }
  
  resetNewReceipt() {
     this.newReceipt = {
      invoiceNumber: 'GNKDC' + Math.floor(Math.random() * 90000 + 10000),
      receiptNumber: 'SU-' + Math.floor(Math.random() * 900 + 100),
      class: this.selectedStudent?.details.yearSem,
      academicYear: '2024-2025',
      date: this.today,
      paymentMode: 'Offline',
      items: [{ description: '', amount: 0 }]
    };
  }
  
  addFeeItem() {
    this.newReceipt.items.push({ description: '', amount: 0 });
  }

  removeFeeItem(index: number) {
    this.newReceipt.items.splice(index, 1);
  }
  
  calculateTotal() {
    return this.newReceipt.items.reduce((acc: number, item: FeeItem) => acc + (Number(item.amount) || 0), 0);
  }

  saveReceipt() {
    this.error = '';
    if (this.selectedStudent) {
      const currentPaid = this.selectedStudent.details.fees.paid;
      const totalFees = this.selectedStudent.details.fees.total;
      const newPayment = this.calculateTotal();

      if (currentPaid + newPayment > totalFees) {
        const overage = (currentPaid + newPayment) - totalFees;
        this.error = `This payment exceeds the total fees by ₹${overage.toLocaleString()}. Maximum payable amount is ₹${(totalFees - currentPaid).toLocaleString()}.`;
        return;
      }
      
      // Fixed: Add studentId to receipt object and pass single parameter
      const receiptData = {
        ...this.newReceipt,
        studentId: this.selectedStudent.id,
        name: `${this.selectedStudent.firstName} ${this.selectedStudent.lastName}`.toUpperCase(),
        total: this.calculateTotal(),
        totalInWords: this.numberToWords(this.calculateTotal())
      };
      
      this.feeService.addReceipt(receiptData);
      
      // Refresh data after short delay
      setTimeout(() => {
        if (this.selectedStudent) {
          this.selectStudent(this.selectedStudent);
        }
      }, 200);
      
      this.closeModal();
    }
  }

  private numberToWords(num: number): string {
    // Simplified version
    return `${num} Rupees`;
  }

  // Bulk Upload Logic
  parsedData: any = null;

  handleFileUpload(event: any) {
    this.parsedData = null;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        if (file.name.endsWith('.csv')) {
          this.parseCsv(content);
        } else if (file.name.endsWith('.json')) {
          this.parseJson(content);
        }
      };
      reader.readAsText(file);
    }
  }

  parseCsv(content: string) {
    const lines = content.split('\n').slice(1);
    this.parsedData = lines.map(line => {
      const [studentId, amount, paymentMode, description] = line.split(',');
      return { 
        studentId: studentId?.trim(), 
        amount: Number(amount), 
        paymentMode: paymentMode?.trim(), 
        description: description?.trim() 
      };
    }).filter(d => d.studentId && d.amount);
    this.processBulkData();
  }

  parseJson(content: string) {
    this.parsedData = JSON.parse(content);
    this.processBulkData();
  }

  processBulkData() {
    if (!this.parsedData || this.parsedData.length === 0) {
      alert('No valid data found.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    this.parsedData.forEach((record: any) => {
      const student = this.userService.getUserById(record.studentId);
      if (student) {
        // Fixed: Create complete receipt object with studentId
        const receipt: Partial<FeeReceipt> = {
          studentId: student.id,
          invoiceNumber: 'BLK-' + Math.floor(Math.random() * 90000),
          receiptNumber: 'REC-' + Math.floor(Math.random() * 9000),
          class: student.details.yearSem,
          name: `${student.firstName} ${student.lastName}`.toUpperCase(),
          academicYear: '2024-2025',
          date: this.today,
          paymentMode: record.paymentMode || 'Offline',
          items: [{ 
            description: record.description || 'Bulk Payment', 
            amount: parseInt(record.amount) 
          }],
          total: parseInt(record.amount),
          totalInWords: this.numberToWords(parseInt(record.amount))
        };
        
        this.feeService.addReceipt(receipt as FeeReceipt);
        successCount++;
      } else {
        errorCount++;
      }
    });

    alert(`Bulk processing complete.\nSuccessful: ${successCount}\nFailed (Student not found): ${errorCount}`);
    
    // Refresh if current student was updated
    setTimeout(() => {
      if (this.selectedStudent) {
        this.selectStudent(this.selectedStudent);
      }
    }, 300);
    
    this.parsedData = null;
  }

  downloadSampleCsv() {
    const csvContent = 'studentId,amount,paymentMode,description\nS00001,5000,Online,Tuition Fee\nS00002,2000,Offline,Lab Fee';
    this.downloadFile(csvContent, 'fee_sample.csv', 'text/csv');
  }

  downloadSampleJson() {
    const jsonContent = JSON.stringify([
      { "studentId": "S00001", "amount": 5000, "paymentMode": "Online", "description": "Tuition Fee" },
      { "studentId": "S00002", "amount": 2000, "paymentMode": "Offline", "description": "Lab Fee" }
    ], null, 2);
    this.downloadFile(jsonContent, 'fee_sample.json', 'application/json');
  }

  private downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}
