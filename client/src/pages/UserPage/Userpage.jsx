import React, { useState, useEffect } from 'react';
import Signup from '../../components/SignUp/index';
import Login from '../../components/LogIn/index';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function User() {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();
    const [flagSignup, setFlagSignup] = useState(1);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/meet-room");
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    const Register = () => setFlagSignup(0);
    const Signin = () => setFlagSignup(1);

    return (
        <div className="flex items-center justify-center h-full bg-slate-950">
            <div className="w-full h-full">
                <div className="flex justify-center gap-2 pt-8">
                    <button
                        onClick={Register}
                        className={`px-6 py-3 text-base font-semibold rounded-t-lg transition-all duration-300 ${
                            flagSignup === 0
                                ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={Signin}
                        className={`px-6 py-3 text-base font-semibold rounded-t-lg transition-all duration-300 ${
                            flagSignup === 1
                                ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                    >
                        Sign In
                    </button>
                </div>

                {flagSignup === 0 ? (
                    <Signup Signin={Signin} />
                ) : (
                    <Login Register={Register} />
                )}
            </div>
        </div>
    );
}

export default User;
