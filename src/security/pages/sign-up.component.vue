<script>
import {AuthenticationService} from "../services/authentication.service";
import {ProfileApiService} from "../../shared/services/profile-api.service";
//import PlanSelection from "../../payments/components/plan-selection.component.vue";


export default {
  name: "sign-up",
  components: {
  },

  data() {
    return {
      // Step tracking (simplified - no plan selection)
      currentStep: 1,
      totalSteps: 1,
      
      // Datos del Taller
      nombreTaller: '',
      ruc: '',
      direccionTaller: '',
      correoTaller: '',
      telefonoTaller: '',
      loading: false,

      // Datos del Propietario / Cuenta (Simplificado)
      password: '',
      confirmPassword: '',
      aceptarTerminos: false,

      // Payment data
      selectedPlan: null,
      checkoutSessionId: null,

      authenticationService: new AuthenticationService(),
      profileService: new ProfileApiService(),

      touched: {
        nombreTaller: false,
        ruc: false,
        direccionTaller: false,
        correoTaller: false,
        telefonoTaller: false,
        password: false,
        confirmPassword: false,
        aceptarTerminos: false
      }
    };
  },

  computed: {
    isFormValid() {
      return this.nombreTaller &&
             this.ruc &&
             this.direccionTaller &&
             this.correoTaller &&
             this.telefonoTaller &&
             this.password &&
             this.confirmPassword &&
             this.aceptarTerminos &&
             this.password === this.confirmPassword;
    },

    passwordsMatch() {
      return this.password === this.confirmPassword;
    }
  },

  methods: {
    // Navigate between steps
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    // Step 1: Validate workshop info
    async validateWorkshopInfo() {
      // Mark fields as touched
      Object.keys(this.touched).forEach(key => {
        this.touched[key] = true;
      });

      if (!this.isFormValid) {
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Please complete all fields correctly', 
          life: 3000 
        });
        return;
      }

      if (!this.passwordsMatch) {
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Passwords do not match', 
          life: 3000 
        });
        return;
      }

      if (!this.aceptarTerminos) {
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'You must accept the terms and conditions', 
          life: 3000 
        });
        return;
      }

      // Complete registration directly (no plan selection step)
      await this.completeRegistration();
    },
    
    // Step 2: Handle plan selection
    onPlanSelected(plan) {
      this.selectedPlan = plan;
      console.log('Plan selected:', plan);
    },
    
    // Step 2: Handle checkout session created
    async onCheckoutSessionCreated({ sessionId, planType }) {
      this.checkoutSessionId = sessionId;
      
      // Store registration data in sessionStorage for after payment
      sessionStorage.setItem('pendingRegistration', JSON.stringify({
        nombreTaller: this.nombreTaller,
        ruc: this.ruc,
        direccionTaller: this.direccionTaller,
        correoTaller: this.correoTaller,
        telefonoTaller: this.telefonoTaller,
        password: this.password,
        planType: planType,
        checkoutSessionId: sessionId
      }));
      
      this.$toast.add({
        severity: 'info',
        summary: 'Redirecting to Payment',
        detail: 'You will be redirected to Stripe Checkout...',
        life: 2000
      });
      
      // Note: PlanSelection component will handle the redirect
    },
    
    // Complete registration after successful payment
    async completeRegistration() {
      const user = {
        email: this.correoTaller,
        password: this.password,
        confirmPassword: this.confirmPassword,
        roles: ["ROLE_WORKSHOP"]
      };

      try {
        this.loading = true;
        
        // 1. Sign Up
        await this.authenticationService.signUp(user);

        // 2. Auto Sign In to get token
        const signInResponse = await this.authenticationService.signIn({
          email: user.email,
          password: user.password
        });
        
        const token = signInResponse.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', signInResponse.data.id);
        localStorage.setItem('email', signInResponse.data.username);

        // 3. Create Business Profile
        const profileData = {
          businessName: this.nombreTaller,
          ruc: this.ruc,
          businessAddress: this.direccionTaller,
          contactPhone: this.telefonoTaller,
          contactEmail: this.correoTaller,
          description: ''
        };

        await this.profileService.createBusinessProfile(this.correoTaller, profileData);
        
        // 4. Store selected plan info
        if (this.selectedPlan) {
          localStorage.setItem('workshopPlan', this.selectedPlan.type);
        }
        
        this.$toast.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Registration completed successfully!', 
          life: 3000 
        });
        
        // Clear pending registration
        sessionStorage.removeItem('pendingRegistration');
        
        // Redirect to dashboard
        setTimeout(() => {
          this.$router.push({ name: 'mechanic-dashboard' });
        }, 2000);

      } catch (error) {
        console.error(error);
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.response?.data?.message) {
          if (error.response.data.message.includes('Email already exists')) {
            errorMessage = 'This email is already registered. Please use a different email or log in.';
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          if (error.message.includes('Email already exists')) {
            errorMessage = 'This email is already registered. Please use a different email or log in.';
          } else {
            errorMessage = error.message;
          }
        }
        
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: errorMessage, 
          life: 5000 
        });
      } finally {
        this.loading = false;
      }
    },

    onFieldBlur(fieldName) {
      this.touched[fieldName] = true;
    },

    goToSignIn() {
      this.$router.push({ name: 'sign-in' });
    },

    goBack() {
      if (this.currentStep > 1) {
        this.prevStep();
      } else {
        this.$router.go(-1);
      }
    }
  }
}
</script>

