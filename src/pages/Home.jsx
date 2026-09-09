import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { ProductCard } from "../components/Ui";
export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api
      .get("/products?limit=4")
      .then((r) => setProducts(r.data.products))
      .catch(() => {});
  }, []);
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">The new essentials</p>
          <h1>
            Made for the
            <br />
            <i>everyday.</i>
          </h1>
          <p className="hero-copy">
            Quietly confident objects and clothing, chosen to bring ease to the
            way you move through the world.
          </p>
          <Link to="/shop" className="button light">
            Discover the collection <ArrowRight size={17} />
          </Link>
        </div>
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85"
          alt="Velora collection"
        />
      </section>
      <section className="benefits">
        <div>
          <Truck />
          <span>
            <b>Thoughtful delivery</b>Complimentary over $100
          </span>
        </div>
        <div>
          <RefreshCw />
          <span>
            <b>Easy returns</b>30 days, no questions asked
          </span>
        </div>
        <div>
          <Sparkles />
          <span>
            <b>Built to last</b>Materials that age beautifully
          </span>
        </div>
      </section>
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Just in</p>
            <h2>
              Small things, <i>well made.</i>
            </h2>
          </div>
          <Link to="/shop">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard product={p} key={p._id} />
          ))}
        </div>
      </section>
      <section className="editorial">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
          alt="Minimal fashion"
        />
        <div>
          <p className="eyebrow">Our philosophy</p>
          <h2>
            Less, but <i>better.</i>
          </h2>
          <p>
            We believe the best pieces earn their place. They feel right today,
            and even better with time.
          </p>
          <Link to="/about" className="text-link">
            Read our story <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
