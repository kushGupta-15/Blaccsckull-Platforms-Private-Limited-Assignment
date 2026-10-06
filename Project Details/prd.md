# Product Requirements Document (PRD)

## Product Overview

A full-stack mobile application module for **Feedants** — a competition platform. The core feature is a **Competition Details Screen** that is fully dynamic, backed by a real API and database, and handles concurrent user interactions in a production-grade manner.

This is built as part of the Feedants Full Stack Development Internship Technical Assignment.

---

## Problem Statement

The Competition Details screen should not rely on hardcoded or static data. All competition information must be served dynamically through a backend API connected to a MongoDB database. The system must:

- Reflect real-time competition state (open, closed, upcoming, full)
- Track user registration/participation state per competition
- Handle time-sensitive data (countdown timers, deadlines)
- Manage limited participation spots with concurrent access safety
- Enforce business rules and validations on both frontend and backend

---

## Goals

1. Build a pixel-accurate, fully functional Competition Details screen in React Native
2. Implement a robust Node.js + Express.js REST API
3. Model MongoDB schemas that support scalability and consistency
4. Handle concurrent users safely (race conditions, double-registration, overbooking)
5. Demonstrate production-readiness: error handling, input validation, edge cases
6. Design for scalability (thousands of concurrent users)

---

## Target Users

- **Participants** — Users who browse, register for, and participate in competitions
- **Administrators** — Users who create and manage competitions (future scope)
- **Anonymous visitors** — Users who can view competition details without logging in

---

## Core Features

### 1. Competition Details Display
- Competition title, description, banner/image
- Host/organizer information
- Competition category/type
- Entry fee (if applicable)
- Prize pool / rewards
- Rules and requirements

### 2. Lifecycle & State Management
- Competition states: `upcoming`, `active`, `full`, `ended`, `cancelled`
- Dynamic status badge reflecting current state
- Start date / end date display
- Countdown timer for upcoming or closing competitions

### 3. Participation & Registration
- Show available spots remaining vs total capacity
- Register / join button with state-aware behavior:
  - "Register" → when open and spots available
  - "Already Registered" → when user has joined
  - "Full" → when capacity reached
  - "Ended" → when competition is over
  - "Upcoming" → when not yet started
- Prevent duplicate registrations
- Handle concurrent spot reservations with atomic DB operations

### 4. User State Awareness
- Detect if user is logged in
- Show personalized participation status
- Guard registration actions behind authentication

### 5. Participants / Leaderboard Preview
- Show count of current participants
- Optionally show list of recent or top participants

### 6. Backend API
- RESTful endpoints for competition CRUD
- Registration endpoint with concurrency-safe logic
- User auth (JWT-based)
- Input validation and error responses

### 7. Data Consistency
- Atomic MongoDB operations for spot decrement
- Prevent race conditions on concurrent registrations
- Idempotent registration handling

---

## Out of Scope (for this assignment)
- Admin panel for creating/editing competitions
- Payment processing for paid competitions
- Push notifications
- Social sharing
