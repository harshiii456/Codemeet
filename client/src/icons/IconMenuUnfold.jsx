import * as React from "react";

function IconMenuUnfold({isMenuOpen,setIsMenuOpen}) {
  return (
    <button
      className={`flex flex-col justify-between items-center w-8 h-6 bg-transparent border-none p-0 cursor-pointer transition-all duration-300 ease-in-out ${isMenuOpen ? "rotate-45" : ""} animate__animated animate__fadeIn `}
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <div
        className={`w-8 h-1 bg-orange-600 transition-all duration-300 ease-in-out ${isMenuOpen ? "transform rotate-45 translate-y-2" : ""
          }`}
      ></div>
      <div
        className={`w-8 h-1 bg-white transition-all duration-300 ease-in-out ${isMenuOpen ? "opacity-0" : ""
          }`}
      ></div>
      <div
        className={`w-8 h-1 bg-green-600 transition-all duration-300 ease-in-out ${isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""
          }`}
      ></div>
    </button>
  );
}

export default IconMenuUnfold;
