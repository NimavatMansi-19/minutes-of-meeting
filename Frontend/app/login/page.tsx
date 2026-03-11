"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { Mail, Lock, User, Loader2, ShieldCheck, Check } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const data = await loginUser(email, password);

      if (data.access_token) {
        saveToken(data.access_token, rememberMe);
        router.push("/dashboard");
      } else {
        setMessage(data.message || "Invalid credentials provided.");
      }
    } catch (error: any) {
      setMessage(error.message || "A secure connection could not be established.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-slate-50 relative font-sans text-black">
      {/* Background gradients resembling the image */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-rose-900/40 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-800/40 blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-700/30 blur-[100px] mix-blend-screen pointer-events-none" />

      {/* Central Login Card */}
      <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center px-4">
        {/* The Glass Container */}
        <div className="w-full bg-slate-50 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[3rem] px-8 py-12 flex flex-col items-center">

          {/* Avatar Icon */}
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-10 shadow-inner overflow-hidden border border-slate-100">
            <User size={56} className="text-slate-400 mt-3" strokeWidth={2} />
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-8" autoComplete="off">
            {/* Email Field */}
            <div className="relative border-b border-slate-300 focus-within:border-white transition-colors pb-2">
              <div className="absolute left-0 bottom-2 text-gray-800">
                <Mail size={16} strokeWidth={2.5} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ID"
                autoComplete="off"
                className="w-full bg-transparent outline-none pl-8 text-black placeholder:text-gray-700 text-sm font-medium"
              />
            </div>

            {/* Password Field */}
            <div className="relative border-b border-slate-300 focus-within:border-white transition-colors pb-2">
              <div className="absolute left-0 bottom-2 text-gray-800">
                <Lock size={16} strokeWidth={2.5} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full bg-transparent outline-none pl-8 text-black placeholder:text-gray-700 text-sm font-medium tracking-wide"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-3.5 h-3.5 rounded-sm border border-slate-1000 group-hover:border-white transition-colors">
                  <input
                    type="checkbox"
                    className="absolute opacity-0 w-full h-full cursor-pointer peer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {rememberMe && <Check size={10} strokeWidth={4} className="text-black absolute" />}
                </div>
                <span className="text-[11px] font-medium text-gray-800 group-hover:text-black transition-colors">Remember me</span>
              </label>

              <button type="button" className="text-[11px] font-medium text-gray-800 hover:text-black transition-colors">
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {message && (
              <div className="flex items-start gap-2 py-2 text-slate-400 text-xs font-medium animate-in fade-in">
                <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                <p className="leading-snug">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 pb-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#211833] via-[#332560] to-[#594ea5] hover:from-[#2a1e42] hover:via-[#3f2f76] hover:to-[#6a5fc1] text-white rounded-full py-4 text-[13px] font-bold tracking-widest shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center border border-slate-200"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "LOGIN"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
