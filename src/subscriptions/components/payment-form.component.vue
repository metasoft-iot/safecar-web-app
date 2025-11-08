<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
// Importa tu promesa de Stripe (asegúrate de que carga la instancia 'stripe')
import stripePromise from '@/utils/stripe-config'; 

const props = defineProps({
  // Se espera que contenga al menos selectedPlan.stripePriceId
  selectedPlan: Object, 
});
const emit = defineEmits(['payment-success']);

const toast = useToast();
const isLoading = ref(false);
const cardholderName = ref('');
const billingEmail = ref('');
const cardType = ref('credito'); 
const registrationDate = ref(''); 
let cardElement = null; // Referencia al Stripe Element

// --- 1. Inicialización y Montaje del Elemento Card de Stripe ---
onMounted(async () => {
  try {
    const stripe = await stripePromise;
    const elements = stripe.elements({
      appearance: { 
        theme: 'flat',
        variables: {
          colorPrimary: '#6366f1', 
          colorText: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSize: '15px',
        }
      },
    });
    
    cardElement = elements.create('card', {
      hidePostalCode: true,
    });
    cardElement.mount('#card-element');
  } catch (error) {
     console.error("Error al montar Stripe Elements:", error);
     toast.add({ severity: 'error', summary: 'Error de Stripe', detail: 'No se pudo cargar la librería de pago.' });
  }
});

onBeforeUnmount(() => {
  if (cardElement) cardElement.unmount();
});

// --- 2. Lógica de Suscripción Principal ---
const subscribeNow = async () => {
  // --- Validaciones iniciales ---
  if (!props.selectedPlan?.stripePriceId) {
    toast.add({ severity: 'warn', summary: 'Plan no seleccionado', detail: 'Por favor, selecciona un plan.' });
    return;
  }
  if (!cardholderName.value || !billingEmail.value) {
    toast.add({ severity: 'warn', summary: 'Campos incompletos', detail: 'Completa todos los campos requeridos.' });
    return;
  }
  
  isLoading.value = true;

  try {
    const stripe = await stripePromise;

    // 1️⃣ Llamada a tu backend: Crea la Suscripción y un SetupIntent
    const { data } = await axios.post('/api/subscription/create', {
      priceId: props.selectedPlan.stripePriceId,
      email: billingEmail.value,
      cardType: cardType.value,
      registrationDate: registrationDate.value,
      cardholderName: cardholderName.value, 
    });

    if (!data.clientSecret) {
        throw new Error('El backend no devolvió el clientSecret necesario.');
    }

    // 2️⃣ Confirmar la configuración de pago (SetupIntent)
    const { error, setupIntent } = await stripe.confirmCardSetup(data.clientSecret, {
      payment_method: {
        card: cardElement, // Referencia al iFrame de Stripe
        billing_details: {
          name: cardholderName.value,
          email: billingEmail.value,
        },
      },
    });

    if (error) {
      toast.add({ severity: 'error', summary: 'Error de pago', detail: error.message });
    } else if (setupIntent.status === 'succeeded') {
      toast.add({ severity: 'success', summary: 'Suscripción exitosa', detail: 'Tu plan se ha activado.' });
      emit('payment-success');
    } else {
       toast.add({ severity: 'info', summary: 'Procesando', detail: 'El pago está en proceso o requiere acción adicional.' });
    }

  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    toast.add({ severity: 'error', summary: 'Error', detail: `Fallo al suscribirse: ${msg}` });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="payment-form surface-card p-4 border-round shadow-1">
    <h3 class="mb-3">Método de Pago 💳</h3>

    <div class="field mb-3">
      <label>Nombre del titular</label>
      <input v-model="cardholderName" type="text" class="p-inputtext p-inputtext-sm w-full" placeholder="Ej: Juan Pérez" />
    </div>

    <div class="field mb-3">
      <label>Correo electrónico</label>
      <input v-model="billingEmail" type="email" class="p-inputtext p-inputtext-sm w-full" placeholder="ejemplo@correo.com" />
    </div>

    <div class="field mb-3">
      <label>Tipo de tarjeta</label>
      <select v-model="cardType" class="p-inputtext p-inputtext-sm w-full">
        <option value="credito">Crédito</option>
        <option value="debito">Débito</option>
      </select>
    </div>

    <div class="field mb-3">
      <label>Fecha de inscripción</label>
      <input v-model="registrationDate" type="date" class="p-inputtext p-inputtext-sm w-full" />
    </div>

    <div class="field mb-4">
      <label>Información de la tarjeta</label>
      <div id="card-element" class="p-inputtext w-full border-round border-1 surface-border p-2"></div>
    </div>

    <Button
      label="Suscribirse ahora"
      icon="pi pi-check"
      class="w-full"
      :loading="isLoading"
      @click="subscribeNow"
      :disabled="isLoading || !cardholderName || !billingEmail"
    />
  </div>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  margin: auto; 
}
.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}
#card-element {
    line-height: 1.5;
    min-height: 38px; 
    display: flex; 
    align-items: center;
}
</style>