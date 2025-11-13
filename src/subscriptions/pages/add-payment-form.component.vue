<template>
  <section class="add-pm-wrapper">
    <header class="page-header">
      <h1>{{ $t("subscription.add_payment_method") }}</h1>
      <p class="muted">{{ $t("subscription.new_payment_method") }}</p>
    </header>

    <div class="form-container">
      <div class="card">
        <h3 class="mb-3">Información de la Tarjeta</h3>

        <form @submit.prevent="confirmSetup">
          <div class="p-field mb-4">
            <label for="cardholder-name" class="p-d-block mb-2">
              Nombre del Titular
              <span class="required-star">*</span>
            </label>
            <input
              id="cardholder-name"
              v-model="cardholderName"
              type="text"
              class="p-inputtext p-component p-inputfield w-full"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div class="p-field mb-4">
            <label class="p-d-block mb-2">
              Información de la Tarjeta
              <span class="required-star">*</span>
            </label>
            <div id="card-element" class="stripe-card-element">
              <div v-if="!stripeReady" class="loading-text">
                Cargando formulario de pago...
              </div>
            </div>
            <div id="card-errors" role="alert" class="error-text">
              {{ cardError }}
            </div>
          </div>

          <button
            type="submit"
            class="p-button p-component p-button-primary w-full"
            :disabled="isProcessing || !stripeReady"
          >
            <span v-if="isProcessing" class="p-button-icon p-c pi pi-spinner pi-spin"></span>
            <span v-else class="p-button-label">
              {{ $t("subscription.save_payment_method_btn") }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

// 🛑 IMPORTACIONES CRÍTICAS:
// Asegúrate de que estas rutas sean correctas en tu proyecto.
import stripePromise from '@/utils/stripe-config';
import { SubscriptionApiService } from "@/subscriptions/services/subscription-api.service";

// --- State Management ---
const toast = useToast();
const router = useRouter();
const apiService = new SubscriptionApiService();

const isProcessing = ref(false);
const stripeReady = ref(false);
const cardholderName = ref('');
const cardError = ref('');

let stripe = null;
let cardElement = null;
let clientSecret = null;

const initializeStripe = async () => {
  isProcessing.value = true;
  cardError.value = '';

  try {
    const setupIntentData = await apiService.getSetupIntentClientSecret(); 
    clientSecret = setupIntentData.clientSecret;

    if (!clientSecret) {
      throw new Error("No se pudo obtener el SetupIntent del servidor.");
    }
    
    // 2. Cargar Stripe y Elements
    stripe = await stripePromise;
    const elements = stripe.elements();

    // 3. Crear el Card Element
    cardElement = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '16px',
          '::placeholder': { color: '#9ca3af' },
        },
        invalid: {
          color: '#ef4444',
        },
      },
    });

    // 4. Montar el Card Element en el DOM
    cardElement.mount('#card-element');
    stripeReady.value = true;

    // 5. Escuchar por errores
    cardElement.on('change', (event) => {
      cardError.value = event.error ? event.error.message : '';
    });

  } catch (error) {
    console.error("Error al inicializar Stripe:", error);
    cardError.value = error.message || "Error al cargar el formulario de pago.";
    toast.add({
      severity: 'error',
      summary: 'Error de Conexión',
      detail: 'No se pudo inicializar Stripe. Intenta recargar la página.',
      life: 5000,
    });
  } finally {
    isProcessing.value = false;
  }
};


const confirmSetup = async () => {
  if (isProcessing.value || !cardholderName.value || cardError.value || !clientSecret) return;
  
  isProcessing.value = true;

  try {
    const { setupIntent, error } = await stripe.confirmCardSetup(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName.value,
          },
        },
      }
    );

    if (error) {
      // Mostrar errores de confirmación (ej: tarjeta rechazada)
      cardError.value = error.message || 'Error al procesar la tarjeta.';
      toast.add({
        severity: 'error',
        summary: 'Error de Pago',
        detail: cardError.value,
        life: 5000,
      });
    } else if (setupIntent.status === 'succeeded') {
      // Éxito: El método de pago ha sido guardado
      
      // 🛑 PASO OPCIONAL/RECOMENDADO: 
      // Si tu backend necesita el ID del método de pago para asociarlo al usuario:
      await apiService.savePaymentMethodId(setupIntent.payment_method);
      
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Método de pago agregado correctamente.',
        life: 3000,
      });

      // Redirigir de vuelta a la vista de resumen de suscripción
      router.push({ name: 'subscriptions-overview' });

    } else {
       // SetupIntent en estado 'processing' o algo inesperado
       toast.add({
        severity: 'warn',
        summary: 'Procesando',
        detail: 'El método de pago está siendo procesado.',
        life: 4000,
      });
    }

  } catch (err) {
    console.error("Error en confirmCardSetup:", err);
    toast.add({
      severity: 'error',
      summary: 'Error del Sistema',
      detail: 'Ocurrió un error inesperado al guardar el pago.',
      life: 5000,
    });
  } finally {
    isProcessing.value = false;
  }
};

// --- Ciclo de Vida ---
onMounted(() => {
  initializeStripe();
});

onUnmounted(() => {
  if (cardElement) {
    cardElement.unmount();
  }
});

</script>

<style scoped>
.add-pm-wrapper {
  padding: 24px;
}
.page-header h1 {
  margin: 0 0 4px;
  font-size: 26px;
}
.muted {
  color: #6b7280;
  margin: 0 0 24px;
}
.form-container {
  max-width: 600px;
  margin: 0 auto;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #eef0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.required-star {
  color: #ef4444;
}
.p-inputtext.w-full {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
/* Estilo para el contenedor del widget de Stripe */
.stripe-card-element {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  min-height: 40px; /* Asegura que no se colapse */
  transition: border-color 0.2s;
}
.stripe-card-element:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}
.loading-text {
    color: #9ca3af;
    font-size: 0.95rem;
    line-height: 20px;
}
.error-text {
  color: #ef4444;
  margin-top: 8px;
  font-size: 0.85rem;
}
.p-button-primary {
  background-color: #3b5cff;
  border-color: #3b5cff;
  color: white;
  padding: 12px;
  border-radius: 8px;
}
.p-button-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}
.p-button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
}
.pi-spin {
    animation: p-progress-spinner-color 1s ease-in-out infinite;
}
</style>