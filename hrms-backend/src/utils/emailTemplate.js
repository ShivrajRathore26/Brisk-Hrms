// Table-based layout with inline styles — the only markup pattern that renders consistently
// across Gmail, Outlook, and other email clients (most strip <style> blocks and flex/grid CSS).

const BRAND_COLOR = "#02a2f3";

const COMPANY = {
  name: "Briskcovey Technologies Pvt. Ltd.",
  team: "HR Team",
  email: "hr@briskcovey.com",
  phone: "+91 6376909530",
  addressLine1: "Dev Siddhi Tower, Nand Vihar Colony,",
  addressLine2: "Jaipur, Rajasthan - 302021",
  website: "briskcovey.com",
};

function button(text, url) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td style="border-radius: 8px; background-color: ${BRAND_COLOR};">
          <a href="${url}" target="_blank"
            style="display: inline-block; padding: 12px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

function buildEmailHtml({ heading, bodyHtml, ctaText, ctaUrl }) {
  return `
<!doctype html>
<html>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">

            <tr>
              <td style="background-color: ${BRAND_COLOR}; padding: 22px 32px;">
                <span style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: bold; color: #ffffff; letter-spacing: 0.3px;">
                  Briskcovey&nbsp;HRMS
                </span>
              </td>
            </tr>

            <tr>
              <td style="padding: 36px 32px 8px 32px;">
                ${heading ? `<h1 style="margin: 0 0 16px 0; font-family: Arial, Helvetica, sans-serif; font-size: 20px; color: #0f172a;">${heading}</h1>` : ""}
                <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
                  ${bodyHtml}
                </div>
                ${ctaText && ctaUrl ? button(ctaText, ctaUrl) : ""}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 32px 32px 32px;">
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 8px 0 24px 0;" />
                <p style="margin: 0 0 4px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; color: #0f172a;">
                  ${COMPANY.team}
                </p>
                <p style="margin: 0 0 2px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748b;">
                  ${COMPANY.name}
                </p>
                <p style="margin: 0 0 2px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748b;">
                  ${COMPANY.email} | ${COMPANY.phone}
                </p>
                <p style="margin: 0 0 2px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748b;">
                  ${COMPANY.addressLine1}<br />
                  ${COMPANY.addressLine2}
                </p>
                <p style="margin: 8px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
                  <a href="https://${COMPANY.website}" target="_blank" style="color: ${BRAND_COLOR}; text-decoration: none;">${COMPANY.website}</a>
                </p>
              </td>
            </tr>

          </table>

          <p style="margin: 16px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #94a3b8;">
            This is an automated message from the Briskcovey HRMS portal — please do not reply directly to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = { buildEmailHtml, COMPANY };
