<script>
import VehicleDetail from '../components/vehicle-detail.component.vue';
import VehicleTelemetryDetail from '../components/vehicle-telemetry-detail.component.vue';
import VehicleInsightsDetail from '../components/vehicle-insights-detail.component.vue';
import {Vehicle} from "../models/vehicle.entity.js";
import {VehicleApiService} from "../services/vehicle-api.service.js";

export default {
  name: 'vehicle-detail-management',
  components: {
    VehicleDetail,
    VehicleTelemetryDetail,
    VehicleInsightsDetail
  },

  data() {
    return {
      vehicle: null,
      loading: true,
      error: null,
      vehicleApiService: new VehicleApiService(),
      activeTab: 0,
      vehicleId: null
    }
  },

  computed: {
    tabs() {
      const t = this.$t;
      return [
        {label: t('vehicle_management.detail.tabs.vehicle_details'), icon: 'pi pi-car'},
        {label: t('vehicle_management.detail.tabs.telemetry'), icon: 'pi pi-chart-line'},
        {label: t('vehicle_management.detail.tabs.insights'), icon: 'pi pi-lightbulb'}
      ];
    }
  },

  methods: {

    onTabChange(event) {
      this.activeTab = event.index;
    },

    navigateBack() {
      this.$router.push({name: 'vehicle-management'});
    },

    getVehicleDetailsById(vehicleId) {
      // Lógica para obtener detalles del vehículo por ID
      // Siguiendo el patrón implementado en service-request
      console.log(`Obtener detalles del vehículo con ID: `, vehicleId);

      this.loading = true;
      this.error = null;

      // Paso 1: Obtener todos los vehículos de la API
      this.vehicleApiService.getAll().then(response => {

        // Paso 2: Filtrar el response para asignar el item correcto
        // Se obtienen todos los recursos de vehículos y luego se filtra por vehicleId
        // para quedarse solo con los datos del vehículo que se tiene que mostrar
        const vehicleData = response.data.find(v => v.vehicleId === parseInt(vehicleId) || v.vehicleId === vehicleId);

        this.vehicle = vehicleData ? new Vehicle(vehicleData) : null;

        // Mostrar mensaje de éxito después de un breve delay
        setTimeout(() => {
          this.loading = false;

          if (this.vehicle) {
            console.log('Detalles del vehículo obtenidos:', this.vehicle);

            this.$toast.add({
              severity: 'success',
              summary: this.$t('vehicle_management.messages.vehicle_loaded'),
              detail: this.$t('vehicle_management.messages.loaded_successfully'),
              life: 3000
            });
          } else {
            this.error = this.$t('vehicle_management.errors.failed_to_load');
            console.error('Vehículo no encontrado con ID:', vehicleId);
          }
        }, 300);
      })
          .catch(error => {
            console.error('Error al obtener detalles del vehículo:', error);
            this.loading = false;
            this.error = this.$t('vehicle_management.errors.failed_to_load');

            this.$toast.add({
              severity: 'error',
              summary: this.$t('vehicle_management.errors.error_title'),
              detail: this.error,
              life: 5000
            });
          });
    }

  },

  created() {
    // Obtener ID del vehículo desde la ruta (siguiendo el patrón de service-requests)
    const vehicleId = this.$route.query.id;

    console.log(`Cargar detalles del vehículo con ID: ${vehicleId}`);

    // Inicializar servicios
    this.vehicleApiService = new VehicleApiService('/vehicles');

    this.getVehicleDetailsById(vehicleId);

  },



}
</script>

