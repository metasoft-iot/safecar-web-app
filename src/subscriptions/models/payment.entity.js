export class Payment {
  /**
   * @param {string} cardholderName - Nombre del titular de la tarjeta
   * @param {string} billingEmail - Correo del titular
   * @param {string} planId - ID del plan seleccionado (basic, professional, premium)
   * @param {number} amount - Monto total a pagar
   * @param {string} paymentMethodId - ID del método de pago (Stripe u otro)
   * @param {string} [status='pending'] - Estado del pago (pending, succeeded, failed)
   * @param {string} [createdAt] - Fecha de creación del pago
   */
  constructor(
    cardholderName,
    billingEmail,
    planId,
    amount,
    paymentMethodId,
    status = 'pending',
    createdAt = new Date().toISOString()
  ) {
    this.cardholderName = cardholderName;
    this.billingEmail = billingEmail;
    this.planId = planId;
    this.amount = amount;
    this.paymentMethodId = paymentMethodId;
    this.status = status;
    this.createdAt = createdAt;
  }
}
