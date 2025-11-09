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
        .map((s) => s.trim())
        .filter(Boolean);

      return {
        id: p.id,
        name: p.name,
        price: p.amount,
        description: p.description,
        features,
        isPopular: !!p.popular,
        stripePriceId: p.stripePriceId || p.id,
      };
    },

    async fetchPlans() {
      try {
        const apiPlans = await this.subscriptionApiService.getAllPlans();
        this.plans = (apiPlans || []).map(this.mapApiPlan);
        this.selectedPlan = null;
      } catch (e) {
        this.plans = [];
        this.selectedPlan = null;
      } finally {
        this.loading = false;
      }
    },

    handlePlanSelection(plan) {
      this.selectedPlan = plan;
      this.$nextTick(() => {
        document
          .getElementById("payment-column-id")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },

    handlePaymentSuccess() {
      this.toast.add({
        severity: "success",
        summary: this.$t("subscription.Suscripción Exitosa"),
        detail: this.$t("subscription.Suscrito exitosamente a {0}.", [
          this.selectedPlan?.name || "",
        ]),
        life: 5000,
      });
    },
  },
};
</script>

<template>
  <!-- 🔹 Agregamos clase dinámica según haya plan seleccionado -->
  <section
    class="subscription-section"
    :class="{ 'selected-mode': selectedPlan }"
  >
    <div class="main-subscription-card">
      <div class="main-content">
        <h1 class="title">
          {{ $t("subscription.Start Your Subscription") }}
        </h1>
        <p class="subtitle">
          {{
            $t(
              "Subscribe to a SafeCar plan to access advanced features and tools for your workshop"
            )
          }}
        </p>

        <!-- 🔹 Contenedor general -->
        <div class="scroll-content">
          <!-- 🔹 Si NO hay plan seleccionado: mostrar solo los planes -->
          <div v-if="!selectedPlan" class="plans-grid full-width-plans">
            <div class="plans-column">
              <h2 class="section-title">
                {{ $t("subscription.Select a Plan") }}
              </h2>

              <div class="plans-list">
                <div
                  v-for="plan in plans"
                  :key="plan.id"
                  class="plan-card-wrapper"
                >
                  <pv-subscription-plan-card
                    :plan="plan"
                    :is-selected="false"
                    @select-plan="handlePlanSelection"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 🔹 Si YA hay un plan seleccionado: mostrar plan y formulario al lado -->
          <div v-else class="plans-grid two-columns">
            <div class="plans-column">
              <h2 class="title">
                {{ $t("subscription.Selected Plan") }}
              </h2>
              <div class="plan-card-wrapper">
                <pv-subscription-plan-card
                  :plan="selectedPlan"
                  :is-selected="true"
                  @select-plan="handlePlanSelection"
                />
              </div>
            </div>

            <div id="payment-column-id" class="payment-column">
              <div
                class="flex justify-content-between align-items-center mb-3"
              >
                <h2 class="title">
                  {{ $t("subscription.Payment Method") }}
                </h2>
                <pv-button
                  label="Cambiar plan"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  outlined
                  size="small"
                  @click="selectedPlan = null"
                />
              </div>

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
.subscription-section {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  background-color: #f9fafb;
  padding-top: 60px; /* ⬅️ padding inicial (vista sin plan) */
  margin: 0;
  min-height: calc(100vh - 90px);
  transition: padding-top 0.4s ease;
  padding-bottom: 600px;
}

/* ✅ Cuando hay plan seleccionado */
.subscription-section.selected-mode {
  padding-top: 160px; /* ⬅️ menos espacio arriba */
}

.main-subscription-card {
  width: 100%;
  max-width: 1380px;
  background-color: #ffffff;
  border-radius: 14px;
  margin-top: -50px;
  padding: 0 !important;
  overflow: hidden;
  border: none;
}

.main-content {
  padding: 1.5rem !important;
}

/* === SCROLL === */
.scroll-content {
  max-height: 90vh;
  overflow-y: auto;
}

/* === TITULOS === */
.title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #2563eb;
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

/* === GRID === */
.plans-grid {
  display: grid;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ✅ Vista inicial: solo los planes en 3 columnas */
.full-width-plans .plans-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* ✅ Vista seleccionada: plan + formulario */
.two-columns {
  display: grid;
  grid-template-columns: 40% 50%;
  gap: 2rem;
  align-items: start;
}

/* Limitar el tamaño del plan para que no se expanda demasiado */
.two-columns .plans-column {
  max-width: 550px;
  justify-self: end;
  width: 100%;
}

/* El formulario debe ocupar todo el alto disponible */
.payment-column {
  max-width: 5000px;
  justify-self: start;
  width: 100%;
}

/* === FORMULARIO === */
.payment-card {
  border-radius: 12px;
  background-color: #fdfdfd;
  padding: 1rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .full-width-plans .plans-list {
    grid-template-columns: 1fr;
  }

  .two-columns {
    grid-template-columns: 1fr;
  }

  .two-columns .plans-column,
  .payment-column {
    max-width: 100%;
    justify-self: stretch;
  }
}
</style>
