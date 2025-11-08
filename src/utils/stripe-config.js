import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = 'pk_test_TU_CLAVE_PUBLICA_AQUI'; 

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default stripePromise;