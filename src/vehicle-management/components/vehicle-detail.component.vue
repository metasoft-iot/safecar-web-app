<script>
import {Vehicle} from "../models/vehicle.entity.js";


export default {
  name: 'vehicle-detail',

  props: {
    vehicle: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      error: null
    };
  },

  computed: {
    vehicleDisplayName() {
      if (!this.vehicle) return '';
      const brand = this.vehicle.brand || '';
      const model = this.vehicle.model || '';
      const subModel = this.vehicle.subModel || '';
      let result = `${brand} ${model}`.trim();
      if (subModel) result += ` ${subModel}`;
      return result;
    },

    ownerFullName() {
      if (!this.vehicle?.owner) return this.$t('vehicle_management.detail.owner_information.no_owner_info');
      const firstName = this.vehicle.owner.firstName || '';
      const lastName = this.vehicle.owner.lastName || '';
      return `${firstName} ${lastName}`.trim() || this.$t('vehicle_management.detail.owner_information.no_owner_info');
    }
  },

  methods: {

    formatDate(dateString) {
      if (!dateString) return this.$t('vehicle_management.messages.na');
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } catch (error) {
        return dateString;
      }
    },

    getStatusSeverity(status) {
      switch (status) {
        case 'active': return 'success';
        case 'in-service': return 'info';
        case 'maintenance': return 'warn';
        case 'inactive': return 'danger';
        default: return 'info';
      }
    }
  },


};
</script>

