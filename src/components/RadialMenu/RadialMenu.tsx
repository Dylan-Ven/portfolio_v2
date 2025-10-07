import { useRef, useEffect, useState } from "react";
import {
  animateMenuOpen,
  animateMenuClose,
  animateMainButton,
  setInitialMainButton
} from "./RadialMenu.animations";
import "./RadialMenu.css";

// RadialMenu item structure
interface RadialMenuItem {
  icon: string;       // path to icon
  section: string;    // target section name
  title: string;      // tooltip or aria label
  angle: number;      // degrees around the main button
}

// Your items
const items: RadialMenuItem[] = [
  { icon: "/icons/home.svg", section: "home", title: "Home", angle: 180 },
  { icon: "/icons/about.svg", section: "about", title: "About", angle: 250 },
  { icon: "/icons/projects.svg", section: "projects", title: "Projects", angle: 330 },
  { icon: "/icons/contact.svg", section: "contact", title: "Contact", angle: 0 }
];

// Props interface
interface RadialMenuProps {
  navigateTo: (section: string) => void;
}

export function RadialMenu({ navigateTo }: RadialMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLButtonElement[]>([]);
  const mainBtnRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Animate main button on mount
  useEffect(() => {
    if (mainBtnRef.current) {
      setInitialMainButton(mainBtnRef.current);
    }
  }, []);

  const toggleMenu = () => {
  if (isOpen) {
    animateMenuClose(buttonsRef.current);
    animateMainButton(mainBtnRef.current!, false); // menu closing
  } else {
    animateMenuOpen(buttonsRef.current);
    animateMainButton(mainBtnRef.current!, true); // menu opening
  }
  setIsOpen(!isOpen);
};


  return (
    <div className="radial-menu" ref={menuRef}>
      <button className="main-btn" ref={mainBtnRef} onClick={toggleMenu}>
        
      </button>
      {items.map((item, i) => (
        <button
            key={item.section}
            ref={el => { buttonsRef.current[i] = el! }}
            className="menu-btn"
            onClick={() => navigateTo(item.section)}
            aria-label={item.title}
            title={item.title}
        >
            <img src={item.icon} alt={item.title} />
        </button>
    ))}
    </div>
  );
}
