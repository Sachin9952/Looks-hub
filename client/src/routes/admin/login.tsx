import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Home } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go to dashboard
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Save token and admin info
      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.data));

      navigate({ to: "/admin/dashboard" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--charcoal)] text-[color:var(--cream)] flex flex-col justify-between">
      {/* Mini Admin Header */}
      <header className="border-b border-white/10 bg-black/20">
        <div className="container-luxe flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl tracking-wide">Look's Hub<span className="text-[color:var(--gold)]">·</span>Admin</span>
          </Link>
          <Link to="/" className="text-xs uppercase tracking-widest text-white/60 hover:text-[color:var(--gold)] flex items-center gap-1.5 transition-colors">
            <Home size={14} /> Back to Site
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-black/40 border border-white/10 rounded-[1.75rem] p-8 md:p-10 shadow-[var(--shadow-luxe)]"
        >
          <div className="text-center">
            <p className="eyebrow !text-[color:var(--gold)]">Owner Portal</p>
            <h1 className="mt-4 font-display text-3xl md:text-4xl text-white">Admin Access</h1>
            <p className="mt-2 text-sm text-white/60">Sign in to manage bookings and services.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div className="p-3.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-white/50 flex items-center gap-2">
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lookshub.com"
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--gold)] text-white"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-white/50 flex items-center gap-2">
                <Lock size={12} /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[color:var(--gold)] text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold justify-center mt-4 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Mini Admin Footer */}
      <footer className="border-t border-white/5 py-6 bg-black/10">
        <div className="container-luxe text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} Look's Hub Admin Portal. Private access only.</p>
        </div>
      </footer>
    </div>
  );
}
