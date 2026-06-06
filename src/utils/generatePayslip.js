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
    .header { text-align: center; margin-bottom: 20px; }
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

</body>
</html>`;

  const win = window.open('', '_blank', 'width=860,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};
