import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("admin@dentalin.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/admin");
  }, [user, navigate]);

  if (loading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Giriş başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-50">
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
          alt="Dentalin"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 to-cyan-900/60" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="text-xs text-cyan-300 uppercase tracking-widest font-bold">
            Yönetim Paneli
          </div>
          <h1 className="mt-2 text-4xl font-bold font-display">Dentalin Admin</h1>
          <p className="mt-3 text-white/80 max-w-md">
            Randevular, hastalar, doktorlar, tedaviler ve içerik yönetimi.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl font-display">D</span>
            </div>
            <div>
              <div className="font-bold font-display text-xl">Dentalin</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-cyan-700">
                Yönetici Paneli
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 font-display">Tekrar Hoş Geldiniz</h2>
          <p className="mt-2 text-slate-600">Yönetici hesabınız ile giriş yapın.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email">E-posta</Label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Şifre</Label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              data-testid="login-submit-btn"
              disabled={submitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-semibold h-11"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Giriş Yap
            </Button>
          </form>

          <div className="mt-6 text-xs text-slate-500 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="font-semibold mb-1">Demo Erişim:</div>
            <div>E-posta: admin@dentalin.com</div>
            <div>Şifre: dentalin2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}
