import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authServices";
import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const passwordChecks = useMemo(
    () => ({
      min8: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const strength = useMemo(() => {
    if (passedChecks <= 1) return { label: "Very Weak", color: "text-red-500" };
    if (passedChecks === 2) return { label: "Weak", color: "text-orange-500" };
    if (passedChecks === 3) return { label: "Fair", color: "text-amber-500" };
    if (passedChecks === 4) return { label: "Good", color: "text-blue-600" };
    return { label: "Strong", color: "text-green-600" };
  }, [passedChecks]);

  const canSubmit =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordValid &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Password does not meet the required rules.");
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.toLowerCase().trim();

      await authService.register(username.trim(), normalizedEmail, password);

      toast.success("Registration successful! Enter the OTP sent to your email.");
      navigate("/verify-email", { state: { email: normalizedEmail } });
    } catch (err) {
      console.log("REGISTER_ERR_FULL", err);
      console.log("REGISTER_ERR_RESPONSE", err?.response);
      console.log("REGISTER_ERR_DATA", err?.response?.data);

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const Rule = ({ ok, text }) => (
    <div className={`flex items-center gap-2 text-xs ${ok ? "text-green-600" : "text-slate-400"}`}>
      {ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/25 mb-6">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">Create an account</h1>
            <p className="text-slate-500 text-sm">Start your AI-powered learning experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Username</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${focusedField === "username" ? "text-orange-500" : "text-gray-400"}`}>
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium focus:outline-none focus:border-orange-400"
                  placeholder="John"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${focusedField === "email" ? "text-orange-500" : "text-gray-400"}`}>
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium focus:outline-none focus:border-orange-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${focusedField === "password" ? "text-orange-500" : "text-gray-400"}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full h-12 pl-12 pr-12 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium focus:outline-none focus:border-orange-400"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-2 border border-slate-200 rounded-xl bg-slate-50/60 p-3">
                <p className="text-xs text-slate-500 mb-2">
                  Password strength: <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                </p>
                <div className="space-y-1">
                  <Rule ok={passwordChecks.min8} text="At least 8 characters" />
                  <Rule ok={passwordChecks.upper} text="Contains uppercase letter" />
                  <Rule ok={passwordChecks.lower} text="Contains lowercase letter" />
                  <Rule ok={passwordChecks.number} text="Contains number" />
                  <Rule ok={passwordChecks.special} text="Contains special character" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={!canSubmit} className="w-full h-12 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-60">
              <span className="flex items-center justify-center gap-2">
                {loading ? "Creating account..." : <>Create account <ArrowRight className="w-4 h-4" /></>}
              </span>
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Already have an account? <Link to="/login" className="text-orange-500 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;