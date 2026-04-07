# CampusX Database - Data Relationships & Reference

## 🗂️ Collection Overview

```
campusx (database)
├── users (43 documents)
├── classes (6 documents)
├── tests (5 documents)
├── submissions (11 documents)
├── results (3 documents)
├── receipts (4 documents)
├── events (8 documents)
├── chatmessages (12 documents)
└── otps (empty - runtime data)
```

## 🔗 Data Relationships

### Users → Classes (One-to-Many)
```
Teacher T00001 → [CS-2022-A, CS-2021-A]
Teacher T00002 → [CS-2022-A, CS-2023-A, CS-2021-A]
Student S00001 → CS-2022-A
Student S00006 → CS-2023-A
```

### Classes → Tests (One-to-Many)
```
CS-2022-A → [TEST001, TEST002, TEST003]
EC-2022-A → [TEST004]
CS-2023-A → [TEST005]
```

### Tests → Submissions (One-to-Many)
```
TEST001 → [SUB001, SUB002, SUB003, SUB004, SUB005]
TEST002 → [SUB006, SUB007, SUB008]
TEST004 → [SUB009, SUB010, SUB011]
```

### Students → Results (One-to-Many)
```
S00001 → [RES001]
S00002 → [RES002]
S00011 → [RES003]
```

### Students → Receipts (One-to-Many)
```
S00001 → [REC001]
S00002 → [REC002]
S00003 → [REC003]
S00011 → [REC004]
```

### Classes → Chat Messages (One-to-Many)
```
CS-2022-A → [MSG001-MSG007]
EC-2022-A → [MSG008-MSG010]
CS-2023-A → [MSG011-MSG012]
```

## 📋 Complete Data Index

### Admins (3)
| ID     | Name              | Role                 |
|--------|-------------------|----------------------|
| A00001 | Dr. Rajesh Kumar  | Principal            |
| A00002 | Ms. Priya Sharma  | Vice Principal       |
| A00003 | Mr. Amit Patel    | Academic Coordinator |

### Teachers (10)
| ID     | Name                  | Department       | Specialization               |
|--------|-----------------------|------------------|------------------------------|
| T00001 | Dr. Sarah Johnson     | Computer Science | Data Structures & Algorithms |
| T00002 | Prof. Michael Chen    | Computer Science | Database Management Systems  |
| T00003 | Dr. Anita Desai       | Computer Science | Web Development              |
| T00004 | Prof. Robert Williams | Electronics      | Digital Electronics          |
| T00005 | Dr. Meera Reddy       | Electronics      | Microprocessors              |
| T00006 | Prof. David Brown     | Mechanical       | Thermodynamics               |
| T00007 | Dr. Kavita Nair       | Mechanical       | Machine Design               |
| T00008 | Prof. James Anderson  | Civil            | Structural Engineering       |
| T00009 | Dr. Sneha Kapoor      | Civil            | Environmental Engineering    |
| T00010 | Prof. Daniel Martinez | Computer Science | Operating Systems            |

### Students by Class

#### CS-2022-A (5 students)
| ID     | Name         | Fees Total | Fees Paid | Dues   |
|--------|--------------|------------|-----------|--------|
| S00001 | Arjun Mehta  | 120,000    | 80,000    | 40,000 |
| S00002 | Priya Singh  | 120,000    | 120,000   | 0      |
| S00003 | Rahul Verma  | 120,000    | 90,000    | 30,000 |
| S00004 | Sneha Patel  | 120,000    | 120,000   | 0      |
| S00005 | Vivek Kumar  | 120,000    | 60,000    | 60,000 |

#### CS-2023-A (5 students)
| ID     | Name         | Fees Total | Fees Paid | Dues   |
|--------|--------------|------------|-----------|--------|
| S00006 | Ananya Iyer  | 120,000    | 120,000   | 0      |
| S00007 | Karan Sharma | 120,000    | 100,000   | 20,000 |
| S00008 | Divya Nair   | 120,000    | 120,000   | 0      |
| S00009 | Rohan Gupta  | 120,000    | 70,000    | 50,000 |
| S00010 | Neha Reddy   | 120,000    | 120,000   | 0      |

#### EC-2022-A (5 students)
| ID     | Name            | Fees Total | Fees Paid | Dues   |
|--------|-----------------|------------|-----------|--------|
| S00011 | Aditya Joshi    | 115,000    | 115,000   | 0      |
| S00012 | Riya Malhotra   | 115,000    | 85,000    | 30,000 |
| S00013 | Varun Kapoor    | 115,000    | 115,000   | 0      |
| S00014 | Ishita Bansal   | 115,000    | 95,000    | 20,000 |
| S00015 | Siddharth Rao   | 115,000    | 115,000   | 0      |

#### ME-2022-A (5 students)
| ID     | Name             | Fees Total | Fees Paid | Dues   |
|--------|------------------|------------|-----------|--------|
| S00016 | Tanvi Deshmukh   | 110,000    | 110,000   | 0      |
| S00017 | Akash Kulkarni   | 110,000    | 75,000    | 35,000 |
| S00018 | Pooja Mishra     | 110,000    | 110,000   | 0      |
| S00019 | Harsh Agarwal    | 110,000    | 90,000    | 20,000 |
| S00020 | Shruti Jain      | 110,000    | 110,000   | 0      |

