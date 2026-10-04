# Security Specification: OmniAcademy LMS & School Management

## 1. Data Invariants
1. **User Identity & Role Immutability**: Users cannot forge their `role` to escalate privileges (e.g., student self-promoting to admin). Only verified admins or initial provisioning may assign roles. User documents can only be updated by the owner or an admin.
2. **Assignment Integrity**: Only teachers and admins can create or delete assignments. The `teacherId` on an assignment must match the creator.
3. **Submission Isolation & Grading Safeguard**: Students may only create submissions for themselves (`studentId == request.auth.uid`). Once submitted, students cannot tamper with `grade`, `feedback`, or `status: 'graded'`. Only teachers or admins can update `grade` and `feedback`.
4. **Course Management**: Only faculty (teachers) and admins can alter course offerings, schedules, or rosters.
5. **Private Communication**: Messages can only be read by the sender or the recipient. Users cannot forge `senderId` to impersonate faculty or staff.
6. **Gamification State Integrity**: Points, tier promotions, and badges cannot be arbitrarily injected or inflated by unauthorized users.
7. **Attendance Records**: Only teachers or admins can create or modify student attendance records.
8. **Bootstrap Admin**: The administrator account is bootstrapped with `hokmas45@gmail.com`.

## 2. The "Dirty Dozen" Malicious Payloads (Designed to Break Identity, Integrity, and State)

1. **Payload 1 (Privilege Escalation on User Creation)**:
   A student registers and injects `"role": "admin"` to gain full administrative permissions.
   `{ "name": "Eve", "email": "eve@student.omni.edu", "role": "admin" }` -> Must be REJECTED.

2. **Payload 2 (Grade Tampering by Student)**:
   A student attempts an update on their submission setting `"grade": 100` and `"status": "graded"`.
   `{ "grade": 100, "status": "graded" }` -> Must be REJECTED.

3. **Payload 3 (Impersonated Assignment Creation)**:
   A student attempts to publish an assignment spoofing a teacher's ID.
   `{ "courseId": "c1", "title": "Free A+", "teacherId": "prof_oak", "dueDate": "2026-10-10" }` -> Must be REJECTED.

4. **Payload 4 (Identity Spoofing in Messaging)**:
   A malicious user sends a message with `senderId: "principal_smith"` to trick a parent.
   `{ "senderId": "principal_smith", "recipientId": "parent_doe", "content": "Send funds." }` -> Must be REJECTED.

5. **Payload 5 (Eavesdropping on Private Messages)**:
   A user queries messages where they are neither `senderId` nor `recipientId`.
   `GET /messages/msg_123` by third party -> Must be REJECTED.

6. **Payload 6 (Shadow Field / Prototype Pollution)**:
   An update to an assignment that adds unauthorized field `isAdminBypass: true`.
   `{ "title": "Updated Title", "isAdminBypass": true }` -> Must be REJECTED.

7. **Payload 7 (Oversized Payload / Denial of Wallet)**:
   A user injects a 5MB junk string in `content` to bloat Firestore read/write costs.
   `{ "content": "A".repeat(5000000) }` -> Must be REJECTED.

8. **Payload 8 (Terminal State Tampering)**:
   A student modifies a submission after it has been finalized and graded.
   `{ "content": "Modified after deadline" }` on graded document -> Must be REJECTED.

9. **Payload 9 (Forged Gamification Points)**:
   A student increments their own XP to 999,999 and sets tier to "Diamond".
   `{ "points": 999999, "tier": "Diamond" }` -> Must be REJECTED.

10. **Payload 10 (Attendance Forgery)**:
    A student creates an attendance record marking themselves "present" for an unexcused absence.
    `{ "studentId": "student_1", "status": "present" }` -> Must be REJECTED.

11. **Payload 11 (Unauthenticated Read of Student PII)**:
    Unauthenticated visitor attempts to list student profiles.
    `GET /users` unauthenticated -> Must be REJECTED.

12. **Payload 12 (Course Hijacking)**:
    A non-teacher modifies course description and assigned teacher.
    `{ "teacherId": "attacker", "title": "Compromised Class" }` -> Must be REJECTED.
