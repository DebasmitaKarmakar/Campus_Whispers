
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { MealType, CanteenConfig, MenuItem, Order } from '../../types';

export const AdminCanteen: React.FC = () => {
  const [config, setConfig] = useState<CanteenConfig>(canteenService.getConfig());
  const [orders, setOrders] = useState<Order[]>(canteenService.getOrders());
  const [feedbacks] = useState(canteenService.getAllFeedback());
  const [orderSearch, setOrderSearch] = useState('');
  
  // Menu Item Form State
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Lunch' as MealType });

  useEffect(() => {
    setOrders(canteenService.getOrders());
  }, []);

  const toggleSlot = (slot: MealType) => {
    const newConfig = {
      ...config,
      isOrderingOpen: {
        ...config.isOrderingOpen,
        [slot]: !config.isOrderingOpen[slot]
      }
    };
    setConfig(newConfig);
    canteenService.saveConfig(newConfig);
  };

  const handleMarkServed = (orderId: string) => {
    canteenService.updateOrderStatus(orderId, 'Served');
    setOrders(canteenService.getOrders());
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      price: Number(newItem.price),
      category: newItem.category,
      available: true,
      createdBy: 'ADM-1001'
    };

    const newConfig = {
      ...config,
      menu: [...config.menu, item]
    };
    setConfig(newConfig);
    canteenService.saveConfig(newConfig);
    setNewItem({ name: '', price: '', category: 'Lunch' });
  };

  const handleDeleteItem = (id: string) => {
    const newConfig = {
      ...config,
      menu: config.menu.filter(item => item.id !== id)
    };
    setConfig(newConfig);
    canteenService.saveConfig(newConfig);
  };

  const avgRating = (cat: 'taste' | 'quantity' | 'hygiene') => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f[cat], 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.studentName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.studentEmail.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl space-y-10 pb-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-nfsu-navy p-10 rounded-[2.5rem] border-b-8 border-nfsu-gold/50 shadow-2xl text-white">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Canteen Management</h2>
          <p className="text-nfsu-gold/70 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Institutional Audit & Configuration Portal</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right border-l-2 border-nfsu-gold/30 pl-4">
            <div className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-widest mb-1">Authorization</div>
            <div className="font-mono font-black text-xl tracking-widest">ADMIN-1001</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(slot => (
          <div key={slot} className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-slate-100 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-2 h-full ${config.isOrderingOpen[slot] ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-nfsu-navy uppercase italic">{slot} Window</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 leading-loose">Status: {config.isOrderingOpen[slot] ? 'Active Processing' : 'Service Suspended'}</p>
            <button
              onClick={() => toggleSlot(slot)}
              className={`w-full py-4 rounded-2xl font-black text-[10px] transition-all uppercase tracking-widest border-2 ${
                config.isOrderingOpen[slot] 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              }`}
            >
              {config.isOrderingOpen[slot] ? 'Suspend Service' : 'Authorize Service'}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] shadow-2xl text-white border-b-8 border-black/20">
            <h3 className="text-xl font-black mb-10 uppercase italic tracking-tighter">Audit Metrics</h3>
            <div className="space-y-8">
              {['taste', 'quantity', 'hygiene'].map((cat) => (
                <div key={cat}>
                  <div className="flex justify-between text-[10px] mb-3 uppercase tracking-widest font-black text-white/50">
                    <span>{cat}</span>
                    <span className="text-nfsu-gold">{avgRating(cat as any)} / 5.0</span>
                  </div>
                  <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-nfsu-gold h-full transition-all duration-1000 shadow-[0_0_10px_rgba(197,179,88,0.5)]" 
                      style={{ width: `${(Number(avgRating(cat as any)) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <h3 className="text-xl font-black mb-8 uppercase italic text-nfsu-navy underline decoration-nfsu-gold decoration-4 underline-offset-8">Append Menu</h3>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Designation</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold uppercase outline-none focus:border-nfsu-navy"
                  placeholder="ITEM NAME"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (INR)</label>
                  <input 
                    type="number" 
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none"
                    placeholder="00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as MealType})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black outline-none uppercase"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-nfsu-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-nfsu-navy/20 border-b-4 border-black/20">
                Commit Entry
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <h3 className="text-xl font-black mb-8 uppercase italic text-nfsu-navy">Menu Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.menu.map(item => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 group transition-all hover:border-nfsu-gold/30">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-800 uppercase tracking-tighter text-lg">{item.name}</span>
                      <span className="text-[8px] font-black text-white bg-nfsu-navy px-2 py-1 rounded uppercase tracking-widest">{item.category}</span>
                    </div>
                    <div className="text-xs font-black text-nfsu-maroon mt-1">INR {item.price}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-3 text-slate-300 hover:text-red-600 transition-colors bg-white rounded-xl shadow-sm border border-slate-100 hover:border-red-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h3 className="text-xl font-black uppercase italic text-nfsu-navy">Transaction Audit</h3>
              <input 
                type="text" 
                placeholder="TOKEN SEARCH..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest w-full md:w-80 outline-none focus:border-nfsu-navy"
              />
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-300 font-black uppercase italic tracking-widest text-[10px]">Registry Empty</div>
              ) : (
                filteredOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 group">
                    <div className="flex gap-6 items-center">
                      <span className="font-mono font-black text-nfsu-navy text-lg tracking-tighter w-20">{o.id}</span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{o.studentName}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{o.studentEmail}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border-2 ${
                        o.status === 'Served' ? 'status-served' : 
                        o.status === 'Expired' ? 'status-expired' : 'status-pending'
                      }`}>{o.status}</span>
                      <div className="flex gap-2">
                         <span className="text-[10px] text-nfsu-maroon font-black uppercase">INR {o.total}</span>
                         {o.status === 'Pending' && (
                           <button 
                             onClick={() => handleMarkServed(o.id)}
                             className="text-[8px] bg-nfsu-navy text-white px-2 py-0.5 rounded font-black uppercase"
                           >
                             Serve
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
