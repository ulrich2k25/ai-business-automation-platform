import { useState } from "react";
import { api } from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      window.location.href = "/dashboard";
    } catch {
      alert("Login incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Connexion</h1>

      <form onSubmit={handleLogin}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}