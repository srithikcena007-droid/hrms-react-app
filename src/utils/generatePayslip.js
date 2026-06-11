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
    .header { position: relative; text-align: center; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60px; }
    .header-logo { position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 28px; width: auto; }
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
