const nodemailer = require("nodemailer");
const { email, password } = require("./emailconfig.json");
const bleach = require("bleach");

const url = "https://tchat.us.to/"

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
    text: `TypeChat\n\nNEW NOTIFICATION ✨\n\n${data.title}\n${data.message
      }\n\nopen: ${new URL(data.to, url).href
      }\n© TypeChat`,
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
      new URL(data.to, url).href
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

async function PasswordEmail(
  to: string,
  passwordUpdateID: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
  await transporter.sendMail({
    from: `"TypeChat💬" <${email}>`,
    to,
    subject: `Update password request! 🔑✔`,
    text: `TypeChat\n\nUpdate password request! 🔑✔\n\nHello ${to}!\n\nTo update your typechat account password go to: ${new URL(`/updatepassword/${passwordUpdateID}`, url).href
      }\nthis update link will only work for 1 hour after the accounts creation.\nif you did not request a typechat account password update you can ignore this email!\n\n© TypeChat`,
    html: `<div style="background-color: #5656ff; color: white"><center><h1 style="color: #ffaa56"><span style="color: #ffff00">Type</span>Chat</h1><div><hr/><div>
    <h3>Update your Password! 🔑✔</h3>
    <b>To update your typechat account password click "Update"</b>
    <table width="100%" cellspacing="0" cellpadding="0"></div>
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
      new URL(`/updatepassword/${passwordUpdateID}`, url).href
    )} target="_blank" style="padding: 8px 12px; border: 1px solid #ffff00;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffaa56;text-decoration: none;font-weight:bold;display: inline-block;">
                        Update
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table>
</table>            <p>this update link will only work for 1 hour after the accounts creation.</p>
                    <p>if you did not request a typechat account password update you can ignore this email!</p>
        </div>
        </div>
                    <hr /><p>© TypeChat</p></center></div>`,
  });
}

async function VerificationEmail(
  to: string,
  verificationID: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
  await transporter.sendMail({
    from: `"TypeChat💬" <${email}>`,
    to,
    subject: `Verify your email! 📨✔`,
    text: `TypeChat\n\nVerify your email! 📨✔\n\nHello ${to}!\n\nTo verify your typechat account go to: ${new URL(`/verify/${verificationID}`, url).href
      }\nthis verification link will only work for 1 hour after the accounts creation.\nif you did not create a typechat account you can ignore this email!\n\n© TypeChat`,
    html: `<div style="background-color: #5656ff; color: white"><center><h1 style="color: #ffaa56"><span style="color: #ffff00">Type</span>Chat</h1><div><hr/><div>
    <h3>Verify your email! 📨✔</h3>
    <b>To verify your typechat account click "Verify"</b>
    <table width="100%" cellspacing="0" cellpadding="0"></div>
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
      new URL(`/verify/${verificationID}`, url).href
    )} target="_blank" style="padding: 8px 12px; border: 1px solid #ffff00;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffaa56;text-decoration: none;font-weight:bold;display: inline-block;">
                        Verify
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table>
</table>            <p>this verification link will only work for 1 hour after the accounts creation.</p>
                    <p>if you did not create a typechat account you can ignore this email!</p>
        </div>
        </div>
                    <hr /><p>© TypeChat</p></center></div>`,
  });
}

export { NotificationEmail, VerificationEmail, PasswordEmail };