<template>
  <div v-if="!loading && !error && vehicle" class="flex flex-column pb-4 gap-4">
    
    <!-- ====================== Card -> Vehicle Information ====================== -->
    <pv-card class="w-full">
      <template #header>
        <div class="flex align-items-center justify-content-between px-3 py-2" style="background-color: #4A60D0; color: white;">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-car" style="color: white;"></i>
            <span class="text-lg font-bold">{{ $t('vehicle_management.detail.vehicle_information.title') }}</span>
          </div>
          <pv-tag 
            :value="vehicle.maintenance?.vehicleStatus || 'active'" 
            :severity="getStatusSeverity(vehicle.maintenance?.vehicleStatus || 'active')"
            class="text-sm"
          />
        </div>
      </template>
      <template #content>
        <div class="formgrid grid">
          <!-- First row: Brand/Model, License Plate, Year, VIN -->
          <div class="field col-12 md:col-3" v-if="vehicleDisplayName">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-car text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.brand_model') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg">{{ vehicleDisplayName }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.licensePlate">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-hashtag text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.license_plate') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg font-mono">{{ vehicle.licensePlate }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.year">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-calendar text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.year') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg">{{ vehicle.year }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.vin">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-id-card text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.vin_number') }}
            </label>
            <p class="font-semibold text-dark m-0 text-sm font-mono">{{ vehicle.vin }}</p>
          </div>
          
          <!-- Second row: Engine Type, Fuel Type, Color, Body Type -->
          <div class="field col-12 md:col-3" v-if="vehicle.engineType">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-cog text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.engine_type') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.engineType }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.fuelType">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-tint text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.fuel_type') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.fuelType }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.color">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-palette text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.color') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.color }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.bodyType">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-th-large text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.body_type') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.bodyType }}</p>
          </div>
          
          <!-- Third row: Transmission, Current Mileage, Registration Country, [Additional field] -->
          <div class="field col-12 md:col-3" v-if="vehicle.transmission">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-sliders-h text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.transmission') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.transmission }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.currentMileage">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-gauge text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.current_mileage') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ vehicle.currentMileage?.toLocaleString() }}</p>
              <span class="text-sm text-color-secondary">km</span>
            </div>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.registrationCountry">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-map text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.registration_country') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.registrationCountry }}</p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-shield text-primary"></i>
              {{ $t('vehicle_management.detail.vehicle_information.vehicle_status') }}
            </label>
            <pv-tag 
              :value="vehicle.maintenance?.vehicleStatus || 'active'" 
              :severity="getStatusSeverity(vehicle.maintenance?.vehicleStatus || 'active')"
              class="text-sm"
            />
          </div>
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> Owner Information ====================== -->
    <pv-card class="w-full">
      <template #header>
        <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
          <i class="pi pi-user" style="color: white;"></i>
          <span class="text-lg font-bold">{{ $t('vehicle_management.detail.owner_information.title') }}</span>
        </div>
      </template>
      <template #content>
        <div class="formgrid grid" v-if="vehicle.owner">
          <!-- First row: Full Name, Email, Phone, Ownership Type -->
          <div class="field col-12 md:col-3" v-if="ownerFullName">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-user text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.full_name') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg">{{ ownerFullName }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.owner.email">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-envelope text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.email_address') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.owner.email }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.owner.phoneNumber">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-phone text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.phone_number') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.owner.phoneNumber }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.owner.ownershipType">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-briefcase text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.ownership_type') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.owner.ownershipType }}</p>
          </div>
          
          <!-- Second row: Address (spans 2 columns), Registration Date, Preferred Workshop -->
          <div class="field col-12 md:col-6" v-if="vehicle.owner.address">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-map-marker text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.address') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.owner.address }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.owner.registeredAt">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-calendar-plus text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.registered_since') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ formatDate(vehicle.owner.registeredAt) }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.owner.preferredWorkshopId">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-wrench text-primary"></i>
              {{ $t('vehicle_management.detail.owner_information.preferred_workshop') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.owner.preferredWorkshopId }}</p>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <i class="pi pi-info-circle text-4xl text-400 mb-3"></i>
          <h3 class="text-600 text-xl m-0 mb-2">{{ $t('vehicle_management.detail.owner_information.no_owner_info') }}</h3>
          <p class="text-500 text-center m-0">{{ $t('vehicle_management.detail.owner_information.no_owner_details') }}</p>
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> Installation Workshop ====================== -->
    <pv-card class="w-full" v-if="vehicle.installationWorkshop">
      <template #header>
        <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
          <i class="pi pi-building" style="color: white;"></i>
          <span class="text-lg font-bold">{{ $t('vehicle_management.detail.installation_workshop.title') }}</span>
        </div>
      </template>
      <template #content>
        <div class="formgrid grid">
          <!-- First row: Workshop Name, Technician, Contact Number, Workshop Email -->
          <div class="field col-12 md:col-3" v-if="vehicle.installationWorkshop.name">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-building text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.workshop_name') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg">{{ vehicle.installationWorkshop.name }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.installationWorkshop.technician">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-user-plus text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.installation_technician') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.installationWorkshop.technician }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.installationWorkshop.contactNumber">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-phone text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.contact_number') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.installationWorkshop.contactNumber }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.installationWorkshop.email">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-envelope text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.workshop_email') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.installationWorkshop.email }}</p>
          </div>
          
          <!-- Second row: Workshop Address (spans 2 columns), Warranty Period, Certification -->
          <div class="field col-12 md:col-6" v-if="vehicle.installationWorkshop.address">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-map-marker text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.workshop_address') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.installationWorkshop.address }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="vehicle.installationWorkshop.installationWarrantyMonths">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-shield text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.warranty_period') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ vehicle.installationWorkshop.installationWarrantyMonths }} {{ $t('vehicle_management.detail.installation_workshop.months') }}</p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-verified text-primary"></i>
              {{ $t('vehicle_management.detail.installation_workshop.certification') }}
            </label>
            <pv-tag 
              :value="vehicle.installationWorkshop.certifiedInstaller ? $t('vehicle_management.detail.installation_workshop.certified') : $t('vehicle_management.detail.installation_workshop.not_certified')" 
              :severity="vehicle.installationWorkshop.certifiedInstaller ? 'success' : 'warn'"
              class="mt-1"
            />
          </div>
        </div>
      </template>
    </pv-card>

  </div>

  <!-- Loading state -->
  <div v-if="loading" class="flex justify-content-center align-items-center py-8">
    <div class="text-center">
      <pv-progress-spinner size="48" />
      <p class="mt-3 text-600 text-lg">{{ $t('vehicle_management.detail.loading') }}</p>
    </div>
  </div>

  <!-- Error state -->
  <div v-if="error" class="flex flex-column align-items-center justify-content-center py-8">
    <i class="pi pi-exclamation-triangle text-6xl text-red-400 mb-4"></i>
    <h3 class="text-600 text-xl m-0 mb-2">{{ $t('vehicle_management.detail.error_loading') }}</h3>
    <p class="text-500 text-center m-0 mb-4">{{ error }}</p>
    <pv-button :label="$t('vehicle_management.detail.retry')" icon="pi pi-refresh" @click="$emit('retry')" />
  </div>
</template>

<style scoped>
.text-dark {
  color: #2C3E50 !important;
}

.text-primary {
  color: #4A60D0 !important;
}

.font-mono {
  font-family: 'Courier New', monospace;
}

.text-sm p {
  font-size: 0.875rem !important;
}

.text-xl p {
  font-size: 1.25rem !important;
}

.text-lg p {
  font-size: 1.125rem !important;
}

/* Enhanced spacing for formgrid in cards */
.formgrid.grid {
  row-gap: 1.5rem;
}

/* Card styling */
:deep(.p-card-content) {
  padding-top: 0 !important;
}

/* Header styling with rounded borders */
:deep(.p-card .p-card-header) {
  border-top-left-radius: var(--border-radius) !important;
  border-top-right-radius: var(--border-radius) !important;
  border-bottom: none !important;
}

:deep(.p-card) {
  border-radius: var(--border-radius) !important;
  overflow: hidden !important;
}
</style>