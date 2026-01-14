import nodemailer from "nodemailer";
import cors from "cors";

// Initialize CORS middleware
const corsHandler = cors({
  origin: "*", // Allow all origins (or restrict to your backend URL)
  methods: ["POST", "OPTIONS"],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Run CORS
  await runMiddleware(req, res, corsHandler);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Security check: Verify API Secret
  const { secret, to, subject, html, text } = req.body;

  if (secret !== "choose_a_complex_password_here") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create SMTP transporter using environment variables from Vercel
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "haythamapp.com@gmail.com",
        pass: "beikhfnvcjgszoxp",
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"HayTham"`,
      to,
      subject,
      text,
      html,
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({ error: error.message });
  }
}
