import { placeOrder, isOrderWindowOpen } from "../../services/canteen/orderservice";

export default function PlaceOrder() {
  if (!isOrderWindowOpen()) {
    return <p>Ordering is currently closed.</p>;
  }

  const handleOrder = (meal) => {
    const orderId = placeOrder(meal);
    alert(`Order placed successfully. Your Order ID is ${orderId}`);
  };

  return (
    <div>
      <h2>Place Order</h2>
      <button onClick={() => handleOrder("Breakfast")}>Breakfast</button>
      <button onClick={() => handleOrder("Lunch")}>Lunch</button>
      <button onClick={() => handleOrder("Dinner")}>Dinner</button>
    </div>
  );
}