<template>
  <pv-toast></pv-toast>

  <div class="w-full h-screen overflow-auto" style="background-color: var(--color-background);">
    <!-- Header -->
    <div class="flex align-items-center py-3 px-4 shadow-2 sticky top-0 z-5" style="background-color: var(--color-white); border-bottom: 1px solid var(--color-border-cards);">
      <pv-button
          icon="pi pi-arrow-left"
          class="p-button-text p-button-rounded p-button-sm mr-3"
          @click="goBack"
          style="color: var(--color-primary);"
      />

      <div class="flex-1 text-center">
        <h1 class="text-2xl font-bold m-0" style="color: var(--color-text-gray);">
          <span style="color: var(--color-primary);">Safe</span><span style="color: var(--color-border-cards);">Car</span>
        </h1>
      </div>
      
      <div style="width: 2.5rem;"></div>
    </div>

    <div class="p-4 pb-6 md:px-6 lg:px-8 xl:px-12 max-w-6xl mx-auto">
      
      <!-- Step 1: Workshop Information Form -->
      <div v-if="currentStep === 1">
        <form @submit.prevent="validateWorkshopInfo">
          <div class="p-fluid">
            <!-- Workshop Info Card -->
            <div class="border-round-lg p-4 mb-5" style="background-color: var(--color-card-background); border: var(--border-width) solid var(--color-border-cards); box-shadow: var(--shadow);">
              <div class="flex align-items-center gap-3 mb-4 pb-3" style="border-bottom: 1px solid var(--color-border-cards);">
                <div class="border-circle w-3rem h-3rem flex align-items-center justify-content-center" style="background-color: var(--color-primary);">
                  <i class="pi pi-user-plus text-xl" style="color: var(--color-white);"></i>
                </div>
                <div>
                  <h3 class="font-semibold m-0" style="color: var(--color-primary);">Create Account</h3>
                  <p class="text-sm m-0" style="color: var(--color-muted);">Enter your workshop details to get started.</p>
                </div>
              </div>

              <div class="grid mb-3">
                <!-- Workshop Name -->
                <div class="col-12">
                  <label for="nombreTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-briefcase mr-2" style="color: var(--color-primary);"></i>Workshop Name *
                  </label>
                  <pv-input-text
                      id="nombreTaller"
                      v-model="nombreTaller"
                      :class="{'p-invalid': touched.nombreTaller && !nombreTaller}"
                      class="w-full"
                      placeholder="Enter workshop name"
                      @blur="onFieldBlur('nombreTaller')"
                  />
                  <small v-if="touched.nombreTaller && !nombreTaller" class="p-error block mt-1">
                    Workshop name is required
                  </small>
                </div>

                <!-- RUC -->
                <div class="col-12 lg:col-6">
                  <label for="ruc" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-id-card mr-2" style="color: var(--color-primary);"></i>RUC / Tax ID *
                  </label>
                  <pv-input-text
                      id="ruc"
                      v-model="ruc"
                      :class="{'p-invalid': touched.ruc && !ruc}"
                      class="w-full"
                      placeholder="Enter RUC"
                      @blur="onFieldBlur('ruc')"
                  />
                  <small v-if="touched.ruc && !ruc" class="p-error block mt-1">
                    RUC is required
                  </small>
                </div>

                <!-- Phone -->
                <div class="col-12 lg:col-6">
                  <label for="telefonoTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-phone mr-2" style="color: var(--color-primary);"></i>Phone *
                  </label>
                  <pv-input-text
                      id="telefonoTaller"
                      v-model="telefonoTaller"
                      :class="{'p-invalid': touched.telefonoTaller && !telefonoTaller}"
                      class="w-full"
                      placeholder="Enter phone number"
                      @blur="onFieldBlur('telefonoTaller')"
                  />
                  <small v-if="touched.telefonoTaller && !telefonoTaller" class="p-error block mt-1">
                    Phone is required
                  </small>
                </div>

                <!-- Address -->
                <div class="col-12">
                  <label for="direccionTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-map-marker mr-2" style="color: var(--color-primary);"></i>Address *
                  </label>
                  <pv-input-text
                      id="direccionTaller"
                      v-model="direccionTaller"
                      :class="{'p-invalid': touched.direccionTaller && !direccionTaller}"
                      class="w-full"
                      placeholder="Enter workshop address"
                      @blur="onFieldBlur('direccionTaller')"
                  />
                  <small v-if="touched.direccionTaller && !direccionTaller" class="p-error block mt-1">
                    Address is required
                  </small>
                </div>

                <!-- Email -->
                <div class="col-12">
                  <label for="correoTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-envelope mr-2" style="color: var(--color-primary);"></i>Email *
                  </label>
                  <pv-input-text
                      id="correoTaller"
                      v-model="correoTaller"
                      :class="{'p-invalid': touched.correoTaller && !correoTaller}"
                      class="w-full"
                      placeholder="Enter email address"
                      type="email"
                      @blur="onFieldBlur('correoTaller')"
                  />
                  <small v-if="touched.correoTaller && !correoTaller" class="p-error block mt-1">
                    Email is required
                  </small>
                </div>
                
                <!-- Password -->
                <div class="col-12 lg:col-6">
                  <label for="password" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-lock mr-2" style="color: var(--color-primary);"></i>Password *
                  </label>
                  <pv-password
                      id="password"
                      v-model="password"
                      :class="{'p-invalid': touched.password && !password}"
                      class="w-full"
                      input-class="w-full"
                      placeholder="Enter password"
                      :feedback="true"
                      toggleMask
                      @blur="onFieldBlur('password')"
                  />
                  <small v-if="touched.password && !password" class="p-error block mt-1">
                    Password is required
                  </small>
                </div>

                <!-- Confirm Password -->
                <div class="col-12 lg:col-6">
                  <label for="confirmPassword" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                    <i class="pi pi-verified mr-2" style="color: var(--color-primary);"></i>Confirm Password *
                  </label>
                  <pv-password
                      id="confirmPassword"
                      v-model="confirmPassword"
                      :class="{'p-invalid': touched.confirmPassword && (!confirmPassword || !passwordsMatch)}"
                      class="w-full"
                      input-class="w-full"
                      placeholder="Confirm password"
                      :feedback="false"
                      toggleMask
                      @blur="onFieldBlur('confirmPassword')"
                  />
                  <small v-if="touched.confirmPassword && !confirmPassword" class="p-error block mt-1">
                    Please confirm your password
                  </small>
                  <small v-else-if="touched.confirmPassword && !passwordsMatch" class="p-error block mt-1">
                    Passwords do not match
                  </small>
                </div>
              </div>

              <!-- Terms & Conditions -->
              <div class="border-round-md p-3 mt-3" style="background-color: var(--bg-info-light); border-left: 3px solid var(--color-primary);">
                <div class="flex align-items-start gap-3">
                  <pv-checkbox
                      id="aceptarTerminos"
                      v-model="aceptarTerminos"
                      :class="{'p-invalid': touched.aceptarTerminos && !aceptarTerminos}"
                      binary
                      @change="onFieldBlur('aceptarTerminos')"
                  />
                  <div class="flex-1">
                    <label for="aceptarTerminos" class="font-medium cursor-pointer" style="color: var(--color-text-gray);">
                      <i class="pi pi-shield mr-2" style="color: var(--color-primary);"></i>
                      I accept the Terms and Conditions *
                    </label>
                    <small v-if="touched.aceptarTerminos && !aceptarTerminos" class="block mt-1" style="color: var(--color-error);">
                      You must accept the terms and conditions
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Continue Button -->
            <div class="mt-5">
              <pv-button
                  type="submit"
                  :label="loading ? 'Processing...' : 'Complete Registration'"
                  :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-right'"
                  icon-pos="right"
                  class="w-full px-6 py-3 text-lg font-semibold p-button-primary"
                  :disabled="!isFormValid || loading"
                  style="background-color: var(--color-primary); border-color: var(--color-primary);"
              />
              
              <div class="flex align-items-center justify-content-center gap-2 mt-3" v-if="isFormValid">
                <i class="pi pi-check-circle text-sm" style="color: var(--color-success);"></i>
                <span class="text-sm font-medium" style="color: var(--color-success);">Form complete - Ready to register</span>
              </div>
              <div class="flex align-items-center justify-content-center gap-2 mt-3" v-else>
                <i class="pi pi-info-circle text-sm" style="color: var(--color-warning);"></i>
                <span class="text-sm" style="color: var(--color-muted);">Please complete all required fields</span>
              </div>
            </div>
          </div>
        </form>
      </div>
      

    </div>
  </div>
</template>

<style scoped>
.step-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e2e8f0;
  color: #64748b;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-indicator.active {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

.step-indicator i {
  font-size: 20px;
}
</style>
```
