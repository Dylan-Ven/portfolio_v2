import './globals.css';
import { ThemeProvider } from '../context/ThemeProvider';
import ClientRadialMenu from '../components/RadialMenu/ClientRadialMenu';

export const metadata = {
  title: 'Portfolio',
  description: 'Dylan van der Ven - Portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="App">
            <ClientRadialMenu />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
