# Project Notes

## Overview
This document contains development notes and decisions made during the project.

## Architecture Decisions
- Using Next.js for the frontend framework
- MongoDB for database
- Authentication with NextAuth.js

## Features to Implement
1. User Authentication
2. Meditation Timer
3. Progress Tracking
4. Guided Meditations
5. Journal Entries

## Technical Requirements
- Responsive design
- Offline capabilities
- Cross-platform compatibility

## API Endpoints
- /api/auth/*
- /api/meditations
- /api/progress
- /api/journal

## Database Schema

### Users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Meditations
```json
{
  "_id": "ObjectId",
  "title": "string",
  "duration": "number",
  "type": "string",
  "audioUrl": "string",
  "createdAt": "date"
}
```

### Progress
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "meditationId": "ObjectId",
  "duration": "number",
  "completedAt": "date"
}
```

### Journal
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "content": "string",
  "mood": "string",
  "createdAt": "date"
}
```