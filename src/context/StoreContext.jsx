import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
const StoreContext = createContext();
export const useStore = () => useContext(StoreContext);
export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const refreshCart = async () => {
    if (!localStorage.getItem("velora_token")) return setCart({ items: [] });
    try {
      setCart((await api.get("/cart")).data);
    } catch {
      setCart({ items: [] });
    }
  };
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("velora_token"))
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
          await refreshCart();
        } catch {
          localStorage.removeItem("velora_token");
        } finally {
          setLoading(false);
        }
      else setLoading(false);
    })();
  }, []);
  const signIn = async (payload, registering = false) => {
    const { data } = await api.post(
      registering ? "/auth/register" : "/auth/login",
      payload,
    );
    localStorage.setItem("velora_token", data.token);
    setUser(data.user);
    await refreshCart();
    return data.user;
  };
  const signOut = () => {
    localStorage.removeItem("velora_token");
    setUser(null);
    setCart({ items: [] });
  };
  return (
    <StoreContext.Provider
      value={{ user, setUser, cart, loading, signIn, signOut, refreshCart }}
    >
      {children}
    </StoreContext.Provider>
  );
}
