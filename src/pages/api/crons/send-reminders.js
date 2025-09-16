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
    const now = new Date();
    // Check a 14-minute window to be safe. 5 mins (cron interval) + 10 mins (reminder) - 1 min (buffer)
    const fifteenMinutesFromNow = new Date(now.getTime() + 14 * 60 * 1000);

    const blocksToSend = await db.collection('timeBlocks').find({
      startTime: {
        $gte: now,
        $lte: fifteenMinutesFromNow,
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