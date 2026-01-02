import React, { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Login(props) {
  const email = useRef("");
  const password = useRef("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const loginSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formValuesObject = {
      email: email.current.value,
      password: password.current.value,
    };

    try {
      await login(formValuesObject);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center px-4 mt-14 animate__animated animate__fadeIn">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-8">
          Welcome Back
        </h2>
        <form className="space-y-5" onSubmit={loginSubmitHandler}>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-semibold text-slate-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              ref={email}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-slate-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              ref={password}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="w-4 h-4 text-indigo-600 border-slate-700 bg-slate-800 rounded focus:ring-2 focus:ring-indigo-500"
              required
            />
            <label
              htmlFor="terms"
              className="ml-2 text-sm text-slate-400"
            >
              I accept the{" "}
              <a
                href="#"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Terms and Conditions
              </a>
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all shadow-lg ${
              isLoading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        <div className="mt-6 text-sm text-center text-slate-400">
          Don't have an account?{" "}
          <button
            onClick={props.Register}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Create one
          </button>
        </div>
      </div>
    </section>
  );
}

export default Login;
