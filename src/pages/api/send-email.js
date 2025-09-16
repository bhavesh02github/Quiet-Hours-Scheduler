// pages/api/send-email.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, title } = req.body;

  try {
    await resend.emails.send({
      from: 'reminders@bhavesh-scheduler.space', // CHANGE THIS
      to: email,
      subject: `Reminder: Your Quiet Time starts in 10 minutes!`,
      html: `<p>Your focused session for "<strong>${title}</strong>" is starting soon.</p>`,
    });
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email' });
  } 
}