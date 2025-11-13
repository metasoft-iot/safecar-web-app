<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'subscription-plan-card',
    props: {
        plan: {
            type: Object,
            required: true
        },
        isSelected: {
            type: Boolean,
            default: false
        }
    },
    emits: ['select-plan'],
    methods: {
        selectPlan() {
            if (!this.isSelected) {
                this.$emit('select-plan', this.plan);
            }
        }
    }
});
</script>

<template>
    <pv-card :class="['shadow-3 h-full flex flex-column transition-all transition-duration-300 cursor-pointer compact-plan-card', 
                       { 'border-3 border-primary': isSelected || plan.isPopular },
                       { 'hover:shadow-6': !isSelected },
                       'relative']"
             @click="selectPlan"
    >
        <template #header>
            <div v-if="plan.isPopular" class="flex justify-content-end">
                <pv-tag :value="$t('subscription.plan_popular_label')" 
                        severity="info" 
                        class="font-bold absolute -mt-3 mr-3"
                ></pv-tag>
            </div>
        </template>
        <template #title>
            <div class="pt-4 px-3"> 
                <h3 class="text-2xl font-semibold mb-2 mt-4">{{ plan.name }}</h3>
            </div>
        </template>
        <template #subtitle>
            <div class="px-3"> 
                <div class="text-3xl font-bold" :class="isSelected ? 'text-primary' : 'text-700'">{{ `S/${plan.price.toFixed(2)}` }}</div>
                <div class="text-sm text-600">{{ $t('subscription.price_per_month') }}</div>
            </div>
        </template>
        
        <template #content>
            <div class="px-3 flex-grow">
                <p class="mb-4 text-700 text-sm">{{ plan.description }}</p>
                <ul class="list-none p-0 m-0">
                    <li v-for="feature in plan.features" :key="feature" class="flex align-items-start mb-2">
                        <i class="pi pi-check text-green-500 mr-2 mt-1"></i> <span class="text-sm text-700">{{ feature }}</span>
                    </li>
                </ul>
            </div>
        </template>
        
        <template #footer>
            <div class="p-3"> 
                <pv-button 
                    :label="isSelected ? $t('subscription.Selected') : $t('subscription.Select Plan')" 
                    @click.stop="selectPlan" 
                    :severity="isSelected ? 'primary' : 'secondary'" 
                    :outlined="!isSelected"
                    :disabled="isSelected"
                    class="w-full font-bold" 
                />
            </div>
        </template>
    </pv-card>
</template>

<style scoped>
.compact-plan-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Hace que el contenido y el footer se separen */
  height: 100%; /* Fuerza que todas las tarjetas tengan la misma altura */
}

/* Ajusta el cuerpo del card */
.compact-plan-card :deep(.p-card-body),
.compact-plan-card :deep(.p-card-content) {
  padding: 0 !important;
  flex-grow: 1; /* El contenido crece para empujar el footer hacia abajo */
  display: flex;
  flex-direction: column;
}

/* Asegura que el footer siempre quede abajo */
.compact-plan-card :deep(.p-card-footer) {
  margin-top: auto;
}
</style>
