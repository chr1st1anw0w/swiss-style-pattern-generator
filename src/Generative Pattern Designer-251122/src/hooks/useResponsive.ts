import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
  height: number;
}

/**
 * Hook to detect device type and screen size
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        width: 1920,
        height: 1080,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      width,
      height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        width,
        height,
      });
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

/**
 * Hook to detect if device is touch-enabled
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0;
      setIsTouch(hasTouch);
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Hook to detect device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'landscape';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to get responsive canvas size
 */
export function useResponsiveCanvas(): {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
} {
  const { isMobile, isTablet, width, height } = useResponsive();

  if (isMobile) {
    // Mobile: Full width minus padding, with bottom panel space
    return {
      width: Math.min(width - 32, 600),
      height: Math.min(height - 200, 600), // Account for bottom panel
      maxWidth: width - 32,
      maxHeight: height - 200,
    };
  }

  if (isTablet) {
    // Tablet: Larger canvas
    return {
      width: Math.min(width - 64, 800),
      height: Math.min(height - 120, 800),
      maxWidth: width - 64,
      maxHeight: height - 120,
    };
  }

  // Desktop: Fixed or full viewport
  return {
    width: 800,
    height: 800,
    maxWidth: width - 400, // Account for sidebar
    maxHeight: height - 80,
  };
}