#### CE-2022-A (5 students)
| ID     | Name           | Fees Total | Fees Paid | Dues   |
|--------|----------------|------------|-----------|--------|
| S00021 | Nikhil Shetty  | 105,000    | 105,000   | 0      |
| S00022 | Sakshi Yadav   | 105,000    | 80,000    | 25,000 |
| S00023 | Manish Pandey  | 105,000    | 105,000   | 0      |
| S00024 | Kavya Pillai   | 105,000    | 105,000   | 0      |
| S00025 | Yash Bhatt     | 105,000    | 65,000    | 40,000 |

#### CS-2021-A (5 students)
| ID     | Name           | Fees Total | Fees Paid | Dues   |
|--------|----------------|------------|-----------|--------|
| S00026 | Anjali Chawla  | 120,000    | 120,000   | 0      |
| S00027 | Kunal Saxena   | 120,000    | 120,000   | 0      |
| S00028 | Megha Bose     | 120,000    | 120,000   | 0      |
| S00029 | Gaurav Chopra  | 120,000    | 100,000   | 20,000 |
| S00030 | Simran Kohli   | 120,000    | 120,000   | 0      |

### Classes Overview
| Class ID   | Name                                    | Teachers | Students |
|------------|-----------------------------------------|----------|----------|
| CS-2022-A  | Computer Science - 3rd Year (2022)      | 4        | 5        |
| CS-2023-A  | Computer Science - 2nd Year (2023)      | 3        | 5        |
| EC-2022-A  | Electronics - 3rd Year (2022)           | 2        | 5        |
| ME-2022-A  | Mechanical - 3rd Year (2022)            | 2        | 5        |
| CE-2022-A  | Civil - 3rd Year (2022)                 | 2        | 5        |
| CS-2021-A  | Computer Science - 4th Year (2021)      | 3        | 5        |

### Tests Overview
| Test ID | Title                        | Class      | Teacher | Status | Published |
|---------|------------------------------|------------|---------|--------|-----------|
| TEST001 | Data Structures Mid-Term     | CS-2022-A  | T00001  | Closed | Yes       |
| TEST002 | DBMS Quiz 1                  | CS-2022-A  | T00002  | Closed | Yes       |
| TEST003 | Web Development Assessment   | CS-2022-A  | T00003  | Active | No        |
| TEST004 | Digital Electronics Test     | EC-2022-A  | T00004  | Closed | Yes       |
| TEST005 | OOP Fundamentals             | CS-2023-A  | T00003  | Active | No        |

### Submissions Summary
| Test ID | Total Submissions | Average Score |
|---------|-------------------|---------------|
| TEST001 | 5                 | 17/20 (85%)   |
| TEST002 | 3                 | 13.3/15 (89%) |
| TEST004 | 3                 | 13.3/15 (89%) |

### Events Timeline
| Date       | Event Name                        |
|------------|-----------------------------------|
| 2025-03-25 | Sports Day                        |
| 2025-03-28 | Mid-Semester Break Begins         |
| 2025-03-30 | Workshop: Full Stack Development  |
| 2025-04-01 | Internship Drive - TCS            |
| 2025-04-05 | Blood Donation Camp               |
| 2025-04-10 | Guest Lecture: AI in Healthcare   |
| 2025-04-15 | Annual Tech Fest                  |
| 2025-04-20 | Project Expo                      |

## 📊 Statistics

### Overall
- **Total Users**: 43
- **Total Students**: 30
- **Total Teachers**: 10
- **Total Admins**: 3
- **Total Classes**: 6
- **Total Tests**: 5
- **Total Submissions**: 11
- **Total Events**: 8

### Fees
- **Students with no dues**: 14 (46.7%)
- **Students with pending dues**: 16 (53.3%)
- **Total fees collected**: ₹3,285,000
- **Total dues pending**: ₹565,000

### Academic
- **Active Tests**: 2
- **Completed Tests**: 3
- **Average Test Score**: 87%

## 🔍 Quick Lookup

### Find Students by Class
```javascript
// CS-2022-A
S00001, S00002, S00003, S00004, S00005

// CS-2023-A
S00006, S00007, S00008, S00009, S00010

// EC-2022-A
S00011, S00012, S00013, S00014, S00015
```

### Find Teachers by Department
```javascript
// Computer Science
T00001, T00002, T00003, T00010

// Electronics
T00004, T00005

// Mechanical
T00006, T00007

// Civil
T00008, T00009
```

### Find Tests by Teacher
```javascript
// T00001 (Dr. Sarah Johnson)
TEST001

// T00002 (Prof. Michael Chen)
TEST002

// T00003 (Dr. Anita Desai)
TEST003, TEST005

// T00004 (Prof. Robert Williams)
TEST004
```

---

Use this reference to understand the relationships and structure of your CampusX database! 📚
