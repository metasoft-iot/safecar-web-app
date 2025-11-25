<script>

import AppointmentRequestDescription from "../components/appointment-request-description.component.vue";
import AppointmentRequestActions from "../components/appointment-request-actions.component.vue";
import {AppointmentRequestApiService} from "../services/appointment-request-api.service.js";
import {MechanicApiService} from "../../workshop/services/mechanic-api.service.js";
import {ProfileApiService} from "../../shared/services/profile-api.service.js";
import {AppointmentRequest} from "../models/appointment-request.entity.js";
import http from "../../shared/services/http-common";


export default {
  name: 'appointment-request-detail-management',
  components: {AppointmentRequestActions, AppointmentRequestDescription},



  data() {
    return {

      // Servicio para obtener detalles de la cita por ID
      appointmentRequestApiService: new AppointmentRequestApiService(),
      mechanicApiService: new MechanicApiService(),
      profileApiService: new ProfileApiService(),

      mechanicsArray: [],

      // Item de la cita obtenido de la API
      item: null,

      // Estados de carga
      isLoading: true,
      hasError: false,
      errorMessage: '',
      
      // Progreso de carga
      loadingStep: 0,

    };
  },

  computed: {
    statusOptions() {
      return [
        { label: this.$t('appointment_detail.status.all'), value: null },
        { label: this.$t('appointment_detail.status.pending'), value: 'PENDING' },
        { label: this.$t('appointment_detail.status.confirmed'), value: 'CONFIRMED' },
        { label: this.$t('appointment_detail.status.in_progress'), value: 'IN_PROGRESS' },
        { label: this.$t('appointment_detail.status.completed'), value: 'COMPLETED' },
        { label: this.$t('appointment_detail.status.cancelled'), value: 'CANCELLED' }
      ];
    },

    loadingSteps() {
      return [
        { icon: 'pi-file-o', label: this.$t('appointment_detail.loading.steps.appointment_data') },
        { icon: 'pi-users', label: this.$t('appointment_detail.loading.steps.customer_info') },
        { icon: 'pi-car', label: this.$t('appointment_detail.loading.steps.vehicle_details') },
        { icon: 'pi-cog', label: this.$t('appointment_detail.loading.steps.service_info') }
      ];
    }
  },


  methods : {

    onDownloadDocument (payload) {
      // Lógica para descargar documento
      console.log(this.$t('appointment_detail.actions.download_document', { type: payload.type, id: payload.item.id }));
      // Aquí iría la lógica real de descarga
    },

    // Formatear fecha para mostrar
    formatDate(dateString) {
      if (!dateString) return this.$t('common.na');
      
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
        if (isNaN(dateToFormat.getTime())) return this.$t('common.na');
        
        // Formatear como dd/mm/aaaa usando los métodos locales
        const day = dateToFormat.getDate().toString().padStart(2, '0');
        const month = (dateToFormat.getMonth() + 1).toString().padStart(2, '0');
        const year = dateToFormat.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return this.$t('common.na');
      }
    },

    async getAppointmentDetailsById(appointmentId) {
      // Lógica para obtener detalles de la cita por ID
      console.log(`Obtener detalles de la cita con ID: `, appointmentId);
      
      this.isLoading = true;
      this.hasError = false;
      this.loadingStep = 0;
      
      // Simular progreso de carga
      this.simulateLoadingProgress();
      
      try {
        // Obtener directamente usando getById en lugar de filtrar getAll
        const response = await this.appointmentRequestApiService.getById(parseInt(appointmentId));
        
        console.log('Appointment response:', response.data);
        
        const appointmentData = response.data;
        
        if (!appointmentData) {
          throw new Error('Appointment not found');
        }

        // Enriquecer con datos de vehicle y driver
        let enrichedData = { ...appointmentData };

        // Obtener datos del vehículo
        if (appointmentData.vehicleId) {
          try {
            const vehicleResponse = await http.get(`/vehicles/${appointmentData.vehicleId}`);
            enrichedData.vehicle = vehicleResponse.data;
          } catch (error) {
            console.warn('Could not fetch vehicle:', error);
            enrichedData.vehicle = null;
          }
        }

        // Obtener datos del driver (person profile)
        if (appointmentData.driverId) {
          try {
            const profileResponse = await http.get(`/person-profiles/${appointmentData.driverId}`);
            enrichedData.driver = profileResponse.data;
          } catch (error) {
            console.warn('Could not fetch driver profile:', error);
            enrichedData.driver = null;
          }
        }

        this.item = new AppointmentRequest(enrichedData);
        
        // Completar todos los pasos
        this.loadingStep = this.loadingSteps.length;
        
        // Mostrar mensaje de éxito después de un breve delay
        setTimeout(() => {
          this.isLoading = false;
          console.log('Detalles de la cita obtenidos:', this.item);
        }, 300);

      } catch (error) {
        console.error('Error al obtener detalles de la cita:', error);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = this.$t('appointment_detail.error.load_details');
      }
    },

    simulateLoadingProgress() {
      // Simular progreso paso a paso para mejor UX
      const progressInterval = setInterval(() => {
        if (this.loadingStep < this.loadingSteps.length - 1) {
          this.loadingStep++;
        } else {
          clearInterval(progressInterval);
        }
      }, 600); // Cambiar paso cada 600ms
      
      // Limpiar intervalo si la carga se completa antes
      setTimeout(() => {
        clearInterval(progressInterval);
      }, 4000);
    },

    // Obtener lista de mecánicos disponibles con sus nombres desde profiles
    async getAllMechanics() {
      console.log(this.$t('appointment_detail.mechanics.get_available'));
      try {
        const workshopId = await this.mechanicApiService.getCurrentWorkshopId();
        const response = await this.mechanicApiService.getAllByWorkshopId(workshopId);
        
        // Fetch profile information for each mechanic
        const mechanicsWithProfiles = await Promise.all(
          response.data.map(async (m) => {
            try {
              // Fetch profile by profileId
              const profileResponse = await this.profileApiService.getPersonProfileById(m.profileId);
              const profile = profileResponse.data;
              
              return {
                id: m.id,
                profileId: m.profileId,
                fullName: profile.fullName || `Mecánico #${m.profileId}`,
                specialization: m.specializations && m.specializations.length > 0 
                  ? m.specializations.join(', ') 
                  : 'General',
                yearsOfExperience: m.yearsOfExperience || 0,
                contactNumber: profile.phone || 'N/A',
                email: 'N/A', // Email is not in PersonProfile, would need user email
                city: profile.city || 'N/A',
                status: 'DISPONIBLE' // This could be calculated based on active appointments
              };
            } catch (profileError) {
              console.warn(`Could not fetch profile for mechanic ${m.id}:`, profileError);
              // Return mechanic without profile data
              return {
                id: m.id,
                profileId: m.profileId,
                fullName: `Mecánico #${m.profileId}`,
                specialization: m.specializations && m.specializations.length > 0 
                  ? m.specializations.join(', ') 
                  : 'General',
                yearsOfExperience: m.yearsOfExperience || 0,
                contactNumber: 'N/A',
                email: 'N/A',
                status: 'DISPONIBLE'
              };
            }
          })
        );
        
        this.mechanicsArray = mechanicsWithProfiles;
        console.log('Mapped mechanics with profiles:', this.mechanicsArray);
      } catch (error) {
        console.error("Error loading mechanics:", error);
        this.mechanicsArray = [];
      }
    },

    // Manejar actualizaciones de la cita desde componentes hijos
    onAppointmentUpdated(updatedAppointment) {
      this.item = updatedAppointment;
      console.log('Cita actualizada:', updatedAppointment);
      
      // Opcional: mostrar mensaje de éxito
      this.$toast?.add({
        severity: 'success',
        summary: this.$t('appointment_detail.success.updated'),
        detail: this.$t('appointment_detail.success.updated_message'),
        life: 3000
      });
    },

  },



  created() {
    // Obtener ID de la cita desde la ruta
    const appointmentId = parseInt(this.$route.query.id);
    
    console.log(`Cargar detalles de la cita con ID: ${appointmentId}`);

    // Inicializar servicios
    this.appointmentRequestApiService = new AppointmentRequestApiService();
    this.mechanicApiService = new MechanicApiService();

    if (appointmentId && !isNaN(appointmentId)) {
      this.getAppointmentDetailsById(appointmentId);
    } else {
      this.hasError = true;
      this.errorMessage = this.$t('appointment_detail.error.no_id');
    }

    // Cargar lista de mecánicos disponibles
    this.getAllMechanics();
  },


};