<template>
  <pv-toast />
  
  <div class="vehicle-detail-management p-4">
    <!-- Header with back button -->
    <div class="flex align-items-center gap-3 mb-4">
      <pv-button 
        icon="pi pi-arrow-left" 
        @click="navigateBack"
        class="p-button-text p-button-plain"
        v-tooltip.bottom="$t('vehicle_management.actions.back_to_management')"
      />
      <div>
        <h2 class="text-3xl font-bold m-0">{{ $t('vehicle_management.detail.title') }}</h2>
        <p class="text-600 m-0" v-if="vehicle">
          {{ vehicle.brand }} {{ vehicle.model }} - {{ vehicle.licensePlate }}
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-content-center align-items-center" style="height: 400px;">
      <div class="text-center">
        <pv-progress-spinner />
        <p class="mt-3 text-600">{{ $t('vehicle_management.detail.loading') }}</p>
      </div>
    </div>

    <!-- Error state -->
    <pv-message v-else-if="error" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </pv-message>

    <!-- Vehicle details with tabs -->
    <div v-else-if="vehicle" class="vehicle-tabs-container">
      <pv-tab-view v-model:activeIndex="activeTab" @tab-change="onTabChange" class="custom-tabview">
        
        <!-- Vehicle Details Tab -->
        <pv-tab-panel>
          <template #header>
            <div class="tab-header">
              <i :class="tabs[0].icon" class="tab-icon"></i>
              <span class="tab-label">{{ tabs[0].label }}</span>
            </div>
          </template>
          
          <div class="tab-content-wrapper">
            <VehicleDetail :vehicle="vehicle" />
          </div>
        </pv-tab-panel>

        <!-- Telemetry Tab -->
        <pv-tab-panel>
          <template #header>
            <div class="tab-header">
              <i :class="tabs[1].icon" class="tab-icon"></i>
              <span class="tab-label">{{ tabs[1].label }}</span>
              <pv-badge 
                v-if="vehicle.telemetry?.activeAlert" 
                value="!" 
                severity="danger" 
                class="ml-2"
              />
            </div>
          </template>
          
          <div class="tab-content-wrapper">
            <VehicleTelemetryDetail 
              :telemetry="vehicle.telemetry" 
              :iot-device="vehicle.iotDevice" 
            />
          </div>
        </pv-tab-panel>

        <!-- Insights Tab -->
        <pv-tab-panel>
          <template #header>
            <div class="tab-header">
              <i :class="tabs[2].icon" class="tab-icon"></i>
              <span class="tab-label">{{ tabs[2].label }}</span>
            </div>
          </template>
          
          <div class="tab-content-wrapper">
            <VehicleInsightsDetail :vehicleId="vehicle.id || vehicle.vehicleId" />
          </div>
        </pv-tab-panel>

      </pv-tab-view>
    </div>
  </div>
</template>

<style scoped>
.vehicle-detail-management {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vehicle-tabs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flexbox scrolling */
}

.custom-tabview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tab-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.tab-icon {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.tab-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.tab-content-wrapper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  background: var(--surface-0);
}

/* Enhanced TabView Styling */
:deep(.p-tabview-nav) {
  background: var(--surface-50);
  border: 1px solid var(--surface-200);
  border-radius: 12px 12px 0 0;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.p-tabview-nav-link) {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  margin: 0 0.25rem;
}

:deep(.p-tabview-nav-link:hover) {
  background: var(--surface-100);
  border-color: var(--primary-200);
  transform: translateY(-1px);
}

:deep(.p-tabview-nav-link:focus) {
  box-shadow: 0 0 0 2px var(--primary-200);
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
  background: var(--primary-50);
  border-color: var(--primary-300);
  color: var(--primary-700);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.p-tabview-selected .tab-icon) {
  color: var(--primary-600);
  transform: scale(1.1);
}

:deep(.p-tabview-panels) {
  background: var(--surface-0);
  border: 1px solid var(--surface-200);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.p-tabview-panel) {
  padding: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for content areas */
.tab-content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.tab-content-wrapper::-webkit-scrollbar-track {
  background: var(--surface-100);
  border-radius: 4px;
}

.tab-content-wrapper::-webkit-scrollbar-thumb {
  background: var(--surface-400);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.tab-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--surface-500);
}

/* Responsive improvements */
@media (max-width: 768px) {
  .tab-header {
    padding: 0.5rem 0.75rem;
  }
  
  .tab-label {
    font-size: 0.85rem;
  }
  
  .tab-icon {
    font-size: 1rem;
  }
  
  .tab-content-wrapper {
    padding: 1rem;
  }
  
  :deep(.p-tabview-nav) {
    padding: 0.25rem;
    border-radius: 8px 8px 0 0;
  }
  
  :deep(.p-tabview-panels) {
    border-radius: 0 0 8px 8px;
  }
}

/* Animation for tab content */
:deep(.p-tabview-panel[aria-hidden="false"]) {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading and error state improvements */
.flex.justify-content-center.align-items-center {
  background: var(--surface-50);
  border-radius: 12px;
  border: 1px solid var(--surface-200);
}
</style>