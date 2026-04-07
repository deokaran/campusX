
# CampusX Backend JSON Data Structure

This document outlines the suggested JSON data structure for a NoSQL database (like MongoDB, Firestore, etc.) to support the CampusX educational portal. The structure is designed to be compatible with the existing Angular application's services and data models.

## Collections Overview

1.  **`users`**: Stores all user accounts (Students, Teachers, Admins).
2.  **`classes`**: Contains information about academic classes, including assigned teachers, students, subjects, and timetables.
3.  **`tests`**: Holds all tests created by teachers, including questions and settings.
4.  **`submissions`**: Stores student submissions for tests, including their answers and scores.
5.  **`results`**: Contains the official semester-end results for students.
6.  **`receipts`**: Manages all fee payment receipts for students.
7.  **`events`**: A list of all campus events.
8.  **`chatMessages`**: Stores all messages sent in the class chatrooms.

---

## 1. `users` Collection

Stores core information for all user types. A `details` object holds role-specific data.

### Sample Document (Student)

```json
{
  "_id": "S00001",
  "name": "Karan",
  "email": "karan123@gmail.com",
  "password": "hashed_password_string",
  "role": "S",
  "details": {
    "fullName": "Thakur Deokaran Shankarchand Kalawati",
    "profileEmail": "g23.deokaran.thakur@gnkhalsa.edu.in",
    "department": "IT",
    "degree": "BSc-IT",
    "yearSem": "Third/05",
    "batch": "2025 - 2026",
    "mobile": "9876543210",
    "uid": "9876-5687-9999",
    "guardianNo": "9876988888",
    "gender": "Male",
    "dob": "2003-05-21T00:00:00.000Z",
    "avatarUrl": "https://i.pravatar.cc/150?u=S00001",
    "classId": "C01",
    "fees": {
      "total": 50000,
      "paid": 39210,
      "due": 10790
    }
  }
}
```

### Sample Document (Teacher)

```json
{
  "_id": "T00001",
  "name": "Dr. Smith",
  "email": "smith.t@campusx.edu",
  "password": "hashed_password_string",
  "role": "T",
  "details": {
    "fullName": "Dr. Alan Smith",
    "department": "Computer Science",
    "specialization": "Artificial Intelligence",
    "mobile": "8887776665",
    "dob": "1980-01-15T00:00:00.000Z",
    "joiningDate": "2015-08-01T00:00:00.000Z",
    "avatarUrl": "https://i.pravatar.cc/150?u=teacher"
  }
}
```

### Sample Document (Admin)

```json
{
  "_id": "A00001",
  "name": "Admin User",
  "email": "admin@campusx.edu",
  "password": "hashed_password_string",
  "role": "A",
  "details": {
    "fullName": "Alicia Woods",
    "role": "Head Administrator",
    "mobile": "9998887776",
    "avatarUrl": "https://i.pravatar.cc/150?u=admin"
  }
}
```

### Field Descriptions
-   `_id` (String): The unique User ID (e.g., "S00001"). Used as the primary key.
-   `name` (String): First name of the user, for quick display.
-   `email` (String): Login email. Should be unique.
-   `password` (String): **MUST be a securely hashed password**.
-   `role` (String): Enum `S`, `T`, or `A`.
-   `details` (Object): A nested object for role-specific data.
    -   **Student**: `fullName`, `department`, `degree`, `classId` (references `classes._id`), `fees`, etc.
    -   **Teacher**: `fullName`, `department`, `specialization`, `joiningDate`, `mobile`, `dob`, etc.
    -   **Admin**: `fullName`, `role` (e.g., "Head Administrator"), `mobile`.
-   `dob`, `joiningDate` (Date): Should be stored in ISODate format for proper querying.

---

## 2. `classes` Collection

Defines an academic class, its subjects, teachers, students, and schedule.

### Sample Document
```json
{
  "_id": "C01",
  "name": "BSc-IT - Sem 5",
  "teacherIds": ["T00001"],
  "studentIds": ["S00001", "S00002"],
  "subjects": [
    {
      "code": "IT-501",
      "name": "Advanced Java",
      "teacherId": "T00001",
      "totalMarks": 100,
      "credits": 4
    }
  ],
  "timeTable": [
    {
      "time": "09:00 - 10:00",
      "mon": "IT-501",
      "tue": "IT-503",
      "wed": "IT-501",
      "thu": "IT-503",
      "fri": "IT-502"
    },
    {
      "time": "10:00 - 11:00",
      "mon": "IT-502",
      "tue": "IT-501",
      "wed": "IT-502",
      "thu": "IT-501",
      "fri": "IT-503"
    },
    {
      "time": "11:00 - 12:00",
      "mon": "BREAK",
      "tue": "BREAK",
      "wed": "BREAK",
      "thu": "BREAK",
      "fri": "BREAK"
    }
  ]
}
```

