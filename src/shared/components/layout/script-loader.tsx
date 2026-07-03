import Script from 'next/script';

export function ScriptLoader() {
  return (
    <>
      {/* Analytics Script (Loaded lazily after interaction) */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* Stripe.js - loaded async for checkout performance */}
      <Script 
        src="https://js.stripe.com/v3/" 
        strategy="lazyOnload" 
      />
    </>
  );
}
