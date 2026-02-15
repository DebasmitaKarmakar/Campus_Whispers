
import React, { useState, useEffect } from 'react';
import { canteenService } from '../../services/canteenService';
import { User, Order, MenuItem, MealType } from '../../types';

export const StudentCanteen: React.FC<{ user: User }> = ({ user }) => {
  const [config] = useState(canteenService.getConfig());
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<MealType>('Lunch');
  
  // Feedback States - Initialized to 0 to ensure user selects
  const [showFeedbackModal, setShowFeedbackModal] = useState<Order | null>(null);
  const [feedbackRatings, setFeedbackRatings] = useState({ taste: 0, quantity: 0, hygiene: 0 });
  
  // Cancellation States
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  const [hasOrdered, setHasOrdered] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

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
      const items = (Object.entries(cart) as [string, number][]).map(([name, quantity]) => ({ name, quantity }));
      if (items.length === 0) return;

      if (editingOrderId) {
        canteenService.updateOrderItems(editingOrderId, items);
        setEditingOrderId(null);
        alert(`Order ${editingOrderId} updated successfully.`);
      } else {
        const newOrder = canteenService.placeOrder(user.id, user.email, items, activeTab);
        alert(`Order Confirmed. Reference: ${newOrder.id}`);
      }
      
      setCart({});
      fetchOrders();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const confirmCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert('A valid reason is mandatory for cancellation protocol.');
      return;
    }
    if (showCancelModal) {
      canteenService.cancelOrder(showCancelModal, cancelReason);
      setShowCancelModal(null);
      setCancelReason('');
      fetchOrders();
    }
  };

  const handleEditOrder = (order: Order) => {
    const newCart: { [key: string]: number } = {};
    order.items.forEach(item => {
      newCart[item.name] = item.quantity;
    });
    setCart(newCart);
    setEditingOrderId(order.id);
    setActiveTab(order.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitFeedback = () => {
    if (feedbackRatings.taste === 0 || feedbackRatings.quantity === 0 || feedbackRatings.hygiene === 0) {
      alert('Please provide ratings for all categories.');
      return;
    }
    if (showFeedbackModal) {
      canteenService.submitFeedback({ 
        orderId: showFeedbackModal.id, 
        ...feedbackRatings 
      });
      setShowFeedbackModal(null);
      setFeedbackRatings({ taste: 0, quantity: 0, hygiene: 0 });
      fetchOrders();
    }
  };

  const pendingFeedbacks = orders.filter(o => o.status === 'Served' && !o.feedbackSubmitted);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl animate-fadeIn">
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl border-4 border-nfsu-gold">
            <h3 className="text-3xl font-black text-nfsu-navy text-center mb-4 uppercase italic tracking-tighter">Meal Feedback</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase text-center mb-10 tracking-widest">Provide accurate quality data</p>
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
            <button 
              onClick={submitFeedback}
              className="w-full mt-10 py-5 bg-nfsu-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-nfsu-navy/30 border-b-4 border-black/20"
            >
              Verify & Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border-4 border-nfsu-maroon">
            <h3 className="text-2xl font-black text-nfsu-maroon text-center mb-6 uppercase italic">Order Withdrawal</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center leading-relaxed">
              Reasoning is mandatory for institutional record-keeping.
            </p>
            <textarea
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold h-32 outline-none focus:border-nfsu-maroon uppercase mb-6"
              placeholder="ENTER REASON FOR CANCELLATION..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest border-b-4 border-slate-200"
              >
                Go Back
              </button>
              <button 
                onClick={confirmCancelOrder}
                className="flex-2 py-4 bg-nfsu-maroon text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-black/20"
              >
                Withdraw Order
              </button>
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

          {editingOrderId && (
            <div className="mb-8 p-8 bg-nfsu-navy text-white rounded-[2rem] border-b-8 border-nfsu-gold shadow-2xl flex items-center justify-between animate-pulse">
              <div>
                <p className="text-[10px] font-black uppercase text-nfsu-gold tracking-[0.3em] mb-1">AUTHORIZATION: MODIFICATION MODE</p>
                <p className="text-lg font-black uppercase italic leading-none">Updating Ref: {editingOrderId}</p>
              </div>
              <button onClick={() => { setEditingOrderId(null); setCart({}); }} className="px-5 py-2.5 bg-white text-nfsu-navy rounded-xl text-[10px] font-black uppercase tracking-widest border-b-4 border-slate-200">Discard Changes</button>
            </div>
          )}

          <div className="space-y-4">
            {!config.isOrderingOpen[activeTab] && (
              <div className="p-8 bg-red-50 text-red-800 rounded-3xl border-2 border-red-100 text-center">
                <p className="text-xs font-black uppercase tracking-widest">Digital window for {activeTab} is currently CLOSED by Authority.</p>
              </div>
            )}
            
            {hasOrdered && !editingOrderId && (
              <div className="p-8 bg-nfsu-lightgold text-nfsu-maroon rounded-3xl border-2 border-nfsu-gold/30">
                <p className="text-xs font-black uppercase tracking-widest leading-loose text-center">Active order detected for this slot. Modify or Withdraw via Activity Pipeline.</p>
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
                  disabled={!config.isOrderingOpen[activeTab] || (hasOrdered && !editingOrderId)}
                  className="px-8 py-3 bg-white border-2 border-slate-200 hover:border-nfsu-navy hover:text-nfsu-navy text-slate-400 font-black rounded-xl transition-all disabled:opacity-30 shadow-sm text-[10px] uppercase tracking-[0.2em]"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        {pendingFeedbacks.length > 0 && (
          <div className="bg-nfsu-navy p-10 rounded-[2.5rem] border-b-8 border-nfsu-gold shadow-2xl">
             <h3 className="text-2xl font-black text-nfsu-gold mb-2 uppercase italic tracking-tighter">Meal Feedback Registry</h3>
             <p className="text-white/50 text-[10px] font-black uppercase mb-8 tracking-[0.3em]">Quality Integrity Confirmation Required</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {pendingFeedbacks.map(o => (
                 <div key={o.id} className="bg-white/5 p-6 rounded-2xl border-2 border-white/10 flex justify-between items-center backdrop-blur-sm">
                   <div>
                     <span className="text-[10px] font-black text-nfsu-gold uppercase tracking-widest">Order ID {o.id}</span>
                     <div className="text-xs font-black text-white mt-1 uppercase tracking-tight">Awaiting Input</div>
                   </div>
                   <button onClick={() => setShowFeedbackModal(o)} className="px-5 py-2.5 bg-nfsu-gold text-nfsu-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-white transition-all shadow-lg border-b-4 border-black/10">Start Rating</button>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {Object.keys(cart).length > 0 && (
          <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-black/20 animate-slideIn sticky top-24 z-20">
            <h3 className="text-xl font-black mb-8 uppercase tracking-[0.3em] italic">{editingOrderId ? 'MODIFICATION CART' : 'ACTIVE CART'}</h3>
            <div className="space-y-4 mb-10">
              {(Object.entries(cart) as [string, number][]).map(([name, qty]) => (
                <div key={name} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="text-xs font-black uppercase tracking-tight">
                    {name} <span className="text-white/40 ml-2">x{qty}</span>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setCart(p => ({...p, [name]: Math.max(0, p[name]-1)}))} className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[12px] font-black">-</button>
                     <span className="font-mono text-xs font-black">INR {qty * 50}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t-2 border-white/20 mb-8 flex justify-between items-end">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Cart Aggregate</span>
              <span className="text-3xl font-black tracking-tighter italic">INR {(Object.values(cart) as number[]).reduce((a, b) => a + b, 0) * 50}</span>
            </div>
            <button
              onClick={handleOrder}
              className="w-full py-5 bg-white text-nfsu-maroon rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-nfsu-gold hover:text-nfsu-navy transition-all shadow-2xl shadow-black/20 border-b-4 border-slate-200"
            >
              {editingOrderId ? 'CONFIRM MODIFICATION' : 'PLACE ORDER NOW'}
            </button>
          </div>
        )}

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
          <h2 className="text-xl font-black text-nfsu-navy mb-8 uppercase tracking-[0.2em] italic underline decoration-nfsu-gold decoration-4 underline-offset-8">Activity Pipeline</h2>
          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-slate-300 font-black uppercase italic tracking-widest text-[10px]">Registry Empty</div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 relative group transition-all hover:border-nfsu-navy/30">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="font-mono font-black text-nfsu-navy text-sm tracking-widest">{o.id}</span>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-nfsu-navy text-white text-[8px] font-black uppercase rounded tracking-widest">{o.type}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 ${
                          o.status === 'Served' ? 'status-served' : 
                          o.status === 'Cancelled' ? 'status-expired' : 
                          o.status === 'Expired' ? 'status-expired' : 'status-pending'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-slate-600 font-black space-y-2 uppercase tracking-tight bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    {o.items.map(i => <div key={i.name} className="flex justify-between"><span>{i.name}</span> <span className="text-nfsu-navy font-black">x{i.quantity}</span></div>)}
                  </div>

                  {o.status === 'Cancelled' && o.cancelReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-[9px] font-black uppercase text-red-700 tracking-tighter italic">REASON: {o.cancelReason}</p>
                    </div>
                  )}

                  {o.status === 'Expired' && o.declineReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-[9px] font-black uppercase text-red-700 tracking-tighter italic">DECLINE REASON: {o.declineReason}</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                         <span>Registry:</span>
                         <span className="text-nfsu-navy">{new Date(o.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                         <span>Placed:</span>
                         <span className="text-nfsu-navy">{new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {o.servedTimestamp && (
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-green-600">
                           <span>Fulfilled:</span>
                           <span>{new Date(o.servedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>

                    {o.status === 'Pending' && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <button 
                          onClick={() => handleEditOrder(o)} 
                          className="py-4 bg-nfsu-navy text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-nfsu-gold hover:text-nfsu-navy transition-all shadow-xl border-b-4 border-black/20"
                        >
                          Modify
                        </button>
                        <button 
                          onClick={() => setShowCancelModal(o.id)} 
                          className="py-4 bg-nfsu-maroon text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl border-b-4 border-black/20"
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                    
                    {o.status === 'Served' && !o.feedbackSubmitted && (
                      <button 
                        onClick={() => setShowFeedbackModal(o)} 
                        className="w-full py-4 bg-nfsu-gold text-nfsu-navy rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-nfsu-navy hover:text-white transition-all shadow-xl border-b-4 border-black/10"
                      >
                        RATE QUALITY
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
