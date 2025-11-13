<template>
  <section class="sub-wrapper" v-if="!loading">
    <header class="page-header">
      <h1>{{ $t("subscription.my_subscription_title") }}</h1>
      <p class="muted">{{ $t("subscription.my_subscription_subtitle") }}</p>
    </header>

    <div class="grid-2">
      <div class="col">
        <div class="card">
          <div class="card-head">
            <h2>{{ $t("subscription.current_plan") }}</h2>
            <div class="actions">
              <button class="btn primary" @click="onUpgrade">{{ $t("subscription.upgrade_btn") }}</button>
              <button class="btn ghost" @click="onCancelPlan">{{ $t("subscription.cancel_btn") }}</button>
            </div>
          </div>
          <div v-if="currentPlan" class="plan-row">
            <div class="plan-title">{{ currentPlan.name }}</div>
            <div class="plan-sub">
              {{ amount(currentPlan.price) }} / {{ $t("subscription.per_month") }}
              · {{ $t("subscription.renews_on") }} {{ dateShort(currentPlan.renewsAt) }}
            </div>
            <p class="plan-desc">{{ currentPlan.perks.join(", ") }}.</p>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <h2>{{ $t("subscription.payment_methods") }}</h2>
            <button class="link" @click="goToAddPaymentForm">
              + {{ $t("subscription.add_payment_method") }}
            </button>
          </div>
          <ul class="pm-list">
            <li v-for="pm in paymentMethods" :key="pm.id" class="pm-item">
              <div class="pm-left">
                <img :src="pm.icon" alt="" class="pm-icon" />
                <div>
                  <div class="pm-title">{{ pm.brand }} **** {{ pm.last4 }}</div>
                  <div class="pm-sub">{{ $t("subscription.expires") }} {{ pm.exp }}</div>
                </div>
              </div>
              <div class="pm-right">
                <span v-if="pm.isPrimary" class="tag primary">{{ $t("subscription.primary") }}</span>
                <button v-else class="btn tiny ghost" @click="setPrimaryMethod(pm.id)">
                  {{ $t("subscription.make_primary") }}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="col">
        <div class="card">
          <h2 class="mb">{{ $t("subscription.billing_history") }}</h2>
          <ul class="bill-list">
            <li v-for="inv in invoices" :key="inv.id" class="bill-row">
              <div class="bill-title">{{ inv.title }}</div>
              <div class="bill-date">{{ dateShort(inv.date) }}</div>
              <div class="bill-amt">{{ amount(inv.amount) }}</div>
              <div :class="badgeClass(inv.status)">{{ $t(`subscription.status.${inv.status.toLowerCase()}`) }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section v-else class="loading">{{ $t("subscription.loading") }}</section>

  <Dialog 
    :visible.sync="showCancelDialog" 
    :header="$t('subscription.confirm_cancel_title') || 'Confirmar Cancelación'" 
    :modal="true" 
    :style="{ width: '400px' }"
  >
    <div class="p-d-flex p-flex-column p-ai-center p-text-center">
      <i class="pi pi-exclamation-triangle p-mb-3" style="font-size: 2rem; color: #ef4444;"></i>
      <p class="p-text-lg p-mb-4">
        {{ $t('subscription.confirm_cancel_modal_text') || '¿Estás seguro de que quieres cancelar tu suscripción? Perderás acceso a las funciones premium al final del ciclo de facturación actual.' }}
      </p>
    </div>

    <template #footer>
      <button 
        class="p-button p-component p-button-secondary p-button-text" 
        @click="showCancelDialog = false"
      >
        {{ $t('common.keep_subscription_btn') || 'Mantener suscripción' }}
      </button>
      <button 
        class="p-button p-component p-button-danger" 
        @click="confirmCancelPlan"
      >
        {{ $t('common.confirm_cancel_btn') || 'Sí, cancelar plan' }}
      </button>
    </template>
  </Dialog>
</template>

<script>
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog"; // 🛑 IMPORTACIÓN DE PRIME VUE DIALOG
import { SubscriptionApiService } from "@/subscriptions/services/subscription-api.service"; 

export default {
  name: "subscription-overview-page",
  components: {
    Dialog // 🛑 REGISTRO DEL COMPONENTE DIALOG
  },
  data() {
    return {
      loading: true,
      currentPlan: null,
      paymentMethods: [],
      invoices: [],
      showCancelDialog: false, // 🛑 NUEVA PROPIEDAD para controlar el modal
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
    await this.loadSubscriptionData();
  },
  methods: {
    async loadSubscriptionData() {
      this.loading = true;
      try {
        const api = new SubscriptionApiService();
        const [plan, methods, invoices] = await Promise.all([
          api.getCurrentPlan(),
          api.getPaymentMethods(),
          api.getInvoices(),
        ]);
        this.currentPlan = plan;
        this.paymentMethods = methods;
        this.invoices = invoices;
      } catch (e) {
        console.error("Error al cargar datos de suscripción:", e);
        this.toast.add({
          severity: "error",
          summary: this.$t("subscription.error_title"),
          detail: this.$t("subscription.error_load"),
          life: 4000,
        });
      } finally {
        this.loading = false;
      }
    },

    onUpgrade() {
      this.toast.add({
        severity: "info",
        summary: this.$t("subscription.upgrade_title"),
        detail: this.$t("subscription.upgrade_body"),
        life: 3000,
      });
      this.$router.push({ name: "subscriptions-management" }).catch(err => {
          console.error("Error de navegación al Mejorar Plan:", err);
          this.toast.add({
             severity: "error",
             summary: "Error de Navegación",
             detail: "No se pudo acceder a la página de selección de planes.",
             life: 4000,
          });
      });
    },

    /**
     * 🛑 onCancelPlan: Ahora solo abre el modal de confirmación.
     */
    onCancelPlan() {
      this.showCancelDialog = true;
    },

    /**
     * 🛑 confirmCancelPlan: Ejecuta la cancelación real después de la confirmación del modal.
     */
    async confirmCancelPlan() {
      this.showCancelDialog = false; // Cierra el modal
      try {
        const api = new SubscriptionApiService();
        await api.cancelSubscription(this.currentPlan.id);
        
        this.toast.add({
          severity: "warn",
          summary: this.$t("subscription.cancel_title"),
          detail: this.$t("subscription.cancel_body"),
          life: 3000,
        });
        await this.loadSubscriptionData(); // Recarga los datos para reflejar la cancelación
      } catch (e) {
        this.toast.add({
          severity: "error",
          summary: this.$t("subscription.error_title"),
          detail: this.$t("subscription.error_cancel"),
          life: 4000,
        });
      }
    },

    goToAddPaymentForm() {
      this.$router.push({ name: 'add-payment-method' }).catch(err => {
        console.error("Error de navegación:", err);
        this.toast.add({
          severity: "error",
          summary: "Error de Navegación",
          detail: "No se pudo encontrar la ruta para el formulario de pago.",
          life: 4000,
        });
      });
    },

    async setPrimaryMethod(id) {
      try {
        const api = new SubscriptionApiService();
        await api.setPrimaryPaymentMethod(id); 
        
        this.paymentMethods = this.paymentMethods.map((m) => ({ ...m, isPrimary: m.id === id }));
        
        this.toast.add({
          severity: "success",
          summary: this.$t("subscription.success_title"),
          detail: this.$t("subscription.success_pm_primary"),
          life: 3000,
        });
      } catch (e) {
        this.toast.add({
          severity: "error",
          summary: this.$t("subscription.error_title"),
          detail: this.$t("subscription.error_pm_primary"),
          life: 4000,
        });
      }
    },

    amount(a) {
      // Formato de moneda para Soles Peruanos (PEN)
      return new Intl.NumberFormat(this.$i18n.locale || "es-PE", { style: "currency", currency: "PEN" }).format(a);
    },

    dateShort(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString(this.$i18n.locale || "es-PE", { month: "short", day: "2-digit", year: "numeric" });
    },

    badgeClass(status) {
      return {
        Paid: "status-badge paid",
        Failed: "status-badge failed",
        Pending: "status-badge pending",
      }[status] || "status-badge";
    },
  },
};
</script>

<style scoped>
/* ESTILOS CSS */
.sub-wrapper { padding: 24px; }
.page-header h1 { margin: 0 0 4px; font-size: 26px; }
.muted { color: #6b7280; margin: 0 0 18px; }
.grid-2 { display: grid; grid-template-columns: 2fr 1.1fr; gap: 20px; align-items: start; }
.col { display: grid; gap: 16px; }
.card { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #eef0f3; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.actions { display: flex; gap: 8px; }
.btn { border: 0; border-radius: 10px; padding: 10px 14px; cursor: pointer; }
.btn.primary { background: #3b5cff; color: #fff; }
.btn.ghost { background: #f5f6fb; color: #111; }
.btn.tiny { padding: 6px 10px; border-radius: 8px; }
.link { background: transparent; color: #4f46e5; border: 0; cursor: pointer; }
.plan-row { display: grid; gap: 6px; }
.plan-title { font-weight: 600; color: #1f2937; }
.plan-sub { color: #6b7280; font-size: 14px; }
.plan-desc { color: #4b5563; }
.pm-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.pm-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #eef0f3; border-radius: 10px; }
.pm-left { display: flex; gap: 12px; align-items: center; }
.pm-icon { width: 36px; height: 24px; object-fit: contain; }
.pm-title { font-weight: 600; }
.pm-sub { color: #6b7280; font-size: 13px; }
.tag { font-size: 12px; padding: 6px 10px; border-radius: 20px; }
.tag.primary { background: #eef2ff; color: #4338ca; }
.bill-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.bill-row { display: grid; grid-template-columns: 1.3fr 0.9fr 0.7fr auto; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #eef0f3; border-radius: 10px; }
.bill-title { font-weight: 600; }
.bill-date, .bill-amt { color: #374151; }
.status-badge { padding: 6px 10px; border-radius: 999px; font-size: 12px; text-align: center; }
.status-badge.paid { background: #e7f7ee; color: #15803d; }
.status-badge.failed { background: #fdecec; color: #b91c1c; }
.status-badge.pending { background: #fff7ed; color: #b45309; }
.loading { padding: 32px; color: #6b7280; }
@media (max-width: 1100px) { .grid-2 { grid-template-columns: 1fr; } }
/* Estilos necesarios para el modal de PrimeVue (simulación si no tienes los estilos base de PrimeVue) */
.pi-exclamation-triangle {
  /* Estilo del ícono en el modal */
  margin-bottom: 1rem;
}
.p-text-center {
  text-align: center;
}
/* Asegúrate de que los estilos p-button-secondary p-button-text y p-button-danger existan en tu entorno */
</style>