import { getAllOrders } from "../../services/canteen/orderservice";

export default function LiveOrders() {
  const orders = getAllOrders();

  return (
    <div>
      <h2>Live Orders</h2>
      {orders.map(o => (
        <div key={o.id}>
          {o.id} — {o.student} — {o.meal} — {o.status}
        </div>
      ))}
    </div>
  );
}
