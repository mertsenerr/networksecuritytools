import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const scrollToTopImmediate = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.scrollTop = 0;
      }
    };
    
    scrollToTopImmediate();
    
    requestAnimationFrame(() => {
      scrollToTopImmediate();
    });
    
    const timeout1 = setTimeout(() => {
      scrollToTopImmediate();
    }, 0);
    
    const timeout2 = setTimeout(() => {
      scrollToTopImmediate();
    }, 50);
    
    const timeout3 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;