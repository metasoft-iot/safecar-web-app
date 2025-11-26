// src/subscriptions/services/subscription-api.service.js
import http from "@/shared/services/http-common.js";

export class SubscriptionApiService {
    constructor() {
        this.checkoutEndpoint = "/payments/checkout-session";
    }

    /**
     * Obtiene los planes de suscripción disponibles
     * @returns {Array} Lista de planes con sus características
     */
    async getAllPlans() {
        // Planes estáticos basados en la documentación del backend
        const plans = [
            {
                id: "basic",
                name: "BASIC",
                type: "BASIC",
                amount: 29,
                price: 29,
                currency: "PEN",
                description: "Plan básico ideal para talleres pequeños",
                features: [
                    "Hasta 3 mecánicos",
                    "Gestión de citas básica",
                    "Historial de servicios",
                    "Soporte por email"
                ],
                popular: false,
                stripePriceId: "price_1SQbsT3l890Fc29CerlSwh4r",
                mechanicsLimit: 3
            },
            {
                id: "professional",
                name: "PROFESSIONAL",
                type: "PROFESSIONAL",
                amount: 99,
                price: 99,
                currency: "PEN",
                description: "Plan profesional para talleres en crecimiento",
                features: [
                    "Hasta 10 mecánicos",
                    "Gestión avanzada de citas",
                    "Historial completo de servicios",
                    "Reportes y analíticas",
                    "Soporte prioritario"
                ],
                popular: true,
                stripePriceId: "price_1SQbt23l890Fc29CqoqLYCnu",
                mechanicsLimit: 10
            },
            {
                id: "premium",
                name: "PREMIUM",
                type: "PREMIUM",
                amount: 299,
                price: 299,
                currency: "PEN",
                description: "Plan premium para talleres grandes",
                features: [
                    "Hasta 30 mecánicos",
                    "Gestión completa de citas",
                    "Historial ilimitado",
                    "Reportes avanzados y BI",
                    "Integraciones personalizadas",
                    "Soporte 24/7 dedicado"
                ],
                popular: false,
                stripePriceId: "price_1SQbtK3l890Fc29COSEZ6iK4",
                mechanicsLimit: 30
            }
        ];

        return plans;
    }

    /**
     * Crea una sesión de Stripe Checkout
     * @param {Object} paymentData - Datos del pago (debe incluir planType)
     * @returns {Promise<Object>} Respuesta con sessionId y clientSecret
     */
    async createSubscription(paymentData) {
        try {
            // Construir el payload según la documentación del backend
            const payload = {
                planType: paymentData.planType || "BASIC"
            };

            console.log("Creating checkout session with payload:", payload);

            const response = await http.post(this.checkoutEndpoint, payload);

            console.log("Checkout session created:", response.data);

            // El backend devuelve { sessionId: "cs_test_..." }
            return {
                sessionId: response.data.sessionId,
                clientSecret: response.data.sessionId // Para compatibilidad
            };
        } catch (error) {
            console.error("Error creating checkout session:", error);
            throw error;
        }
    }

    /**
     * Obtiene la suscripción actual del usuario
     * @returns {Promise<Object>} Datos de la suscripción
     */
    async getUserSubscription() {
        // TODO: Implementar cuando el backend tenga un endpoint GET para obtener la suscripción
        // Por ahora retornamos null
        return null;
    }

    /**
     * Métodos legacy para compatibilidad con subscription-overview
     */
    async getCurrentPlan() {
        const plans = await this.getAllPlans();
        const subscription = await this.getUserSubscription();

        if (!subscription) {
            return {
                name: "Sin Plan",
                price: 0,
                renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                perks: []
            };
        }

        const plan = plans.find(p => p.type === subscription.planType) || plans[0];

        return {
            name: plan.name,
            price: plan.amount,
            renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            perks: plan.features
        };
    }

    async getPaymentMethods() {
        // Retorna array vacío por ahora hasta que se implemente en el backend
        return [];
    }

    async getInvoices() {
        // Retorna array vacío por ahora hasta que se implemente en el backend
        return [];
    }
}
