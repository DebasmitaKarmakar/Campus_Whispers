import { getAllOrders, markServed } from "../services/canteen/orderservice";

export default function Orders() {
  const orders = getAllOrders();

  return (
    <div>
      <h2>Serve Orders</h2>
      {orders.map(order => (
        <div key={order.id}>
          {order.id} — {order.meal} — {order.status}
          {order.status === "Pending" && (
            <button onClick={() => markServed(order.id)}>
              Mark Served
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
