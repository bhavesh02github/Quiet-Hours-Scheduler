// pages/api/crons/send-reminders.js
import clientPromise from '../../../lib/mongodb';
import { Resend } from 'resend';

export default async function handler(req, res) {
  console.log("CRON job started...");

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Unauthorized attempt.");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const client = await clientPromise;
  const db = client.db('quiet_hours_db');

  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      console.error("Time window not provided.");
      return res.status(400).json({ message: 'Time window not provided.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    console.log(`Searching for blocks between ${start.toISOString()} and ${end.toISOString()}`);

    const blocksToSend = await db.collection('timeBlocks').find({
      startTime: { $gte: start, $lte: end },
      reminderSent: false,
    }).toArray();

    if (blocksToSend.length === 0) {
      console.log("No reminders to send.");
      return res.status(200).json({ message: 'No reminders to send.' });
    }

    console.log(`Found ${blocksToSend.length} blocks to send reminders for.`);

    for (const block of blocksToSend) {
      try {
        console.log(`Attempting to send email to ${block.userEmail} for block: ${block.title}`);
        await resend.emails.send({
          from: 'reminders@bhavesh-scheduler.space',
          to: block.userEmail,
          subject: `Reminder: Your Quiet Time starts soon!`,
          html: `<p>Hi there, just a friendly reminder that your focused session for "<strong>${block.title}</strong>" is starting soon.</p>`,
        });
        console.log(`Email sent successfully to ${block.userEmail}.`);

        console.log(`Updating reminderSent flag for block ID: ${block._id}`);
        await db.collection('timeBlocks').updateOne(
          { _id: block._id },
          { $set: { reminderSent: true } }
        );
        console.log(`Successfully updated block ID: ${block._id}`);
      } catch (emailError) {
        console.error(`Failed to process block ID: ${block._id}`, emailError);
      }
    }

    res.status(200).json({ message: `Successfully processed reminders.` });
  } catch (error) {
    console.error('CRON job failed:', error);
    res.status(500).json({ message: 'CRON job failed', error: error.message });
  }
}