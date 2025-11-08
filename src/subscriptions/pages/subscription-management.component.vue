<script>
import { SubscriptionApiService } from "@/subscriptions/services/subscription-api.service";
import SubscriptionPlanCard from "@/subscriptions/components/subscription-plan-card.component.vue";
import PaymentForm from "@/subscriptions/components/payment-form.component.vue";
import { useToast } from "primevue/usetoast";

export default {
  name: "subscription-management-component",
  components: {
    "pv-subscription-plan-card": SubscriptionPlanCard,
    "pv-payment-form": PaymentForm,
  },
  data() {
    return {
      subscriptionApiService: null,
      plans: [],
      selectedPlan: null,
      loading: true,
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
    this.subscriptionApiService = new SubscriptionApiService();
    await this.fetchPlans();
  },
  methods: {
    mapApiPlan(p) {
      const features = (p.description || "")
          .replace(/\.$/, "")
          .split("+")
          .map(s => s.trim())
          .filter(Boolean);

      return {
        id: p.id,                                  // "basic" | "professional" | "premium"
        name: p.name,                               // ej. "Basic Plan"
        price: p.amount,                            // número
        description: p.description,
        features,
        isPopular: !!p.popular,
        stripePriceId: p.stripePriceId || p.id, // Usa el campo real de tu API. Usaré p.id como fallback simulado.
      };
    },

    async fetchPlans() {
      try {
        const apiPlans = await this.subscriptionApiService.getAllPlans();
        this.plans = (apiPlans || []).map(this.mapApiPlan);
        this.selectedPlan = this.plans.find(p => p.isPopular) || this.plans[0] || null;
      } catch (e) {
        // si hay error, deja la UI vacía sin romper
        this.plans = [];
        this.selectedPlan = null;
      } finally {
        this.loading = false;
      }
    },

    handlePlanSelection(plan) {
      this.selectedPlan = plan;
    },

    handlePaymentSuccess() {
      this.toast.add({
        severity: "success",
        summary: this.$t("subscription.Suscripción Exitosa"),
        detail: this.$t("subscription.Suscrito exitosamente a {0}.", [this.selectedPlan?.name || ""]),
        life: 5000,
      });
    },
  },
};
</script>

<template>
    <section class="subscription-section">
        <div class="main-subscription-card">
            <div class="main-content">
                <h1 class="title">{{ $t('subscription.Start Your Subscription') }}</h1>
                <p class="subtitle">
                    {{ $t('Subscribe to a SafeCar plan to access advanced features and tools for your workshop') }}
                </p>

                <div class="scroll-content">
                    <div class="plans-grid">
                        <div class="plans-column">
                            <h2 class="section-title">{{ $t('subscription.Select a Plan') }}</h2>
                            <div class="plans-list">
                                <div
                                    v-for="plan in plans"
                                    :key="plan.id"
                                    class="plan-card-wrapper"
                                >
                                    <pv-subscription-plan-card
                                        :plan="plan"
                                        :is-selected="plan.id === selectedPlan?.id"
                                        @select-plan="handlePlanSelection"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="payment-column">
                            <h2 class="section-title">{{ $t('subscription.Payment Method') }}</h2>
                            <div class="payment-card">
                                <pv-payment-form
                                    @payment-success="handlePaymentSuccess"
                                    :selected-plan="selectedPlan"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
/* === CONTENEDOR GENERAL === */
.subscription-section {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    background-color: #f9fafb;
    padding-top: 40px;
    margin: 0;
    min-height: calc(100vh - 90px);
}

/* === CARD PRINCIPAL SIN SOMBRA NI BORDES === */
.main-subscription-card {
    width: 100%;
    max-width: 1380px; /* 🔹 más ancho */
    background-color: #ffffff;
    border-radius: 14px;
    margin-top: -50px;
    padding: 0 !important;
    overflow: hidden;
    border: none; /* quita cualquier línea */
}

/* === CONTENIDO === */
.main-content {
    padding: 1rem 1.5rem 1.75rem 1.5rem !important;
}

/* === SCROLL INTERNO === */
.scroll-content {
    max-height: 90vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f9fafb;
}
.scroll-content::-webkit-scrollbar {
    width: 6px;
}
.scroll-content::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
.scroll-content::-webkit-scrollbar-track {
    background: transparent;
}

/* === TEXTOS === */
.title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #2563eb; /* Azul elegante */
    margin-bottom: 0.4rem;
    text-align: left;
}
.subtitle {
    color: #6b7280;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    text-align: left;
}
.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.75rem;
}

/* === GRID PRINCIPAL === */
.plans-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
    align-items: flex-start;
}

/* === PLANES === */
.plans-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}
.plan-card-wrapper {
    width: 100%;
}

/* === FORMULARIO PAGO SIN LÍNEAS === */
.payment-card {
    border-radius: 12px;
    background-color: #fdfdfd;
    padding: 1rem;
    border: none;
    box-shadow: none; /* sin bordes ni sombras */
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
    .plans-grid {
        grid-template-columns: 1fr;
    }
    .plans-list {
        grid-template-columns: 1fr;
    }
    .main-content {
        padding: 1rem;
    }
    .main-subscription-card {
        margin-top: -20px;
    }
}
</style>