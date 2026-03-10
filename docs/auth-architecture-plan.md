# [IMPLEMENTATION PLAN] 3d-ai-maker.tech 4-Level RBAC & Course Licensing Architecture

## 🎯 Agent Directives (CRITICAL)
- **Context Limit:** Do NOT scan the entire repository. Only create or modify the files explicitly listed in this document.
- **Artifacts-First:** Execute this plan phase by phase. Do not proceed to the next phase until the user reviews and approves the current phase's PR or code output.
- **Tech Stack:** Next.js (App Router), Prisma, TypeScript, Tailwind CSS.

## 🏗️ Architecture Overview
The system implements a B2B2C multi-tenant authorization flow:
1. `SUPER_ADMIN` (Platform) -> Allocates `Series` & total seats to `Organization`.
2. `ORG_ADMIN` (Principal) -> Distributes specific `Course` seats to `TEACHER`s.
3. `TEACHER` -> Generates `InvitationCode`s for their allocated courses.
4. `STUDENT` -> Registers via `InvitationCode`, automatically binding to the `TEACHER` and inheriting course access.

---

## 🛠️ Phase 1: Prisma Schema Definition
**Target File:** `prisma/schema.prisma`
**Action:** Append/Update the following models. Do not delete existing user fields without user confirmation.

```prisma
enum Role {
  SUPER_ADMIN
  ORG_ADMIN
  TEACHER
  STUDENT
}

model User {
  id            String    @id @default(cuid())
  role          Role      @default(STUDENT)
  orgId         String?
  organization  Organization? @relation(fields: [orgId], references: [id])
  
  teacherId     String?
  teacher       User?     @relation("TeacherStudents", fields: [teacherId], references: [id])
  students      User[]    @relation("TeacherStudents")

  teacherLicenses TeacherLicense[]
  createdCodes    InvitationCode[]
}

model Organization {
  id            String    @id @default(cuid())
  name          String
  users         User[]
  orgLicenses   OrgLicense[]
}

model CourseSeries {
  id            String    @id @default(cuid())
  name          String    // e.g., "3D打印体系", "AI互动体系"
  courses       Course[]
  orgLicenses   OrgLicense[]
}

model Course {
  id            String    @id @default(cuid())
  seriesId      String
  series        CourseSeries @relation(fields: [seriesId], references: [id])
  
  teacherLicenses TeacherLicense[]
  invitationCodes InvitationCode[]
}

model OrgLicense {
  id            String    @id @default(cuid())
  orgId         String
  seriesId      String
  totalSeats    Int
  usedSeats     Int       @default(0)
  expiresAt     DateTime
  
  organization  Organization @relation(fields: [orgId], references: [id])
  series        CourseSeries @relation(fields: [seriesId], references: [id])
}

model TeacherLicense {
  id            String    @id @default(cuid())
  teacherId     String
  courseId      String
  allocatedSeats Int
  usedSeats     Int       @default(0)
  
  teacher       User      @relation(fields: [teacherId], references: [id])
  course        Course    @relation(fields: [courseId], references: [id])
}

model InvitationCode {
  id            String    @id @default(cuid())
  code          String    @unique
  teacherId     String
  courseId      String
  maxUses       Int
  usedCount     Int       @default(0)
  
  teacher       User      @relation(fields: [teacherId], references: [id])
  course        Course    @relation(fields: [courseId], references: [id])
}
```

---

## ⚙️ Phase 2: Core Server Actions (Business Logic)

**Target Directory:** `src/actions/auth/`
**Action:** Create isolated Next.js Server Actions with strict Prisma `$transaction` logic.

**Required Functions to Implement:**

1. `assignCourseToTeacher(orgId: string, teacherId: string, courseId: string, seats: number)`
* *Logic:* Check `OrgLicense` remaining seats -> decrement Org available seats -> upsert `TeacherLicense`.


2. `generateInvitationCode(teacherId: string, courseId: string, maxUses: number)`
* *Logic:* Verify `TeacherLicense` has enough `allocatedSeats - usedSeats` -> create `InvitationCode`.


3. `registerStudentWithCode(studentData: any, code: string)`
* *Logic:* Validate code -> increment code `usedCount` -> increment `TeacherLicense.usedSeats` -> create User with `STUDENT` role, mapping `orgId` and `teacherId`.



---

## 🔒 Phase 3: Middleware & Security

**Target File:** `src/middleware.ts`
**Action:** Implement route-based RBAC.

* `/admin/*` -> Requires `SUPER_ADMIN`
* `/org/*` -> Requires `ORG_ADMIN`
* `/teacher/*` -> Requires `TEACHER`

**Target File:** `src/lib/dal.ts` (Data Access Layer)
**Action:** Create a utility function `verifyStudentCourseAccess(studentId: string, courseId: string)` that performs a flat query checking if the student's `teacherId` has a valid `TeacherLicense` for the requested `courseId`.

---

## 🎨 Phase 4: UI Scaffolding (Placeholder generation)

**Target Directory:** `src/app/(dashboard)/`
**Action:** Create the following page structures (UI only, wire up to actions later):

* `org/matrix/page.tsx`: A matrix view for `ORG_ADMIN` to assign courses to teachers.
* `teacher/codes/page.tsx`: A view for `TEACHER`s to generate and manage invitation codes.

## 🏁 Execution Command for Agent

"I have read the plan. I will start with Phase 1 by updating `prisma/schema.prisma` and running `npx prisma format`. Awaiting user approval to proceed to Phase 2."
