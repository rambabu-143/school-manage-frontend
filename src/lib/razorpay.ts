// Thin wrapper around Razorpay's Checkout.js - loaded on demand (only when
// a parent actually opens the payment sheet), not on every page load.

interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description?: string
  handler: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
  modal?: { ondismiss?: () => void }
  theme?: { color?: string }
}

interface RazorpayCheckout {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

let loadPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = CHECKOUT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null
      reject(new Error("Could not load Razorpay checkout"))
    }
    document.body.appendChild(script)
  })
  return loadPromise
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<void> {
  await loadRazorpayScript()
  if (!window.Razorpay) throw new Error("Razorpay checkout failed to load")
  new window.Razorpay(options).open()
}
