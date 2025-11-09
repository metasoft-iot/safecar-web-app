<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import stripePromise from '@/utils/stripe-config';
import { SubscriptionApiService } from "@/subscriptions/services/subscription-api.service";
import { Payment } from "@/subscriptions/models/payment.entity"; 

// --- Props y eventos ---
const props = defineProps({
  selectedPlan: Object,
});
const emit = defineEmits(['payment-success']);
const subscriptionService = new SubscriptionApiService();

// --- Variables reactivas ---
const toast = useToast();
const isLoading = ref(false);
const cardholderName = ref('');
const billingEmail = ref('');
const country = ref('PE');
const showErrors = ref(false);
let cardElement = null;

// --- Stripe setup ---
onMounted(async () => {
  try {
    const stripe = await stripePromise;
    const elements = stripe.elements({
      appearance: {
        theme: 'flat',
        variables: {
          colorPrimary: '#2563eb',
          colorText: '#111827',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSizeBase: '16px',
        },
      },
    });

    cardElement = elements.create('card', { hidePostalCode: true });
    cardElement.mount('#card-element');
  } catch (error) {
    console.error('Error al montar Stripe Elements:', error);
    toast.add({
      severity: 'error',
      summary: 'Error de Stripe',
      detail: 'No se pudo inicializar el método de pago.',
    });
  }
});

onBeforeUnmount(() => {
  if (cardElement) cardElement.unmount();
});

// --- Validación del formulario ---
const isFormValid = computed(() => {
  return (
    billingEmail.value.trim() !== '' &&
    cardholderName.value.trim() !== '' &&
    !isLoading.value
  );
});

// --- Acción principal ---
const subscribeNow = async () => {
  showErrors.value = true;

  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Campos incompletos',
      detail: 'Por favor completa todos los campos requeridos.',
    });
    return;
  }

  if (!props.selectedPlan?.stripePriceId) {
    toast.add({
      severity: 'warn',
      summary: 'Plan no seleccionado',
      detail: 'Por favor selecciona un plan antes de continuar.',
    });
    return;
  }

  isLoading.value = true;

  try {
    const stripe = await stripePromise;

    // ✅ 1. Crear método de pago en Stripe
    const { paymentMethod, error: paymentError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName.value,
        email: billingEmail.value,
      },
    });

    if (paymentError) {
      toast.add({
        severity: 'error',
        summary: 'Error en el pago',
        detail: paymentError.message,
      });
      isLoading.value = false;
      return;
    }

    // ✅ 2. Crear entidad Payment antes de enviar al backend
    const paymentEntity = new Payment(
      cardholderName.value,
      billingEmail.value,
      props.selectedPlan.id,
      props.selectedPlan.price,
      paymentMethod.id,
      'pending'
    );

    // ✅ 3. Llamada al backend (service)
    const data = await subscriptionService.createSubscription(paymentEntity);

    if (!data.clientSecret)
      throw new Error('El backend no devolvió el clientSecret.');

    // ✅ 4. Confirmar el pago en Stripe
    const { error, setupIntent } = await stripe.confirmCardSetup(
      data.clientSecret,
      {
        payment_method: paymentMethod.id,
      }
    );

    if (error) {
      toast.add({
        severity: 'error',
        summary: 'Error en el pago',
        detail: error.message,
      });
    } else if (setupIntent.status === 'succeeded') {
      toast.add({
        severity: 'success',
        summary: 'Suscripción Exitosa',
        detail: 'Tu plan se ha activado correctamente.',
      });
      emit('payment-success');
    } else {
      toast.add({
        severity: 'info',
        summary: 'Procesando',
        detail: 'El pago está en proceso o requiere acción adicional.',
      });
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Fallo al suscribirse: ${msg}`,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="payment-form">
    <h3 class="form-title">Información de Contacto y Pago</h3>

    <!-- 🔹 Contacto -->
    <div class="section">
      <h4>Datos de contacto</h4>

      <div class="field">
        <label>Correo electrónico <span>*</span></label>
        <input
          v-model="billingEmail"
          type="email"
          placeholder="ejemplo@correo.com"
          class="input"
          :class="{ 'input-error': showErrors && !billingEmail }"
        />
        <small v-if="showErrors && !billingEmail" class="error-text">
          Este campo es obligatorio
        </small>
      </div>

      <div class="field">
        <label>Nombre del titular de la tarjeta <span>*</span></label>
        <input
          v-model="cardholderName"
          type="text"
          placeholder="Ej: Juan Pérez"
          class="input"
          :class="{ 'input-error': showErrors && !cardholderName }"
        />
        <small v-if="showErrors && !cardholderName" class="error-text">
          Este campo es obligatorio
        </small>
      </div>
    </div>

    <!-- 🔹 Método de pago -->
    <div class="section">
      <h4>Método de pago</h4>

      <div class="field">
        <label>País o región</label>
        <select v-model="country" class="input">
          <option value="PE">Perú</option>
          <option value="CL">Chile</option>
          <option value="CO">Colombia</option>
          <option value="MX">México</option>
          <option value="OTRO">Otro...</option>
        </select>
      </div>

      <div class="field">
        <label>Información de la tarjeta <span>*</span></label>
        <div id="card-element" class="card-box"></div>
      </div>
    </div>

    <Button
      label="Completar Suscripción"
      icon="pi pi-lock"
      class="submit-btn"
      :loading="isLoading"
      @click="subscribeNow"
      :disabled="!isFormValid"
    />
  </div>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 1.75rem;
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

.section h4 {
  font-size: 1.05rem;
  color: #111827;
  font-weight: 600;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

label span {
  color: #dc2626;
}

.input {
  padding: 0.7rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}
.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2;
}
.error-text {
  color: #dc2626;
  font-size: 0.85rem;
  margin-left: 2px;
}

.card-box {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  min-height: 46px;
  background-color: #fafafa;
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
</style>
