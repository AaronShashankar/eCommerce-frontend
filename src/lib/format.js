export const money = (value = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
export const date = (value) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value),
  );
