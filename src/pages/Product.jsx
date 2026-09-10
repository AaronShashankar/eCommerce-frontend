import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Heart, Star, Tag, Package, Clock, Truck } from "lucide-react";
import api from "../lib/api";
import { money, date } from "../lib/format";
import { Notice, ProductCard } from "../components/Ui";
import { useStore } from "../context/StoreContext";

export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Greenish");
  const [selectedSize, setSelectedSize] = useState("S");
  const [isFavorite, setIsFavorite] = useState(false);
  const [descOpen, setDescOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [toast, setToast] = useState("");

  const { user, refreshCart } = useStore();
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => {
    setError("");
    setAdded(false);
    api
      .get(`/products/${slug}`)
      .then((r) => {
        setProduct(r.data);
        api.get(`/products/${r.data._id}/reviews`).then((reviewsResponse) => setReviews(reviewsResponse.data)).catch(() => setReviews([]));
        api.get("/products?limit=4")
          .then((res) => {
            setRelatedProducts(res.data.products?.filter(p => p.slug !== slug) || []);
          })
          .catch(() => {});
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error && !product)
    return (
      <section className="section">
        <Notice>{error}</Notice>
      </section>
    );

  if (!product) return <div className="loading">Loading C&F collection item…</div>;

  const price = product.salePrice ?? product.price;

  const defaultImages = [
    product.images?.[0] || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    product.images?.[1] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    product.images?.[2] || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80"
  ];
  const activeImage = defaultImages[activeImageIndex] || defaultImages[0];

  const colors = [
    { name: "Black", hex: "#1c1c1c" },
    { name: "White", hex: "#ffffff" },
    { name: "Greenish", hex: "#95a88d" },
    { name: "Grey", hex: "#9b9d9f" },
    { name: "Logan", hex: "#6c757d" }
  ];

  const sizes = ["S", "M", "L", "XL", "XXL", "XL"];

  const sampleReviews = [
    {
      id: 1,
      name: "Alexander Stewart",
      date: "13/12/2024",
      rating: 5,
      comment: "Goddamn!, this hoodie makes me feel soooooo much comfortable and genuinely warm af, I love this hoodie, make sure you buy it guys, love it!",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      photos: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"
      ]
    },
    {
      id: 2,
      name: "Simson Will",
      date: "13/12/2024",
      rating: 5,
      comment: "Very quick and easy! Great service, thanks!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      photos: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"
      ]
    },
    {
      id: 3,
      name: "J.Rodriguez",
      date: "13/12/2024",
      rating: 5,
      comment: "Very quick and easy! Great service, thanks!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      photos: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=200&q=80"
      ]
    }
  ];

  const addToCart = async () => {
    if (!user) {
      showToast("Please sign in to add items to your bag.");
      return;
    }
    try {
      await api.post("/cart/items", {
        productId: product._id,
        quantity: 1,
        variant: `Color: ${selectedColor}, Size: ${selectedSize}`,
      });
      await refreshCart();
      setAdded(true);
      showToast(`${product.name} added to your bag! 🛍️`);
    } catch (e) {
      setError(e.message);
    }
  };
  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) {
      showToast("Please sign in to leave a review.");
      return;
    }
    setReviewError(""); setReviewMessage("");
    try {
      const { data } = await api.post(`/products/${product._id}/reviews`, reviewForm);
      setReviews((current) => [data, ...current]);
      setReviewForm({ rating: 5, comment: "" });
      setReviewMessage("Thanks — your review is now live.");
    } catch (error) { setReviewError(error.message); }
  };

  return (
    <div className="wink-product-page">
      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.includes("sign in") ? "toast-warn" : ""}`}>
          <Check size={16} />{toast}
        </div>
      )}
      <div className="wink-container">
        {/* Breadcrumb */}
        <nav className="wink-breadcrumb">
          <Link to="/shop">
            <ArrowLeft size={16} /> Home
          </Link>
          <span>&gt;</span>
          <span className="current">Product details</span>
        </nav>

        {/* Main Layout Grid */}
        <div className="wink-product-grid">
          
          {/* Gallery Column */}
          <div className="wink-gallery-col">
            <div className="wink-main-image-card">
              <span className="wink-badge-pill">{product.category?.name || "Hoodie"}</span>
              <img src={activeImage} alt={product.name} />
            </div>
            
            <div className="wink-thumbnails-grid">
              {defaultImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  className={`wink-thumb-card ${activeImageIndex === idx ? "active" : ""} ${idx === 2 ? "wide" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={imgUrl} alt={`${product.name} thumb ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Options Card Column */}
          <div className="wink-details-col">
            <div className="wink-details-card">
              <div className="wink-title-row">
                <h1 className="wink-product-title">{product.name}</h1>
                <button
                  className={`wink-heart-btn ${isFavorite ? "active" : ""}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                  aria-label="Save to favorites"
                >
                  <Heart size={20} fill={isFavorite ? "#e63946" : "none"} stroke={isFavorite ? "#e63946" : "#666"} />
                </button>
              </div>

              <div className="wink-rating-row">
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span className="rating-score">{Number(product.rating || 0).toFixed(1)}</span>
                <span className="rating-reviews">({product.reviewCount || reviews.length}) customer reviews</span>
              </div>

              {/* Color Swatches */}
              <div className="wink-option-section">
                <label className="wink-option-label">Color</label>
                <div className="wink-swatches">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      className={`wink-swatch-item ${selectedColor === c.name ? "active" : ""}`}
                      onClick={() => setSelectedColor(c.name)}
                    >
                      <span className="swatch-circle" style={{ backgroundColor: c.hex }} />
                      <span className="swatch-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="wink-option-section">
                <label className="wink-option-label">Size</label>
                <div className="wink-sizes">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      className={`wink-size-pill ${selectedSize === s ? "active" : ""}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Description */}
              <div className="wink-accordion-item">
                <button className="wink-accordion-header" onClick={() => setDescOpen(!descOpen)}>
                  <span>Description</span>
                  {descOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {descOpen && (
                  <div className="wink-accordion-body">
                    <p>
                      {product.description ||
                        "Nike Forward catapults your classic hoodie into the future. Unlike traditional knit fabrics, Nike Forward combines multiple thin layers of select fibres for an exceptionally lightweight feel that's effortlessly warm and comfortable. Plus, this first iteration of Nike Forward reduces the carbon footprint by an average of 75% (due to the use of recycled materials, lower process-energy use, and lower material density) when used instead of our traditional knit fleece materials."}
                    </p>
                  </div>
                )}
              </div>

              {/* Collapsible Shipping */}
              <div className="wink-accordion-item">
                <button className="wink-accordion-header" onClick={() => setShippingOpen(!shippingOpen)}>
                  <span>Shipping</span>
                  {shippingOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {shippingOpen && (
                  <div className="wink-accordion-body">
                    <div className="wink-shipping-grid">
                      <div className="shipping-card-item">
                        <div className="shipping-icon-wrap"><Tag size={18} /></div>
                        <div>
                          <strong>Discount</strong>
                          <p>&gt; Rp 3,000,000 Disc 50%</p>
                        </div>
                      </div>
                      <div className="shipping-card-item">
                        <div className="shipping-icon-wrap"><Package size={18} /></div>
                        <div>
                          <strong>Package</strong>
                          <p>Regular Package</p>
                        </div>
                      </div>
                      <div className="shipping-card-item">
                        <div className="shipping-icon-wrap"><Clock size={18} /></div>
                        <div>
                          <strong>Delivery Time</strong>
                          <p>6-12 Working Days</p>
                        </div>
                      </div>
                      <div className="shipping-card-item">
                        <div className="shipping-icon-wrap"><Truck size={18} /></div>
                        <div>
                          <strong>Estimation Arrive</strong>
                          <p>10 - 12 October 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Dark Buy Bar */}
            <div className="wink-buy-bar">
              <div className="buy-price">
                {money(price)}
              </div>
              <button
                className="wink-buy-btn"
                disabled={!product.stock}
                onClick={addToCart}
              >
                {product.stock ? (
                  <>
                    Buy Now <ArrowRight size={18} />
                  </>
                ) : (
                  "Sold out"
                )}
              </button>
            </div>

            {added && (
              <Notice type="success">
                <Check size={16} /> Added to your bag.
              </Notice>
            )}
            {error && <Notice>{error}</Notice>}
          </div>

          {/* Customer Reviews Column */}
          <div className="wink-reviews-col">
            <div className="wink-reviews-card">
              <div className="reviews-header">
                <h3>Reviews ({reviews.length})</h3>
                <span className="review-average">{Number(product.rating || 0).toFixed(1)} / 5</span>
              </div>
              <form className="review-form" onSubmit={submitReview}>
                <div className="review-form-top"><b>Share your experience</b><div className="review-stars-input">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setReviewForm({ ...reviewForm, rating: value })} aria-label={`${value} stars`}><Star size={18} fill={value <= reviewForm.rating ? "#f7b928" : "none"} color="#f7b928"/></button>)}</div></div>
                <textarea required maxLength="1200" value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} placeholder="What did you like? How does it fit?"/>
                {reviewError && <Notice>{reviewError}</Notice>}{reviewMessage && <Notice type="success">{reviewMessage}</Notice>}
                <button className="review-submit">Post review</button>
              </form>
              <div className="reviews-list">
                {reviews.length ? reviews.map((rev) => (
                  <div key={rev._id} className="review-item-card">
                    <div className="review-user-row">
                      <div className="review-avatar">{rev.user?.username?.slice(0, 1).toUpperCase()}</div>
                      <div className="review-user-meta">
                        <div className="name-and-date">
                          <strong>{rev.user?.username || "C&F customer"}</strong>
                          <span className="review-date">{date(rev.createdAt)}</span>
                        </div>
                        <div className="review-stars">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                    {rev.photos && (
                      <div className="review-photos-grid">
                        {rev.photos.map((p, i) => (
                          <img key={i} src={p} alt="User review attachment" />
                        ))}
                      </div>
                    )}
                  </div>
                )) : <p className="no-reviews">No reviews yet. Be the first verified customer to share an experience.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* More All You Needs / Related Products Section */}
        <section className="wink-related-section">
          <div className="wink-section-header">
            <h2>More All You Needs.</h2>
          </div>
          <div className="wink-related-grid">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((p) => <ProductCard product={p} key={p._id} />)
            ) : (
              [
                {
                  _id: "demo1",
                  slug: "pan-green-outer",
                  name: "Pan Green Outer",
                  price: 490,
                  category: { name: "Outerwear" },
                  images: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"]
                },
                {
                  _id: "demo2",
                  slug: "black-to-basic-tee",
                  name: "Black to basic tee",
                  price: 190,
                  category: { name: "T-Shirts" },
                  images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"]
                },
                {
                  _id: "demo3",
                  slug: "soft-hoodie",
                  name: "Soft Hoodie",
                  price: 890,
                  category: { name: "Hoodies" },
                  images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"]
                }
              ].map((p) => <ProductCard product={p} key={p._id} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
