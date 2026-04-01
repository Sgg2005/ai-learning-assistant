import { CheckCircle2, Circle } from "lucide-react";

const Rule = ({ ok, text }) => (
  <div className={`flex items-center gap-2 text-sm ${ok ? "text-green-600" : "text-slate-400"}`}>
    {ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}
    <span>{text}</span>
  </div>
);

const PasswordChecklist = ({ password = "" }) => {
  const checks = {
    min8: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  const strength =
    passed <= 1 ? "Very Weak" :
    passed === 2 ? "Weak" :
    passed === 3 ? "Fair" :
    passed === 4 ? "Good" : "Strong";

  const strengthColor =
    passed <= 1 ? "text-red-500" :
    passed === 2 ? "text-orange-500" :
    passed === 3 ? "text-amber-500" :
    passed === 4 ? "text-blue-600" : "text-green-600";

  return (
    <div className="mt-2">
      <p className="text-xs text-slate-500">
        Password strength: <span className={`font-semibold ${strengthColor}`}>{strength}</span>
      </p>

      <div className="mt-2 space-y-1">
        <Rule ok={checks.min8} text="At least 8 characters" />
        <Rule ok={checks.upper} text="Contains uppercase letter" />
        <Rule ok={checks.lower} text="Contains lowercase letter" />
        <Rule ok={checks.number} text="Contains number" />
        <Rule ok={checks.special} text="Contains special character" />
      </div>
    </div>
  );
};

export default PasswordChecklist;