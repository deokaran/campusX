import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FeeService, FeeReceipt, FeeItem } from '../../services/fee.service';
import { ClassService } from '../../services/class.service';
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
  classService = inject(ClassService);
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
     const classLabel = this.getStudentClassLabel(this.selectedStudent);
     this.newReceipt = {
      invoiceNumber: 'GNKDC' + Math.floor(Math.random() * 90000 + 10000),
      receiptNumber: 'SU-' + Math.floor(Math.random() * 900 + 100),
      class: classLabel,
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
      const classLabel = this.getStudentClassLabel(this.selectedStudent);

      if (!classLabel) {
        this.error = 'This student is not assigned to a class yet. Please assign a class before creating a receipt.';
        this.cdr.markForCheck();
        return;
      }

      const currentPaid = this.selectedStudent.details.fees.paid;
      const totalFees = this.selectedStudent.details.fees.total;
      const newPayment = this.calculateTotal();

      if (currentPaid + newPayment > totalFees) {
        const overage = (currentPaid + newPayment) - totalFees;
        this.error = `This payment exceeds the total fees by ₹${overage.toLocaleString()}. Maximum payable amount is ₹${(totalFees - currentPaid).toLocaleString()}.`;
        return;
      }
      
      // Create receipt object with all required fields
      const receiptData: Partial<FeeReceipt> = {
        studentId: this.selectedStudent.id,
        invoiceNumber: this.newReceipt.invoiceNumber,
        receiptNumber: this.newReceipt.receiptNumber,
        class: classLabel,
        name: `${this.selectedStudent.firstName} ${this.selectedStudent.lastName}`.toUpperCase(),
        academicYear: this.newReceipt.academicYear,
        date: this.newReceipt.date,
        paymentMode: this.newReceipt.paymentMode,
        items: this.newReceipt.items,
        total: this.calculateTotal(),
        totalInWords: this.numberToWords(this.calculateTotal())
      };
      
      // Subscribe to the Observable
      this.feeService.addReceipt(receiptData).subscribe({
        next: (savedReceipt) => {
          console.log('Receipt saved successfully:', savedReceipt);
          if (!this.selectedStudent) {
            this.closeModal();
            return;
          }

          this.userService.fetchUserById(this.selectedStudent.id).subscribe({
            next: (freshStudent) => {
              this.selectedStudent = freshStudent;
              this.students = this.userService.getStudents();
              this.filterStudents();
              this.studentReceipts = this.feeService.getReceiptsForStudent(freshStudent.id);
              this.closeModal();
              this.cdr.markForCheck();
            },
            error: () => {
              this.studentReceipts = this.feeService.getReceiptsForStudent(this.selectedStudent!.id);
              this.closeModal();
              this.cdr.markForCheck();
            }
          });
        },
        error: (error) => {
          console.error('Error saving receipt:', error);
          this.error = error.error?.message || 'Failed to save receipt. Please try again.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  private numberToWords(num: number): string {
    // Simplified version
    return `${num} Rupees`;
  }

  private getStudentClassLabel(student: User | null): string {
    const classId = student?.details?.classId?.trim();
    const yearSem = student?.details?.yearSem?.trim();

    if (classId) {
      const classData = this.classService.getClassById(classId);
      return classData?.classId || classData?.id || classData?._id || classId;
    }

    return yearSem || '';
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
    const errors: string[] = [];

    // Process receipts sequentially to avoid race conditions
    const processReceipt = (index: number) => {
      if (index >= this.parsedData.length) {
        // All done
        const message = `Bulk processing complete.\nSuccessful: ${successCount}\nFailed: ${errorCount}`;
        const fullMessage = errors.length > 0 ? `${message}\n\nErrors:\n${errors.join('\n')}` : message;
        alert(fullMessage);
        
        this.students = this.userService.getStudents();
        this.filterStudents();

        if (this.selectedStudent) {
          this.userService.fetchUserById(this.selectedStudent.id).subscribe({
            next: (freshStudent) => {
              this.selectedStudent = freshStudent;
              this.studentReceipts = this.feeService.getReceiptsForStudent(freshStudent.id);
              this.cdr.markForCheck();
            },
            error: () => {
              this.studentReceipts = this.feeService.getReceiptsForStudent(this.selectedStudent!.id);
              this.cdr.markForCheck();
            }
          });
        }
        
        this.parsedData = null;
        return;
      }

      const record = this.parsedData[index];
      const student = this.userService.getUserById(record.studentId);
      
      if (student) {
        const classLabel = this.getStudentClassLabel(student);

        if (!classLabel) {
          errorCount++;
          errors.push(`${student.id}: Student is not assigned to a class`);
          processReceipt(index + 1);
          return;
        }

        const receipt: Partial<FeeReceipt> = {
          studentId: student.id,
          invoiceNumber: 'BLK-' + Math.floor(Math.random() * 90000),
          receiptNumber: 'REC-' + Date.now() + '-' + index,
          class: classLabel,
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
        
        this.feeService.addReceipt(receipt).subscribe({
          next: () => {
            successCount++;
            processReceipt(index + 1);
          },
          error: (error) => {
            errorCount++;
            errors.push(`${student.id}: ${error.error?.message || 'Failed to save'}`);
            processReceipt(index + 1);
          }
        });
      } else {
        errorCount++;
        errors.push(`${record.studentId}: Student not found`);
        processReceipt(index + 1);
      }
    };

    processReceipt(0);
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
