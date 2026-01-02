import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

function Signup(props) {
  const fullnameRef = useRef("");
  const usernameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const signupSubmitHandler = async (event) => {
    event.preventDefault();

    const formValuesObject = {
      fullname: fullnameRef.current.value,
      username: usernameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      confirmPassword: confirmPasswordRef.current.value,
    };

    if (
      !formValuesObject.fullname ||
      !formValuesObject.username ||
      !formValuesObject.email ||
      !formValuesObject.password ||
      !formValuesObject.confirmPassword
    ) {
      toast.error("Error: All fields are required.");
      return;
    }

    if (formValuesObject.password !== formValuesObject.confirmPassword) {
      toast.error("Error: Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await register(formValuesObject);
      // Auto-login is handled in the context
    } catch (error) {
      // Error is handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center px-4 mt-14 animate__animated animate__fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 py-8 px-8 rounded-2xl shadow-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-slate-100 text-center mb-8">
          Create Account
        </h2>
        <form onSubmit={signupSubmitHandler} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                ref={fullnameRef}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                ref={usernameRef}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="johndoe"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                ref={emailRef}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                ref={passwordRef}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                ref={confirmPasswordRef}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-1 text-indigo-600 border-slate-700 bg-slate-800 rounded focus:ring-2 focus:ring-indigo-500"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-slate-400">
              I agree to the{" "}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
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
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        <div className="text-sm text-center mt-6 text-slate-400">
          Already have an account?{" "}
          <button
            onClick={props.Signin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </section>
  );
}

export default Signup;
