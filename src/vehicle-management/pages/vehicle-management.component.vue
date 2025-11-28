<script>

import DataManager from "../../shared/components/data-manager.component.vue";
import {Vehicle} from "../models/vehicle.entity.js";
import {VehicleApiService} from "@/vehicle-management/services/vehicle-api.service.js";
import http from "../../shared/services/http-common";


export default {
  name: 'vehicle-management',
  components: {DataManager},

  data() {
      return {
        // Servicio de API
        vehicleApiService: new VehicleApiService(),

        itemsArray: [],

        globalFilterValue: '', // Valor del filtro global de búsqueda
        selectedStatus: null, // Estado seleccionado en el filtro
        selectedFuelType: null, // Tipo de combustible seleccionado

        loading: false,
      }
  },

  computed: {
    columns() {
      const t = this.$t;
      return [
        { field: 'licensePlate', header: t('vehicle_management.columns.license_plate'), sortable: true, style: 'width: 130px;' },
        { field: 'vehicleBrandModel', header: t('vehicle_management.columns.vehicle'), sortable: true, style: 'width: 200px;' },
        { field: 'ownerName', header: t('vehicle_management.columns.owner'), sortable: true, style: 'width: 180px;' },
        { field: 'ownerPhone', header: t('vehicle_management.columns.contact'), sortable: true, style: 'width: 140px;' },
        { field: 'currentMileage', header: t('vehicle_management.columns.mileage'), sortable: true, style: 'width: 120px;' },
        { field: 'fuelLevel', header: t('vehicle_management.columns.fuel_level'), sortable: true, template: 'fuelLevel', style: 'width: 100px;' },
        { field: 'vehicleStatus', header: t('vehicle_management.columns.status'), sortable: true, template: 'status', style: 'width: 120px;' },
        { field: 'iotActiveStatus', header: t('vehicle_management.columns.iot_device'), sortable: true, template: 'iotStatus', style: 'width: 120px;' },
      ];
    },

    statusOptions() {
      const t = this.$t;
      return [
        { label: t('vehicle_management.filters.all_status'), value: null },
        { label: t('vehicle_management.status.active'), value: 'active' },
        { label: t('vehicle_management.status.in_service'), value: 'in-service' },
        { label: t('vehicle_management.status.inactive'), value: 'inactive' },
        { label: t('vehicle_management.status.maintenance'), value: 'maintenance' },
      ];
    },

    fuelTypeOptions() {
      const t = this.$t;
      return [
        { label: t('vehicle_management.filters.all_fuel_types'), value: null },
        { label: t('vehicle_management.fuel_types.gasoline'), value: 'gasoline' },
        { label: t('vehicle_management.fuel_types.diesel'), value: 'diesel' },
        { label: t('vehicle_management.fuel_types.hybrid'), value: 'hybrid' },
        { label: t('vehicle_management.fuel_types.electric'), value: 'electric' },
      ];
    },

    title() {
      const t = this.$t;
      return {
        singular: t('vehicle_management.title_singular'),
        plural: t('vehicle_management.title_plural'),
      };
    },

    // Filtro combinado que aplica todos los filtros activos
    filteredItemsArray() {
      let filtered = [...this.itemsArray]; // Copia del array original para filtrar sin mutar el original

      // Filtro por búsqueda global (placa, marca/modelo, propietario, teléfono)
      if (this.globalFilterValue && this.globalFilterValue.trim().length > 0) {
        const searchTerm = this.globalFilterValue.toLowerCase().trim().replace(/\s+/g, ' ');
        filtered = filtered.filter(vehicle =>
            (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
            (vehicle.vehicleBrandModel && vehicle.vehicleBrandModel.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
            (vehicle.ownerName && vehicle.ownerName.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
            (vehicle.ownerPhone && vehicle.ownerPhone.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
            (vehicle.vin && vehicle.vin.toLowerCase().includes(searchTerm))
        );
      }

      // Filtro por estado seleccionado
      if (this.selectedStatus) {
        filtered = filtered.filter(vehicle => vehicle.vehicleStatus === this.selectedStatus);
      }

      // Filtro por tipo de combustible
      if (this.selectedFuelType) {
        filtered = filtered.filter(vehicle => vehicle.fuelType === this.selectedFuelType);
      }

      return filtered;
    }
  },

  methods: {

    onNewItemRequested() {
      console.log('Add new vehicle');
      // Implement navigation to vehicle creation form
    },

    onDeleteSelectedItems(selectedItems) {
      console.log('Delete selected vehicles:', selectedItems);
      // Implement multiple deletion logic
      selectedItems.forEach(item => {
        const index = this.itemsArray.findIndex(vehicle => vehicle.id === item.id);
        if (index > -1) {
          this.itemsArray.splice(index, 1);
        }
      });
    },

    onDeleteItem(item) {
      console.log('Delete vehicle:', item);
      // Implement individual deletion logic
      const index = this.itemsArray.findIndex(vehicle => vehicle.id === item.id);
      if (index > -1) {
        this.itemsArray.splice(index, 1);
      }
    },

    onEditItem(item) {
      console.log('Edit vehicle:', item);
      // Implement navigation to vehicle editing form
    },

    onViewItem(item) {
      console.log('View vehicle details:', item);
      // Navigate to vehicle details view, passing vehicle data via route state
      this.$router.push({
        name: 'vehicle-details',
        query: { id: item.vehicleId },
        state: { vehicleData: item.fullData }  // Pass the complete vehicle data
      });
    },

    onRowSelect(event) {
      console.log('Row selected:', event);
    },

    onRowUnselect(event) {
      console.log('Row unselected:', event);
    },

    onClearFilters() {
      this.globalFilterValue = '';
      this.selectedStatus = null;
      this.selectedFuelType = null;
    },

    onGlobalFilterChange(value) {
      this.globalFilterValue = value || '';
    },

    getStatusSeverity(status) {
      switch (status) {
        case 'active':
          return 'success';
        case 'in-service':
          return 'info';
        case 'maintenance':
          return 'warn';
        case 'inactive':
          return 'danger';
        default:
          return 'info';
      }
    },

    getIoTStatusSeverity(isActive) {
      return isActive ? 'success' : 'danger';
    },

    getFuelLevelSeverity(fuelLevel) {
      if (fuelLevel >= 50) return 'success';
      if (fuelLevel >= 25) return 'warn';
      return 'danger';
    },

    // Function to get owner full name
    getOwnerFullName(owner) {
      if (!owner) return this.$t('vehicle_management.messages.no_owner_specified');

      const firstName = owner.firstName || '';
      const lastName = owner.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();

      return fullName || this.$t('vehicle_management.messages.no_owner_specified');
    },

    // Function to get vehicle brand and model
    getVehicleBrandModel(vehicle) {
      if (!vehicle) return this.$t('vehicle_management.messages.na');

      const brand = vehicle.brand || '';
      const model = vehicle.model || '';
      const subModel = vehicle.subModel || '';
      
      let result = `${brand} ${model}`.trim();
      if (subModel) {
        result += ` ${subModel}`;
      }

      return result || this.$t('vehicle_management.messages.na');
    },


    // Function to handle server errors
    handleServerError(error, context = 'data') {
      console.error(`Error loading ${context}:`, error);

      let errorMessage = '';
      let showToast = false;

      if (error.response) {
        const status = error.response.status;
        showToast = true;
        
        if (status >= 500) {
          errorMessage = this.$t('vehicle_management.errors.internal_server_error', { context });
        } else if (status >= 400) {
          errorMessage = this.$t('vehicle_management.errors.request_error', { context });
        } else {
          errorMessage = this.$t('vehicle_management.errors.server_error', { status, context });
        }
      } else if (error.request) {
        showToast = true;
        errorMessage = this.$t('vehicle_management.errors.connection_error', { context });
      } else if (error.message && (error.message.includes('invalid') || error.message.includes('format'))) {
        showToast = true;
        errorMessage = this.$t('vehicle_management.errors.data_format_error', { message: error.message });
      }
      
      if (showToast) {
        this.$toast.add({
          severity: 'error',
          summary: this.$t('vehicle_management.errors.server_error_title'),
          detail: errorMessage,
          life: 7000
        });
      }
    },

    async getAll() {
      this.loading = true;

      try {
        const response = await this.vehicleApiService.getAll();
        console.log('Raw API response (Appointments for Vehicles):', response);
        console.log('Total appointments:', response.data?.length || 0);
        
        // Filtrar SOLO citas que están EN PROGRESO (vehículos siendo atendidos)
        const appointments = (response.data || []).filter(app => app.status === 'IN_PROGRESS');
        console.log('Filtered IN_PROGRESS appointments:', appointments);
        console.log('Total IN_PROGRESS appointments:', appointments.length);

        // Extraer vehículos únicos por vehicleId
        const vehiclesMap = new Map();

        // Usar Promise.all para obtener los datos de cada vehículo
        const vehiclePromises = appointments.map(async (app) => {
            if (!app.vehicleId) {
                console.warn('Appointment without vehicleId:', app);
                return null;
            }

            const vehicleKey = String(app.vehicleId); // Asegurar que sea string para consistencia
            
            // Skip if already processed
            if (vehiclesMap.has(vehicleKey)) {
                console.log(`Vehicle ${vehicleKey} already processed, skipping...`);
                return null;
            }

            try {
              // Obtener datos completos del vehículo  
              const vehicleResponse = await http.get(`/vehicles/${app.vehicleId}`);
              const vehicleData = vehicleResponse.data;
              console.log(`Fetched vehicle data for ID ${app.vehicleId}:`, vehicleData);

              // Obtener datos del owner (driver/person profile)
              let ownerData = null;
              if (app.driverId) {
                try {
                  const profileResponse = await http.get(`/person-profiles/${app.driverId}`);
                  ownerData = {
                    firstName: profileResponse.data.fullName?.split(' ')[0] || 'N/A',
                    lastName: profileResponse.data.fullName?.split(' ').slice(1).join(' ') || '',
                    phoneNumber: profileResponse.data.phone || 'N/A',
                    email: profileResponse.data.email || 'N/A'
                  };
                } catch (error) {
                  console.warn(`Could not fetch driver profile ${app.driverId}:`, error.message);
                }
              }

              // Combinar datos
              const enrichedVehicle = {
                vehicleId: vehicleData.id,
                licensePlate: vehicleData.licensePlate || 'N/A',
                brand: vehicleData.brand || 'N/A',
                model: vehicleData.model || 'N/A',
                owner: ownerData,
                vehicleStatus: 'in-service', // En servicio porque está IN_PROGRESS
                currentAppointmentId: app.id
              };

              vehiclesMap.set(vehicleKey, enrichedVehicle);
              return enrichedVehicle;
            } catch (error) {
              console.error(`Error fetching vehicle ${app.vehicleId}:`, error);
              return null;
            }
        });

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(vehiclePromises);
        
        const vehicles = Array.from(vehiclesMap.values());
        console.log('Final enriched vehicles being serviced:', vehicles);
        console.log('Total vehicles to display:', vehicles.length);

        // Map to table structure
        this.itemsArray = vehicles.map(item => {
          const vehicle = new Vehicle(item);

          return {
            ...vehicle,
            id: item.vehicleId,
            licensePlate: item.licensePlate,
            vehicleBrandModel: `${item.brand} ${item.model}`.trim(),
            currentMileage: item.currentMileage || 0,
            fuelType: item.fuelType || this.$t('vehicle_management.messages.na'),
            ownerName: item.owner ? `${item.owner.firstName} ${item.owner.lastName}`.trim() : 'N/A',
            ownerPhone: item.owner?.phoneNumber || 'N/A',
            ownerEmail: item.owner?.email || 'N/A',
            fuelLevel: item.telemetry?.fuelLevel || 0,
            engineTemperature: item.telemetry?.engineTemperature || 0,
            batteryVoltage: item.telemetry?.batteryVoltage || 0,
            lastUpdate: item.telemetry?.lastUpdate || null,
            vehicleStatus: 'in-service', // Siempre in-service porque filtramos IN_PROGRESS
            iotActiveStatus: item.iotDevice?.isActive || false,
            iotDeviceModel: item.iotDevice?.deviceModel || this.$t('vehicle_management.messages.na'),
            fullData: item
          };
        });

        console.log('Final mapped items for table:', this.itemsArray);
        console.log('Items array length:', this.itemsArray.length);

      } catch (error) {
        console.error('API Error:', error);
        this.itemsArray = [];
        this.handleServerError(error, 'vehicles');
      } finally {
        this.loading = false;
      }
    },

    // Mock data for development/testing


  },

  created() {
    this.vehicleApiService = new VehicleApiService('/vehicles');

    // Load data when component initializes
    this.getAll();
  }



}

</script>

<template>
  <pv-toast />

  <div class="h-full overflow-hidden flex flex-column p-4">

    <!-- Page title -->
    <h2 class="text-3xl font-bold mb-2">{{ $t('vehicle_management.title') }}</h2>
    <p>{{ $t('vehicle_management.subtitle') }}</p>

    <data-manager
        :items="itemsArray"
        :filtered-items="filteredItemsArray"
        :global-filter-value="globalFilterValue"
        :columns="columns"
        :title="title"
        :loading="loading"
        :dynamic="true"
        :show-new="false"
        :show-delete="true"
        :show-export="true"
        :show-selection="true"
        :show-actions="true"
        :show-action-buttons="true"
        :rows="10"
        :rows-per-page-options="[5, 10, 15, 20, 50]"
        :new-button-label="$t('vehicle_management.actions.add_vehicle')"
        :delete-button-label="$t('vehicle_management.actions.delete')"
        :export-button-label="$t('vehicle_management.actions.export')"
        :search-placeholder="$t('vehicle_management.actions.search_placeholder')"
        @new-item-requested-manager="onNewItemRequested"
        @delete-selected-items-requested-manager="onDeleteSelectedItems"
        @delete-item-requested-manager="onDeleteItem"
        @edit-item-requested-manager="onEditItem"
        @view-item-requested-manager="onViewItem"
        @row-select="onRowSelect"
        @row-unselect="onRowUnselect"
        @global-filter-change="onGlobalFilterChange"
        @clear-filters="onClearFilters"
    >
      <!-- Custom filters for status and fuel type -->
      <template #filters="{ clearFilters }" >
        <div class="flex align-items-center gap-2">
          <pv-dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('vehicle_management.filters.filter_by_status')"
              class="flex-1 h-full"
          />
          <pv-dropdown
              v-model="selectedFuelType"
              :options="fuelTypeOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('vehicle_management.filters.filter_by_fuel_type')"
              class="flex-1 h-full"
          />
          <!-- Button to clear specific filters -->
          <pv-button
              :label="$t('vehicle_management.actions.clear_filters')"
              icon="pi pi-filter-slash"
              @click="onClearFilters()"
              class="p-button-secondary flex-shrink-0 h-full"
          />
        </div>
      </template>

      <!-- Template for "status" field -->
      <template #status="{ data }">
        <pv-tag
            :value="data.vehicleStatus"
            :severity="getStatusSeverity(data.vehicleStatus)"
            class="text-sm"
        />
      </template>

      <!-- Template for "iotStatus" field -->
      <template #iotStatus="{ data }">
        <pv-tag
            :value="data.iotActiveStatus ? $t('vehicle_management.iot_status.active') : $t('vehicle_management.iot_status.inactive')"
            :severity="getIoTStatusSeverity(data.iotActiveStatus)"
            class="text-sm"
        />
      </template>

      <!-- Template for "fuelLevel" field -->
      <template #fuelLevel="{ data }">
        <div class="flex align-items-center gap-2">
          <pv-tag
              :value="`${data.fuelLevel}%`"
              :severity="getFuelLevelSeverity(data.fuelLevel)"
              class="text-sm"
          />
        </div>
      </template>

    </data-manager>

  </div>

</template>

<style scoped>

</style>