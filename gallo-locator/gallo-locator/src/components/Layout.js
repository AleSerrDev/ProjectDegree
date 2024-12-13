import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Components/Header';

const Layout = ({ children }) => {
  const location = useLocation();
  const noHeaderFooter = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!noHeaderFooter && <Header />}
      <div style={{ flex: 1, padding: noHeaderFooter ? '0' : '20px 0' }}>
        {children}
      </div>
    </>
  );
};

export default Layout;
