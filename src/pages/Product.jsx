import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import api from "../lib/api";
import { money } from "../lib/format";
import { Notice, Quantity } from "../components/Ui";
import { useStore } from "../context/StoreContext";
export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState(),
    [quantity, setQuantity] = useState(1),
    [variant, setVariant] = useState(""),
    [error, setError] = useState(""),
    [added, setAdded] = useState(false);
  const { user, refreshCart } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then((r) => setProduct(r.data))
      .catch((e) => setError(e.message));
  }, [slug]);
  if (error && !product)
    return (
      <section className="section">
        <Notice>{error}</Notice>
      </section>
    );
  if (!product) return <div className="loading">Loading piece…</div>;
  const price = product.salePrice ?? product.price;
  const add = async () => {
    if (!user) return navigate("/login", { state: { from: `/shop/${slug}` } });
    try {
      await api.post("/cart/items", {
        productId: product._id,
        quantity,
        variant,
      });
      await refreshCart();
      setAdded(true);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <section className="section product-detail">
      <Link to="/shop" className="back">
        <ArrowLeft size={16} /> Back to collection
      </Link>
      <div className="product-layout">
        <div className="detail-image">
          <img src={product.images?.[0]} alt={product.name} />
        </div>
        <div className="detail-info">
          <p className="eyebrow">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <div className="price">
            {money(price)}{" "}
            {product.salePrice && <del>{money(product.price)}</del>}
          </div>
          <p className="description">{product.description}</p>
          {product.variants?.map((v) => (
            <div className="variant" key={v.name}>
              <label>{v.name}</label>
              <div>
                {v.values.map((value) => (
                  <button
                    className={
                      variant === `${v.name}: ${value}` ? "active" : ""
                    }
                    onClick={() => setVariant(`${v.name}: ${value}`)}
                    key={value}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="buy-row">
            <Quantity
              value={quantity}
              onChange={(n) =>
                setQuantity(Math.max(1, Math.min(product.stock, n)))
              }
            />
            <button
              className="button dark"
              disabled={!product.stock}
              onClick={add}
            >
              {product.stock ? "Add to bag" : "Sold out"}
            </button>
          </div>
          {added && (
            <Notice type="success">
              <Check size={16} /> Added to your bag.
            </Notice>
          )}
          <Notice>{error}</Notice>
          <p className="stock">
            {product.stock > 0
              ? `${product.stock} available`
              : "Currently unavailable"}{" "}
            · Secure checkout
          </p>
        </div>
      </div>
    </section>
  );
}
