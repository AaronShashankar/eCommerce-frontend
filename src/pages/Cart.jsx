import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useStore } from "../context/StoreContext";
import { CartLine, Empty } from "../components/Ui";
import { money } from "../lib/format";
export default function Cart() {
  const { cart, user, refreshCart } = useStore();
  const navigate = useNavigate();
  const items = cart.items || [];
  const change = async (id, quantity) => {
    if (quantity < 1) return remove(id);
    await api.patch(`/cart/items/${id}`, { quantity });
    await refreshCart();
  };
  const remove = async (id) => {
    await api.delete(`/cart/items/${id}`);
    await refreshCart();
  };
  const subtotal = items.reduce(
    (s, i) => s + (i.product?.salePrice ?? i.product?.price ?? 0) * i.quantity,
    0,
  );
  if (!items.length)
    return (
      <Empty
        title="Your bag is empty."
        text="The right piece is waiting for you."
      />
    );
  return (
    <section className="section cart-page">
      <div className="page-heading compact">
        <p className="eyebrow">Your selection</p>
        <h1>
          Shopping <i>bag.</i>
        </h1>
      </div>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((i) => (
            <CartLine
              key={i._id}
              item={i}
              onQuantity={(q) => change(i._id, q)}
              onRemove={() => remove(i._id)}
            />
          ))}
        </div>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <p>
            <span>Subtotal</span>
            <b>{money(subtotal)}</b>
          </p>
          <p>
            <span>Delivery</span>
            <b>Calculated at checkout</b>
          </p>
          <hr />
          <p className="total">
            <span>Total</span>
            <b>{money(subtotal)}</b>
          </p>
          <button
            className="button dark full"
            onClick={() =>
              user
                ? navigate("/checkout")
                : navigate("/login", { state: { from: "/checkout" } })
            }
          >
            Secure checkout
          </button>
          <Link to="/shop" className="continue">
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
