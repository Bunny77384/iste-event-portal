const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAcknowledgement = async (registration) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials missing. Skipping email.');
    return;
  }

  const mailOptions = {
    from: `"Tech Club Events" <${process.env.EMAIL_USER}>`,
    to: registration.email,
    subject: `Registration Confirmed: ${registration.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Registration Acknowledgement</h2>
        <p>Dear ${registration.participantName},</p>
        <p>Thank you for registering for <strong>${registration.eventName}</strong>. We have received your details.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Registration ID:</strong> ${registration.registrationId}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${registration.status}</p>
          ${registration.teamName ? `<p style="margin: 5px 0;"><strong>Team:</strong> ${registration.teamName}</p>` : ''}
        </div>

        <p>Your payment (Ref: ${registration.paymentReference || 'N/A'}) is currently being verified. You will receive a final confirmation shortly.</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Regards,<br>
          Tech Club Team<br>
          College Name
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const sendVerificationSuccess = async (registration) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const mailOptions = {
    from: `"Tech Club Events" <${process.env.EMAIL_USER}>`,
    to: registration.email,
    subject: `Payment Verified: ${registration.eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #22c55e; border-radius: 8px;">
        <h2 style="color: #15803d;">Registration Confirmed!</h2>
        <p>Dear ${registration.participantName},</p>
        <p>Your payment for <strong>${registration.eventName}</strong> has been successfully verified.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Registration ID:</strong> ${registration.registrationId}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Confirmed</p>
        </div>

        <p>We look forward to seeing you at the event!</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Regards,<br>
          Tech Club Team
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to ' + registration.email);
    return true;
  } catch (error) {
    console.error('Error sending verified email:', error);
    return false;
  }
};

module.exports = { sendAcknowledgement, sendVerificationSuccess };
