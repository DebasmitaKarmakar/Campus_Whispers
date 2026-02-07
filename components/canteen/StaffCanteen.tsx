
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { Order } from '../../types';

export const StaffCanteen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = () => {
      setOrders(canteenService.getOrders().filter(o => o.status === 'Pending'));
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (id: string, action: 'Served' | 'Expired') => {
    canteenService.updateOrderStatus(id, action);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="w-full max-w-4xl space-y-8 animate-fadeIn">
      <div className="bg-nfsu-navy p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-black/20">
        <label className="block text-[10px] font-black text-nfsu-gold uppercase tracking-[0.4em] mb-4">Input Identity Token / Order Reference</label>
        <input
          type="text"
          placeholder="SEARCH REGISTRY..."
          className="w-full p-6 bg-white/5 rounded-2xl border-4 border-white/10 focus:border-nfsu-gold outline-none text-4xl font-black uppercase tracking-tighter text-white placeholder:text-white/10 italic"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] italic">
            REGISTRY CLEAR • WAITING FOR INPUT
          </div>
        )}
        {filteredOrders.map(o => (
          <div key={o.id} className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-nfsu-navy pointer-events-none">
              <span className="text-[120px] font-black italic">{o.id.slice(0,1)}</span>
            </div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <span className="text-[10px] font-black text-white bg-nfsu-maroon px-3 py-1.5 rounded-lg mb-3 inline-block border-2 border-black/10 uppercase tracking-widest">{o.type}</span>
                <h3 className="text-5xl font-black font-mono tracking-tighter text-nfsu-navy italic leading-none">{o.id}</h3>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-800 uppercase tracking-tighter text-2xl mb-1">{o.studentName}</div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(o.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 mb-10 space-y-4 border-b-4 border-nfsu-gold">
              {o.items.map(i => (
                <div key={i.name} className="flex justify-between font-black text-white text-xl border-b border-white/5 pb-3 last:border-0">
                  <span className="uppercase italic tracking-tight">{i.name}</span>
                  <span className="text-nfsu-gold">x{i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <button 
                onClick={() => handleAction(o.id, 'Served')}
                className="py-6 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-green-700 active:scale-95 transition-all shadow-xl shadow-green-100 border-b-4 border-black/20"
              >
                Served
              </button>
              <button 
                onClick={() => handleAction(o.id, 'Expired')}
                className="py-6 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white active:scale-95 transition-all border-2 border-slate-200 shadow-sm"
              >
                Expired
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
