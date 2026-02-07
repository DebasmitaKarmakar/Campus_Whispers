import { getTodayMenu } from "../../services/canteen/menuservice";

export default function Menu() {
  const menu = getTodayMenu();

  return (
    <div>
      <h2>Today's Menu</h2>
      {menu.map(slot => (
        <div key={slot.meal}>
          <h3>{slot.meal}</h3>
          <ul>
            {slot.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
