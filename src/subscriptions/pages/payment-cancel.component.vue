<template>
  <div class="payment-cancel-container">
    <div class="cancel-card">
      <div class="cancel-icon">
        <i class="pi pi-times-circle"></i>
      </div>
      
      <h1>Pago Cancelado</h1>
      <p class="cancel-message">
        Has cancelado el proceso de pago. No se ha realizado ningún cargo.
      </p>

      <div class="actions">
        <pv-button 
          label="Volver a Suscripciones" 
          icon="pi pi-arrow-left"
          @click="goToSubscriptions"
          class="secondary-btn"
          outlined
        />
        <pv-button 
          label="Ir al Dashboard" 
          icon="pi pi-home"
          @click="goToDashboard"
          class="primary-btn"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'payment-cancel',
  methods: {
    goToSubscriptions() {
      this.$router.push({ name: 'subscriptions-management' });
    },
    goToDashboard() {
      this.$router.push({ name: 'mechanic-dashboard' });
    }
  }
};
</script>

<style scoped>
.payment-cancel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  padding: 2rem;
}

.cancel-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.cancel-icon {
  font-size: 5rem;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.cancel-message {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
</style>
