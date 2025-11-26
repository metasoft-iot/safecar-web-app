// Configuración de métodos de pago de Stripe
// Cambia USE_PAYMENT_LINKS a true para testing rápido, false para producción

export const STRIPE_CONFIG = {
    // ⚙️ Modo de operación
    // true = Usar Payment Links (testing rápido, no requiere backend)
    // false = Usar Checkout Sessions (producción, requiere backend funcionando)
    USE_PAYMENT_LINKS: true, // 👈 Cambia esto a false cuando tu backend esté listo

    // 🔗 Payment Links de Stripe (para testing)
    PAYMENT_LINKS: {
        BASIC: 'https://buy.stripe.com/test_00w14g1mfc8J5XqdH1dAk03',
        PROFESSIONAL: 'https://buy.stripe.com/test_00w5kwgh92y9bhK32ndAk01',
        PREMIUM: 'https://buy.stripe.com/test_8x26oA5Cvb4F99C8mHdAk02'
    },

    // 📝 Mapeo de tipos de plan a Payment Links
    getPaymentLinkUrl(planType) {
        return this.PAYMENT_LINKS[planType] || this.PAYMENT_LINKS.BASIC;
    }
};
