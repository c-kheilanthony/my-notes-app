import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 bg-gray-900/70 backdrop-blur-md rounded-3xl shadow-xl border border-gray-700">
      <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
        {isSignUp ? "Create Account" : "Welcome Back"}
      </h2>

      {error && (
        <div className="mb-4 text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 transition"
        >
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsSignUp((prev) => !prev)}
          className="text-purple-400 font-medium hover:underline focus:outline-none"
        >
          {isSignUp ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
