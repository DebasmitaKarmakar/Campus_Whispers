
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { MealType, CanteenConfig, MenuItem, Order, User } from '../../types';

export const AdminCanteen: React.FC<{ user: User }> = ({ user }) => {
  const [config, setConfig] = useState<CanteenConfig>(canteenService.getConfig());
  const [orders, setOrders] = useState<Order[]>(canteenService.getOrders());
  const [feedbacks, setFeedbacks] = useState(canteenService.getAllFeedback());
  const [orderSearch, setOrderSearch] = useState('');
  
  useEffect(() => {
    const fetch = () => {
      setOrders(canteenService.getOrders());
      setFeedbacks(canteenService.getAllFeedback());
      setConfig(canteenService.getConfig());
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  const avgRating = (cat: 'taste' | 'quantity' | 'hygiene') => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f[cat], 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.studentName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl space-y-10 pb-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-nfsu-navy p-10 rounded-[2.5rem] border-b-8 border-nfsu-gold/50 shadow-2xl text-white">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Institutional Canteen Feedback</h2>
          <p className="text-nfsu-gold/70 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Operational Integrity & Service Analytics</p>
        </div>
        <div className="flex gap-4 text-right border-l-2 border-nfsu-gold/30 pl-4">
          <div>
            <div className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-widest mb-1">Authorization</div>
            <div className="font-mono font-black text-xl tracking-widest">{user.id}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(slot => (
          <div key={slot} className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${config.isOrderingOpen[slot] ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h3 className="font-black text-xl text-nfsu-navy uppercase italic mb-2">{slot} Window</h3>
            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${config.isOrderingOpen[slot] ? 'text-green-600' : 'text-red-600'}`}>
               <span className={`w-2 h-2 rounded-full ${config.isOrderingOpen[slot] ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></span>
               {config.isOrderingOpen[slot] ? 'Receiving Orders' : 'Portal Closed'}
            </div>
            <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-tight">Admin Level: View Only (Toggle Restricted to Canteen Staff)</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Feedback Column */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] shadow-2xl text-white border-b-8 border-black/20">
            <h3 className="text-xl font-black mb-10 uppercase italic tracking-tighter text-nfsu-gold">Student Quality Feedback</h3>
            <div className="space-y-8">
              {['taste', 'quantity', 'hygiene'].map((cat) => (
                <div key={cat}>
                  <div className="flex justify-between text-[10px] mb-3 uppercase tracking-widest font-black text-white/50">
                    <span>{cat} index</span>
                    <span className="text-nfsu-gold">{avgRating(cat as any)} / 5.0</span>
                  </div>
                  <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-nfsu-gold h-full" style={{ width: `${(Number(avgRating(cat as any)) / 5) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <h3 className="text-xl font-black mb-8 uppercase italic text-nfsu-navy">Recent Feedback Feed</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {feedbacks.slice().reverse().map((f, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-nfsu-navy uppercase mb-1">Order Ref: {f.orderId}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase mb-2">Taste: {f.taste}, Qty: {f.quantity}, Hygiene: {f.hygiene}</div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-nfsu-maroon h-full" style={{ width: `${((f.taste + f.quantity + f.hygiene) / 15) * 100}%` }}></div>
                  </div>
                </div>
              ))}
              {feedbacks.length === 0 && <p className="text-[10px] font-black text-slate-300 uppercase italic text-center py-10">No feedback entries</p>}
            </div>
          </div>
        </div>

        {/* Pipeline Column */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h3 className="text-2xl font-black uppercase italic text-nfsu-navy">Operational Registry</h3>
              <input 
                type="text" 
                placeholder="TOKEN SEARCH..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest w-full md:w-80 outline-none focus:border-nfsu-navy"
              />
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
              {filteredOrders.slice().reverse().map(o => (
                <div key={o.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 group gap-6">
                  <div className="flex gap-6 items-center">
                    <span className="font-mono font-black text-nfsu-navy text-xl tracking-tighter w-20">{o.id}</span>
                    <div>
                      <div className="font-black text-slate-800 uppercase text-sm tracking-tight">{o.studentName}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Type: {o.type}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] font-black text-nfsu-navy uppercase">Placed: {new Date(o.timestamp).toLocaleTimeString()}</div>
                    {o.servedTimestamp && (
                      <div className="text-[10px] font-black text-green-600 uppercase">Served: {new Date(o.servedTimestamp).toLocaleTimeString()}</div>
                    )}
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border-2 ${
                    o.status === 'Served' ? 'status-served' : 
                    o.status === 'Cancelled' ? 'status-expired' :
                    o.status === 'Expired' ? 'status-expired' : 'status-pending'
                  }`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
