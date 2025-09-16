// pages/api/crons/send-reminders.js
import clientPromise from '../../../lib/mongodb';
import { Resend } from 'resend';

export default async function handler(req, res) {
  // 1. Authorize the request
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 2. Initialize database and email clients
  const resend = new Resend(process.env.RESEND_API_KEY);
  const client = await clientPromise;
  const db = client.db('quiet_hours_db');

  try {
    // 3. Get the accurate time window from the GitHub Action URL
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Time window not provided.' });
    }
    
    // 4. Create a flexible query to handle delays
    const now = new Date(startTime);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // Look 5 mins into the past
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000); // Look 10 mins into the future

    // 5. Find all blocks that need a reminder
    const blocksToSend = await db.collection('timeBlocks').find({
      startTime: {
        $gte: fiveMinutesAgo, // Catches blocks missed due to delay
        $lte: tenMinutesFromNow, // Catches upcoming blocks
      },
      reminderSent: false,
    }).toArray();

    if (blocksToSend.length === 0) {
      return res.status(200).json({ message: 'No reminders to send.' });
    }

    // 6. Send an email for each block found
    const reminderPromises = blocksToSend.map(async (block) => {
      await resend.emails.send({
        from: 'reminders@bhavesh-scheduler.space',
        to: block.userEmail,
        subject: `Reminder: Your Quiet Time starts soon!`,
        html: `<p>Hi there, just a friendly reminder that your focused session for "<strong>${block.title}</strong>" is starting soon.</p>`,
      });

      // 7. Update the block to prevent sending more reminders
      return db.collection('timeBlocks').updateOne(
        { _id: block._id },
        { $set: { reminderSent: true } }
      );
    });

    await Promise.all(reminderPromises);

    res.status(200).json({ message: `Successfully sent ${blocksToSend.length} reminders.` });
  } catch (error) {
    console.error('CRON job failed:', error);
    res.status(500).json({ message: 'CRON job failed', error: a.message });
  }
}