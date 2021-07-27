const nodemailer = require("nodemailer");
const { email, password } = require("./emailconfig.json");
const bleach = require("bleach");

async function verifyemail(username: String, to: String, link: String) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: password,
    },
  });
  const info = await transporter.sendMail({
    from: `"TypeChat💬" <${email}>`,
    to,
    subject: "verify your email ✔",
    text: `TypeChat\n\nhello ${bleach.sanitize(
      username
    )}!\nverify: ${link}\nif you did not create an account you can ignore this email!\n© TypeChat`,
    html: `<div style="background-color: #5656ff; color: white"><center><h1 style="color: #ffaa56"><span style="color: #ffff00">Type</span>Chat</h1><div><hr/><div><h2>hello ${bleach.sanitize(
      username
    )}!</h2><h3>To enable your TypeChat account, you must verify using this email!</h3><table width="100%" cellspacing="0" cellpadding="0"></div>
  <div><table width="100%" cellspacing="0" cellpadding="0" style="
  margin-left: auto;
  margin-right: auto;">
  <tr>
      <td>
          <table cellspacing="0" cellpadding="0" style="margin-left: auto;
  margin-right: auto;">
              <tr>
                  <td style="border-radius: 2px;" bgcolor="#ffff00">
                      <a href=${JSON.stringify(
                        link
                      )} target="_blank" style="padding: 8px 12px; border: 1px solid #ffff00;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffaa56;text-decoration: none;font-weight:bold;display: inline-block;">
                          Click             
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table>
</table></div><div><p>if you did not create an account you can ignore this email!</p></div></div><hr /><p>© TypeChat</p></center></div>`,
  });

  console.log("Message sent:", info);
}

async function NotificationEmail(
  to: string,
  data: { title: string; message: string; to: string; sound?: string }
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
  const info = await transporter.sendMail({
    from: `"TypeChat💬" <${email}>`,
    to,
    subject: `${data.title} | ${data.message}`,
    text: `TypeChat\n\nNEW NOTIFICATION ✨\n\n${data.title}\n${
      data.message
    }\n\nopen: ${new URL(data.to, "http://localhost:3000/").href}\n© TypeChat`,
    html: `<div style="background-color: #5656ff; color: white"><center><h1 style="color: #ffaa56"><span style="color: #ffff00">Type</span>Chat</h1><div><hr/><div>
    <h3>NEW NOTIFICATION ✨</h3>
    <b>${bleach.sanitize(data.title)}</b>
    <p>${bleach.sanitize(
      data.message
    )}</p><table width="100%" cellspacing="0" cellpadding="0"></div>
  <div><table width="100%" cellspacing="0" cellpadding="0" style="
  margin-left: auto;
  margin-right: auto;">
  <tr>
      <td>
          <table cellspacing="0" cellpadding="0" style="margin-left: auto;
  margin-right: auto;">
              <tr>
                  <td style="border-radius: 2px;" bgcolor="#ffff00">
                      <a href=${JSON.stringify(
                        new URL(data.to, "http://localhost:3000/").href
                      )} target="_blank" style="padding: 8px 12px; border: 1px solid #ffff00;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffaa56;text-decoration: none;font-weight:bold;display: inline-block;">
                          Open
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table>
</table></div></div><hr /><p>© TypeChat</p></center></div>`,
  });
}

module.exports = { verifyemail, NotificationEmail };
