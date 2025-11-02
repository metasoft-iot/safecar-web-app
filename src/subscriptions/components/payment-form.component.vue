<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'payment-form',
    emits: ['payment-success'],
    props: {
        selectedPlan: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            // Nota: Es mejor traducir los valores de las opciones del SelectButton en el template si no son claves (Credit Card, Debit Card)
            paymentMethod: 'Credit Card', 
            cardholderName: 'John Doe', 
            billingEmail: 'john.doe@example.com',
            cardNumber: '0000 0000 0000 0000',
            expirationDate: 'MM/YY', 
            cvv: '***',
            saveCard: false
        };
    },
    methods: {
        subscribeNow() {
            if (!this.cardholderName || !this.billingEmail || !this.cardNumber || !this.expirationDate || !this.cvv) {
                // 🔹 CORRECCIÓN: Usar this.$t() para traducir los mensajes de error (toast)
                this.$toast.add({
                    severity: 'warn', 
                    summary: this.$t('subscription.Missing Fields'), 
                    detail: this.$t('subscription.Please fill in all payment details.'), 
                    life: 3000
                });
                return;
            }

            const paymentData = {
                cardholderName: this.cardholderName,
                billingEmail: this.billingEmail,
                lastFourDigits: this.cardNumber.slice(-4), 
                method: this.paymentMethod,
                planId: this.selectedPlan ? this.selectedPlan.id : null
            };

            setTimeout(() => {
                this.$emit('payment-success', paymentData);
            }, 1000);
        },
        resetForm() {
            this.cardholderName = '';
            this.billingEmail = '';
            this.cardNumber = '';
            this.expirationDate = '';
            this.cvv = '';
            this.saveCard = false;
        }
    }
});
</script>

<template>
    <div class="p-fluid">
        
        <label for="cardTypeSelect" class="block text-sm font-semibold text-700 mb-2">{{ $t('subscription.Card Type') }}</label>

        <div id="cardTypeSelect" class="p-inputgroup mb-4 w-full">
            <pv-select-button 
                v-model="paymentMethod" 
                :options="[$t('subscription.Credit Card'), $t('subscription.Debit Card')]" 
                :allow-empty="false" 
                class="w-full"
            />
        </div>
        
        <div class="field mb-4">
            <label for="cardholderName" class="block text-sm font-semibold text-700 mb-2">{{ $t('subscription.Cardholder Name') }}</label>
            <pv-input-text id="cardholderName" v-model="cardholderName" class="p-inputtext-sm w-full" required />
        </div>

        <div class="field mb-4">
            <label for="billingEmail" class="block text-sm font-semibold text-700 mb-2">{{ $t('subscription.Email associated with billing') }}</label>
            <pv-input-text id="billingEmail" v-model="billingEmail" type="email" class="p-inputtext-sm w-full" required />
        </div>

        <div class="field mb-4">
            <label for="cardNumber" class="block text-sm font-semibold text-700 mb-2">{{ $t('subscription.Card Number') }}</label>
            <div class="p-inputgroup w-full">
                <pv-input-mask id="cardNumber" v-model="cardNumber" mask="9999 9999 9999 9999" slotChar="0" class="p-inputtext-sm w-full" required />
                <span class="p-inputgroup-addon">
                    <i class="pi pi-credit-card"></i>
                </span>
            </div>
        </div>
        
        <div class="grid formgrid p-0"> 
            
            <div class="col-7 p-2"> <div class="field mb-4">
                <label for="expirationDate" class="block text-sm font-semibold text-700 mb-2">{{ $t('subscription.Expiration Date') }}</label>
                <pv-input-mask id="expirationDate" v-model="expirationDate" mask="99/99" placeholder="MM/YY" class="p-inputtext-sm w-full" required />
            </div>
            </div>
            <div class="col-5 p-2"> <div class="field mb-4">
                <label for="cvv" class="block text-sm font-semibold text-700 mb-2">CVV</label>
                <pv-password id="cvv" v-model="cvv" :feedback="false" toggleMask inputClass="w-full p-inputtext-sm" placeholder="***" />
            </div>
            </div>
        </div>
        
        <div class="field-checkbox mt-2 mb-5 flex align-items-center">
            <pv-checkbox id="saveCard" v-model="saveCard" :binary="true" />
            <label for="saveCard" class="text-600 text-sm ml-2">{{ $t('subscription.Save this card as my primary payment method.') }}</label>
        </div>
        
        <pv-button :label="$t('subscription.Subscribe Now')" @click="subscribeNow" class="w-full mb-3 font-bold" severity="primary" size="large" />

        <p class="mt-2 text-xs text-500 text-center">
            {{ $t('subscription.You will be charged monthly according to your selected plan. You can cancel anytime.') }}
        </p>
    </div>
</template>

<style scoped>
/* Ajuste de altura y fuente de los campos de entrada */
:deep(.p-inputtext), 
:deep(.p-password input),
:deep(.p-inputmask) {
    padding: 0.75rem 0.75rem !important;
    font-size: 0.95rem !important;
}

/* Ajuste específico para el SelectButton */
:deep(.p-selectbutton .p-button) {
    padding: 0.75rem 1rem !important;
    font-size: 0.95rem !important;
}

.p-inputgroup {
    display: flex;
}
.p-inputgroup > .w-full {
    flex-grow: 1;
}
</style>