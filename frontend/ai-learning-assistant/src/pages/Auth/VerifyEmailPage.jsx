import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BrainCircuit, ArrowRight } from "lucide-react";
import authService from "../../services/authServices";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || "";
  const [email] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !code) {
      setError("Email and verification code are required.");
      return;
    }

    try {
      setLoading(true);

      await authService.verifyEmail(email.toLowerCase().trim(), code.trim());

      toast.success("Email verified successfully!");
      navigate("/login", {
        state: { email: email.toLowerCase().trim(), verified: true },
      });
    } catch (err) {
      const message = err?.message || err?.error || "Verification failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/register");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/25 mb-5">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">
              Check your email
            </h1>
            <p className="text-slate-500 text-sm">
              We sent a verification code to
            </p>
            <p className="text-slate-800 font-semibold text-base break-all">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                maxLength={8}
                placeholder="12345678"
                className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-base font-semibold text-center tracking-[0.2em] transition-all duration-200 focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-lg focus:shadow-orange-400/10"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
              </span>
            </button>

            {/* Go back */}
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-200"
            >
              Go back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;