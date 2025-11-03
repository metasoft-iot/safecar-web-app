<script>
import { useToast } from "primevue/usetoast";
import { SubscriptionApiService } from "@/subscriptions/services/subscription-api.service";

export default {
  name: "subscription-overview-page",
  data() {
    return {
      loading: true,
      currentPlan: null,       // { name, price, renewsAt, perks[] }
      paymentMethods: [],      // [{ id, brand, last4, exp, isPrimary, icon }]
      invoices: [],            // [{ id, title, amount, date, status }]
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  async created() {
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
      this.toast.add({ severity: "error", summary: this.$t("subscription.error_title"), detail: this.$t("subscription.error_load"), life: 4000 });
    } finally {
      this.loading = false;
    }
  },
  methods: {
    onUpgrade() {
      this.toast.add({ severity: "info", summary: this.$t("subscription.upgrade_title"), detail: this.$t("subscription.upgrade_body"), life: 3000 });
      // TODO: navegar a /subscriptions (tu selector de planes) o abrir modal
      this.$router.push({ name: "subscription-management" }).catch(() => {});
    },
    onCancelPlan() {
      // TODO: llamada real -> api.cancelSubscription()
      this.toast.add({ severity: "warn", summary: this.$t("subscription.cancel_title"), detail: this.$t("subscription.cancel_body"), life: 3000 });
    },
    onAddPaymentMethod() {
      // TODO: abrir tu formulario de pago existente
      this.$router.push({ name: "subscription-management" }).catch(() => {});
    },
    setPrimaryMethod(id) {
      this.paymentMethods = this.paymentMethods.map(m => ({ ...m, isPrimary: m.id === id }));
      // TODO: api.setPrimaryPaymentMethod(id)
    },
    amount(a) {
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

<template>
  <section class="sub-wrapper" v-if="!loading">
    <header class="page-header">
      <h1>{{ $t("subscription.my_subscription_title") }}</h1>
      <p class="muted">{{ $t("subscription.my_subscription_subtitle") }}</p>
    </header>

    <div class="grid-2">
      <!-- LEFT -->
      <div class="col">
        <!-- Current Plan -->
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
            <p class="plan-desc">
              {{ currentPlan.perks.join(", ") }}.
            </p>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="card">
          <div class="card-head">
            <h2>{{ $t("subscription.payment_methods") }}</h2>
            <button class="link" @click="onAddPaymentMethod">+ {{ $t("subscription.add_payment_method") }}</button>
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
                <button v-else class="btn tiny ghost" @click="setPrimaryMethod(pm.id)">{{ $t("subscription.make_primary") }}</button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- RIGHT: Billing History -->
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
</template>

<style scoped>
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

@media (max-width: 1100px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
