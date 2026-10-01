# Online Library Store - Full Stack Application

A modern, full-stack digital book library platform where users can discover, read, and purchase books online. Built with React (Vite) and Spring Boot.

## 🌟 Key Features

### For Users (Readers)
* **Book Discovery**: Browse an extensive catalog with category, price, and search filters
* **Online Reader**: Built-in PDF reader with zoom, dark mode, bookmarks, and page navigation
* **Library Management**: Keep track of purchased and free books, reading progress, and completion status
* **Checkout System**: Smooth cart and checkout flow with demo payment integration
* **Reviews & Ratings**: Share thoughts and rate books
* **Responsive UI**: Stunning "Glassmorphism" UI that works on all screen sizes

### For Administrators
* **Dashboard**: Live statistics and analytics for books, users, and revenue
* **Book Management**: Full CRUD operations for the book catalog including PDF and cover uploads
* **Category Management**: Organize the library with custom categories and icons
* **User Management**: Monitor users, assign roles (Admin/User), and activate/deactivate accounts
* **Order Tracking**: View all platform purchases and transactions

## 🛠️ Technology Stack

**Frontend:**
* React 18 (Vite)
* Tailwind CSS 3 (Custom Glassmorphism Theme)
* React Router v6 (Routing)
* Axios (API Client with Interceptors)
* Context API (Global State Management)
* Lucide React (Icons)

**Backend:**
* Java 17 + Spring Boot 3.2.5
* Spring Data JPA (Hibernate)
* Spring Security (JWT Authentication)
* MySQL (Production DB) / H2 (Test DB)
* Lombok (Boilerplate Reduction)
* Maven (Build Tool)

## 🚀 Getting Started

### Prerequisites
* Java 17+
* Node.js 18+

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Build and run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will start on `http://localhost:8085`*

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on `http://localhost:3000`*

## 🔑 Demo Credentials

The database is automatically seeded with demo data on the first run. You can use the following credentials to log in:

**Admin Account:**
* Email: `admin@library.com`
* Password: `admin123`

**User Account:**
* Email: `john@example.com`
* Password: `user123`

*(Note: In the login page, you can simply click the "Demo Accounts" shortcuts to auto-fill these credentials)*

## 📁 Project Structure

* `/backend`: Spring Boot application containing all REST APIs, database models, business logic, and security configurations.
* `/frontend`: React application containing the UI, state management, components, and Tailwind styles.
* `/backend/uploads`: Automatically generated folder for storing uploaded book covers and PDF files.

## 📝 License
This project was built as an academic Full Stack Development demonstration.
