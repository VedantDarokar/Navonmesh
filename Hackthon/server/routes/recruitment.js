const express = require('express');
const router = express.Router();
const Recruitment = require('../models/Recruitment');
const sendEmail = require('../utils/email');

// POST — submit a recruitment application
router.post('/', async (req, res) => {
  try {
    const { name, contactNo, email, year, designation } = req.body;
    if (!name || !contactNo || !email || !year || !designation) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const application = new Recruitment({ name, contactNo, email, year, designation });
    await application.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('Recruitment submission error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET — fetch all recruitment applications (admin protected)
router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
    return res.status(401).json({ error: 'Unauthorized Access' });
  }
  try {
    const applications = await Recruitment.find().sort({ submittedAt: -1 });
    res.json({ count: applications.length, entries: applications });
  } catch (err) {
    console.error('Error fetching recruitment data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE — delete a single recruitment application (admin only)
router.delete('/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
    return res.status(401).json({ error: 'Unauthorized Access' });
  }
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// POST — send acknowledgment email to applicant (admin only)
router.post('/:id/send-mail', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer admin_secret_token_navonmesh') {
    return res.status(401).json({ error: 'Unauthorized Access' });
  }
  try {
    const application = await Recruitment.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Application Received - Navonmesh 27</title></head>
<body style="margin:0;padding:0;background:#1C0A00;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1C0A00,#2d1200);padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;box-shadow:0 12px 50px rgba(0,0,0,0.8);">
  <tr><td style="background:linear-gradient(135deg,#5a1020 0%,#8B2435 50%,#5a1020 100%);padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(90deg,#2d1200,#c9a84c,#f0d060,#c9a84c,#2d1200);height:5px;"></td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 40px 32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:9px;color:#f0d060;font-family:Georgia,serif;text-transform:uppercase;">&#10022; &nbsp; Navonmesh '27 &nbsp; &#10022;</p>
        <h1 style="margin:0;font-size:36px;font-weight:900;color:#FFFDF5;font-family:Georgia,serif;letter-spacing:5px;line-height:1.15;text-shadow:0 3px 10px rgba(0,0,0,0.5);">APPLICATION</h1>
        <h1 style="margin:2px 0 12px;font-size:36px;font-weight:900;color:#f0d060;font-family:Georgia,serif;letter-spacing:5px;line-height:1.15;">RECEIVED</h1>
        <p style="margin:0 0 16px;font-size:10px;letter-spacing:7px;color:#e8c87a;font-family:Georgia,serif;text-transform:uppercase;">SSGMCE Shegaon</p>
        <p style="margin:0;font-size:14px;color:rgba(255,253,245,0.4);letter-spacing:5px;">&#10022; ------- &#10022; ------- &#10022;</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(90deg,#2d1200,#c9a84c,#f0d060,#c9a84c,#2d1200);height:5px;"></td></tr></table>
  </td></tr>
  <tr><td style="background:#FFFDF5;padding:36px 48px 8px;">
    <p style="font-size:16px;color:#2c1a00;line-height:1.9;margin:0 0 14px;font-family:Georgia,serif;">
      Honorable <strong style="color:#6B1A2A;font-size:17px;">${application.name}</strong>,
    </p>
    <p style="font-size:14px;color:#4a2e00;line-height:1.9;margin:0 0 10px;font-family:Georgia,serif;">
      Your candidacy for the esteemed position of
      <strong style="color:#fff;background:#8B2435;padding:2px 10px;border-radius:3px;">&nbsp;${application.designation}&nbsp;</strong>
      has been duly inscribed into the archives of Navonmesh '27.
      Our council shall review your profile and convene with you shortly regarding the next steps.
    </p>
  </td></tr>
  <tr><td style="background:#FFFDF5;padding:20px 48px 10px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-top:1px solid #e0c98a;"></td>
        <td style="padding:0 16px;white-space:nowrap;font-size:10px;letter-spacing:4px;color:#8B2435;font-family:Georgia,serif;font-weight:bold;text-align:center;">&#10022; APPLICATION DETAILS &#10022;</td>
        <td style="border-top:1px solid #e0c98a;"></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:#FFFDF5;padding:10px 48px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:5px;overflow:hidden;border:1px solid #dfc87a;box-shadow:0 2px 12px rgba(139,36,53,0.1);">
      <tr style="background:linear-gradient(90deg,#8B2435,#6B1A2A);">
        <td style="padding:12px 18px;color:#f0d060;font-size:11px;letter-spacing:3px;font-family:Georgia,serif;width:36%;">CANDIDATE</td>
        <td style="padding:12px 18px;color:#FFFDF5;font-size:14px;font-weight:bold;font-family:Georgia,serif;">${application.name}</td>
      </tr>
      <tr style="background:#fdf6e3;">
        <td style="padding:11px 18px;color:#7a1a28;font-size:11px;letter-spacing:3px;font-family:Georgia,serif;border-top:1px solid #ead99a;">DESIGNATION</td>
        <td style="padding:11px 18px;color:#3d1a00;font-size:13px;font-weight:bold;font-family:Georgia,serif;border-top:1px solid #ead99a;">${application.designation}</td>
      </tr>
      <tr style="background:#fff9ef;">
        <td style="padding:11px 18px;color:#7a1a28;font-size:11px;letter-spacing:3px;font-family:Georgia,serif;border-top:1px solid #ead99a;">YEAR</td>
        <td style="padding:11px 18px;color:#3d1a00;font-size:13px;font-family:Georgia,serif;border-top:1px solid #ead99a;">${application.year}</td>
      </tr>
      <tr style="background:#fdf6e3;">
        <td style="padding:11px 18px;color:#7a1a28;font-size:11px;letter-spacing:3px;font-family:Georgia,serif;border-top:1px solid #ead99a;">CONTACT</td>
        <td style="padding:11px 18px;color:#3d1a00;font-size:13px;font-family:Georgia,serif;border-top:1px solid #ead99a;">${application.contactNo}</td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:#FFFDF5;padding:0 48px 28px;">
    <p style="margin:0 0 14px;font-size:13px;color:#5a3a00;font-family:Georgia,serif;text-align:center;font-style:italic;">
      The interview date, time &amp; venue shall be conveyed via mail in due course.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:5px;overflow:hidden;border:1px solid #c9a84c;box-shadow:0 2px 8px rgba(180,130,0,0.12);">
      <tr style="background:linear-gradient(90deg,#fffbec,#fef3c7);">
        <td style="padding:14px 16px;text-align:center;vertical-align:middle;width:42px;font-size:20px;border-right:1px solid #e0c98a;">&#9876;</td>
        <td style="padding:14px 18px;font-size:13px;color:#4a1a00;font-family:Georgia,serif;border-bottom:1px solid #e8d5a0;"><strong>Be present on the schedule conveyed later.</strong></td>
      </tr>
      <tr style="background:linear-gradient(90deg,#fef3c7,#fffbec);">
        <td style="padding:14px 16px;text-align:center;vertical-align:middle;font-size:20px;border-right:1px solid #e0c98a;">&#128220;</td>
        <td style="padding:14px 18px;font-size:13px;color:#4a1a00;font-family:Georgia,serif;"><strong>Bring 2 hard copies of your resume strictly.</strong></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:linear-gradient(180deg,#FFFDF5,#fdf0dc);padding:4px 48px 36px;text-align:center;">
    <p style="margin:0 0 16px;font-size:12px;color:#7a4a00;font-family:Georgia,serif;letter-spacing:1px;font-style:italic;">Join our official group to stay connected:</p>
    <a href="https://chat.whatsapp.com/GkUgvDm7GCjIXBTC9Yc1lL"
       style="display:inline-block;background:linear-gradient(135deg,#25D366 0%,#128C7E 100%);color:#fff;text-decoration:none;font-family:Georgia,serif;font-size:15px;font-weight:bold;padding:15px 40px;border-radius:50px;letter-spacing:2px;box-shadow:0 5px 20px rgba(18,140,126,0.4);">
      &#128242; &nbsp; JOIN WHATSAPP GROUP
    </a>
  </td></tr>
  <tr><td style="background:linear-gradient(135deg,#5a1020 0%,#8B2435 50%,#5a1020 100%);padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(90deg,#2d1200,#c9a84c,#f0d060,#c9a84c,#2d1200);height:4px;"></td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:22px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:5px;color:#f0d060;font-family:Georgia,serif;">&#10022; --------- &#10022; --------- &#10022;</p>
        <p style="margin:0;font-size:10px;letter-spacing:5px;color:rgba(240,208,96,0.65);font-family:Georgia,serif;text-transform:uppercase;">Navonmesh '27 &nbsp;&#8212;&nbsp; SSGMCE Shegaon</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const sent = await sendEmail({
      to: application.email,
      subject: `Application Received - Navonmesh 27 Recruitment`,
      htmlContent
    });

    if (sent) {
      application.mailSent = true;
      await application.save();
      res.json({ success: true, message: `Acknowledgment email sent to ${application.email}` });
    } else {
      res.status(500).json({ error: 'Failed to send email. Check SMTP credentials.' });
    }
  } catch (err) {
    console.error('Send mail error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
