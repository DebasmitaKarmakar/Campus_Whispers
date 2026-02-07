import { getCanteenReport } from "../../services/canteen/reportservice";

export default function Reports() {
  const report = getCanteenReport();

  return (
    <div>
      <h2>Canteen Reports</h2>
      <p>Most Ordered Item: {report.topItem}</p>
      <p>Peak Hour: {report.peakHour}</p>
    </div>
  );
}
