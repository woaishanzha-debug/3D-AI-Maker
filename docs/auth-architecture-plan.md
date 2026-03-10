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

## ✅ Phase 1: Prisma Schema Definition
**Status:** COMPLETED
**Action:** Updated `prisma/schema.prisma` with 4-level hierarchy and licensing models.

---

## ✅ Phase 2: Core Server Actions (Business Logic)
**Status:** COMPLETED (Implemented by Jules)
**Target Directory:** `src/actions/auth/`
**Implementation:** 
- `assignCourseToTeacher`: Handles atomic seat allocation from Org to Teacher.
- `generateInvitationCode`: Validates teacher license before code creation.
- `registerStudentWithCode`: Full registration flow with automatic hierarchy mapping.

---

## ✅ Phase 3: Middleware & Security
**Status:** COMPLETED (Implemented by Jules)
**Target File:** `src/middleware.ts`
- Implemented RBAC for `/admin`, `/org`, and `/teacher`.
**Target File:** `src/lib/dal.ts`
- Implemented `verifyStudentCourseAccess` for data-level security.

---

## 🛠️ Phase 4: UI Scaffolding & Integration
**Status:** NEXT
**Target Directory:** `src/app/(dashboard)/`

1. **ORG_ADMIN Matrix (`org/matrix/page.tsx`)**:
   - Visual desk for assigning course series to teachers.
   - Seat count visualization.

2. **TEACHER Dashboard (`teacher/codes/page.tsx`)**:
   - List assigned courses and seat status.
   - Modal to generate new student invitation codes.

3. **STUDENT Course View**:
   - Filtered view showing only authorized courses.

---

## 🏁 Execution Command for Agent
"I have merged Jules' contribution. All backend logic for RBAC is now local. Ready to start Phase 4 UI development."
