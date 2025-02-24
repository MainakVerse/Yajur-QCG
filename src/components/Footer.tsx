import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black text-white text-center py-4">
      <p className="text-sm md:text-base">&copy; {new Date().getFullYear()} Quantum Vedas. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
