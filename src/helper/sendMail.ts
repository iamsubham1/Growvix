
import { transporter } from '../configuration/nodeMailer';

const fromAddress = `GrowVix Support <${process.env.EMAIL}>`;

const mailOptionsGeneratedPassword = (toEmail: string, generatedPassword: string, userID?: string) => {
  return {
    from: fromAddress,
    to: toEmail,
    subject: "Generated Password",
    html: `
         <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                <div style="border-bottom: 1px solid #744FE8">
                  <a href="" style="font-size: 1.4em; color: #744FE8; text-decoration: none; font-weight: 600">GrowVix</a>
                </div>
                <p style="font-size: 1.1em">Hi,</p>
                ${userID ? `<p>Your UserID is :</p> <h2 style="margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${userID}</h2>` : ``}
                <p>The Generated password is</p>
                <h2 style="background: #744FE8; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${generatedPassword}</h2>
                <p style="font-size: 0.9em;">Regards,<br />Growvix</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                  <p>GROWVIX Private LTD</p>
                  <p>India</p>
                </div>
              </div>
            </div>
        `
  };
};

const mailOptionsOTP = (toEmail: string, OTP: string, resetLink: string) => {
  return {
    from: fromAddress,
    to: toEmail,
    subject: "Password Reset and OTP",
    html: `
         <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                <div style="border-bottom: 1px solid #744FE8">
                  <a href="" style="font-size: 1.4em; color: #744FE8; text-decoration: none; font-weight: 600">GrowVix</a>
                </div>
                <p style="font-size: 1.1em">Hi,</p>
                <p>Your OTP is:</p>
                <h2 style="background: #744FE8; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${OTP}</h2>
                <p>Please click the link below to reset your password:</p>
                <a href="${resetLink}" style="background: #744FE8; margin: 0 auto; padding: 10px 20px; color: #fff; border-radius: 4px; text-decoration: none;">Reset Password</a>
                <p style="font-size: 0.9em;">Regards,<br />Growvix</p>
                <hr style="border: none; border-top: 1px solid #eee" />
                <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
                  <p>GROWVIX Private LTD</p>
                  <p>India</p>
                </div>
              </div>
            </div>
        `
  };
};

export const sendEmailWithPassword = async (toEmail: string, generatedPassword: string, userID?: string) => {
  try {
    const options = mailOptionsGeneratedPassword(toEmail, generatedPassword, userID);
    const info = await transporter.sendMail(options);
    console.log('Email sent:', info);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message || error);
    throw new Error('Failed to send email with generated password');
  }
};

export const sendEmailWithOTP = async (toEmail: string, OTP: string, resetLink: string) => {
  try {
    const options = mailOptionsOTP(toEmail, OTP, resetLink);
    const info = await transporter.sendMail(options);
    console.log('Email sent:', info);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message || error);
    throw new Error('Failed to send email with OTP');
  }
}


