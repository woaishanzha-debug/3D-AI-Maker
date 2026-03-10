# ADR 0001: Core Technology Stack

## Status
Accepted

## Context
The project `3d-ai-maker.tech` aims to provide an educational platform for 3D printing and AI-powered model generation. The goal is to provide a seamless Web-based 3D workspace.

## Decision
We utilize the following technology stack:
- **Framework**: Next.js (App Router) for high-performance server-side rendering and routing.
- **Language**: TypeScript for type safety and scalability.
- **Styling**: Tailwind CSS for rapid UI development and glassmorphism design.
- **3D Engine**: Native Three.js for maximum performance and fine-grained control over geometry generation (e.g., STL export).
- **ORM**: Prisma for database management (PostgreSQL/MongoDB).
- **Animation**: Framer Motion for high-quality SVG and UI transitions.
- **Auth**: Next-Auth (v4) with Prisma Adapter.

## Consequences
- High development velocity with professional UI components.
- Direct control over Three.js means more complex custom geometry logic but requires more careful memory management (`renderer.dispose()`).
- Strict TypeScript enforcement ensures reliable API integrations.
