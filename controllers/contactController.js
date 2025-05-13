const nodemailer = require('nodemailer');

exports.sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Configuração do transporter para Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'brazilianautogroup@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: 'brazilianautogroup@gmail.com',
      to: 'brazilianautogroup@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b><br>${message.replace(/\n/g, '<br>')}</p>`
    });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, message: 'Error sending message. Please try again later.' });
  }
}; 