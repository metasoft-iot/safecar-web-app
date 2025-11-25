<script>

import DataManager from "../../shared/components/data-manager.component.vue";
import {AppointmentRequest, Customer, Vehicle, AppointmentRequestDetails} from "../models/appointment-request.entity.js";
import {AppointmentRequestApiService} from "@/service-requests/services/appointment-request-api.service.js";
import http from "../../shared/services/http-common";


export default {
  name: 'services-request-management',
  components: {DataManager},

  data(){
    return {

      // Servicio de API
      appointmentRequestApiService: new AppointmentRequestApiService(),

      itemsArray:[],

      globalFilterValue: '', // Valor del filtro global de búsqueda
      selectedDate: null, // Fecha seleccionada en el filtro
      selectedStatus: null, // Estado seleccionado en el filtro

      loading: false,

      // Dialog State
      showManageDialog: false,
      manageDialogLoading: false,
      selectedAppointment: null,
      availableMechanics: [],
      
      // Form State
      formStatus: null,
      formMechanicId: null,

    }
  },

  computed: {
    columns() {
      return [
        { field: 'customerName', header: this.$t('service_requests.columns.customer'), sortable: true, style: 'width: 200px;' },
        { field: 'customerPhone', header: this.$t('service_requests.columns.phone'), sortable: true, style: 'width: 140px;' },
        { field: 'vehiclePlate', header: this.$t('service_requests.columns.plate'), sortable: true, style: 'width: 120px;' },
        { field: 'vehicleBrand', header: this.$t('service_requests.columns.brand_model'), sortable: true, style: 'width: 180px;' },
        { field: 'appointmentDate', header: this.$t('service_requests.columns.appointment_date'), sortable: true, template: 'appointmentDate', style: 'width: 140px;' },
        { field: 'serviceReason', header: this.$t('service_requests.columns.service'), sortable: true, style: 'width: 200px;' },
        { field: 'status', header: this.$t('service_requests.columns.status'), sortable: true, template: 'status', style: 'width: 120px;' },
      ];
    },

    statusOptions() {
      return [
        { label: this.$t('service_requests.status.all'), value: null },
        { label: this.$t('service_requests.status.pending'), value: 'PENDING' },
        { label: this.$t('service_requests.status.confirmed'), value: 'CONFIRMED' },
        { label: this.$t('service_requests.status.in_progress'), value: 'IN_PROGRESS' },
        { label: this.$t('service_requests.status.completed'), value: 'COMPLETED' },
        { label: this.$t('service_requests.status.cancelled'), value: 'CANCELLED' },
      ];
    },

    title() {
      return {
        singular: this.$t('service_requests.title_singular'),
        plural: this.$t('service_requests.title_plural'),
      };
    },
    // Filtro combinado que aplica todos los filtros activos
    filteredItemsArray() {
      let filtered = [...this.itemsArray]; // Copia del array original para filtrar sin mutar el original

      // Filtro por búsqueda global (nombre de cliente, teléfono, placa, marca/modelo, servicio)
      // Solo aplicar filtro si hay contenido real (no null, no undefined, no string vacío o solo espacios)
      if (this.globalFilterValue && this.globalFilterValue.trim().length > 0) {
        // Normalizar el término de búsqueda: quitar espacios extra y convertir a minúsculas
        const searchTerm = this.globalFilterValue.toLowerCase().trim().replace(/\s+/g, ' ');
        filtered = filtered.filter(request =>
          (request.customerName && request.customerName.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
          (request.customerPhone && request.customerPhone.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
          (request.vehiclePlate && request.vehiclePlate.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
          (request.vehicleBrand && request.vehicleBrand.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm)) ||
          (request.serviceReason && request.serviceReason.toLowerCase().trim().replace(/\s+/g, ' ').includes(searchTerm))
        );
      }

      // Filtro por estado seleccionado
      if (this.selectedStatus) {
        filtered = filtered.filter(request => request.status === this.selectedStatus);
      }

      // Filtro por fecha seleccionada (corregido para zona horaria)
      if (this.selectedDate) {
        const selectedDateStr = this.dateToComparableString(this.selectedDate);
        if (selectedDateStr) {
          filtered = filtered.filter(request => {
            const requestDateStr = this.normalizeDateForComparison(request.appointmentDate);
            return requestDateStr === selectedDateStr;
          });
        }
      }

      return filtered;
    }
  },

  methods: {

    onNewItemRequested() {
      console.log('Crear nueva solicitud de servicio');
      // Implementar navegación a formulario de creación
    },

    onDeleteSelectedItems(selectedItems) {
      console.log('Eliminar solicitudes seleccionadas:', selectedItems);
      // Implementar lógica de eliminación múltiple
      selectedItems.forEach(item => {
        const index = this.itemsArray.findIndex(request => request.id === item.id);
        if (index > -1) {
          this.itemsArray.splice(index, 1);
        }
      });
    },

    onDeleteItem(item) {
      console.log('Eliminar solicitud:', item);
      // Implementar lógica de eliminación individual
      const index = this.itemsArray.findIndex(request => request.id === item.id);
      if (index > -1) {
        this.itemsArray.splice(index, 1);
      }
    },

    onEditItem(item) {
      console.log('Editar solicitud:', item);
      this.openManageDialog(item);
    },

    async openManageDialog(item) {
        this.selectedAppointment = item;
        this.formStatus = item.status;
        this.formMechanicId = item.assignedMechanic ? item.assignedMechanic.mechanicId : null;
        this.showManageDialog = true;
        this.manageDialogLoading = true;

        try {
            const response = await this.appointmentRequestApiService.getAvailableMechanics();
            // Map mechanics to a format friendly for dropdown (e.g. including name)
            // Assuming response.data is an array of mechanics
            this.availableMechanics = response.data.map(m => ({
                label: `${m.fullName} (${m.specialization || 'General'})`,
                value: m.id // or mechanicId depending on API response
            }));
            
            // If the mechanic ID is not in the list (maybe fetching mechanics failed or structure is diff), handle gracefully
            console.log("Available mechanics:", this.availableMechanics);

        } catch (error) {
            console.error("Error fetching mechanics:", error);
            this.$toast.add({severity: 'error', summary: 'Error', detail: 'Could not load mechanics', life: 3000});
        } finally {
            this.manageDialogLoading = false;
        }
    },

    closeManageDialog() {
        this.showManageDialog = false;
        this.selectedAppointment = null;
        this.availableMechanics = [];
        this.formStatus = null;
        this.formMechanicId = null;
    },

    async saveManagementChanges() {
        if (!this.selectedAppointment) return;

        this.manageDialogLoading = true;
        const appointmentId = this.selectedAppointment.id;
        let successCount = 0;
        let errorCount = 0;

        try {
            // 1. Update Status if changed
            if (this.formStatus && this.formStatus !== this.selectedAppointment.status) {
                await this.appointmentRequestApiService.updateStatus(appointmentId, this.formStatus);
                successCount++;
            }

            // 2. Assign Mechanic if changed (and selected)
            // Note: If null, we might want to unassign, but API might only support assign or unassign specific.
            // For now, let's assume we only assign if a mechanic is selected.
            // The unassign logic would require a separate check or API support.
            const currentMechanicId = this.selectedAppointment.assignedMechanic ? this.selectedAppointment.assignedMechanic.mechanicId : null;
            
            if (this.formMechanicId && this.formMechanicId !== currentMechanicId) {
                await this.appointmentRequestApiService.assignMechanic(appointmentId, this.formMechanicId);
                successCount++;
            }

            if (successCount > 0) {
                this.$toast.add({severity: 'success', summary: 'Success', detail: 'Appointment updated successfully', life: 3000});
                this.closeManageDialog();
                this.getAll(); // Refresh list
            } else if (errorCount === 0) {
                this.closeManageDialog(); // No changes made
            }

        } catch (error) {
            console.error("Error updating appointment:", error);
            this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update appointment', life: 3000});
        } finally {
            this.manageDialogLoading = false;
        }
    },

    onViewItem(item) {
      console.log('Ver detalles de solicitud:', item);
      console.log('Cargar detalles de la cita con ID:', item.id);
      // Navegar a vista de detalles pasando el ID de la solicitud
      this.$router.push({ 
        name: 'appointment-request-details',
        query: { id: item.id }
      });
    },

    onRowSelect(event) {
      console.log('Fila seleccionada:', event);
    },

    onRowUnselect(event) {
      console.log('Fila deseleccionada:', event);
    },

    onClearFilters() {
      this.globalFilterValue = '';
      this.selectedStatus = null;
      this.selectedDate = null;
    },

    onGlobalFilterChange(value) {
      this.globalFilterValue = value || '';
    },

    getStatusSeverity(status) {
      switch (status) {
        case 'CONFIRMED':
          return 'success';
        case 'IN_PROGRESS':
          return 'info';
        case 'COMPLETED':
          return 'success';
        case 'PENDING':
          return 'warn';
        case 'CANCELLED':
          return 'danger';
        default:
          return 'info';
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        // Manejar diferentes formatos de fecha de entrada
        let dateToFormat;
        
        if (dateString.includes('T')) {
          // Si tiene formato ISO con hora, extraer solo la fecha
          const datePart = dateString.split('T')[0];
          const [year, month, day] = datePart.split('-');
          // Crear fecha usando componentes individuales para evitar zona horaria
          dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (dateString.includes('-')) {
          // Si es formato YYYY-MM-DD
          const [year, month, day] = dateString.split('-');
          dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Fallback para otros formatos
          dateToFormat = new Date(dateString);
        }
        
        // Verificar que la fecha sea válida
        if (isNaN(dateToFormat.getTime())) return dateString;
        
        // Formatear como dd/mm/aaaa usando los métodos locales
        const day = dateToFormat.getDate().toString().padStart(2, '0');
        const month = (dateToFormat.getMonth() + 1).toString().padStart(2, '0');
        const year = dateToFormat.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return dateString;
      }
    },

    // Función para normalizar fechas y evitar problemas de zona horaria
    normalizeDateForComparison(dateString) {
      if (!dateString) return null;
      
      try {
        // Crear fecha desde string de API (formato YYYY-MM-DD)
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        
        // Retornar solo la parte de la fecha (YYYY-MM-DD) sin hora
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error al normalizar fecha:', error);
        return null;
      }
    },

    // Función para convertir Date de calendario a string comparable
    dateToComparableString(dateObject) {
      if (!dateObject) return null;
      
      try {
        // Asegurar que es un objeto Date válido
        const date = dateObject instanceof Date ? dateObject : new Date(dateObject);
        if (isNaN(date.getTime())) return null;
        
        // Usar fecha local para evitar problemas de zona horaria
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Error al convertir fecha del calendario:', error);
        return null;
      }
    },

    // Función para obtener el nombre completo del cliente
    getCustomerFullName(customer) {
      if (!customer) return 'Cliente no especificado';
      
      const firstName = customer.firstName || '';
      const lastName = customer.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      return fullName || 'Cliente no especificado';
    },

    // Función para obtener marca y modelo del vehículo
    getVehicleBrandModel(vehicle) {
      if (!vehicle) return 'N/A';
      
      const brand = vehicle.brand || '';
      const model = vehicle.model || '';
      const brandModel = `${brand} ${model}`.trim();
      
      return brandModel || 'N/A';
    },

    // Función modular para manejar errores de servidor
    handleServerError(error, context = 'datos') {
      console.error(`Error al cargar ${context}:`, error);

      // Determinar si mostrar toast basado en el tipo de error
      let errorMessage = '';
      let showToast = false;

      if (error.response) {
        // Error de respuesta del servidor (4xx, 5xx)
        const status = error.response.status;
        showToast = true;
        
        if (status >= 500) {
          errorMessage = `Error interno del servidor al cargar ${context}. Por favor, contacte al administrador.`;
        } else if (status >= 400) {
          errorMessage = `Error en la solicitud de ${context}. Verifique los permisos de acceso.`;
        } else {
          errorMessage = `Error del servidor (${status}) al cargar ${context}.`;
        }
      } else if (error.request) {
        // Error de red o conexión
        showToast = true;
        errorMessage = `No se pudo conectar con el servidor para cargar ${context}. Verifique su conexión a internet.`;
      } else if (error.message && (error.message.includes('inválido') || error.message.includes('formato'))) {
        // Error de formato de datos del servidor
        showToast = true;
        errorMessage = `Error en el formato de datos del servidor: ${error.message}`;
      }
      
      if (showToast) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error del servidor',
          detail: errorMessage,
          life: 7000
        });
      }
    },



    async getAll() {
      this.loading = true;
      
      try {
        const response = await this.appointmentRequestApiService.getAll();
        console.log('Raw API response:', response);

        // Enriquecer los datos obteniendo información de vehicle y driver profile
        const enrichedAppointments = await Promise.all(
          response.data.map(async (item) => {
            try {
              // Crear el objeto base
              const request = new AppointmentRequest(item);
              
              // Enriquecer con datos de vehículo
              let vehicleData = {
                licensePlate: 'N/A',
                brand: 'N/A',
                model: 'N/A'
              };
              
              if (item.vehicleId) {
                try {
                  const vehicleResponse = await http.get(`/vehicles/${item.vehicleId}`);
                  if (vehicleResponse && vehicleResponse.data) {
                    vehicleData = {
                      licensePlate: vehicleResponse.data.licensePlate || 'N/A',
                      brand: vehicleResponse.data.brand || 'N/A',
                      model: vehicleResponse.data.model || 'N/A'
                    };
                  }
                } catch (error) {
                  console.warn(`Could not fetch vehicle ${item.vehicleId}:`, error.message);
                }
              }

              // Enriquecer con datos del  driver (person profile)
              let driverData = {
                fullName: 'N/A',
                phone: 'N/A',
                email: 'N/A'
              };
              
              if (item.driverId) {
                try {
                  // El driverId es el profileId en person-profiles
                  const profileResponse = await http.get(`/person-profiles/${item.driverId}`);
                  if (profileResponse && profileResponse.data) {
                    driverData = {
                      fullName: profileResponse.data.fullName || 'N/A',
                      phone: profileResponse.data.phone || 'N/A',
                      email: profileResponse.data.email || 'N/A'
                    };
                  }
                } catch (error) {
                  console.warn(`Could not fetch driver profile ${item.driverId}:`, error.message);
                }
              }

              // Retornar el objeto enriquecido
              return {
                ...request,
                id: item.id,
                
                // Datos del cliente (driver)
                customerName: driverData.fullName,
                customerPhone: driverData.phone,
                customerEmail: driverData.email,
                
                // Datos del vehículo
                vehiclePlate: vehicleData.licensePlate,
                vehicleBrand: `${vehicleData.brand} ${vehicleData.model}`.trim() || 'N/A',
                
                // Datos de la cita
                appointmentDate: item.startAt ? item.startAt.split('T')[0] : '',
                appointmentTime: item.startAt ? item.startAt.split('T')[1]?.substring(0, 5) || '' : '',
                serviceReason: item.serviceType === 'CUSTOM' 
                  ? (item.customServiceDescription || 'Servicio personalizado')
                  : item.serviceType || 'Servicio general',
                
                // Estado
                status: item.status || 'PENDING',
                
                // Fecha normalizada para filtros
                appointmentDateNormalized: item.startAt ? item.startAt.split('T')[0] : null,
                
                // Mantener referencia al objeto completo
                fullData: item
              };
            } catch (error) {
              console.error('Error enriching appointment:', error);
              // Retornar datos mínimos si falla el enriquecimiento
              return {
                id: item.id,
                customerName: 'N/A',
                customerPhone: 'N/A',
                customerEmail: 'N/A',
                vehiclePlate: 'N/A',
                vehicleBrand: 'N/A',
                appointmentDate: item.startAt ? item.startAt.split('T')[0] : '',
                serviceReason: 'N/A',
                status: item.status || 'PENDING',
                fullData: item
              };
            }
          })
        );

        this.itemsArray = enrichedAppointments;
        console.log('Enriched items for table:', this.itemsArray);

      } catch (error) {
        this.itemsArray = [];
        this.handleServerError(error, 'las solicitudes de servicio');
      } finally {
        this.loading = false;
      }
    },

    async onStatusChange(item) {
        try {
            await this.appointmentRequestApiService.updateStatus(item.id, item.status);
            this.$toast.add({severity: 'success', summary: 'Success', detail: 'Status updated successfully', life: 3000});
        } catch (error) {
            console.error("Error updating status:", error);
            this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 3000});
            this.getAll(); // Revert/Refresh on error
        }
    },

  },

  created() {
    this.appointmentRequestApiService = new AppointmentRequestApiService('/appointments')

    // Cargar datos al inicializar el componente
    this.getAll();
  }

};

