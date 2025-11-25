<script>
export default {
  name: 'payment-cancel',
  
  data() {
    return {
      countdown: 5
    };
  },
  
  methods: {
    goBackToRegistration() {
      this.$router.push({ name: 'sign-up' });
    },
    
    startCountdown() {
      const interval = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(interval);
          this.goBackToRegistration();
        }
      }, 1000);
    }
  },
  
  mounted() {
    this.startCountdown();
  }
};
</script>

<template>
  <pv-toast />
  
  <div class="w-full h-screen flex align-items-center justify-content-center" style="background-color: var(--color-background);">
    <div class="text-center p-6 surface-card border-round-lg shadow-4" style="max-width: 500px;">
      <!-- Icon -->
      <div class="mb-4">
        <i class="pi pi-exclamation-triangle text-6xl text-orange-500"></i>
      </div>
      
      <!-- Message -->
      <h2 class="text-3xl font-bold text-900 mb-2">Payment Cancelled</h2>
      <p class="text-600 mb-4">You have cancelled the payment process. No charges have been made to your account.</p>
      
      <!-- Info -->
      <div class="surface-100 border-round p-3 mb-4">
        <p class="text-sm text-700 m-0">
          <i class="pi pi-info-circle mr-2"></i>
          Your workshop information has been saved. You can complete the payment process at any time.
        </p>
      </div>
      
      <!-- Countdown -->
      <p class="text-500 text-sm mb-4">
        Redirecting to registration in {{ countdown }} seconds...
      </p>
      
      <!-- Actions -->
      <div class="flex gap-2 justify-content-center">
        <pv-button 
          label="Back to Registration" 
          icon="pi pi-arrow-left"
          class="p-button-primary"
          @click="goBackToRegistration"
        />
        <pv-button 
          label="Contact Support" 
          icon="pi pi-envelope"
          class="p-button-outlined"
          @click="$router.push({ name: 'contact' })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
