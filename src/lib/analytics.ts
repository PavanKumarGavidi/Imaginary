/**
 * Google Analytics 4 & Search Console integration.
 * 
 * Set VITE_GA_MEASUREMENT_ID in your environment (e.g., G-XXXXXXXXXX)
 * to enable analytics. Leave empty to disable.
 * 
 * Set VITE_GSC_VERIFICATION to verify site ownership in Google Search Console.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION as string | undefined;

let initialized = false;

/**
 * Initialize Google Analytics and Search Console verification.
 * Call once on app load.
 */
export function initAnalytics(): void {
  // Google Search Console verification
  if (GSC_VERIFICATION) {
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = GSC_VERIFICATION;
    document.head.appendChild(meta);
    console.log('[GSC] Verification meta tag added');
  }

  // Google Analytics
  if (!GA_ID || initialized) return;
  
  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });
  
  initialized = true;
  console.log('[Analytics] GA4 initialized:', GA_ID);
}

/**
 * Track a page view. Call on route changes.
 */
export function trackPageView(path: string, title?: string): void {
  if (!GA_ID || !initialized || !window.gtag) return;
  
  window.gtag('config', GA_ID, {
    page_title: title || document.title,
    page_location: `${window.location.origin}${path}`,
    page_path: path
  });
}

/**
 * Track a custom event.
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (!GA_ID || !initialized || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
}

/**
 * Track a booking submission.
 */
export function trackBooking(ref: string, packageId: string, amount: number): void {
  trackEvent('booking_submit', 'Booking', `${packageId} - ${ref}`, amount);
  
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: ref,
      value: amount,
      currency: 'USD',
      items: [{
        item_name: packageId,
        item_category: 'Photography Session'
      }]
    });
  }
}

/**
 * Track a payment completion.
 */
export function trackPayment(ref: string, amount: number): void {
  trackEvent('payment_complete', 'Payment', ref, amount);
}

// Extend Window type for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