</script>

<template>

  <!-- Detalles de la cita de servicio (se divide en cards tipo grid)-->
  <div class="appointment-container flex flex-column p-4 h-full w-full overflow-auto " >

    <!-- Breadcrumb -->
    <div class="text-base">
      <router-link
          :to="{ name: 'appointment-request' }"
          class="font-bold text-gray-900 no-underline hover:underline cursor-pointer"
      >
        {{ $t('appointment_detail.breadcrumb.service_requests') }}
      </router-link>
      <span class="text-gray-500 font-bold"> / </span>
      <span class="text-blue-700 font-bold hover:underline cursor-pointer">
        {{ $t('appointment_detail.breadcrumb.appointment_detail') }}
      </span>
    </div>

    <!-- ID de cita a la izquierda y fecha de solicitud a la derecha -->
    <div class="flex align-content-center justify-content-between  mt-4 mb-2" v-if="item">
      <!-- Izquierda -->
      <h2 class="text-2xl xl:font-bold font-extrabold text-gray-900">
        {{ $t('appointment_detail.appointment_code') }} <span class="text-blue-700 xl:font-bold "> {{ item.appointmentId || $t('common.na') }}</span>
      </h2>

      <!-- Derecha -->
      <span class="font-medium text-gray-900">
        {{ $t('appointment_detail.request_date') }} {{ formatDate(item.appointmentDetails?.requestDate) }}
      </span>
    </div>


    <!-- Estado de carga minimalista -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-content">
        <!-- Spinner elegante -->
        <pv-progress-spinner
            size="48"
            stroke-width="4"
            animation-duration="1.2s"
            class="loading-spinner"
        />

        <!-- Contenido textual simple -->
        <div class="loading-text">
          <h3 class="loading-title">{{ $t('appointment_detail.loading.title') }}</h3>
          <p class="loading-subtitle">{{ loadingSteps[loadingStep]?.label || $t('common.loading') }}</p>
        </div>
      </div>
    </div>


    <!-- Grid de detalles de la cita (con dos columnas: izquierda más ancha, derecha más estrecha) -->
    <div v-else-if="item" class="appointment-content flex gap-4 h-full w-full">

      <!-- Columna izquierda (2/3 del ancho) -->
      <div class="flex flex-column gap-4" style="flex: 2;">
        <appointment-request-description
            :item="item"
            @download-document="onDownloadDocument"
        />
      </div>

      <!-- Columna derecha (1/3 del ancho) -->
      <div class="flex flex-column gap-4" style="flex: 1;">
        <appointment-request-actions
            :item="item"
            :available-mechanics="mechanicsArray"
            @appointment-updated="onAppointmentUpdated"
        />
      </div>

    </div>

  </div>


</template>

<style scoped>

</style>