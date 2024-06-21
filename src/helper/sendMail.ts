// sendEmailWithPassword.ts

import { transporter } from '../configuration/nodeMailer';

const fromAddress = `GrowVix Support <${process.env.EMAIL}>`;

const mailOptions = (toEmail: string, generatedPassword: string) => {
    return {
        from: fromAddress,
        to: toEmail,
        subject: "Generated Password",
        html: `
            <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
              <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                <div style="border-bottom: 1px solid #eee">
                  <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">GrowVix</a>
                </div>
                <p style="font-size: 1.1em">Hi,</p>
                <p>The Generated password is</p>
                <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${generatedPassword}</h2>
                <p style="font-size: 0.9em;">Regards,<br />Connect Messaging app</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                  <p>Connect Messaging app LTD</p>
                  <p>Odisha</p>
                  <p>India</p>
                </div>
              </div>
            </div>
        `
    };
};

// Function to send email with auto-generated password
const sendEmailWithPassword = async (toEmail: string, generatedPassword: string) => {
    try {
        // Generate mail options with provided arguments
        const options = mailOptions(toEmail, generatedPassword);

        // Send email using transporter
        const info = await transporter.sendMail(options);

        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

export default sendEmailWithPassword;
