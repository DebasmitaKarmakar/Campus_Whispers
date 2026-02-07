import { getStudentOrders } from "../../services/canteen/orderservice";

export default function OrderHistory() {
  const orders = getStudentOrders();

  return (
    <div>
      <h2>My Orders</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.id} — {order.meal} — {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
