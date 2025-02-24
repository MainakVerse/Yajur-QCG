import React from "react";
import Image from "next/image";

const Header: React.FC = () => {
  return (
    <header className="w-full bg-black text-white py-8 text-center text-xl md:text-2xl lg:text-3xl flex items-center justify-center gap-3">
    <Image src="/favicon.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10" width={50} height={50} />
    <span>YAJUR - Quantum Circuit Generator</span>
    </header>

  );
};

export default Header;
