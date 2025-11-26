<script>
import { InsightsApiService } from "../services/insights-api.service.js";

export default {
    name: "vehicle-insights-detail",
    props: {
        vehicleId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            insights: null,
            loading: false,
            error: null,
            insightsService: new InsightsApiService()
        };
    },
    methods: {
        getInsights() {
            this.loading = true;
            this.error = null;
            this.insightsService.getVehicleInsights(this.vehicleId)
                .then(response => {
                    this.insights = response.data;
                    this.loading = false;
                })
                .catch(e => {
                    console.error(e);
                    // 404 means no insights generated yet
                    if (e.response && e.response.status === 404) {
                        this.insights = null;
                    } else {
                        this.error = this.$t('common.error_loading_data');
                    }
                    this.loading = false;
                });
        },
        getRiskSeverity(level) {
             if (!level) return 'info';
             switch(level.toUpperCase()) {
                 case 'HIGH': return 'danger';
                 case 'MEDIUM': return 'warning';
                 case 'LOW': return 'success';
                 default: return 'info';
             }
        }
    },
    mounted() {
        if (this.vehicleId) {
            this.getInsights();
        }
    },
    watch: {
        vehicleId(newId) {
            if (newId) {
                this.getInsights();
            }
        }
    }
}
</script>

<template>
    <div class="vehicle-insights-detail">
        <div v-if="loading" class="flex justify-content-center p-4">
            <pv-progress-spinner />
        </div>
        <div v-else-if="error" class="p-4">
            <pv-message severity="error">{{ error }}</pv-message>
        </div>
        <div v-else-if="insights" class="flex flex-column gap-4 pb-4">
            
            <!-- Insight Summary Card -->
            <pv-card>
                <template #header>
                    <div class="flex align-items-center gap-2 px-3 py-2 header-bg text-white">
                        <i class="pi pi-lightbulb"></i>
                        <span class="font-bold text-lg">{{ $t('vehicle_management.detail.insights.summary_title') }}</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid formgrid pt-3">
                        <div class="col-12 md:col-6">
                            <label class="block text-500 font-semibold mb-2">{{ $t('vehicle_management.detail.insights.risk_level') }}</label>
                            <pv-tag :value="insights.riskLevel" :severity="getRiskSeverity(insights.riskLevel)" class="text-lg px-3 py-2"></pv-tag>
                        </div>
                        <div class="col-12 md:col-6">
                            <label class="block text-500 font-semibold mb-2">{{ $t('vehicle_management.detail.insights.generated_at') }}</label>
                            <span class="text-900 text-lg">{{ new Date(insights.generatedAt).toLocaleString() }}</span>
                        </div>
                    </div>
                </template>
            </pv-card>

            <!-- Recommendations -->
            <div v-if="insights.recommendations && insights.recommendations.length > 0">
                <h3 class="mb-3">{{ $t('vehicle_management.detail.insights.recommendations_title') }}</h3>
                <div class="grid">
                    <div v-for="(rec, index) in insights.recommendations" :key="index" class="col-12">
                        <pv-card class="h-full surface-card border-left-3 border-primary-500">
                             <template #title>
                                <div class="flex align-items-center gap-2">
                                    <i class="pi pi-check-circle text-primary-500"></i>
                                    <span>{{ rec.title }}</span>
                                </div>
                             </template>
                             <template #content>
                                <p class="m-0 line-height-3 text-700">{{ rec.detail }}</p>
                             </template>
                        </pv-card>
                    </div>
                </div>
            </div>
            <div v-else class="text-center p-4">
                <span class="text-500">{{ $t('vehicle_management.detail.insights.no_recommendations') }}</span>
            </div>

        </div>
        <div v-else class="flex flex-column align-items-center justify-content-center p-6 text-center">
            <i class="pi pi-info-circle text-4xl text-500 mb-3"></i>
            <span class="text-xl text-700 font-medium">{{ $t('vehicle_management.detail.insights.no_insights_generated') }}</span>
        </div>
    </div>
</template>

<style scoped>
.header-bg {
    background-color: #4A60D0;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}
</style>