</script>

<template>
  <pv-toast />

  <div class="h-full overflow-hidden flex flex-column p-4">

    <!-- Título de la página -->
    <h2 class="text-3xl font-bold mb-2">{{ $t('service_requests.title') }}</h2>
    <p>{{ $t('service_requests.subtitle') }}</p>

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
        :new-button-label="$t('service_requests.new_request')"
        :delete-button-label="$t('service_requests.delete')"
        :export-button-label="$t('service_requests.export')"
        :search-placeholder="$t('service_requests.search_placeholder')"
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
      <!-- Filtro personalizado para el estado y fecha -->
      <template #filters="{ clearFilters }" >
        <div class="flex align-items-center gap-2">
          <pv-dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('service_requests.status_filter_placeholder')"
              class="flex-1 h-full"
          />
          <!-- Filtro por fecha -->
          <pv-calendar
              id="appointmentDate"
              v-model="selectedDate"
              :placeholder="$t('common.date_format')"
              dateFormat="dd/mm/yy"
              show-icon
              class="flex-1 h-full"
          />
          <!-- Botón para limpiar filtros específicos -->
          <pv-button
              :label="$t('service_requests.clear_filters')"
              icon="pi pi-filter-slash"
              @click="onClearFilters()"
              class="p-button-secondary flex-shrink-0 h-full"
          />
        </div>
      </template>

      <!-- Template para el campo "status" -->
      <template #status="{ data }">
        <pv-dropdown
            v-model="data.status"
            :options="statusOptions.filter(o => o.value !== null)"
            option-label="label"
            option-value="value"
            placeholder="Select Status"
            class="w-full p-inputtext-sm"
            @change="onStatusChange(data)"
            :class="{'p-disabled': loading}"
        />
      </template>

      <!-- Template para el campo "appointmentDate" -->
      <template #appointmentDate="{ data }">
        <span>{{ formatDate(data.appointmentDate) }}</span>
      </template>

    </data-manager>

    <pv-dialog v-model:visible="showManageDialog" :style="{width: '450px'}" header="Manage Appointment" :modal="true" class="p-fluid">
      <div v-if="selectedAppointment">
          
          <div class="field mb-4">
              <label for="status" class="font-bold block mb-2">{{ $t('service_requests.columns.status') }}</label>
              <pv-dropdown 
                  id="status" 
                  v-model="formStatus" 
                  :options="statusOptions.filter(o => o.value !== null)" 
                  option-label="label" 
                  option-value="value" 
                  placeholder="Select a Status" 
                  class="w-full"
              />
          </div>

          <div class="field mb-4">
              <label for="mechanic" class="font-bold block mb-2">Assign Mechanic</label>
              <pv-dropdown 
                  id="mechanic" 
                  v-model="formMechanicId" 
                  :options="availableMechanics" 
                  option-label="label" 
                  option-value="value" 
                  placeholder="Select a Mechanic" 
                  class="w-full"
                  :loading="manageDialogLoading"
                  empty-message="No mechanics available"
              />
          </div>

      </div>
      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeManageDialog"/>
        <pv-button label="Save" icon="pi pi-check" class="p-button-text" @click="saveManagementChanges" :loading="manageDialogLoading" />
      </template>
    </pv-dialog>

  </div>

</template>

<style scoped>
/* Estilos usando variables CSS corporativas */
.text-orange-500 {
  color: var(--color-warning) !important;
}

/* Los estilos de botones ahora son globales en style.css */

/* Los estilos de input y dropdown ahora son globales en style.css */

/* Los estilos de tags y checkboxes ahora son globales en style.css */

/* Los estilos de botones de acción, paginador, tabla y toolbar ahora son globales en style.css */

</style>