// src/subscriptions/services/subscription-api.service.js
import axios from "axios";

const http = axios.create({
    baseURL: "https://my-json-server.typicode.com/MetaSoft-IOT/subscriptions-fake-api",
    timeout: 8000,
});

export class SubscriptionApiService {
    constructor() {
        this.plansEndpoint = "/plans";
        this.subscriptionsEndpoint = "/subscriptions";
        this.paymentsEndpoint = "/payments";
    }

    // ===== PLANES =====
    async getAllPlans() {
        const { data } = await http.get(this.plansEndpoint);
        return data; // [{ id, name, price, currency, amount, description, popular }]
    }

    // ===== SUSCRIPCIÓN (objeto único en db.json) =====

    async createSubscription(subscriptionData) {
        try {
            const response = await http.post(this.subscriptionsEndpoint, subscriptionData); 
            return response.data;
         }catch (error) {    
            console.error("Error creating subscription:", error);
            throw error;
        }
  }
    async getUserSubscription() {
        const { data } = await http.get(this.subscriptionsEndpoint);
        return data; // { planId, paymentMethod, metadata }
    }

    async updateSubscription(subscriptionData) {
        // Simulación de update
        return http.put(`${this.subscriptionsEndpoint}/1`, subscriptionData);
    }

    async cancelSubscription() {
        return http.patch(`${this.subscriptionsEndpoint}/1`, { status: "canceled" });
    }

    // ===== PAGOS ===== 💳
  /**
   * Crea un nuevo pago en la API Fake (se conecta con /payments)
   * @param {Payment} paymentData - Objeto del formulario (instancia de Payment)
   */
  async createPayment(paymentData) {
    try {
      // Si es una instancia de Payment, la convertimos a JSON plano
      const payload = paymentData instanceof Payment ? { ...paymentData } : paymentData;

      const { data } = await http.post(this.paymentsEndpoint, payload);
      console.log(" Pago registrado en Fake API:", data);
      return data;
    } catch (error) {
      console.error(" Error al registrar el pago:", error);
      throw error;
    }
  }

    // ===== Métodos derivados para tu VISTA “overview” =====
    /**
     * Combina /plans + /subscriptions y devuelve:
     * { name, price, renewsAt, perks[] }
     */
    async getCurrentPlan() {
        const [plans, sub] = await Promise.all([this.getAllPlans(), this.getUserSubscription()]);
        const plan = plans.find(p => p.id === sub?.planId) || plans[0];

        // Fecha de renovación: hoy + 30 días (simulado)
        const renewsAt = new Date();
        renewsAt.setMonth(renewsAt.getMonth() + 1);

        return {
            name: plan?.name ?? "Plan",
            price: plan?.amount ?? 0,
            renewsAt: renewsAt.toISOString(),
            perks: (plan?.description || "")
                .replace(/\.$/, "")
                .split("+")
                .map(s => s.trim())
                .filter(Boolean),
        };
    }

    /**
     * Deriva un método de pago “principal” desde subscriptions.paymentmethod
     * Devuelve: [{ id, brand, last4, exp, isPrimary, icon }]
     */
async getPaymentMethods() {
        const sub = await this.getUserSubscription();
        const pm = sub?.paymentmethod || {};
        const last4 = (pm.cardNumber || "").replace(/\s/g, "").slice(-4) || "0000";
        const exp = (pm.expirationDate || "").replace("-", "/");

        const brand = pm.cardType || "Card";
        const brandLower = String(brand).toLowerCase();
        
        // 🛑 Lógica para devolver la CLASE de PrimeIcon
        let iconClass = "pi pi-credit-card"; // Icono por defecto (genérico)
        
        if (brandLower.includes("visa")) {
            iconClass = "pi pi-visa";
        } else if (brandLower.includes("master")) {
            iconClass = "pi pi-mastercard";
        }

        return [
            {
                id: "pm_1",
                brand: brand.toUpperCase(),
                last4,
                exp,
                isPrimary: true,
                // Eliminamos 'icon' y añadimos 'iconClass'
                iconClass: iconClass, 
            },
        ];
    }

    /**
     * Genera un historial simulado a partir del plan actual
     * Devuelve: [{ id, title, amount, date, status }]
     */
    async getInvoices() {
        const [plans, sub] = await Promise.all([this.getAllPlans(), this.getUserSubscription()]);
        const plan = plans.find(p => p.id === sub?.planId) || plans[0];
        const amount = plan?.amount ?? 0;

        // 6 últimos meses
        const today = new Date();
        const items = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(today);
            d.setMonth(today.getMonth() - i);
            const status = i === 2 ? "Failed" : "Paid"; // 1 fallo para que la UI lo muestre
            return {
                id: `inv_${i + 1}`,
                title: plan?.name || "Plan",
                amount,
                date: d.toISOString().slice(0, 10),
                status,
            };
        });
        return items;
    }

    async getSetupIntentClientSecret() {
    console.log("Simulando obtención de SetupIntent Client Secret...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia de red
    
    const fakeClientSecret = "seti_1P24GjASkU2f87o0xQZ3j3nZ_secret_ABCDEFGHIJKLMN"; 

    return { clientSecret: fakeClientSecret };
}
async savePaymentMethodId(paymentMethodId) {
    console.log(`Simulando guardar PaymentMethod ID: ${paymentMethodId} en el backend.`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
}
}
