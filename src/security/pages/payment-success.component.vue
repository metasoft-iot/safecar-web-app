<script>
import { AuthenticationService } from "../services/authentication.service";
import { ProfileApiService } from "../../shared/services/profile-api.service";

export default {
  name: 'payment-success',
  
  data() {
    return {
      loading: true,
      registering: false,
      error: false,
      authService: new AuthenticationService(),
      profileService: new ProfileApiService()
    };
  },
  
  methods: {
    async completeRegistration() {
      // Get pending registration data from sessionStorage
      const pendingData = sessionStorage.getItem('pendingRegistration');
      
      if (!pendingData) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No registration data found',
          life: 3000
        });
        this.error = true;
        this.loading = false;
        return;
      }
      
      const registration = JSON.parse(pendingData);
      this.registering = true;
      
      try {
        // 1. Sign Up
        await this.authService.signUp({
          email: registration.correoTaller,
          password: registration.password,
          confirmPassword: registration.password,
          roles: ["ROLE_WORKSHOP"]
        });

        // 2. Auto Sign In
        const signInResponse = await this.authService.signIn({
          email: registration.correoTaller,
          password: registration.password
        });
        
        const token = signInResponse.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', signInResponse.data.id);
        localStorage.setItem('email', signInResponse.data.username);

        // 3. Create Business Profile
        await this.profileService.createBusinessProfile(registration.correoTaller, {
          businessName: registration.nombreTaller,
          ruc: registration.ruc,
          businessAddress: registration.direccionTaller,
          contactPhone: registration.telefonoTaller,
          contactEmail: registration.correoTaller,
          description: ''
        });
        
        // 4. Store plan info
        localStorage.setItem('workshopPlan', registration.planType);
        
        // Clear pending registration
        sessionStorage.removeItem('pendingRegistration');
        
        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Registration completed successfully!',
          life: 3000
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          this.$router.push({ name: 'home' });
        }, 2000);
        
      } catch (error) {
        console.error('Registration error:', error);
        this.error = true;
        
        let errorMessage = 'Registration failed';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      } finally {
        this.loading = false;
        this.registering = false;
      }
    }
  },
  
  mounted() {
    // Complete registration automatically when page loads
    this.completeRegistration();
  }
};
</script>

<template>
  <pv-toast />
  
  <div class="w-full h-screen flex align-items-center justify-content-center" style="background-color: var(--color-background);">
    <div class="text-center p-6 surface-card border-round-lg shadow-4" style="max-width: 500px;">
      <!-- Loading State -->
      <div v-if="loading && !error">
        <div class="mb-4">
          <i class="pi pi-spin pi-spinner text-6xl text-primary"></i>
        </div>
        <h2 class="text-3xl font-bold text-900 mb-2">{{ registering ? 'Completing Registration...' : 'Processing Payment...' }}</h2>
        <p class="text-600">{{ registering ? 'Creating your workshop account' : 'Please wait while we process your payment' }}</p>
        <pv-progress-bar mode="indeterminate" class="mt-4" style="height: 6px;" />
      </div>
      
      <!-- Success State -->
      <div v-else-if="!loading && !error">
        <div class="mb-4">
          <i class="pi pi-check-circle text-6xl text-green-500"></i>
        </div>
        <h2 class="text-3xl font-bold text-900 mb-2">Payment Successful!</h2>
        <p class="text-600 mb-4">Your subscription is now active and your account has been created.</p>
        <p class="text-500 text-sm">Redirecting to dashboard...</p>
      </div>
      
      <!-- Error State -->
      <div v-else>
        <div class="mb-4">
          <i class="pi pi-times-circle text-6xl text-red-500"></i>
        </div>
        <h2 class="text-3xl font-bold text-900 mb-2">Registration Failed</h2>
        <p class="text-600 mb-4">There was an error completing your registration.</p>
        <pv-button 
          label="Try Again" 
          icon="pi pi-refresh"
          class="p-button-primary"
          @click="$router.push({ name: 'sign-up' })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
