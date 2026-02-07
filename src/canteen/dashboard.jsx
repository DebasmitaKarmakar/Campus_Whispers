import { getPendingCount } from "../services/canteen/orderservice";

export default function Dashboard() {
  return <h2>Pending Orders: {getPendingCount()}</h2>;
}
