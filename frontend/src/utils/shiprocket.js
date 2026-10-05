/**
 * Utility to load Shiprocket Checkout script and styles dynamically if not already in document
 */
export const loadShiprocketScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // Ensure hidden sellerDomain input exists
    let domainInput = document.getElementById("sellerDomain");
    if (!domainInput) {
      domainInput = document.createElement("input");
      domainInput.type = "hidden";
      domainInput.id = "sellerDomain";
      // Defaults to current hostname or onrender
      domainInput.value = window.location.hostname.includes("localhost")
        ? "wooff-frontend.onrender.com"
        : window.location.hostname;
      document.body.appendChild(domainInput);
    }

    // Ensure CSS is loaded
    const cssId = "shiprocket-checkout-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://checkout-ui.shiprocket.com/assets/styles/shopify.css";
      document.head.appendChild(link);
    }

    // If HeadlessCheckout already available
    if (window.HeadlessCheckout) {
      resolve(true);
      return;
    }

    const scriptSrc = "https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js";
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
