import clientPromise from '../../../lib/mongodb';
import { Resend } from 'resend';
import { zonedTimeToUtc, toDate } from 'date-fns-tz';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const client = await clientPromise;
  const db = client.db('quiet_hours_db');

  try {
    const userTimeZone = 'Asia/Kolkata';
    const nowInIST = toDate(new Date(), { timeZone: userTimeZone });
    
    const fiveMinutesAgo = new Date(nowInIST.getTime() - 5 * 60 * 1000);
    const tenMinutesFromNow = new Date(nowInIST.getTime() + 10 * 60 * 1000);

    const blocksToSend = await db.collection('timeBlocks').find({
      startTime: {
        $gte: fiveMinutesAgo,
        $lte: tenMinutesFromNow,
      },
      reminderSent: false,
    }).toArray();

    if (blocksToSend.length === 0) {
      return res.status(200).json({ message: 'No reminders to send.' });
    }

    // 6. Process each block found
    for (const block of blocksToSend) {
      try {
        await resend.emails.send({
            from: 'Reminder <reminders@bhavesh-scheduler.space>',
            to: block.userEmail,
            subject: `⏰ Reminder: Your session for "${block.title}" starts in 10 minutes!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">Quiet Hours Reminder 🤫</h2>
                <p>Hi there,</p>
                <p>This is a friendly reminder that your focused session for "<strong>${block.title}</strong>" is scheduled to begin in about 10 minutes.</p>
                <p>Time to wrap up, grab a drink, and get ready to focus!</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>The Quiet Hours Scheduler</strong></p>
              </div>
            `,
});

        // 7. Update the block to prevent sending more reminders
        await db.collection('timeBlocks').updateOne(
          { _id: block._id },
          { $set: { reminderSent: true } }
        );
      } catch (emailError) {
        console.error(`Failed to process block ID: ${block._id}`, emailError);
      }
    }

    res.status(200).json({ message: `Successfully processed ${blocksToSend.length} reminders.` });
  } catch (error) {
    console.error('CRON job failed:', error);
    res.status(500).json({ message: 'CRON job failed', error: error.message });
  }
}