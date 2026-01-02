import React, { useState } from "react";
import logo from './images/logo.png';
import IconMenuUnfold from './icons/IconMenuUnfold.jsx';
import IconUser from './icons/IconUser.jsx';
import IconLogout from './icons/IconLogout.jsx';
import { useAuth } from './context/AuthContext';

const logoutAPI = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to logout");

        const data = await response.json();
        console.log("Logout successful:", data);
    } catch (error) {
        console.log("Error during logout:", error);
    }
};

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const logoutHandler = async () => {
        await logoutAPI();
        logout();
    };

    return (
        <header className="h-full bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center py-3 px-5 sm:px-8 md:px-12">
            {/* Logo */}
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-4 p-2 rounded-lg">
                    <h3 className="flex items-center gap-4 text-2xl font-bold">
                        <img src={logo} alt="Logo" className="h-10 transition-transform duration-300 hover:scale-110" />
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            CodeMeet
                        </span>
                    </h3>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {isAuthenticated && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg border border-slate-800">
                        <IconUser className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-200">
                            {user?.fullname || 'User'}
                        </span>
                    </div>
                )}
                
                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center">
                    {isAuthenticated && (
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-800 hover:border-red-600 transition-all"
                            onClick={logoutHandler}
                            title="Logout"
                        >
                            <IconLogout className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    )}
                </div>

                {/* Mobile Navigation */}
                <div className="relative lg:hidden flex items-center">
                    <IconMenuUnfold setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />

                    {/* Mobile Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-14 right-0 bg-slate-900 border border-slate-800 text-white p-3 rounded-lg shadow-2xl z-50 min-w-[150px]">
                            {isAuthenticated && (
                                <button 
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-600 rounded-lg text-slate-300 hover:text-white transition-all" 
                                    onClick={logoutHandler}
                                >
                                    <IconLogout className="w-5 h-5" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
