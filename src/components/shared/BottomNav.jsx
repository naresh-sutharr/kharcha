import React from 'react';
import { LayoutDashboard, ListOrdered, MessageCircle, Settings } from 'lucide-react';

const adminTabs = [
  { id:'dashboard',    label:'Home',     Icon:LayoutDashboard },
  { id:'transactions', label:'Records',  Icon:ListOrdered },
  { id:'queries',      label:'Queries',  Icon:MessageCircle },
  { id:'settings',     label:'Settings', Icon:Settings },
];
const viewerTabs = [
  { id:'dashboard', label:'Home',   Icon:LayoutDashboard },
  { id:'charts',    label:'Charts', Icon:ListOrdered },
  { id:'queries',   label:'Ask',    Icon:MessageCircle },
];

export default function BottomNav({ role, active, onChange, queryCount }) {
  const tabs = role === 'admin' ? adminTabs : viewerTabs;
  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        const badge = id === 'queries' && queryCount > 0;
        return (
          <button key={id} className={`nav-item ${on?'active':''}`} onClick={() => onChange(id)}>
            <div style={{ position:'relative' }}>
              <Icon size={21} strokeWidth={on ? 2.5 : 1.8} />
              {badge && <span style={{ position:'absolute', top:-4, right:-4, width:8, height:8, borderRadius:'50%', background:'var(--rose)', border:'2px solid #fff' }}/>}
            </div>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
