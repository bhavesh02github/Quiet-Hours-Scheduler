// pages/api/cron/send-reminders.js
import clientPromise from '../../../lib/mongodb';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const client = await clientPromise;
  const db = client.db('quiet_hours_db');

  try {
    // Use the times provided by the GitHub Action from the URL
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Time window not provided.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const blocksToSend = await db.collection('timeBlocks').find({
      startTime: {
        $gte: start,
        $lte: end,
      },
      reminderSent: false,
    }).toArray();

    if (blocksToSend.length === 0) {
      return res.status(200).json({ message: 'No reminders to send.' });
    }

    const reminderPromises = blocksToSend.map(async (block) => {
      // 1. Send the email - THIS PART IS NOW ENABLED
      await resend.emails.send({
        from: 'reminders@bhavesh-scheduler.space', // <-- CHANGE THIS to your verified domain
        to: block.userEmail,                       // <-- Use the email from the block document
        subject: `Reminder: Your Quiet Time starts in 10 minutes!`,
        html: `<p>Hi there, just a friendly reminder that your focused session for "<strong>${block.title}</strong>" is starting soon.</p>`,
      });

      // 2. Update the block to prevent re-sending
      return db.collection('timeBlocks').updateOne(
        { _id: block._id },
        { $set: { reminderSent: true } }
      );
    });

    await Promise.all(reminderPromises);

    res.status(200).json({ message: `Successfully sent ${blocksToSend.length} reminders.` });
  } catch (error) {
    console.error('CRON job failed:', error);
    res.status(500).json({ message: 'CRON job failed', error: error.message });
  }
}