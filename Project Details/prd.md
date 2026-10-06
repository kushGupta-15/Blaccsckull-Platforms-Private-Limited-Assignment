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

### 8. Host & Organizer Management (Extension)
- Competition creation wizard allowing authenticated hosts to launch new events
- Customizable event parameters: title, description, category, banner, start/end dates, spot limits, prize pool, dynamic rules list
- Organizer Dashboard to view and manage all competitions hosted by the current user
- Participant roster inspection with registration timestamps and submission counts

### 9. Project Submission & Review Workflow (Extension)
- Registered participants can submit project entries (title, description, GitHub repository link, live demo URL, preview media)
- Submission deadline validation and one-submission-per-participant constraint
- Public Submissions Showcase tab on the competition screen
- Peer upvoting / appreciation system on submissions
- Host evaluation interface to score submissions (0–100), leave feedback, and award winner podium ranks (1st, 2nd, 3rd)
- Celebratory Winners showcase displaying badges and project highlights

---

## Out of Scope
- Payment gateway processor integration (real money transactions)
- Push notifications
- Video streaming within app
