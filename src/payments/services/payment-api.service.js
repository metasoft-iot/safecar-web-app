import http from "../../shared/services/http-common";

export class PaymentApiService {

    /**
     * Create a Stripe checkout session for subscription payment
     * @param {string} planType - Plan type (BASIC, PROFESSIONAL, PREMIUM)
     * @returns {Promise} Checkout session with sessionId
     */
    async createCheckoutSession(planType) {
        try {
            const response = await http.post('/payments/checkout-session', {
                planType: planType
            });
            return response.data;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    /**
     * Get available plans information
     * @returns {Array} Array of plan objects
     */
    getAvailablePlans() {
        return [
            {
                type: 'BASIC',
                name: 'Basic',
                price: 29.99,
                currency: 'USD',
                billingPeriod: 'month',
                features: [
                    'Up to 5 mechanics',
                    'Basic appointment management',
                    '50 appointments per month',
                    'Email support',
                    'Mobile app access'
                ],
                recommended: false
            },
            {
                type: 'PROFESSIONAL',
                name: 'Professional',
                price: 79.99,
                currency: 'USD',
                billingPeriod: 'month',
                features: [
                    'Up to 15 mechanics',
                    'Advanced appointment management',
                    'Unlimited appointments',
                    'Priority email support',
                    'Mobile app access',
                    'Analytics and reports',
                    'Customer notifications'
                ],
                recommended: true
            },
            {
                type: 'PREMIUM',
                name: 'Premium',
                price: 149.99,
                currency: 'USD',
                billingPeriod: 'month',
                features: [
                    'Unlimited mechanics',
                    'Full appointment management',
                    'Unlimited appointments',
                    '24/7 phone & email support',
                    'Mobile app access',
                    'Advanced analytics & AI insights',
                    'Customer notifications',
                    'Custom integrations',
                    'Dedicated account manager'
                ],
                recommended: false
            }
        ];
    }

    /**
     * Load Stripe.js library
     * @returns {Promise} Stripe instance
     */
    async loadStripe() {
        if (window.Stripe) {
            return window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        }

        // Load Stripe.js if not already loaded
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
   * Redirect to Stripe Checkout
   * Since the backend provides a sessionId, we construct the checkout URL and redirect
   * @param {string} sessionId - Stripe checkout session ID
   */
    async redirectToCheckout(sessionId) {
        try {
            // Stripe Checkout URL format (works with session ID)
            // The backend should return a checkout URL or we construct it
            // For now, we'll use window.location to redirect assuming backend provides the URL
            // Or we can use Stripe.js if available

            if (window.Stripe) {
                const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QRNxWRtjidxR8HjmFXL4q6SzgJQxlsxWp0S7DJJZGxNGXoNOMlQHO3eCaEBWdNbpXbL15R7iY9b3EFCVvMqYYgH00Q3L4lHwK');
                const { error } = await stripe.redirectToCheckout({ sessionId });

                if (error) {
                    console.error('Stripe redirect error:', error);
                    throw error;
                }
            } else {
                // Fallback: load Stripe.js then redirect
                await this.loadStripe();
                return this.redirectToCheckout(sessionId);
            }
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            throw error;
        }
    }
}
