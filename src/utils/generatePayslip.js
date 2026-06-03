/**
 * generatePayslip — opens a styled print window matching "Payslip Template.docx"
 * Company: SPATIO TECH SOLUTIONS LLC
 */

const toWords = (amount) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero';

  const convertHundreds = (n) => {
    let str = '';
    if (n >= 100) { str += ones[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
    if (n >= 20) { str += tens[Math.floor(n / 10)] + ' '; n %= 10; }
    if (n > 0) str += ones[n] + ' ';
    return str;
  };

  let num = Math.floor(amount);
  if (num === 0) return 'Zero';
  let result = '';
  if (num >= 10000000) { result += convertHundreds(Math.floor(num / 10000000)) + 'Crore '; num %= 10000000; }
  if (num >= 100000)   { result += convertHundreds(Math.floor(num / 100000))   + 'Lakh '; num %= 100000; }
  if (num >= 1000)     { result += convertHundreds(Math.floor(num / 1000))     + 'Thousand '; num %= 1000; }
  if (num > 0)         { result += convertHundreds(num); }
  return result.trim() + ' Only';
};

const fmt = (n) => `\u20B9 ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export const generatePayslip = (payment) => {
  const {
    month, year, paymentDate, paidDays = 31, lopDays = 0, lopAmount = 0, monthDays = 31,
    empCode, userName, amountPaid = 0,
    basic = 0, hra = 0, conveyance = 0, specialAllowance = 0,
    pf = 0, tds = 0, professionalTax = 0
  } = payment;

  const cca = 0;
  const esic = 0;
  const loanRepayment = 0;

  const totalEarnings = Number(basic) + Number(hra) + Number(conveyance) + Number(specialAllowance);
  const totalDeductions = Number(pf) + Number(tds) + Number(professionalTax) + Number(lopAmount);
  
  const netPay = amountPaid;
  const ref = `EMP/PS/${year}/${empCode}`;

  // Default placeholders for fields not explicitly tracked in DB yet
  const designation = 'Employee';
  const dateOfJoining = 'N/A';
  const ctc = totalEarnings * 12;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payslip – ${userName} – ${month} ${year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 13px; }
    .page { width: 794px; margin: 0 auto; padding: 32px 40px 24px; border: 1px solid #ddd; }

    /* Header */
    .header { text-align: center; margin-bottom: 20px; }
    .company { font-size: 22px; font-weight: 700; letter-spacing: 1px; color: #1a1a2e; text-transform: uppercase; }
    .payslip-title { font-size: 15px; font-weight: 600; margin-top: 4px; color: #4318FF; }
    .header-divider { border: none; border-top: 2px solid #4318FF; margin: 10px 0; }

    /* Meta row */
    .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #555; }

    /* Employee info */
    .emp-section { border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; margin: 12px 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
    .emp-field { display: flex; flex-direction: column; gap: 2px; }
    .emp-label { font-size: 10px; font-weight: 600; color: #A3AED0; text-transform: uppercase; letter-spacing: 0.5px; }
    .emp-value { font-size: 13px; font-weight: 600; color: #1a1a2e; }

    /* Days row */
    .days-row { display: flex; gap: 0; margin-bottom: 12px; }
    .day-box { flex: 1; border: 1px solid #ddd; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; }
    .day-box:not(:last-child) { border-right: none; }
    .day-box:first-child { border-radius: 6px 0 0 6px; }
    .day-box:last-child  { border-radius: 0 6px 6px 0; }
    .day-label { font-size: 10px; font-weight: 600; color: #A3AED0; text-transform: uppercase; }
    .day-value { font-size: 15px; font-weight: 700; color: #4318FF; }

    /* Earnings / Deductions table */
    .salary-table-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 12px; }
    .sal-table { width: 100%; border-collapse: collapse; }
    .sal-table th { background: #4318FF; color: #fff; padding: 7px 10px; text-align: left; font-size: 12px; font-weight: 600; }
    .sal-table td { padding: 5px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12.5px; }
    .sal-table td:last-child { text-align: right; }
    .sal-table tr.total-row td { font-weight: 700; border-top: 2px solid #4318FF; border-bottom: none; background: #f7f5ff; }
    .earnings-table { border-right: 1px solid #ddd; }

    /* Net pay */
    .net-section { background: #4318FF; border-radius: 8px; padding: 14px 18px; color: #fff; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .net-label { font-size: 13px; font-weight: 600; opacity: 0.85; }
    .net-amount { font-size: 22px; font-weight: 700; }
    .net-words { font-size: 11px; opacity: 0.8; margin-top: 2px; }

    /* Footer */
    .footer { text-align: center; font-size: 11px; color: #A3AED0; margin-top: 14px; border-top: 1px solid #eee; padding-top: 10px; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { border: none; padding: 12px; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="company">Spatio Tech Solutions LLC</div>
    <div class="payslip-title">Payslip for ${month} ${year}</div>
  </div>
  <hr class="header-divider" />

  <!-- Meta -->
  <div class="meta-row">
    <span><strong>Date:</strong> ${paymentDate}</span>
    <span><strong>REF:</strong> ${ref}</span>
  </div>

  <!-- Employee Info -->
  <div class="emp-section">
    <div class="emp-field"><span class="emp-label">EMP Code</span><span class="emp-value">${empCode}</span></div>
    <div class="emp-field"><span class="emp-label">Name</span><span class="emp-value">${userName}</span></div>
    <div class="emp-field"><span class="emp-label">Designation</span><span class="emp-value">${designation}</span></div>
    <div class="emp-field"><span class="emp-label">Date of Joining</span><span class="emp-value">${dateOfJoining}</span></div>
    <div class="emp-field"><span class="emp-label">CTC (Annual)</span><span class="emp-value">${fmt(ctc)}</span></div>
  </div>

  <!-- Days -->
  <div class="days-row">
    <div class="day-box"><span class="day-label">Month Days</span><span class="day-value">${monthDays}</span></div>
    <div class="day-box"><span class="day-label">Paid Days</span><span class="day-value">${paidDays}</span></div>
    <div class="day-box"><span class="day-label">LOP Days</span><span class="day-value">${lopDays}</span></div>
  </div>

  <!-- Earnings + Deductions -->
  <div class="salary-table-wrap">
    <table class="sal-table earnings-table">
      <thead><tr><th>Earnings</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Basic</td><td>${fmt(basic)}</td></tr>
        <tr><td>HRA</td><td>${fmt(hra)}</td></tr>
        <tr><td>CCA</td><td>${fmt(cca)}</td></tr>
        <tr><td>Conveyance</td><td>${fmt(conveyance)}</td></tr>
        <tr><td>Special Allowance</td><td>${fmt(specialAllowance)}</td></tr>
        <tr class="total-row"><td>Total</td><td>${fmt(totalEarnings)}</td></tr>
      </tbody>
    </table>
    <table class="sal-table">
      <thead><tr><th>Deductions</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>PF Amount</td><td>${fmt(pf)}</td></tr>
        <tr><td>ESIC</td><td>${fmt(esic)}</td></tr>
        <tr><td>TDS</td><td>${fmt(tds)}</td></tr>
        <tr><td>Professional Tax</td><td>${fmt(professionalTax)}</td></tr>
        <tr><td>Loan Repayment</td><td>${fmt(loanRepayment)}</td></tr>
        <tr><td>LOP Amount</td><td>${fmt(lopAmount)}</td></tr>
        <tr class="total-row"><td>Total</td><td>${fmt(totalDeductions)}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Net Pay -->
  <div class="net-section">
    <div>
      <div class="net-label">NET PAY</div>
      <div class="net-words">In Words: ${toWords(netPay)}</div>
    </div>
    <div class="net-amount">${fmt(netPay)}</div>
  </div>

  <!-- Footer -->
  <div class="footer">Note: This is a computer-generated slip and does not require a Signature</div>
</div>

<script>
  window.onload = function() { window.print(); };
<\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=860,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};
