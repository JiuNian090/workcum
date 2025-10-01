import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Fab, Box } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

const Layout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Desktop navigation link active state styles
  const getDesktopLinkClass = (path) => {
    const baseClass = "nav-desktop-link";
    const activeClass = "nav-desktop-link-active";
    const inactiveClass = "nav-desktop-link-inactive";
    
    // Special handling for root path
    if (path === "/" && location.pathname === "/") {
      return `${baseClass} ${activeClass}`;
    }
    
    // Exact matching for other paths
    if (path !== "/" && location.pathname === path) {
      return `${baseClass} ${activeClass}`;
    }
    
    return `${baseClass} ${inactiveClass}`;
  };

  // Mobile navigation link active state styles
  const getMobileLinkClass = (path) => {
    const baseClass = "nav-mobile-link";
    const activeClass = "nav-mobile-link-active";
    const inactiveClass = "nav-mobile-link-inactive";
    
    // Special handling for root path
    if (path === "/" && location.pathname === "/") {
      return `${baseClass} ${activeClass}`;
    }
    
    // Exact matching for other paths
    if (path !== "/" && location.pathname === path) {
      return `${baseClass} ${activeClass}`;
    }
    
    return `${baseClass} ${inactiveClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-between bg-white shadow-md p-4 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
          <h1 className="nav-title">
            {t('app_title')}
          </h1>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2 md:space-x-3 items-center">
              <Link to="/schedule" className={getDesktopLinkClass("/schedule")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('navigation.schedule')}
              </Link>
              <Link to="/" className={getDesktopLinkClass("/")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('navigation.time_entry')}
              </Link>
              <Link to="/reports" className={getDesktopLinkClass("/reports")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('navigation.reports')}
              </Link>
              <Link to="/data" className={getDesktopLinkClass("/data")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                {t('navigation.data')}
              </Link>
              <UserProfile />
            </div>
          </div>
        </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 border-t border-gray-100">
        <div className="flex justify-around items-center py-2 px-1">
          <Link to="/schedule" className={getMobileLinkClass("/schedule")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">{t('navigation.schedule')}</span>
          </Link>
          <Link to="/" className={getMobileLinkClass("/")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">{t('navigation.time_entry')}</span>
          </Link>
          <Link to="/reports" className={getMobileLinkClass("/reports")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">{t('navigation.reports')}</span>
          </Link>
          <Link to="/data" className={getMobileLinkClass("/data")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className="text-xs mt-1">{t('navigation.data')}</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:pb-6 pb-24 pt-6 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;