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
    }

    // ===== PLANES =====
    async getAllPlans() {
        const { data } = await http.get(this.plansEndpoint);
        return data; // [{ id, name, price, currency, amount, description, popular }]
    }

    // ===== SUSCRIPCIÓN (objeto único en db.json) =====
    async getUserSubscription() {
        const { data } = await http.get(this.subscriptionsEndpoint);
        return data; // { planId, paymentMethod, metadata }
    }

    async createSubscription(subscriptionData) {
        // POST sobre el recurso único (fake api)
        return http.post(this.subscriptionsEndpoint, subscriptionData);
    }

    async updateSubscription(subscriptionData) {
        // Simulación de update
        return http.put(`${this.subscriptionsEndpoint}/1`, subscriptionData);
    }

    async cancelSubscription() {
        return http.patch(`${this.subscriptionsEndpoint}/1`, { status: "canceled" });
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
        const exp = (pm.expirationDate || "").replace("-", "/"); // por si viene 11/28 ya está ok

        const brand = pm.cardType || "Card";
        const brandLower = String(brand).toLowerCase();
        const icon =
            brandLower.includes("visa")
                ? "/assets/cards/visa.png"
                : brandLower.includes("master")
                    ? "/assets/cards/mastercard.png"
                    : "/assets/cards/card.png";

        return [
            {
                id: "pm_1",
                brand: brand.toUpperCase(),
                last4,
                exp,
                isPrimary: true,
                icon,
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
}