### Field Descriptions
-   `_id` (String): The unique Class ID (e.g., "C01"). Primary key.
-   `name` (String): The display name of the class.
-   `teacherIds` (Array<String>): List of teacher `_id`'s assigned.
-   `studentIds` (Array<String>): List of student `_id`'s enrolled.
-   `subjects` (Array<Object>): List of subjects taught in this class.
-   `timeTable` (Array<Object>): The weekly schedule. Each object represents a time slot with subject codes or 'BREAK' for each day (mon, tue, wed, thu, fri).

---

## 3. `tests` Collection

Stores the structure and content of tests created by teachers.

### Sample Document
```json
{
  "_id": "TEST1678886400000",
  "title": "Advanced Java - Midterm",
  "subject": "IT-501",
  "classId": "C01",
  "createdBy": "T00001",
  "status": "Published",
  "resultsPublished": false,
  "questions": [
    {
      "text": "What is the main purpose of the `static` keyword in Java?",
      "options": [
        "To define a variable that cannot be changed",
        "To create a method that can be called without creating an object",
        "To make a class final",
        "To handle exceptions"
      ],
      "correctAnswer": "To create a method that can be called without creating an object",
      "marks": 10,
      "explanation": "The static keyword is used for memory management mainly..."
    }
  ]
}
```
### Field Descriptions
-   `_id` (String): Unique ID for the test.
-   `status` (String): 'Draft', 'Published', 'Closed'.
-   `resultsPublished` (Boolean): Flag to indicate if students can see results.
-   `questions` (Array<Object>): The list of questions in the test.

---

## 4. `submissions` Collection

Records each student's attempt at a test.

### Sample Document
```json
{
    "_id": "SUB1678886400000",
    "testId": "TEST1678886400000",
    "studentId": "S00001",
    "answers": {
        "0": "To create a method that can be called without creating an object",
        "1": "Use of pointers"
    },
    "score": 20,
    "totalMarks": 20,
    "submittedAt": "2024-09-15T10:30:00.000Z"
}
```
### Field Descriptions
-   `answers` (Object): A map where the key is the question index (as a string) and the value is the selected answer string.

### Notes
-   An index on `{ "testId": 1, "studentId": 1 }` should be created to ensure a student can only submit a test once and for quick lookups.

---

## 5. `results` Collection

Stores official, detailed semester mark sheets for students.

### Sample Document
```json
{
    "_id": "RESULT_S00001_SEM1",
    "studentId": "S00001",
    "semester": 1,
    "prn": "2023016401665115",
    "seatNo": "B-130",
    "examMonthYear": "OCTOBER-2023",
    "finalRemarks": "SUCCESSFUL",
    "subjects": [
      {
        "srNo": 1,
        "paperCode": "GNKUSIT1101",
        "paper": "INFORMATION TECHNOLOGY:PROGRAMMING PRINCIPLES WITH C",
        "internal": 14,
        "external": 42,
        "total": 56,
        "grade": "B"
      }
    ]
}
```
### Notes
-   An index on `{ "studentId": 1, "semester": 1 }` would be beneficial for fetching a specific student's results.

---

## 6. `receipts` Collection

Stores individual fee payment transactions.

### Sample Document
```json
{
    "_id": "RECEIPT_SU-0038",
    "studentId": "S00001",
    "invoiceNumber": "GNKDC02147",
    "receiptNumber": "SU-0038",
    "class": "SY IT 24-25",
    "name": "KARAN",
    "academicYear": "2024-2025",
    "date": "2024-06-10T00:00:00.000Z",
    "paymentMode": "Offline",
    "items": [
      { "description": "Tuition Fee", "amount": 20000 },
      { "description": "Library", "amount": 1200 }
    ],
    "total": 21200,
    "totalInWords": "Twenty-One Thousand, Two Hundred"
}
```
### Notes
-   After adding a new receipt, the corresponding `user` document's `details.fees` object must be updated to reflect the new `paid` and `due` amounts.

---

## 7. `events` Collection

Stores campus-wide events and announcements.

### Sample Document
```json
{
    "_id": "EVENT_TECHFEST24",
    "date": "2024-10-15T00:00:00.000Z",
    "name": "Tech Fest \"Innovate\"",
    "description": "Annual technical festival with coding competitions and workshops."
}
```
### Notes
-   An index on the `date` field would be useful for sorting events chronologically.

---

## 8. `chatMessages` Collection

Stores messages for the class-specific chatrooms.

### Sample Document
```json
{
    "_id": "MSG1678886400000",
    "classId": "C01",
    "senderId": "S00001",
    "senderName": "Karan",
    "senderAvatar": "https://i.pravatar.cc/150?u=S00001",
    "text": "Hey everyone, did you check the notes for Advanced Java?",
    "timestamp": "2024-09-20T12:00:00.000Z"
}
```

### Notes
-   `senderName` and `senderAvatar` are denormalized to avoid looking up the `users` collection for every message when loading a chat history.
-   An index on `{ "classId": 1, "timestamp": 1 }` is crucial for efficiently fetching and sorting messages for a specific class.
-   Consider using a TTL (Time To Live) index on `timestamp` if you want messages to automatically expire after a certain period.
```