const nodemailer = require("nodemailer");

/* 
  SECURITY NOTE: 
  To use Gmail, you MUST use an "App Password" if 2FA is enabled.
  1. Go to Google Account -> Security
  2. 2-Step Verification -> App Passwords
  3. Generate a password for "Mail" and "Other (GoTripo)"
*/

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("❌ EMAIL_USER or EMAIL_PASS missing in environment variables.");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email Transporter Verification Failed:", error.message);
      transporter = null; // Reset so it tries again next time
    } else {
      console.log("✅ Email Transporter is ready to deliver messages");
    }
  });

  return transporter;
};

/**
 * Send a broadcast update to multiple users
 */
async function sendUpdateEmail(emails, subject, content) {
  const currentTransporter = getTransporter();
  if (!currentTransporter) return;

  const mailOptions = {
    from: `"GoTripo Updates" <${process.env.EMAIL_USER}>`,
    bcc: emails.join(", "),
    subject: subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6;">🌍 GoTripo Update</h2>
        <div style="font-size: 16px; line-height: 1.6;">
          ${content}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">
          You received this because you enabled Email Alerts in your Settings.
        </p>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Update email sent to ${emails.length} users.`);
  } catch (error) {
    console.error("❌ Failed to send update email:", error.message);
  }
}

/**
 * Send a welcome email to a new user
 */
async function sendWelcomeEmail(email, name) {
  console.log(`📧 Attempting to send welcome email to: ${email}`);
  
  const currentTransporter = getTransporter();
  if (!currentTransporter) {
    console.warn(`⚠️ Skipping welcome email for ${email}: Transporter not initialized. Check EMAIL_USER/PASS.`);
    return;
  }

  const firstName = name ? name.split(" ")[0] : "Traveler";

  const mailOptions = {
    from: `"GoTripo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to your next adventure, ${firstName}! 🌍`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #3b82f6; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -1px;">GoTripo</h1>
          <p style="color: #bfdbfe; margin-top: 8px; font-size: 16px;">Your AI-Powered Odyssey Blueprint</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 24px; color: #0f172a; margin-top: 0;">Welcome aboard, ${firstName}! ✨</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We're thrilled to have you join our community of explorers. GoTripo is designed to help you plan, collaborate, and experience travel like never before.
          </p>
          
          <div style="margin: 30px 0; background-color: #f8fafc; border-radius: 12px; padding: 20px; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; font-size: 18px; color: #1e293b;">What's next?</h3>
            <ul style="padding-left: 20px; color: #475569; line-height: 1.8;">
              <li><strong>Create your first plan:</strong> Use our AI engine to build a bespoke itinerary in seconds.</li>
              <li><strong>Invite friends:</strong> Collaborate in real-time to build the perfect group getaway.</li>
              <li><strong>Save your memories:</strong> Track your progress and upload photos of your journey.</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/planner" style="background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);">
              Start Planning Now
            </a>
          </div>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">&copy; 2026 GoTripo. All rights reserved.</p>
          <p style="margin: 5px 0 0;">Adventure is calling. Don't let it go to voicemail.</p>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
  }
}

/**
 * Send a login notification email
 */
async function sendLoginNotificationEmail(email, name) {
  const currentTransporter = getTransporter();
  if (!currentTransporter) return;

  const firstName = name ? name.split(" ")[0] : "Traveler";
  const loginTime = new Date().toLocaleString();

  const mailOptions = {
    from: `"GoTripo Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `New Login Detected on GoTripo 🔐`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -1px;">GoTripo Security</h1>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Hi ${firstName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            We noticed a new login to your GoTripo account.
          </p>
          
          <div style="margin: 30px 0; background-color: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 700;">Login Details</p>
            <p style="margin: 10px 0 0; color: #1e293b;"><strong>Time:</strong> ${loginTime}</p>
            <p style="margin: 5px 0 0; color: #1e293b;"><strong>Account:</strong> ${email}</p>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            If this was you, you can safely ignore this email. If you don't recognize this activity, we recommend changing your password immediately.
          </p>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/profile" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Review Account Activity
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0;">&copy; 2026 GoTripo Security Team</p>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Login notification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send login notification email:", error.message);
  }
}

/**
 * Send notification to admin when a new job application is submitted
 */
async function sendJobApplicationNotification(application) {
  const currentTransporter = getTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  if (!currentTransporter || !adminEmail) return;

  const mailOptions = {
    from: `"GoTripo Hiring" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Job Application: ${application.jobTitle} - ${application.name} 💼`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">New Application Received</h2>
        </div>
        <div style="padding: 30px;">
          <p><strong>Applicant Name:</strong> ${application.name}</p>
          <p><strong>Email:</strong> ${application.email}</p>
          <p><strong>Position:</strong> ${application.jobTitle}</p>
          <p><strong>Note:</strong> ${application.note || 'No note provided'}</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${application.resume}" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">View Resume</a>
            <a href="${process.env.FRONTEND_URL || 'https://gotripo.tech'}/admin/applications" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review in Dashboard</a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent for application from ${application.email}`);
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error.message);
  }
}

module.exports = { 
  sendUpdateEmail, 
  sendWelcomeEmail, 
  sendLoginNotificationEmail,
  sendJobApplicationNotification
};