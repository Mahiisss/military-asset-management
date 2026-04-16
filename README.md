# 🎯 KristalBall — Military Asset Management System

A full-stack web application built to manage and track military assets such as vehicles, weapons, and ammunition across multiple bases.
The system supports real-world logistics workflows including purchases, transfers, assignments, and expenditures with accurate inventory tracking and role-based access control.

---

## 🚀 Overview

KristalBall enables military administrators, base commanders, and logistics officers to efficiently manage assets across locations.

The system provides:

* Centralized asset tracking
* Real-time inventory updates
* Movement history (purchase → transfer → usage)
* Secure role-based access

---

## 🛠 Tech Stack

**Frontend**

* React (Functional Components + Hooks)
* React Router DOM
* Axios

**Backend**

* Node.js
* Express.js

**Database**

* SQLite (better-sqlite3)

**Authentication**

* JWT (JSON Web Tokens)
* bcryptjs

---

## 🧠 Core Features

### 📊 Dashboard

* Displays total assets by category (vehicles, weapons, ammunition, equipment)
* Search, filter by base and type
* Clean UI with real-time updates

---

### 📦 Asset Management

#### ➤ Purchases

* Record new asset acquisitions
* Automatically updates inventory

#### ➤ Transfers

* Move assets between bases
* Updates stock at both source and destination

#### ➤ Assignments

* Assign assets to personnel
* Deducts from available stock

#### ➤ Expenditures

* Log asset usage or loss
* Maintains accurate inventory balance

---

### 📈 Net Movement Tracking

Click any asset to view detailed breakdown:

* Purchased quantity
* Transferred In / Out
* Assigned quantity
* Expended quantity
* Final Net Balance

This ensures transparency and traceability of all asset movements.

---

## 🔐 Role-Based Access Control (RBAC)

| Role                  | Access                             |
| --------------------- | ---------------------------------- |
| **Admin**             | Full system access                 |
| **Base Commander**    | Manage assets within assigned base |
| **Logistics Officer** | View data + log expenditures       |

Implemented using JWT authentication and middleware authorization.

---

## 🏗 System Architecture

React Frontend → Axios API Calls → Express Backend → SQLite Database

* Frontend handles UI and state
* Backend manages business logic and security
* Database stores all asset operations

---

## 📂 Project Structure

military-asset-management/
├── backend/
│   ├── db/
│   ├── routes/
│   ├── middleware/
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
├── README.md

---

## ⚙️ Setup Instructions

### 1. Clone Repository

git clone <your-repo-link>
cd military-asset-management

---

### 2. Backend Setup

cd backend
npm install
node db/seed.js   (run once)
npm run dev

Backend runs at:
http://localhost:5000

---

### 3. Frontend Setup

cd frontend
npm install
npm start

Frontend runs at:
http://localhost:3000

---

## 🔑 Demo Credentials

| Role      | Email                                         | Password     |
| --------- | --------------------------------------------- | ------------ |
| Admin     | [admin@mil.gov](mailto:admin@mil.gov)         | admin123     |
| Commander | [commander@mil.gov](mailto:commander@mil.gov) | commander123 |
| Officer   | [officer@mil.gov](mailto:officer@mil.gov)     | officer123   |

---

## 🌐 API Endpoints

POST /api/auth/login
GET /api/assets
POST /api/purchases
POST /api/transfers
POST /api/assignments
POST /api/expenditures

---

## 📊 Key Functional Logic

Stock Calculation:

Stock = Purchased
+ Transferred In
- Transferred Out
- Assigned
- Expended

This ensures accurate real-time inventory tracking.

---

## 🚀 Deployment

* Backend: Render
* Frontend: Vercel

(Add your live links here after deployment)

---

## 🎥 Demo Video

(Add your screen recording link here)

---

## 📘 Learning Outcomes

* Built complete full-stack application
* Implemented secure authentication (JWT)
* Designed real-world inventory logic
* Integrated frontend with REST APIs
* Applied role-based authorization
* Managed structured data using SQLite


