<script>
import { PaymentApiService } from '../services/payment-api.service';

export default {
  name: 'plan-selection',
  
  props: {
    preSelectedPlan: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      paymentService: new PaymentApiService(),
      plans: [],
      selectedPlan: null,
      loading: false,
      processingPayment: false
    };
  },
  
  computed: {
    hasSelectedPlan() {
      return this.selectedPlan !== null;
    }
  },
  
  methods: {
    selectPlan(plan) {
      this.selectedPlan = plan.type;
      this.$emit('plan-selected', plan);
    },
    
    async proceedToPayment() {
      if (!this.selectedPlan) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Plan Required',
          detail: 'Please select a plan to continue',
          life: 3000
        });
        return;
      }
      
      this.processingPayment = true;
      
      try {
        // Create checkout session
        const session = await this.paymentService.createCheckoutSession(this.selectedPlan);
        
        // Emit event with session info before redirecting
        this.$emit('checkout-session-created', {
          sessionId: session.sessionId,
          planType: this.selectedPlan
        });
        
        // Redirect to Stripe Checkout
        await this.paymentService.redirectToCheckout(session.sessionId);
        
      } catch (error) {
        console.error('Error creating checkout session:', error);
        
        let errorMessage = 'Failed to create payment session';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.$toast.add({
          severity: 'error',
          summary: 'Payment Error',
          detail: errorMessage,
          life: 5000
        });
      } finally {
        this.processingPayment = false;
      }
    },
    
    getPlanIcon(planType) {
      switch(planType) {
        case 'BASIC': return 'pi-star';
        case 'PROFESSIONAL': return 'pi-shield';
        case 'PREMIUM': return 'pi-crown';
        default: return 'pi-circle';
      }
    },
    
    getPlanColor(planType) {
      switch(planType) {
        case 'BASIC': return '#64748b'; // slate  
        case 'PROFESSIONAL': return '#3b82f6'; // blue
        case 'PREMIUM': return '#f59e0b'; // amber
        default: return '#94a3b8';
      }
    }
  },
  
  mounted() {
    this.plans = this.paymentService.getAvailablePlans();
    
    // Pre-select plan if provided
    if (this.preSelectedPlan) {
      this.selectedPlan = this.preSelectedPlan;
    }
  }
};
</script>

<template>
  <pv-toast />
  
  <div class="plan-selection-container p-4">
    <div class="text-center mb-5">
      <h2 class="text-4xl font-bold text-900 mb-2">Choose Your Plan</h2>
      <p class="text-600 text-lg">Select the perfect plan for your workshop</p>
    </div>
    
    <div class="grid">
      <div 
        v-for="plan in plans" 
        :key="plan.type"
        class="col-12 md:col-6 lg:col-4"
      >
        <div 
          class="plan-card surface-card p-4 border-round-lg cursor-pointer transition-all transition-duration-300"
          :class="{ 
            'selected': selectedPlan === plan.type,
            'recommended': plan.recommended
          }"
          @click="selectPlan(plan)"
        >
          <!-- Recommended Badge -->
          <div v-if="plan.recommended" class="recommended-badge">
            <i class="pi pi-star-fill mr-1"></i>
            Recommended
          </div>
          
          <!-- Plan Header -->
          <div class="text-center mb-4">
            <div 
              class="plan-icon mx-auto mb-3"
              :style="{ backgroundColor: getPlanColor(plan.type) }"
            >
              <i :class="`pi ${getPlanIcon(plan.type)} text-white text-3xl`"></i>
            </div>
            
            <h3 class="text-2xl font-bold text-900 mb-2">{{ plan.name }}</h3>
            
            <div class="price-container">
              <span class="currency">$</span>
              <span class="price">{{ plan.price }}</span>
              <span class="period">/ {{ plan.billingPeriod }}</span>
            </div>
          </div>
          
          <!-- Features List -->
          <div class="features-list mb-4">
            <div 
              v-for="(feature, index) in plan.features" 
              :key="index"
              class="feature-item flex align-items-start mb-2"
            >
              <i class="pi pi-check text-green-500 mr-2 mt-1"></i>
              <span>{{ feature }}</span>
            </div>
          </div>
          
          <!-- Select Button -->
          <pv-button
            :label="selectedPlan === plan.type ? 'Selected' : 'Select Plan'"
            :icon="selectedPlan === plan.type ? 'pi pi-check' : 'pi pi-arrow-right'"
            class="w-full"
            :class="selectedPlan === plan.type ? 'p-button-success' : 'p-button-outlined'"
            @click.stop="selectPlan(plan)"
          />
        </div>
      </div>
    </div>
    
    <!-- Continue Button -->
    <div class="text-center mt-5">
      <pv-button
        label="Continue to Payment"
        icon="pi pi-credit-card"
        class="p-button-lg p-button-primary"
        :loading="processingPayment"
        :disabled="!hasSelectedPlan"
        @click="proceedToPayment"
      />
    </div>
    
    <!-- Security Notice -->
    <div class="text-center mt-4 text-600">
      <i class="pi pi-lock mr-2"></i>
      Secure payment powered by <strong>Stripe</strong>
    </div>
  </div>
</template>

<style scoped>
.plan-selection-container {
  max-width: 1200px;
  margin: 0 auto;
}

.plan-card {
  position: relative;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.plan-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

.plan-card.recommended {
  border-color: #f59e0b;
}

.plan-card.recommended.selected {
  border-color: #3b82f6;
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.plan-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.price-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: #64748b;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
}

.period {
  font-size: 0.875rem;
  color: #64748b;
}

.features-list {
  min-height: 200px;
}

.feature-item {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

.feature-item i {
  flex-shrink: 0;
}
</style>
