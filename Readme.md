# 📅 Coda – Todo & Calendar App

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.18-blue?logo=express)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

</div>

<div align="center">
  <img src="./screenshots/preview.png" alt="Coda App Preview" width="800" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <p><em>Visualize and manage your tasks directly from the calendar</em></p>
</div>

---

## 📖 Description

**Coda** is a full‑stack web application that merges a **calendar** with a **todo list**. Users can create, edit, and delete tasks on specific dates, mark them as *In Progress* or *Done*, and set daily or weekday reminders. It features a clean, modern UI with smooth animations, session‑based authentication, and professional toast notifications instead of browser alerts.

Built with **Node.js**, **Express**, **MongoDB Atlas**, and vanilla **HTML/CSS/JavaScript**, Coda helps you stay organized with a visual approach to task management.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📆 **Calendar View** | Interactive monthly calendar – switch months, click any date to add tasks. |
| ✅ **Task Creation** | Add tasks with name, description, and status (`In Progress` / `Done`). |
| 🔁 **Daily Reminders** | Option to repeat tasks every day or on specific weekdays. |
| ✏️ **Edit & Delete** | Modify or remove tasks anytime. |
| 📋 **Task List Page** | See all tasks sorted by date (newest/oldest). |
| 🔐 **User Authentication** | Sign up, log in, and log out – secure sessions with bcryptjs. |
| 👤 **Profile Dropdown** | Click the profile icon to view your email and log out. |
| 🧩 **Modern UI** | Glass‑morphism, smooth hover/click animations, and responsive design. |
| 🚨 **Toast Notifications** | Professional popup messages for success, error, and confirmation. |
| 🗓️ **Reminder Options** | Choose “Every day” or select specific days (Mon, Tue, …). |

---

## 🛠️ Tech Stack

<div align="center">

| **Frontend** | **Backend** | **Database** | **Authentication** |
|:------------:|:-----------:|:------------:|:-------------------:|
| HTML5        | Node.js     | MongoDB Atlas| express-session     |
| CSS3         | Express.js  | Mongoose ODM | bcryptjs            |
| JavaScript   | REST API    |              |                     |

</div>

---

## ⚙️ Installation Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier)
- Git (optional)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/coda.git
   cd coda
Install dependencies

bash
npm install
Set up environment variables
Create a .env file in the root directory and add:

env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/coda?retryWrites=true&w=majority
SESSION_SECRET=your-strong-secret-key
Configure MongoDB Atlas

Create a cluster and a database user with read/write permissions.

Go to Network Access and add your current IP (or 0.0.0.0/0 for development).

Copy the connection string and paste it as MONGODB_URI in your .env file.

Run the app locally

bash
npm start
Open http://localhost:3000 in your browser.

🚀 How to Run the Project
Development mode: npm run dev (if nodemon is installed)

Production mode: npm start

The server will start on the port specified in your .env file (default: 3000).

📁 Project Structure
text
coda/
├── .env
├── package.json
├── server.js
├── models/
│   ├── User.js
│   └── Task.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   └── tasks.js
└── public/
    ├── index.html
    ├── tasks.html
    ├── login.html
    ├── signup.html
    ├── css/
    │   └── style.css
    └── js/
        ├── auth.js
        ├── calendar.js
        └── tasks.js
📸 Screenshots
Calendar View	Add Task Panel	Task List
<img src="./screenshots/calendar.png" width="250">	<img src="./screenshots/add-task.png" width="250">	<img src="./screenshots/task-list.png" width="250">
Replace the placeholder images with actual screenshots of your app.

🔮 Future Improvements
Drag & drop tasks on the calendar

Dark / light theme toggle

Email reminders

Share tasks with other users

Mobile app (React Native)

👤 Author
Ramdas Hembram
https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white
https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white
📧 ramdas@example.com

This project was built using my development experience along with assistance from AI tools such as DeepSeek.

🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check the issues page.

Fork the project

Create your feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add some amazing')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

<div align="center"> <p>Made with ❤️ by Ramdas Hembram</p> <p>⭐ Star this project if you found it useful!</p> </div> ```