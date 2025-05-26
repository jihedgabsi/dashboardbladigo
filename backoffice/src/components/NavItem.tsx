import React, { ReactNode } from 'react';

interface NavItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 mb-1 rounded-md transition-colors duration-200 ${
        active ? 'bg-red-800' : 'hover:bg-red-800'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default NavItem;