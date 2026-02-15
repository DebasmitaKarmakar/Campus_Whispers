
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { Order, MenuItem, MealType, User } from '../../types';

export const StaffCanteen: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState(canteenService.getConfig());
  const [feedbacks, setFeedbacks] = useState(canteenService.getAllFeedback());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Menu Item Form State
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Lunch' as MealType });

  useEffect(() => {
    const fetch = () => {
      setOrders(canteenService.getOrders());
      setFeedbacks(canteenService.getAllFeedback());
      setConfig(canteenService.getConfig());
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (id: string, action: 'Served' | 'Expired') => {
    canteenService.updateOrderStatus(id, action);
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
      createdBy: user.id
    };

    const newConfig = {
      ...config,
      menu: [...config.menu, item]
    };
    setConfig(newConfig);
    canteenService.saveConfig({ isOrderingOpen: newConfig.isOrderingOpen });
    setNewItem({ name: '', price: '', category: 'Lunch' });
  };

  const handleDeleteItem = (id: string) => {
    const newConfig = {
      ...config,
      menu: config.menu.filter(item => item.id !== id)
    };
    setConfig(newConfig);
  };

  const toggleSlot = (slot: MealType) => {
    const newToggles = {
      ...config.isOrderingOpen,
      [slot]: !config.isOrderingOpen[slot]
    };
    const newConfig = { ...config, isOrderingOpen: newToggles };
    setConfig(newConfig);
    canteenService.saveConfig({ isOrderingOpen: newToggles });
  };

  const filteredOrders = orders.filter(o => 
    o.status === 'Pending' && (
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="w-full max-w-7xl space-y-10 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-nfsu-navy p-10 rounded-[2.5rem] border-b-8 border-nfsu-gold/50 shadow-2xl text-white">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Service Operations</h2>
          <p className="text-nfsu-gold/70 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Active Registry & Menu Control</p>
        </div>
        <div className="flex gap-4 text-right border-l-2 border-nfsu-gold/30 pl-4">
          <div>
            <div className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-widest mb-1">Staff Auth</div>
            <div className="font-mono font-black text-xl tracking-widest">{user.id}</div>
          </div>
        </div>
      </div>

      {/* Slot Termination Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(slot => {
          const isOpen = config.isOrderingOpen[slot];
          return (
            <div key={slot} className={`p-8 rounded-[2rem] shadow-xl border-2 transition-all overflow-hidden relative ${isOpen ? 'bg-white border-slate-100' : 'bg-red-50 border-red-200'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs text-nfsu-navy uppercase tracking-widest italic">{slot} Window</h3>
                  <p className={`text-[9px] font-black uppercase mt-1 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {isOpen ? 'ACTIVE: RECEIVING ORDERS' : 'HALTED: PORTAL CLOSED'}
                  </p>
                </div>
                <button 
                  onClick={() => toggleSlot(slot)}
                  className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-b-4 ${
                    isOpen 
                    ? 'bg-nfsu-maroon text-white border-black/20 hover:bg-red-700 shadow-lg shadow-nfsu-maroon/20' 
                    : 'bg-green-600 text-white border-black/20 hover:bg-green-700 shadow-lg shadow-green-600/20'
                  }`}
                >
                  {isOpen ? 'Terminate' : 'Authorize'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          {/* Feedback Section */}
          <div className="bg-nfsu-navy p-10 rounded-[2.5rem] shadow-2xl text-white border-b-8 border-nfsu-gold">
            <h3 className="text-xl font-black mb-10 uppercase italic tracking-tighter text-nfsu-gold">Quality Feed</h3>
            <div className="space-y-6">
              {feedbacks.slice().reverse().map((f, i) => {
                const avg = Math.round((f.taste + f.quantity + f.hygiene) / 3);
                return (
                  <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                     <div className="flex justify-between items-center mb-3">
                       <div className="text-[10px] font-black text-nfsu-gold uppercase">Order #{f.orderId}</div>
                       <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={`w-2 h-2 rounded-full ${s <= avg ? 'bg-nfsu-gold' : 'bg-white/10'}`}></div>
                          ))}
                       </div>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                       <div className="text-center bg-black/20 p-2 rounded-xl">
                         <div className="text-[8px] opacity-50 uppercase mb-1">Taste</div>
                         <div className="text-xs font-black">{f.taste}</div>
                       </div>
                       <div className="text-center bg-black/20 p-2 rounded-xl">
                         <div className="text-[8px] opacity-50 uppercase mb-1">Qty</div>
                         <div className="text-xs font-black">{f.quantity}</div>
                       </div>
                       <div className="text-center bg-black/20 p-2 rounded-xl">
                         <div className="text-[8px] opacity-50 uppercase mb-1">Hygiene</div>
                         <div className="text-xs font-black">{f.hygiene}</div>
                       </div>
                     </div>
                  </div>
                );
              })}
              {feedbacks.length === 0 && <p className="text-[10px] font-black opacity-30 uppercase italic text-center py-10 tracking-widest">Feedback Registry Empty</p>}
            </div>
          </div>

          {/* Menu Management */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <h3 className="text-xl font-black mb-8 uppercase italic text-nfsu-navy underline decoration-nfsu-gold decoration-4 underline-offset-8">Update Registry</h3>
            <form onSubmit={handleAddItem} className="space-y-6">
              <input 
                type="text" 
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold uppercase outline-none focus:border-nfsu-navy"
                placeholder="FOOD ITEM NAME"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none"
                  placeholder="PRICE INR"
                />
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
              <button type="submit" className="w-full py-5 bg-nfsu-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest border-b-4 border-black/20 shadow-xl">Commit to Menu</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h3 className="text-2xl font-black uppercase italic text-nfsu-navy">Active Pipeline</h3>
              <input
                type="text"
                placeholder="SEARCH TOKEN..."
                className="px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest w-full md:w-80 outline-none focus:border-nfsu-navy shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.length === 0 ? (
                <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] italic">No Pending Orders</div>
              ) : (
                filteredOrders.map(o => (
                  <div key={o.id} className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-200 relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-3xl font-black font-mono tracking-tighter text-nfsu-navy italic">{o.id}</span>
                      <span className="px-2 py-1 bg-nfsu-navy text-white text-[8px] font-black uppercase rounded">{o.type}</span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="font-black text-slate-800 uppercase text-lg">{o.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order Time: {new Date(o.timestamp).toLocaleTimeString()}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 mb-8 space-y-2 border border-slate-200">
                      {o.items.map(i => (
                        <div key={i.name} className="flex justify-between font-black text-slate-700 text-xs">
                          <span className="uppercase">{i.name}</span>
                          <span className="text-nfsu-maroon">x{i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleAction(o.id, 'Served')} className="py-5 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase border-b-4 border-black/20 shadow-xl transition-all active:scale-95">Mark Served</button>
                      <button onClick={() => handleAction(o.id, 'Expired')} className="py-5 bg-white text-slate-400 rounded-2xl font-black text-[10px] border-2 border-slate-100 hover:border-nfsu-maroon hover:text-nfsu-maroon transition-all">Decline</button>
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
