/**
 * generatePayslip — opens a preview window with brand-guide colours.
 * User views the payslip first, then clicks "Download Payslip" to print/save.
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

  /* ── Brand colours ──
     --deep-green:  #003B2C
     --rich-green:  #006742
     --neo-green:   #00A87E
     --soft-mint:   #E8F2EF
  */

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payslip – ${userName} – ${month} ${year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Readex Pro', 'Inter', Arial, sans-serif; background: #f4f4f4; color: #000; font-size: 13px; }

    /* ── Toolbar (hidden in print) ── */
    .toolbar {
      position: sticky; top: 0; z-index: 100;
      background: #003B2C; padding: 12px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .toolbar-title { color: #fff; font-size: 14px; font-weight: 500; }
    .toolbar-btn {
      background: #00A87E; color: #fff; border: none;
      padding: 8px 20px; border-radius: 8px;
      font-weight: 600; font-size: 13px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      transition: background 0.2s;
    }
    .toolbar-btn:hover { background: #006742; }
    .toolbar-btn svg { width: 16px; height: 16px; fill: currentColor; }

    /* ── Page ── */
    .page {
      width: 794px; margin: 24px auto; padding: 32px 40px 24px;
      background: #fff; border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,59,44,0.08);
    }

    /* Header */
    .header { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 20px; }
    .header-logo { height: 48px; width: auto; }
    .header-text { text-align: center; }
    .company { font-family: 'Instrument Sans', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 1px; color: #003B2C; text-transform: uppercase; }
    .payslip-title { font-size: 15px; font-weight: 600; margin-top: 4px; color: #006742; }
    .header-divider { border: none; border-top: 2px solid #006742; margin: 10px 0; }

    /* Meta row */
    .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #646465; }

    /* Employee info */
    .emp-section { border: 1px solid #E8E8E8; border-radius: 6px; padding: 12px 16px; margin: 12px 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
    .emp-field { display: flex; flex-direction: column; gap: 2px; }
    .emp-label { font-size: 10px; font-weight: 600; color: #646465; text-transform: uppercase; letter-spacing: 0.5px; }
    .emp-value { font-size: 13px; font-weight: 600; color: #000; }

    /* Days row */
    .days-row { display: flex; gap: 0; margin-bottom: 12px; }
    .day-box { flex: 1; border: 1px solid #E8E8E8; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; }
    .day-box:not(:last-child) { border-right: none; }
    .day-box:first-child { border-radius: 6px 0 0 6px; }
    .day-box:last-child  { border-radius: 0 6px 6px 0; }
    .day-label { font-size: 10px; font-weight: 600; color: #646465; text-transform: uppercase; }
    .day-value { font-size: 15px; font-weight: 700; color: #006742; }

    /* Earnings / Deductions table */
    .salary-table-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 12px; }
    .sal-table { width: 100%; border-collapse: collapse; }
    .sal-table th { background: #006742; color: #fff; padding: 7px 10px; text-align: left; font-size: 12px; font-weight: 600; }
    .sal-table td { padding: 5px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12.5px; }
    .sal-table td:last-child { text-align: right; }
    .sal-table tr.total-row td { font-weight: 700; border-top: 2px solid #006742; border-bottom: none; background: #E8F2EF; }
    .earnings-table { border-right: 1px solid #E8E8E8; }

    /* Net pay */
    .net-section { background: #003B2C; border-radius: 8px; padding: 14px 18px; color: #fff; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .net-label { font-size: 13px; font-weight: 600; opacity: 0.85; }
    .net-amount { font-size: 22px; font-weight: 700; }
    .net-words { font-size: 11px; opacity: 0.8; margin-top: 2px; }

    /* Footer */
    .footer { text-align: center; font-size: 11px; color: #646465; margin-top: 14px; border-top: 1px solid #E8E8E8; padding-top: 10px; }

    @media print {
      body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .toolbar { display: none !important; }
      .page { margin: 0; border-radius: 0; box-shadow: none; padding: 12px; }
    }
  </style>
</head>
<body>

<!-- Toolbar: preview-first, download on click -->
<div class="toolbar">
  <span class="toolbar-title">Payslip Preview — ${userName} — ${month} ${year}</span>
  <button class="toolbar-btn" onclick="window.print()">
    <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v4c0 1.1.9 2 2 2h2v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h2c1.1 0 2-.9 2-2v-4c0-1.66-1.34-3-3-3zm-4 11H9v-4h6v4zm4-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2-8H7v4h10V4z"/></svg>
    Download Payslip
  </button>
</div>

<div class="page">
  <!-- Header -->
  <div class="header">
    <img class="header-logo" src="data:image/png;base64,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" alt="Spatio Logo" />
    <div class="header-text">
      <div class="company">Spatio Tech Solutions LLC</div>
      <div class="payslip-title">Payslip for ${month} ${year}</div>
    </div>
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

</body>
</html>`;

  const win = window.open('', '_blank', 'width=860,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};
