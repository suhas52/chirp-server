# Social Media REST API

A full-stack ready backend for a Twitter-like social platform.  
This project implements authentication, user profiles, posts, comments, likes, retweets, follows, image uploads, and cursor-based pagination using a modern, production-grade stack.

---

## Features

### Authentication and Users
- User registration and login using JWT stored in HTTP-only cookies  
- Profile management (name, bio, avatar)  
- Public user profiles  
- Follow and unfollow system  

### Posts and Interactions
- Create and delete posts  
- Image uploads for posts  
- Like and unlike posts  
- Retweet and un-retweet posts  
- Comment on posts  
- View posts by user or globally  

### Media Handling
- Image validation and resizing using Sharp  
- Uploads stored in AWS S3  
- Secure, time-limited signed URLs for image access  

### Performance and Security
- Cursor-based pagination for posts and comments  
- API rate limiting and request throttling  
- Zod request validation  
- Centralized error handling with Prisma error mapping  
- Secure password hashing with bcrypt  

---

## Tech Stack

**Backend**
- Node.js  
- Express  
- TypeScript  

**Database**
- PostgreSQL  
- Prisma ORM  

**Authentication**
- JSON Web Tokens (JWT)  
- HTTP-only cookies  

**Storage**
- AWS S3 for avatars and post images  

**Validation and Utilities**
- Zod  
- Multer  
- Sharp  
- Faker (for seeding)  

---

## Database Schema Overview

The system is built around these core models:

- **User** – accounts, profiles, avatars, followers, and relationships  
- **Post** – user posts with optional images and cursor-based pagination  
- **Comment** – comments on posts  
- **Like** – user likes on posts  
- **Retweet** – user reposts of posts  
- **Follow** – follower and following relationships  

The schema enforces:
- Unique usernames  
- One like and one retweet per user per post  
- Indexed foreign keys for fast timeline and profile queries  

---

## API Structure

Base URL: `/api`

### Auth
| Method | Route | Description |
|-------|-------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get logged-in user |
| GET | `/auth/user/:userId` | Get public user profile |
| PATCH | `/auth/update-profile` | Update profile |
| PATCH | `/auth/update-avatar` | Update avatar |

### Posts and Interactions
| Method | Route |
|-------|-------|
| POST | `/user/post` |
| GET | `/user/posts` |
| GET | `/user/post/:postId` |
| GET | `/user/posts/:userId` |
| DELETE | `/user/post/:postId` |
| POST | `/user/post/like/:postId` |
| DELETE | `/user/post/like/:likeId` |
| POST | `/user/post/retweet/:postId` |
| DELETE | `/user/post/retweet/:retweetId` |

### Comments
| Method | Route |
|-------|-------|
| POST | `/user/comment/:postId` |
| GET | `/user/comments/:postId` |

### Follow System
| Method | Route |
|-------|-------|
| POST | `/user/follow/:userId` |
| DELETE | `/user/follow/:userId` |
| GET | `/user/followers/:userId` |
| GET | `/user/following/:userId` |

---

## Pagination

Posts and comments use cursor-based pagination.  
A base64-encoded cursor is returned with each response and can be sent back using the `cursor` query parameter for infinite scrolling.

---

## Environment Variables

The application uses schema-validated environment variables. Typical values include:
 - DATABASE_URL
 - JWT_SECRET
 - SERVER_PORT
 - CLIENT_URL

 - AWS_ACCESS_KEY_ID
 - AWS_SECRET_ACCESS_KEY
 - AWS_BUCKET_NAME
 - AWS_BUCKET_REGION


---

## Running the Project
This backend server is a part of a monorepo and is intended be run as a part of it.

## Seeding Test Data

The project includes endpoints for generating realistic test data.

| Route | Description |
|-------|-------------|
| POST | `/api/seed/register/:userNumber` |
| POST | `/api/seed/posts/:postNumber` |
| POST | `/api/seed/comments/:commentNumber` |

These use Faker to generate users, posts, and comments.

---

## Architecture

- Controllers handle HTTP input and output  
- Services encapsulate business logic  
- Prisma handles all database access  
- Middleware enforces authentication, validation, and rate limits  
- Cloud utilities manage S3 uploads and signed URLs  

This separation keeps the codebase maintainable, testable, and scalable.

---

## License

This project is intended for portfolio and educational use.
