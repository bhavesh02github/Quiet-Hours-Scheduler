# Quiet Hours Scheduler 🤫

A full-stack web application designed to help users schedule focused, uninterrupted time blocks for study or work, with automated email reminders sent 10 minutes before each session begins.



---

## ✨ Key Features

- **User Authentication**: Secure user sign-up and login handled by Supabase.
- **Block Creation**: Authenticated users can create, view, and delete their own "Quiet Hour" time blocks.
- **Automated Email Reminders**: A background CRON job runs every 5 minutes to check for upcoming sessions.
- **Timely Notifications**: Users receive a professionally styled email reminder exactly 10 minutes before their scheduled block starts.
- **Modern UI**: A responsive, dark-themed interface with a "glassmorphism" design for a clean and modern user experience.

---

## ⚙️ Technology Stack

This project uses a modern, serverless-focused technology stack.

- **Framework**: **Next.js** (React)
- **Database**: **MongoDB** (with MongoDB Atlas)
- **Authentication**: **Supabase Auth**
- **Email Delivery**: **Resend**
- **Scheduler**: **GitHub Actions** (or any external CRON job provider)
- **Hosting**: **Netlify**

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A free [Supabase](https://supabase.com) account
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [Resend](https://resend.com) account with a verified domain

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/bhavesh02github/Quiet-Hours-Scheduler.git](https://github.com/bhavesh02github/Quiet-Hours-Scheduler.git)
    cd Quiet-Hours-Scheduler
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following keys with your own values:
    ```ini
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # MongoDB
    MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

    # Resend
    RESEND_API_KEY=YOUR_RESEND_API_KEY

    # Cron Job Security
    CRON_SECRET=GENERATE_A_STRONG_RANDOM_STRING
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deployment

This project is designed to be deployed on a serverless platform like Vercel or Netlify.

1.  **Push your code to a GitHub repository.**
2.  **Import the repository** into your Vercel or Netlify account.
3.  **Configure the Environment Variables** in the project settings on your hosting provider, copying the values from your `.env.local` file.
4.  **Set up the CRON Job**:
    -   Create a free account on a service like [Cron-Job.org](https://cron-job.org).
    -   Create a new job that sends a `GET` request to your live API endpoint (`https://<your-site-url>/api/crons/send-reminders`) every 5 minutes.
    -   Add a custom HTTP header: `Authorization` with the value `Bearer YOUR_CRON_SECRET`.

---

## © License

This project is created by Bhavesh. All Rights Reserved.
