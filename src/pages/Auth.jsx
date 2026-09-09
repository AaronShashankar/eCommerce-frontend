import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Notice } from "../components/Ui";
export default function Auth({ register = false }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { signIn } = useStore();
  const navigate = useNavigate(),
    location = useLocation();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await signIn(
        register ? form : { email: form.email, password: form.password },
        register,
      );
      navigate(
        user.role === "admin" ? "/admin" : location.state?.from || "/account",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <Link className="logo" to="/">
          VELORA<span>.</span>
        </Link>
        <p className="eyebrow">
          {register ? "Create an account" : "Welcome back"}
        </p>
        <h1>
          {register ? "A little closer to considered." : "Good to see you."}
        </h1>
        {register && (
          <label>
            Username
            <input
              required
              minLength="3"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
        )}
        <label>
          Email address
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            minLength="8"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <Notice>{error}</Notice>
        <button className="button dark full" disabled={busy}>
          {busy ? "Just a moment…" : register ? "Create account" : "Sign in"}
        </button>
        <p className="form-switch">
          {register ? "Already have an account?" : "New here?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create one"}
          </Link>
        </p>
      </form>
    </section>
  );
}
