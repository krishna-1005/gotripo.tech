import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import ReactGA from 'react-ga4';

/**
 * useTracking hook sends tracking events on every route change.
 * It handles backend logging, Microsoft Clarity, and Google Analytics 4.
 */
export const useTracking = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // 1. Get or create guestId for anonymous tracking
    let guestId = localStorage.getItem('gt_guest_id');
    if (!guestId) {
      guestId = 'g_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('gt_guest_id', guestId);
    }

    // 2. Prepare tracking data
    const trackData = {
      userId: user?.uid || null,
      userType: user ? 'user' : 'guest',
      guestId: guestId,
      action: 'page_view',
      details: {
        path: location.pathname + location.search,
        referrer: document.referrer,
        title: document.title,
        screenRes: `${window.screen.width}x${window.screen.height}`,
      }
    };

    // 3. Send to backend (fire and forget)
    const track = async () => {
      try {
        // Send to backend
        await api.post('/public/track', trackData);

        // 4. Identify in Microsoft Clarity
        if (typeof (window as any).clarity === 'function') {
          (window as any).clarity('identify', user?.uid || guestId);
          (window as any).clarity('set', 'userType', user ? 'user' : 'guest');
        }

        // 5. Send to Google Analytics 4
        ReactGA.send({
          hitType: 'pageview',
          page: location.pathname + location.search,
          title: document.title || 'GoTripo',
        });
      } catch (err) {
        // Silent fail to not disturb user experience
        console.debug('Analytics ping skipped');
      }
    };

    // Delay slightly to ensure page title is updated if changed by React Helmet or similar
    const timer = setTimeout(track, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search, user?.uid]);
};
