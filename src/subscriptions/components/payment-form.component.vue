<script>
import { SubscriptionApiService } from "@/subscriptions/services/subscription-api.service";
import { loadStripe } from '@stripe/stripe-js';
import stripePromise from '@/utils/stripe-config';

export default {
  name: 'payment-form',
  props: {
    selectedPlan: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      subscriptionService: null,
      isLoading: false
    };
  },
  created() {
    this.subscriptionService = new SubscriptionApiService();
  },
  methods: {
    async subscribeNow() {
      if (!this.selectedPlan?.type) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Plan no seleccionado',
          detail: 'Por favor selecciona un plan antes de continuar.',
        });
        return;
      }

      this.isLoading = true;

      try {
        const { STRIPE_CONFIG } = await import('@/subscriptions/config/stripe-payment-config.js');
        
        if (STRIPE_CONFIG.USE_PAYMENT_LINKS) {
          // ✅ MODO 1: Payment Links (Testing - No requiere backend)
          console.log('Using Payment Link mode for plan:', this.selectedPlan.type);
          const paymentUrl = STRIPE_CONFIG.getPaymentLinkUrl(this.selectedPlan.type);
          
          // Redirigir directamente al Payment Link de Stripe
          window.location.href = paymentUrl;
          
        } else {
          // ✅ MODO 2: Checkout Sessions (Producción - Requiere backend)
          console.log('Using Checkout Session mode for plan:', this.selectedPlan.type);
          
          // 1. Crear checkout session en el backend
          const data = await this.subscriptionService.createSubscription({
            planType: this.selectedPlan.type
          });

          if (!data.sessionId) {
            throw new Error('El backend no devolvió el sessionId.');
          }

          // 2. Redirigir a Stripe Checkout
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
          });

          if (error) {
            this.$toast.add({
              severity: 'error',
              summary: 'Error en el pago',
              detail: error.message,
            });
          }
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `Fallo al procesar el pago: ${msg}`,
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<template>
  <div class="payment-form">
    <h3 class="form-title">Plan Seleccionado</h3>

    <!-- 🔹 Resumen del Plan -->
    <div class="plan-summary" v-if="selectedPlan">
      <div class="plan-header">
        <h4>{{ selectedPlan.name }}</h4>
        <div class="plan-price">
          <span class="currency">S/.</span>
          <span class="amount">{{ selectedPlan.price }}</span>
          <span class="period">/mes</span>
        </div>
      </div>
      
      <div class="plan-features">
        <ul>
          <li v-for="(feature, index) in selectedPlan.features" :key="index">
            <i class="pi pi-check"></i>
            {{ feature }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 🔹 Información de Pago con Stripe -->
    <div class="payment-info">
      <div class="info-box">
        <i class="pi pi-shield" style="font-size: 2rem; color: #2563eb;"></i>
        <div class="info-text">
          <h4>Pago Seguro con Stripe</h4>
          <p>Serás redirigido a una página segura de Stripe para completar tu pago.</p>
        </div>
      </div>
    </div>

    <!-- 🔹 Botón de Suscripción -->
    <pv-button
      label="Proceder al Pago"
      icon="pi pi-lock"
      class="submit-btn"
      :loading="isLoading"
      @click="subscribeNow"
      :disabled="!selectedPlan"
    />

    <p class="security-note">
      <i class="pi pi-shield"></i>
      Tu información de pago está protegida con encriptación de nivel bancario
    </p>
  </div>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 1.75rem 2.75rem 7rem;
  background-color: #ffffff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.form-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e3a8a;
  text-align: left;
  margin-bottom: 0.5rem;
}

.plan-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.plan-header h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.plan-price .currency {
  font-size: 1.2rem;
  font-weight: 600;
}

.plan-price .amount {
  font-size: 2.5rem;
  font-weight: 700;
}

.plan-price .period {
  font-size: 1rem;
  opacity: 0.9;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.plan-features li i {
  font-size: 1.1rem;
  color: #10b981;
  background: white;
  border-radius: 50%;
  padding: 0.2rem;
}

.payment-info {
  margin: 1rem 0;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
}

.info-text h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1e3a8a;
}

.info-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  font-size: 1rem;
  padding: 0.9rem;
  border-radius: 10px;
  background-color: #2563eb !important;
  border: none !important;
  color: white !important;
  font-weight: 600;
  transition: background 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1d4ed8 !important;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.security-note {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.security-note i {
  color: #10b981;
}
</style>
