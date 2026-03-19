# 🚀 Splitwise Clone - Backend (API)

Yeh hamare Expense Sharing Application ka core server hai, jo MERN stack par based hai.

## 🛠 Tech Stack
* **Node.js & Express** - Server Framework
* **MongoDB & Mongoose** - Database & Modeling
* **Socket.io** - Real-time updates (Expenses & Approvals)
* **JWT** - Authentication
* **Cloudinary** - Image/Media uploads

## 📂 Folder Structure
* `/controllers` - Logic for Auth, Expenses, and Groups
* `/models` - MongoDB Schemas (User, Group, Expense)
* `/routes` - API Endpoints
* `/utils` - Socket configuration & Helpers

## ⚙️ Setup Instructions
1. `cd backend`
2. `npm install`
3. Create a `.env` file and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...






   ### 2. Frontend README (`frontend/README.md`)

```markdown
# 💻 Splitwise Clone - Frontend (UI)

Modern dashboard jahan users apne expenses track kar sakte hain aur doston ke sath settle kar sakte hain.

## 🛠 Tech Stack
* **React.js** - UI Library
* **Redux Toolkit** - State Management
* **Tailwind CSS & Aceternity UI** - Styling
* **Lucide React** - Icons
* **jsPDF & AutoTable** - Report Generation
* **Socket.io-client** - Live synchronization

## ✨ Key Features
* **Real-time Dashboard**: Bina refresh kiye naye expenses dikhte hain.
* **Smart Settlement**: Kaun kitna owe karta hai, uska accurate calculation.
* **PDF Reports**: Sirf approved expenses aur current balances ki PDF download.
* **Member Management**: Inactive request aur approval system.

## ⚙️ Setup Instructions
1. `cd frontend`
2. `npm install`
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
