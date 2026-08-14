const PDFDocument = require("pdfkit");

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generatePayslipPdf({ user, payslip }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#4f46e5").text("HRMS Portal", { align: "left" });
    doc.fontSize(12).fillColor("#000").text("Payslip", { align: "left" });
    doc.moveDown(1.5);

    doc.fontSize(10).fillColor("#666");
    doc.text(`Employee: ${user.name}`);
    doc.text(`Designation: ${user.designation || "—"}`);
    doc.text(`Pay Period: ${monthNames[payslip.month - 1]} ${payslip.year}`);
    doc.moveDown();

    doc.strokeColor("#e2e8f0").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    const rows = [
      ["Basic", payslip.basic],
      ["HRA", payslip.hra],
      ["Allowances", payslip.allowances],
      ["Deductions", -payslip.deductions],
      ["Gross Pay", payslip.grossPay],
      ["Tax Deducted", -payslip.taxDeducted],
    ];

    doc.fontSize(11).fillColor("#000");
    rows.forEach(([label, value]) => {
      doc.text(label, 50, doc.y, { continued: true });
      doc.text(`Rs. ${Number(value).toLocaleString("en-IN")}`, { align: "right" });
    });

    doc.moveDown();
    doc.strokeColor("#e2e8f0").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(13).fillColor("#4f46e5").text("Net Pay", 50, doc.y, { continued: true });
    doc.text(`Rs. ${Number(payslip.netPay).toLocaleString("en-IN")}`, { align: "right" });

    doc.moveDown(2);
    doc.fontSize(8).fillColor("#94a3b8").text(`Generated on ${new Date().toLocaleDateString()}`, { align: "left" });

    doc.end();
  });
}

module.exports = generatePayslipPdf;
