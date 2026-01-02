import React from 'react';
import Header from '../Header';
import { Outlet } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

function Layout() {
  return (
    <>
      {/* Toast Notifications */}
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88', // Custom green for success
              },
            },
          }}
        />
      </div>

      <div className="h-screen bg-gray-500 flex flex-col">
        {/* Header with subtle fade-in animation */}
        <header className="bg-white transition-all h-[8%]">
          <Header />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 h-[92%] bg-red-300">
         
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default Layout;
