export function generateWhatsAppSummary(transactions, month) {
  const credits = transactions.filter(t => t.type === 'credit');
  const debits = transactions.filter(t => t.type === 'debit');
  const totalReceived = credits.reduce((s, t) => s + t.amount, 0);
  const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
  const balance = totalReceived - totalSpent;

  const categoryBreakdown = {};
  debits.forEach(t => {
    categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
  });

  const catLines = Object.entries(categoryBreakdown)
    .map(([cat, amt]) => `  • ${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join('\n');

  const txLines = transactions.slice(0, 20).map(t =>
    `${t.date} | ${t.type === 'credit' ? '✅ +₹' : '❌ -₹'}${t.amount.toLocaleString('en-IN')} | ${t.category} | ${t.note || '-'}`
  ).join('\n');

  const summary = `📊 *Hisab-Kitab — ${month} Summary*\n\n💰 *Received from Papa:* ₹${totalReceived.toLocaleString('en-IN')}\n💸 *Total Spent:* ₹${totalSpent.toLocaleString('en-IN')}\n✨ *Remaining Balance:* ₹${balance.toLocaleString('en-IN')}\n\n📂 *Category Breakdown:*\n${catLines}\n\n📋 *Recent Transactions:*\n${txLines}\n\n_Sent via Family Ledger App_`;

  const encoded = encodeURIComponent(summary);
  return `https://wa.me/?text=${encoded}`;
}

export function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
