import { loadStripe } from '@stripe/stripe-js';

// Tu clave pública de Stripe (obtenla de tu dashboard de Stripe)
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51QS1IjRs9YU1bY3oZqL2W0bk8ePHr50f4ZXGVK1PvwPw3yDLKSJj69xdLiXv1lj7a1aq6f9U4lhdWJ67jnKfCXwZ00z3QVkxN7';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default stripePromise;
