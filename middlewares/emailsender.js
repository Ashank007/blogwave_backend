import nodemailer from "nodemailer";

const emailsent = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const reciver = {
      from: process.env.USEREMAIL,
      to: email,
      subject: subject,
      text: text,
    };
    await transporter.sendMail(reciver);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};

export default emailsent;