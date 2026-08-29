import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { useData, CATEGORIES } from '../../context/DataContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const CHART_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

export default function SpendingCharts() {
  const { transactions } = useData();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  // Donut: category breakdown this month
  const monthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'debit' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const catData = {};
  monthTxs.forEach(t => { catData[t.category] = (catData[t.category] || 0) + t.amount; });
  const catLabels = Object.keys(catData).map(id => CATEGORIES.find(c => c.id === id)?.label || id);
  const catValues = Object.values(catData);

  // Bar: monthly spending this year
  const monthly = Array.from({ length: 12 }, (_, m) => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'debit' && d.getFullYear() === year && d.getMonth() === m;
    }).reduce((s, t) => s + t.amount, 0);
  });

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const donutData = {
    labels: catLabels,
    datasets: [{ data: catValues, backgroundColor: CHART_COLORS, borderWidth: 0, hoverOffset: 8 }],
  };

  const barData = {
    labels: monthLabels,
    datasets: [{
      label: 'Spending (₹)',
      data: monthly,
      backgroundColor: monthly.map((_, i) => i === now.getMonth() ? '#6366f1' : 'rgba(99,102,241,0.25)'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(226,232,240,0.5)' }, ticks: { callback: v => `₹${v/1000}k` } } } };

  return (
    <div className="page">
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Spending Insights</h1>

      {/* Donut - Category */}
      <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>This Month — By Category</p>
        {catValues.length > 0 ? (
          <>
            <div style={{ maxWidth: 240, margin: '0 auto 16px' }}>
              <Doughnut data={donutData} options={{ responsive: true, cutout: '65%', plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { family: 'Plus Jakarta Sans', size: 12 } } } } }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {catLabels.map((label, i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>₹{catValues[i].toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </>
        ) : <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No expense data this month</div>}
      </div>

      {/* Bar - Monthly */}
      <div className="glass" style={{ padding: 20 }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Monthly Spending — {year}</p>
        <Bar data={barData} options={chartOptions} />
      </div>
    </div>
  );
}
