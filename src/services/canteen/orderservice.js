let orders = [];
let open = true;

export const isOrderWindowOpen = () => open;
export const setOrderWindow = (state) => open = state;

export const placeOrder = (meal) => {
  const id = meal[0] + "-" + Math.floor(1000 + Math.random() * 9000);
  orders.push({ id, meal, status: "Pending", student: "Student" });
  return id;
};

export const getStudentOrders = () => orders;
export const getAllOrders = () => orders;

export const markServed = (id) => {
  orders = orders.map(o =>
    o.id === id ? { ...o, status: "Served" } : o
  );
};

export const getPendingCount = () =>
  orders.filter(o => o.status === "Pending").length;
