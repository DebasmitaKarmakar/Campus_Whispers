
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { User, Order, MenuItem, MealType, CanteenConfig } from '../../types';

export const StudentCanteen: React.FC<{ user: User }> = ({ user }) => {
  const [config, setConfig] = useState<CanteenConfig>(canteenService.getConfig());
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<MealType>('Lunch');
  
  const [showFeedbackModal, setShowFeedbackModal] = useState<Order | null>(null);
  const [feedbackRatings, setFeedbackRatings] = useState({ taste: 0, quantity: 0, hygiene: 0 });
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [hasOrdered, setHasOrdered] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const fetchData = () => {
    const allOrders = canteenService.getOrders();
    const userOrders = allOrders.filter(o => o.studentEmail === user.email);
    setOrders(userOrders);
    setConfig(canteenService.getConfig());
    setHasOrdered(canteenService.hasOrderedForSlot(user.email, activeTab));
  };

  useEffect(() => {
    fetchData();
    // Fast polling for immediate feedback
    const interval = setInterval(fetchData, 3000);
    // Same-tab database update event
    window.addEventListener('cw_db_update', fetchData);
    // Cross-tab database update event
    window.addEventListener('storage', fetchData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cw_db_update', fetchData);
      window.removeEventListener('storage', fetchData);
    };
  }, [user.email, activeTab]);

  const addToCart = (itemName: string) => {
    setCart(prev => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }));
  };

  const handleOrder = () => {
    try {
      const items = (Object.entries(cart) as [string, number][]).map(([name, quantity]) => ({ name, quantity }));
      if (items.length === 0) return;
      if (editingOrderId) {
        canteenService.updateOrderItems(editingOrderId, items);
        setEditingOrderId(null);
      } else {
        canteenService.placeOrder(user.id, user.email, items, activeTab);
      }
      setCart({});
      fetchData();
    } catch (e: any) { alert(e.message); }
  };

  const confirmCancelOrder = () => {
    if (!cancelReason.trim()) return;
    if (showCancelModal) {
      canteenService.cancelOrder(showCancelModal, cancelReason);
      setShowCancelModal(null);
      setCancelReason('');
      fetchData();
    }
  };

  const handleEditOrder = (order: Order) => {
    const newCart: { [key: string]: number } = {};
    order.items.forEach(item => { newCart[item.name] = item.quantity; });
    setCart(newCart);
    setEditingOrderId(order.id);
    setActiveTab(order.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitFeedback = () => {
    if (feedbackRatings.taste === 0 || feedbackRatings.quantity === 0 || feedbackRatings.hygiene === 0) return;
    if (showFeedbackModal) {
      canteenService.submitFeedback({ orderId: showFeedbackModal.id, ...feedbackRatings });
      setShowFeedbackModal(null);
      setFeedbackRatings({ taste: 0, quantity: 0, hygiene: 0 });
      fetchData();
    }
  };

  const pendingFeedbacks = orders.filter(o => o.status === 'Served' && !o.feedbackSubmitted);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl animate-fadeIn">
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border-4 border-nfsu-gold">
            <h3 className="text-3xl font-black text-nfsu-navy text-center mb-4 uppercase italic tracking-tighter">Meal Feedback</h3>
            <div className="space-y-8">
              {(['taste', 'quantity', 'hygiene'] as const).map(category => (
                <div key={category}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{category} rating</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => setFeedbackRatings(prev => ({ ...prev, [category]: star }))} 
                        className={`flex-1 h-14 rounded-xl font-black text-lg transition-all border-2 ${
                          feedbackRatings[category] === star 
                          ? 'bg-nfsu-navy border-nfsu-navy text-white shadow-lg scale-105' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-nfsu-navy/30'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={submitFeedback} className="w-full mt-10 py-5 bg-nfsu-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl border-b-4 border-black/20">Submit Feedback</button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border-4 border-nfsu-maroon">
            <h3 className="text-2xl font-black text-nfsu-maroon text-center mb-6 uppercase italic">Order Withdrawal</h3>
            <textarea
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold h-32 outline-none focus:border-nfsu-maroon uppercase mb-6"
              placeholder="REASON..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowCancelModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase border-b-4 border-slate-200">Go Back</button>
              <button onClick={confirmCancelOrder} className="flex-2 py-4 bg-nfsu-maroon text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-black/20">Withdraw</button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div>
              <h2 className="text-3xl font-black text-nfsu-navy uppercase italic">Menu Registry</h2>
              <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-tight">University nutrition standard.</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 shadow-inner">
              {(['Breakfast', 'Lunch', 'Dinner'] as MealType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setEditingOrderId(null); setCart({}); }}
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === t ? 'bg-nfsu-navy shadow-lg text-white' : 'text-slate-400 hover:text-slate-800'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {!config.isOrderingOpen[activeTab] && (
              <div className="p-8 bg-red-50 text-red-800 rounded-3xl border-2 border-red-100 text-center">
                <p className="text-xs font-black uppercase tracking-widest">Digital window for {activeTab} is CLOSED.</p>
              </div>
            )}
            
            {hasOrdered && !editingOrderId && (
              <div className="p-8 bg-nfsu-lightgold text-nfsu-maroon rounded-3xl border-2 border-nfsu-gold/30 text-center">
                <p className="text-xs font-black uppercase tracking-widest">Active order exists for this slot.</p>
              </div>
            )}
            
            {config.menu.filter(m => m.category === activeTab).map(item => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100 group">
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg">{item.name}</h4>
                  <p className="text-[10px] font-black text-nfsu-navy/50 mt-1 uppercase tracking-widest">INR {item.price}</p>
                </div>
                <button
                  onClick={() => addToCart(item.name)}
                  disabled={!config.isOrderingOpen[activeTab] || (hasOrdered && !editingOrderId)}
                  className="px-8 py-3 bg-white border-2 border-slate-200 hover:border-nfsu-navy hover:text-nfsu-navy text-slate-400 font-black rounded-xl transition-all disabled:opacity-30 shadow-sm text-[10px] uppercase"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.keys(cart).length > 0 && (
          <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-black/20 sticky top-24 z-20">
            <h3 className="text-xl font-black mb-8 uppercase tracking-[0.3em] italic">CART</h3>
            <div className="space-y-4 mb-8">
              {(Object.entries(cart) as [string, number][]).map(([name, qty]) => (
                <div key={name} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs font-black uppercase">{name} x{qty}</span>
                  <span className="font-mono text-xs font-black">INR {qty * 50}</span>
                </div>
              ))}
            </div>
            <button onClick={handleOrder} className="w-full py-5 bg-white text-nfsu-maroon rounded-2xl font-black text-xs uppercase tracking-[0.3em] border-b-4 border-slate-200">PLACE ORDER</button>
          </div>
        )}

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
          <h2 className="text-xl font-black text-nfsu-navy mb-8 uppercase italic underline decoration-nfsu-gold decoration-4 underline-offset-8">Activity</h2>
          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
            {orders.map(o => (
              <div key={o.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 relative group transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono font-black text-nfsu-navy text-sm">{o.id}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 ${
                    o.status === 'Served' ? 'status-served' : 
                    o.status === 'Cancelled' ? 'status-expired' : 'status-pending'
                  }`}>{o.status}</span>
                </div>
                {o.declineReason && (
                  <div className="p-2 bg-red-50 text-red-700 text-[8px] font-black uppercase rounded mb-2">REASON: {o.declineReason}</div>
                )}
                <div className="text-[9px] font-black uppercase text-slate-400">Time: {new Date(o.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
