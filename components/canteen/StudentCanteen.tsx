
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { User, Order, MenuItem, MealType } from '../../types';

export const StudentCanteen: React.FC<{ user: User }> = ({ user }) => {
  const [config] = useState(canteenService.getConfig());
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<MealType>('Lunch');
  const [showFeedbackModal, setShowFeedbackModal] = useState<Order | null>(null);
  const [hasOrdered, setHasOrdered] = useState(false);

  const fetchOrders = () => {
    const allOrders = canteenService.getOrders();
    const userOrders = allOrders.filter(o => o.studentEmail === user.email);
    setOrders(userOrders);
    setHasOrdered(canteenService.hasOrderedForSlot(user.email, activeTab));
  };

  useEffect(() => {
    fetchOrders();
  }, [user.email, activeTab]);

  const addToCart = (itemName: string) => {
    setCart(prev => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }));
  };

  const handleOrder = () => {
    try {
      const items = Object.entries(cart).map(([name, quantity]) => ({ name, quantity }));
      if (items.length === 0) return;
      const newOrder = canteenService.placeOrder(user.id, user.email, items, activeTab);
      setOrders([newOrder, ...orders]);
      setCart({});
      setHasOrdered(true);
      alert(`Order Confirmed. Reference: ${newOrder.id}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const pendingFeedbacks = orders.filter(o => o.status === 'Served' && !o.feedbackSubmitted);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl animate-fadeIn">
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border-4 border-nfsu-gold">
            <h3 className="text-3xl font-black text-nfsu-navy text-center mb-10 uppercase italic">Meal Audit</h3>
            <div className="space-y-8">
              {['taste', 'quantity', 'hygiene'].map(category => (
                <div key={category}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{category} rating</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => {}} className="flex-1 h-14 rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-400 font-black text-lg hover:border-nfsu-navy transition-all">{star}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                canteenService.submitFeedback({ orderId: showFeedbackModal.id, taste: 5, quantity: 5, hygiene: 5 });
                setShowFeedbackModal(null);
                fetchOrders();
              }}
              className="w-full mt-10 py-5 bg-nfsu-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-nfsu-navy/30 border-b-4 border-black/20"
            >
              Verify Audit
            </button>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div>
              <h2 className="text-3xl font-black text-nfsu-navy uppercase italic">Menu Registry</h2>
              <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-tight">Standardized university nutrition plan.</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 shadow-inner">
              {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === t ? 'bg-nfsu-navy shadow-lg text-white' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {!config.isOrderingOpen[activeTab] && (
              <div className="p-8 bg-red-50 text-red-800 rounded-3xl border-2 border-red-100">
                <p className="text-xs font-black uppercase tracking-widest">Digital window for {activeTab} is currently CLOSED.</p>
              </div>
            )}
            
            {hasOrdered && (
              <div className="p-8 bg-nfsu-lightgold text-nfsu-maroon rounded-3xl border-2 border-nfsu-gold/30">
                <p className="text-xs font-black uppercase tracking-widest leading-loose text-center">Protocol Restriction: Only one order per institutional member per slot is permitted.</p>
              </div>
            )}
            
            {config.menu.filter(m => m.category === activeTab).map(item => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 hover:border-nfsu-navy/20 transition-all group">
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg">{item.name}</h4>
                  <p className="text-[10px] font-black text-nfsu-navy/50 mt-1 uppercase tracking-widest">Institutional Rate: INR {item.price}</p>
                </div>
                <button
                  onClick={() => addToCart(item.name)}
                  disabled={!config.isOrderingOpen[activeTab] || hasOrdered}
                  className="px-8 py-3 bg-white border-2 border-slate-200 hover:border-nfsu-navy hover:text-nfsu-navy text-slate-400 font-black rounded-xl transition-all disabled:opacity-30 shadow-sm text-[10px] uppercase tracking-[0.2em]"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {pendingFeedbacks.length > 0 && (
          <div className="bg-nfsu-navy p-10 rounded-[2.5rem] border-b-8 border-black/20 shadow-2xl">
             <h3 className="text-2xl font-black text-nfsu-gold mb-2 uppercase italic tracking-tighter">Required Meal Audits</h3>
             <p className="text-white/50 text-[10px] font-black uppercase mb-8 tracking-[0.3em]">Quality Integrity Verification Necessary</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {pendingFeedbacks.map(o => (
                 <div key={o.id} className="bg-white/5 p-6 rounded-2xl border-2 border-white/10 flex justify-between items-center backdrop-blur-sm">
                   <div>
                     <span className="text-[10px] font-black text-nfsu-gold uppercase tracking-widest">Order ID {o.id}</span>
                     <div className="text-xs font-black text-white mt-1 uppercase tracking-tight">Audit Pending</div>
                   </div>
                   <button onClick={() => setShowFeedbackModal(o)} className="px-5 py-2.5 bg-nfsu-gold text-nfsu-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-white transition-all shadow-lg">Start</button>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {Object.keys(cart).length > 0 && (
          <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-black/20 animate-slideIn">
            <h3 className="text-xl font-black mb-8 uppercase tracking-[0.3em] italic">Pending Cart</h3>
            <div className="space-y-4 mb-10">
              {Object.entries(cart).map(([name, qty]) => (
                <div key={name} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="text-xs font-black uppercase tracking-tight">{name} <span className="text-white/40 ml-2">x{qty}</span></div>
                  <span className="font-mono text-xs font-black">INR {qty * 50}</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t-2 border-white/20 mb-8 flex justify-between items-end">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Total Charge</span>
              <span className="text-3xl font-black tracking-tighter italic">INR {Object.values(cart).reduce((a, b) => a + b, 0) * 50}</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={hasOrdered}
              className="w-full py-5 bg-white text-nfsu-maroon rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-nfsu-gold hover:text-nfsu-navy transition-all shadow-2xl shadow-black/20 disabled:opacity-50"
            >
              Authorize Order
            </button>
          </div>
        )}

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
          <h2 className="text-xl font-black text-nfsu-navy mb-8 uppercase tracking-[0.2em] italic underline decoration-nfsu-gold decoration-4 underline-offset-8">Activity Log</h2>
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {orders.map(o => (
              <div key={o.id} className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 relative group">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-black text-nfsu-navy text-sm tracking-widest">{o.id}</span>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 ${
                    o.status === 'Served' ? 'status-served' : 
                    o.status === 'Expired' ? 'status-expired' : 'status-pending'
                  }`}>
                    {o.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 font-black space-y-1 uppercase tracking-tight">
                  {o.items.map(i => <div key={i.name} className="flex justify-between"><span>{i.name}</span> <span className="text-nfsu-navy font-black">x{i.quantity}</span></div>)}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    {new Date(o.timestamp).toLocaleDateString()} • {o.type}
                  </span>
                  {o.status === 'Served' && !o.feedbackSubmitted && (
                    <button onClick={() => setShowFeedbackModal(o)} className="text-[10px] font-black text-nfsu-maroon underline tracking-widest uppercase">AUDIT</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
