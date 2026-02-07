import { setOrderWindow } from "../../services/canteen/orderservice";

export default function OrderWindow() {
  const openWindow = () => setOrderWindow(true);
  const closeWindow = () => setOrderWindow(false);

  return (
    <div>
      <h2>Order Window</h2>
      <button onClick={openWindow}>Open Ordering</button>
      <button onClick={closeWindow}>Close Ordering</button>
    </div>
  );
}
