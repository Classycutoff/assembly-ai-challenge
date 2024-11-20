import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="bg-[hsl(var(--header))] text-[hsl(var(--header-foreground))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Speech Analyzer</h1>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/">
                  <Button variant="ghost" className="text-[hsl(var(--header-foreground))] hover:text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header)/_0.8)]">Home</Button>
                </Link>
              </li>
              <li>
                <Link to="/about">
                  <Button variant="ghost" className="text-[hsl(var(--header-foreground))] hover:text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header)/_0.8)]">About</Button>
                </Link>
              </li>
              <li>
                <Button variant="ghost" onClick={toggleDarkMode} className="text-[hsl(var(--header-foreground))] hover:text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header)/_0.8)]">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;