<template>
  <div class="payment-success-container">
    <div class="success-card">
      <div class="success-icon">
        <i class="pi pi-check-circle"></i>
      </div>
      
      <h1>¡Pago Exitoso!</h1>
      <p class="success-message">
        Tu suscripción ha sido activada correctamente.
      </p>
      
      <div class="session-info" v-if="sessionId">
        <p class="session-id"><strong>ID de Sesión:</strong> {{ sessionId }}</p>
      </div>

      <div class="actions">
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
  name: 'payment-success',
  data() {
    return {
      sessionId: null
    };
  },
  mounted() {
    // Obtener session_id de la URL
    const params = new URLSearchParams(window.location.search);
    this.sessionId = params.get('session_id');
  },
  methods: {
    goToDashboard() {
      this.$router.push({ name: 'mechanic-dashboard' });
    }
  }
};
</script>

<style scoped>
.payment-success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.success-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  font-size: 5rem;
  color: #10b981;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.session-info {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.session-id {
  font-size: 0.9rem;
  color: #4b5563;
  word-break: break-all;
}

.actions {
  display: flex;
  justify-content: center;
}

.primary-btn {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
}
</style>
