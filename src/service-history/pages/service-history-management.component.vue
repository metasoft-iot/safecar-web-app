<script>

import DataManager from "../../shared/components/data-manager.component.vue";
import {AppointmentRequestApiService} from "@/service-requests/services/appointment-request-api.service.js";
import {AppointmentRequest} from "@/service-requests/models/appointment-request.entity.js";
import http from "../../shared/services/http-common";

export default {
  name: 'service-history-management',
  components: {DataManager},

  data(){
    return {
      appointmentRequestApiService: new AppointmentRequestApiService(),
      itemsArray:[],

      globalFilterValue: '',
      selectedDate: null,
      selectedStatus: 'COMPLETED', // Default/Fixed filter

      loading: false,
    }
  },

  computed: {
    columns() {
      return [
        { field: 'vehiclePlate', header: this.$t('service_history.columns.plate'), sortable: true, style: 'width: 120px;' },
        { field: 'vehicleBrand', header: this.$t('service_history.columns.vehicle'), sortable: true, style: 'width: 180px;' },
        { field: 'customerName', header: this.$t('service_requests.columns.customer'), sortable: true, style: 'width: 180px;' },
        { field: 'serviceReason', header: this.$t('service_requests.columns.service'), sortable: true, style: 'width: 200px;' },
        { field: 'appointmentDate', header: this.$t('service_history.columns.service_date'), sortable: true, template: 'appointmentDate', style: 'width: 140px;' },
        { field: 'status', header: this.$t('service_requests.columns.status'), sortable: true, template: 'status', style: 'width: 120px;' }
      ];
    },
    
    title() {
      return {
        singular: 'Servicio Completado',
        plural: 'Servicios Completados',
      };
    },

    filteredItemsArray() {
      let filtered = [...this.itemsArray];

      // Global Filter
      if (this.globalFilterValue && this.globalFilterValue.trim().length > 0) {
        const searchTerm = this.globalFilterValue.toLowerCase().trim().replace(/\s+/g, ' ');
        filtered = filtered.filter(item =>
          (item.vehiclePlate && item.vehiclePlate.toLowerCase().includes(searchTerm)) ||
          (item.vehicleBrand && item.vehicleBrand.toLowerCase().includes(searchTerm)) ||
          (item.customerName && item.customerName.toLowerCase().includes(searchTerm)) ||
          (item.serviceReason && item.serviceReason.toLowerCase().includes(searchTerm))
        );
      }

      // Date Filter
      if (this.selectedDate) {
        const selectedDateStr = this.dateToComparableString(this.selectedDate);
        if (selectedDateStr) {
          filtered = filtered.filter(item => {
            const itemDateStr = this.normalizeDateForComparison(item.appointmentDate);
            return itemDateStr === selectedDateStr;
          });
        }
      }

      return filtered;
    }
  },

  methods: {

    onNewItemRequested() {
      // Not implemented for history
    },

    onDeleteSelectedItems(selectedItems) {
       // Not implemented
    },

    onDeleteItem(item) {
       // Not implemented
    },

    onEditItem(item) {
       // Not implemented
    },

    onViewItem(item) {
      // Navigate to details if needed, reusing appointment details
       this.$router.push({ 
        name: 'appointment-request-details',
        query: { id: item.appointmentId }
      });
    },

    onRowSelect(event) {},
    onRowUnselect(event) {},

    onClearFilters() {
      this.globalFilterValue = '';
      this.selectedDate = null;
    },

    onGlobalFilterChange(value) {
      this.globalFilterValue = value || '';
    },

    getStatusSeverity(status) {
      switch (status) {
        case 'COMPLETED': return 'success';
        case 'CANCELLED': return 'danger';
        default: return 'info';
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      try {
        let dateToFormat;
        if (dateString.includes('T')) {
          const datePart = dateString.split('T')[0];
          const [year, month, day] = datePart.split('-');
          dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (dateString.includes('-')) {
          const [year, month, day] = dateString.split('-');
          dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          dateToFormat = new Date(dateString);
        }
        if (isNaN(dateToFormat.getTime())) return dateString;
        const day = dateToFormat.getDate().toString().padStart(2, '0');
        const month = (dateToFormat.getMonth() + 1).toString().padStart(2, '0');
        const year = dateToFormat.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (error) {
        return dateString;
      }
    },

    normalizeDateForComparison(dateString) {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
      } catch (error) {
        return null;
      }
    },

    dateToComparableString(dateObject) {
      if (!dateObject) return null;
      try {
        const date = dateObject instanceof Date ? dateObject : new Date(dateObject);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        return null;
      }
    },
    
    getCustomerFullName(customer) {
      if (!customer) return 'Cliente no especificado';
      const firstName = customer.firstName || '';
      const lastName = customer.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Cliente no especificado';
    },

    getVehicleBrandModel(vehicle) {
      if (!vehicle) return 'N/A';
      const brand = vehicle.brand || '';
      const model = vehicle.model || '';
      return `${brand} ${model}`.trim() || 'N/A';
    },

    async getAll() {
      this.loading = true;
      try {
        const response = await this.appointmentRequestApiService.getAll();
        const allAppointments = response.data || [];
        
        // Enrich appointments with vehicle and driver data (like in dashboard)
        const enrichedAppointments = await Promise.all(
          allAppointments.map(async (app) => {
            let enrichedApp = { ...app };

            // Get vehicle data
            if (app.vehicleId) {
              try {
                const vehicleResponse = await http.get(`/vehicles/${app.vehicleId}`);
                enrichedApp.vehicle = {
                  brand: vehicleResponse.data.brand || 'Unknown',
                  model: vehicleResponse.data.model || '',
                  licensePlate: vehicleResponse.data.licensePlate || 'N/A'
                };
              } catch (error) {
                console.warn(`Could not fetch vehicle ${app.vehicleId}`);
                enrichedApp.vehicle = null;
              }
            }

            // Get driver data (customer)
            if (app.driverId) {
              try {
                const profileResponse = await http.get(`/person-profiles/${app.driverId}`);
                const fullName = profileResponse.data.fullName || 'N/A';
                enrichedApp.customer = {
                  firstName: fullName.split(' ')[0] || 'N/A',
                  lastName: fullName.split(' ').slice(1).join(' ') || ''
                };
              } catch (error) {
                console.warn(`Could not fetch driver profile ${app.driverId}`);
                enrichedApp.customer = null;
              }
            }

            // Add appointment request with proper date formatting
            enrichedApp.appointmentRequest = {
              scheduledDate: app.startAt || null,
              startTime: app.startAt ? app.startAt.split('T')[1]?.substring(0, 5) : null,
              requestedService: app.serviceType || app.customServiceDescription || 'Servicio general'
            };

            return enrichedApp;
          })
        );
        
        // Map to display format
        const processedAppointments = enrichedAppointments.map(item => {
          return {
            ...item,
            id: item.id,
            appointmentId: item.id,
            customerName: this.getCustomerFullName(item.customer),
            vehiclePlate: item.vehicle?.licensePlate || 'N/A',
            vehicleBrand: this.getVehicleBrandModel(item.vehicle),
            appointmentDate: item.appointmentRequest?.scheduledDate || '',
            serviceReason: item.appointmentRequest?.requestedService || 'Servicio general',
            status: item.status || 'PENDING'
          };
        });

        // Filter only COMPLETED appointments
        this.itemsArray = processedAppointments.filter(a => a.status === 'COMPLETED');
        
      } catch (error) {
        console.error("Error loading history:", error);
        this.itemsArray = [];
        this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to load completed services', life: 3000});
      } finally {
        this.loading = false;
      }
    }
  },

  created() {
    this.getAll();
  }
};
</script>

<template>
  <pv-toast />

  <div class="h-full overflow-hidden flex flex-column p-4">

    <!-- Título de la página -->
    <h2 class="text-3xl font-bold mb-2">Completed Services</h2>
    <p>View history of completed services.</p>

    <data-manager
        :items="itemsArray"
        :filtered-items="filteredItemsArray"
        :global-filter-value="globalFilterValue"
        :columns="columns"
        :title="title"
        :loading="loading"
        :dynamic="true"
        :show-new="false"
        :show-delete="false"
        :show-export="true"
        :show-selection="false"
        :show-actions="true"
        :show-action-buttons="true"
        :rows="10"
        :rows-per-page-options="[5, 10, 15, 20, 50]"
        :export-button-label="$t('service_history.export')"
        :search-placeholder="$t('service_history.search_placeholder')"
        @view-item-requested-manager="onViewItem"
        @global-filter-change="onGlobalFilterChange"
        @clear-filters="onClearFilters"
    >
      <!-- Filtro personalizado para fecha -->
      <template #filters="{ clearFilters }" >
        <div class="flex align-items-center gap-2">
          <!-- Filtro por fecha -->
          <pv-calendar
              id="serviceDate"
              v-model="selectedDate"
              :placeholder="$t('common.date_format')"
              dateFormat="dd/mm/yy"
              show-icon
              class="flex-1 h-full"
          />
          <!-- Botón para limpiar filtros específicos -->
          <pv-button
              :label="$t('service_history.clear_filters')"
              icon="pi pi-filter-slash"
              @click="onClearFilters()"
              class="p-button-secondary flex-shrink-0 h-full"
          />
        </div>
      </template>

      <!-- Template para el campo "appointmentDate" -->
      <template #appointmentDate="{ data }">
        <span>{{ formatDate(data.appointmentDate) }}</span>
      </template>
      
      <!-- Template para el campo "status" -->
      <template #status="{ data }">
        <pv-tag
            :value="data.status"
            :severity="getStatusSeverity(data.status)"
            class="text-sm"
        />
      </template>

    </data-manager>

  </div>

</template>
