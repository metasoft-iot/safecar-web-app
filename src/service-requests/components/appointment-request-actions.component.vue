<script>
import { AppointmentRequestApiService } from '../services/appointment-request-api.service.js';

export default {
  name: 'appointment-request-actions',
  
  props: {
    item: {
      type: Object,
      required: true
    },
    availableMechanics: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      // Estados de carga y procesamiento
      isAssigningMechanic: false,
      isAddingNote: false,
      isChangingStatus: false,
      
      // Estados de edición para secciones específicas
      editingStates: {
        mechanic: false,
        observations: false
      },
      
      // Datos originales para restaurar en caso de cancelar edición
      originalData: {
        mechanic: {},
        observations: {}
      },
      
      // Formularios y datos
      selectedMechanic: null,
      currentObservation: {
        type: 'Cambio de solicitud',
        description: ''
      },
      
      // Servicio API
      appointmentRequestApiService: new AppointmentRequestApiService()
    };
  },
  
  computed: {
    canModifyAssignment() {
      const status = this.item.status;
      return ['PENDING', 'CONFIRMED'].includes(status);
    },
    
    selectedMechanicInfo() {
      if (!this.selectedMechanic) return null;
      return this.availableMechanics.find(mechanic => mechanic.id === this.selectedMechanic);
    },
    
    // Validación en tiempo real para los campos de asignación
    isMechanicAssignmentValid() {
      if (!this.editingStates.mechanic) return true;
      return this.selectedMechanic;
    }
  },
  
  methods: {
    // Formatear fecha para mostrar
    formatDate(dateString) {
      if (!dateString) return 'No disponible';
      
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
        
        if (isNaN(dateToFormat.getTime())) return 'Fecha inválida';
        
        const day = dateToFormat.getDate().toString().padStart(2, '0');
        const month = (dateToFormat.getMonth() + 1).toString().padStart(2, '0');
        const year = dateToFormat.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Fecha inválida';
      }
    },
    
    // Obtener texto de estado para mostrar
    getStatusDisplayText(status) {
      const statusTexts = {
        'PENDING': 'Pendiente',
        'CONFIRMED': 'Confirmada',
        'IN_PROGRESS': 'En Progreso',
        'COMPLETED': 'Completada',
        'CANCELLED': 'Cancelada',
        'RESCHEDULED': 'Reprogramada'
      };
      return statusTexts[status] || status;
    },
    
    // Habilitar modo edición para una sección específica
    enableEditing(section) {
      // Guardar datos originales de la sección específica
      if (section === 'mechanic') {
        // Guardar el estado actual
        this.originalData.mechanic = {
          selectedMechanic: this.selectedMechanic
        };
        
        // Si ya hay un mecánico asignado, pre-seleccionarlo en el dropdown
        if (this.item.mechanicId) {
          this.selectedMechanic = this.item.mechanicId;
        } else if (this.item.assignedMechanic && this.item.assignedMechanic.id) {
          this.selectedMechanic = this.item.assignedMechanic.id;
        }
      } else if (section === 'observations') {
        this.originalData.observations = {
          observations: [...(this.item.serviceNotes || [])]
        };
      }

      this.editingStates[section] = true;
    },

    // Cancelar edición para una sección específica
    cancelEditing(section) {
      // Restaurar datos originales de la sección específica
      if (section === 'mechanic') {
        this.selectedMechanic = this.originalData.mechanic.selectedMechanic || null;
      } else if (section === 'observations') {
        // Limpiar el formulario de observaciones
        this.currentObservation = {
          type: 'Cambio de solicitud',
          description: ''
        };
      }

      this.editingStates[section] = false;
      this.originalData[section] = {};
    },

    // Asignar mecánico a una cita
    async assignMechanic() {
      // Validaciones previas
      if (!this.selectedMechanic) {
        this.showToast('warn', 'Validación', 'Debe seleccionar un mecánico');
        return;
      }

      const selectedMechanicData = this.availableMechanics.find(m => m.id === this.selectedMechanic);
      if (!selectedMechanicData) {
        this.showToast('error', 'Error', 'El mecánico seleccionado no está disponible');
        return;
      }

      // Mostrar advertencia si el mecánico está ocupado (pero permitir continuar)
      if (selectedMechanicData.status === 'OCUPADO') {
        console.warn('Mecánico ocupado seleccionado:', selectedMechanicData.fullName);
      }
      
      this.isAssigningMechanic = true;
      try {
        // Usar el endpoint correcto para asignar mecánico
        await this.appointmentRequestApiService.assignMechanic(
          this.item.appointmentId, 
          this.selectedMechanic
        );
        
        // Actualizar el item local con el mecánico asignado
        const updatedItem = {
          ...this.item,
          mechanicId: this.selectedMechanic,
          assignedMechanic: selectedMechanicData,
          lastModified: new Date().toISOString()
        };
        
        // Emitir evento para actualizar el componente padre
        this.$emit('appointment-updated', updatedItem);
        
        // Deshabilitar modo edición y limpiar estado
        this.editingStates.mechanic = false;
        this.originalData.mechanic = {};
        this.selectedMechanic = null;
        
        this.showToast('success', 'Mecánico Asignado', `${selectedMechanicData.fullName || 'Mecánico'} ha sido asignado exitosamente a la cita`);
      } catch (error) {
        this.handleError('Error al asignar el mecánico', error);
      } finally {
        this.isAssigningMechanic = false;
      }
    },

    // Confirmar cita (cambiar status a CONFIRMED)
    async confirmAppointment() {
      this.isChangingStatus = true;
      try {
        await this.appointmentRequestApiService.updateStatus(this.item.appointmentId, 'CONFIRMED');
        
        const updatedItem = {
          ...this.item,
          status: 'CONFIRMED'
        };
        
        this.$emit('appointment-updated', updatedItem);
        this.showToast('success', 'Cita Confirmada', 'La cita ha sido confirmada exitosamente');
      } catch (error) {
        this.handleError('Error al confirmar la cita', error);
      } finally {
        this.isChangingStatus = false;
      }
    },

    // Iniciar servicio (cambiar status a IN_PROGRESS)
    async startAppointment() {
      this.isChangingStatus = true;
      try {
        await this.appointmentRequestApiService.updateStatus(this.item.appointmentId, 'IN_PROGRESS');
        
        const updatedItem = {
          ...this.item,
          status: 'IN_PROGRESS'
        };
        
        this.$emit('appointment-updated', updatedItem);
        this.showToast('success', 'Servicio Iniciado', 'El servicio ha sido iniciado');
      } catch (error) {
        this.handleError('Error al iniciar el servicio', error);
      } finally {
        this.isChangingStatus = false;
      }
    },

    // Completar servicio (cambiar status a COMPLETED)
    async completeAppointment() {
      this.isChangingStatus = true;
      try {
        await this.appointmentRequestApiService.updateStatus(this.item.appointmentId, 'COMPLETED');
        
        const updatedItem = {
          ...this.item,
          status: 'COMPLETED'
        };
        
        this.$emit('appointment-updated', updatedItem);
        this.showToast('success', 'Servicio Completado', 'El servicio ha sido completado exitosamente');
      } catch (error) {
        this.handleError('Error al completar el servicio', error);
      } finally {
        this.isChangingStatus = false;
      }
    },

    // Cancelar cita (cambiar status a CANCELLED)
    async cancelAppointment() {
      this.isChangingStatus = true;
      try {
        await this.appointmentRequestApiService.updateStatus(this.item.appointmentId, 'CANCELLED');
        
        const updatedItem = {
          ...this.item,
          status: 'CANCELLED'
        };
        
        this.$emit('appointment-updated', updatedItem);
        this.showToast('info', 'Cita Cancelada', 'La cita ha sido cancelada');
      } catch (error) {
        this.handleError('Error al cancelar la cita', error);
      } finally {
        this.isChangingStatus = false;
      }
    },

    // Agregar observación o comentario
    async addObservation() {
      if (!this.currentObservation.description.trim()) return;
      
      this.isAddingNote = true;
      try {
        const newObservation = {
          id: Date.now(),
          type: this.currentObservation.type,
          description: this.currentObservation.description.trim(),
          author: 'Usuario Actual',
          timestamp: new Date().toISOString()
        };
        
        const currentNotes = this.item.serviceNotes || [];
        const updatedNotes = [...currentNotes, newObservation];
        
        const updateData = {
          ...this.item,
          serviceNotes: updatedNotes,
          lastModified: new Date().toISOString()
        };
        
        await this.appointmentRequestApiService.update(this.item.appointmentId, updateData);
        this.$emit('appointment-updated', updateData);
        
        // Limpiar el formulario y deshabilitar modo edición
        this.currentObservation = {
          type: 'Cambio de solicitud',
          description: ''
        };
        this.editingStates.observations = false;
        
        this.showToast('success', 'Observación Agregada', 'La observación ha been agregada exitosamente');
      } catch (error) {
        this.handleError('Error al agregar la observación', error);
      } finally {
        this.isAddingNote = false;
      }
    },

    // Método para mostrar toast messages
    showToast(severity, summary, detail, life = 3000) {
      if (this.$toast && typeof this.$toast.add === 'function') {
        this.$toast.add({
          severity: severity,
          summary: summary,
          detail: detail,
          life: life
        });
      } else {
        console.log(`${severity.toUpperCase()}: ${summary} - ${detail}`);
      }
    },

    // Manejo de errores
    handleError(message, error) {
      console.error(message, error);
      this.showToast('error', 'Error', message);
    }
  },

  mounted() {
    // Debug: Verificar que los datos lleguen correctamente
    console.log('Componente appointment-request-actions montado');
    console.log('Item:', this.item);
    console.log('Available Mechanics:', this.availableMechanics);
    console.log('Can modify assignment:', this.canModifyAssignment);
  }
};
</script>

<template>
  <div class="flex flex-column gap-4 w-full">

    <!-- ====================== Card -> Asignar Mecánico ====================== -->
    <pv-card class="w-full">
      <template #header>
        <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
          <i class="pi pi-user-plus" style="color: white;"></i>
          <span class="text-lg font-bold">Asignar Mecánico</span>
        </div>
      </template>
      <template #content>

        <div class="field mb-3">
          <label for="mechanic" class="font-medium text-gray-700 flex align-items-center gap-2">
            <i class="pi pi-user text-primary"></i>
            Seleccionar mecánico *
            <span class="text-red-500">*</span>
          </label>
          <pv-dropdown
              id="mechanic"
              v-model="selectedMechanic"
              :options="availableMechanics"
              optionLabel="fullName"
              optionValue="id"
              placeholder="Seleccionar mecánico disponible"
              class="w-full mt-1"
              :class="{ 'p-invalid': editingStates.mechanic && !selectedMechanic }"
              :disabled="!editingStates.mechanic"
              showClear
              filter
          >
            <template #option="slotProps">
              <div class="flex flex-column gap-1">
                <div class="font-semibold">{{ slotProps.option.fullName }}</div>
                <div class="text-sm text-500">{{ slotProps.option.specialization || 'General' }}</div>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-phone text-xs text-400"></i>
                  <span class="text-xs text-400">{{ slotProps.option.contactNumber }}</span>
                  <pv-tag
                      :value="slotProps.option.status"
                      :severity="slotProps.option.status === 'DISPONIBLE' ? 'success' : 'warning'"
                      class="text-xs"
                  />
                </div>
              </div>
            </template>
          </pv-dropdown>
        </div>

        <!-- Información del Mecánico Seleccionado (cuando está editando) -->
        <div v-if="editingStates.mechanic && selectedMechanicInfo" class="field mb-3">
          <label class="font-medium text-gray-700 flex align-items-center gap-2 mb-2">
            <i class="pi pi-info-circle text-primary"></i>
            Mecánico seleccionado
          </label>
          <div class="p-3 border-1 border-300 border-round bg-blue-50">
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="text-sm text-600">Especialización:</div>
                <div class="font-semibold">{{ selectedMechanicInfo.specialization || 'General' }}</div>
              </div>
              <div class="col-12 md:col-6">
                <div class="text-sm text-600">Estado:</div>
                <pv-tag
                    :value="selectedMechanicInfo.status"
                    :severity="selectedMechanicInfo.status === 'DISPONIBLE' ? 'success' : 'warning'"
                />
              </div>
              <div class="col-12 md:col-6">
                <div class="text-sm text-600">Contacto:</div>
                <div class="font-semibold">{{ selectedMechanicInfo.contactNumber }}</div>
              </div>
              <div class="col-12 md:col-6">
                <div class="text-sm text-600">Email:</div>
                <div class="font-semibold">{{ selectedMechanicInfo.email }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Mecánico Actual -->
        <div v-if="item.assignedMechanic && !editingStates.mechanic" class="field mb-4">
          <label class="font-medium text-gray-700 flex align-items-center gap-2 mb-2">
            <i class="pi pi-user text-primary"></i>
            Mecánico asignado
          </label>
          <div class="p-3 border-1 border-300 border-round bg-gray-50 flex align-items-center gap-2">
            <i class="pi pi-user text-primary"></i>
            <span class="font-semibold text-gray-800">
              {{ item.assignedMechanic.fullName }} - {{ item.assignedMechanic.specialization || 'General' }}
            </span>
          </div>
        </div>

        <div class="flex gap-2 w-full">
          <!-- Botón de Editar (cuando no está editando) -->
          <pv-button
              v-if="!editingStates.mechanic"
              :label="item.assignedMechanic ? 'Cambiar Mecánico' : 'Asignar Mecánico'"
              icon="pi pi-pencil"
              class="p-button-warning w-full"
              @click="enableEditing('mechanic')"
              :disabled="!canModifyAssignment"
          />

          <!-- Botones de acción (cuando está editando) -->
          <template v-if="editingStates.mechanic">
            <pv-button
                label="Asignar"
                icon="pi pi-user-plus"
                class="p-button-primary flex-1"
                :disabled="!isMechanicAssignmentValid"
                :loading="isAssigningMechanic"
                @click="assignMechanic"
            />
            <pv-button
                label="Cancelar"
                icon="pi pi-times"
                class="p-button-secondary flex-1"
                @click="cancelEditing('mechanic')"
            />
          </template>
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> Estado de la Cita ====================== -->
    <pv-card class="w-full">
      <template #header>
        <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
          <i class="pi pi-flag" style="color: white;"></i>
          <span class="text-lg font-bold">Estado de la Cita</span>
        </div>
      </template>
      <template #content>

        <div class="field mb-3">
          <label class="font-medium text-gray-700 flex align-items-center gap-2 mb-2">
            <i class="pi pi-info-circle text-primary"></i>
            Estado actual
          </label>
          <div class="p-3 border-1 border-300 border-round bg-gray-50 flex align-items-center gap-2">
            <i class="pi pi-circle-fill text-primary"></i>
            <span class="font-semibold text-gray-800">
              {{ getStatusDisplayText(item.status || 'PENDING') }}
            </span>
          </div>
        </div>

        <!-- Acciones de estado -->
        <div class="flex flex-column gap-2 w-full mt-3">
          <!-- Botón Confirmar Cita (solo visible si está en PENDING) -->
          <pv-button
              v-if="item.status === 'PENDING'"
              label="Confirmar Cita"
              icon="pi pi-check"
              class="p-button-success w-full"
              @click="confirmAppointment"
              :loading="isChangingStatus"
          />
          
          <!-- Botón Iniciar Servicio (solo visible si está CONFIRMED) -->
          <pv-button
              v-if="item.status === 'CONFIRMED'"
              label="Iniciar Servicio"
              icon="pi pi-play"
              class="p-button-info w-full"
              @click="startAppointment"
              :loading="isChangingStatus"
          />
          
          <!-- Botón Completar Servicio (solo visible si está IN_PROGRESS) -->
          <pv-button
              v-if="item.status === 'IN_PROGRESS'"
              label="Completar Servicio"
              icon="pi pi-check-circle"
              class="p-button-success w-full"
              @click="completeAppointment"
              :loading="isChangingStatus"
          />
          
          <!-- Botón Cancelar Cita (visible si NO está COMPLETED o CANCELLED) -->
          <pv-button
              v-if="!['COMPLETED', 'CANCELLED'].includes(item.status)"
              label="Cancelar Cita"
              icon="pi pi-times"
              class="p-button-danger w-full"
              @click="cancelAppointment"
              :loading="isChangingStatus"
          />
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> Observaciones ====================== -->
    <pv-card class="w-full">
      <template #header>
        <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
          <i class="pi pi-comment" style="color: white;"></i>
          <span class="text-lg font-bold">Observaciones</span>
        </div>
      </template>
      <template #content>

        <div class="field mb-3">
          <label for="observationType" class="font-medium text-gray-700 flex align-items-center gap-2">
            <i class="pi pi-file text-primary"></i>
            Tipo de observación
          </label>
          <pv-dropdown
              id="observationType"
              v-model="currentObservation.type"
              :options="[
              { label: 'Cambio de solicitud', value: 'Cambio de solicitud' },
              { label: 'Aprobación de servicio', value: 'Aprobación de servicio' },
              { label: 'Comentario general', value: 'Comentario general' }
            ]"
              optionLabel="label"
              optionValue="value"
              placeholder="Cambio de solicitud"
              class="w-full mt-1"
              :disabled="!editingStates.observations"
          />
        </div>

        <div class="field mb-4">
          <label for="observations" class="font-bold text-primary flex align-items-center gap-2">
            <i class="pi pi-align-left text-primary"></i>
            Descripción
          </label>
          <pv-textarea
              id="observations"
              v-model="currentObservation.description"
              :rows="3"
              placeholder="Escriba sus observaciones o comentarios sobre la cita..."
              class="w-full mt-1"
              :disabled="!editingStates.observations"
          />
        </div>

        <!-- Observaciones Existentes -->
        <div v-if="item.serviceNotes && item.serviceNotes.length > 0" class="field mb-4">
          <label class="font-medium text-gray-700 flex align-items-center gap-2 mb-2">
            <i class="pi pi-history text-primary"></i>
            Historial de observaciones
          </label>
          <div class="max-h-20rem overflow-y-auto">
            <div
                v-for="(note, index) in item.serviceNotes"
                :key="index"
                class="p-3 border-1 border-300 border-round bg-gray-50 mb-2">
              <div class="flex justify-content-between align-items-center mb-1">
                <span class="font-semibold text-primary">{{ note.type || 'Observación' }}</span>
                <span class="text-sm text-500">{{ formatDate(note.timestamp) }}</span>
              </div>
              <p class="m-0 text-gray-800">{{ note.description || note.content }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2 w-full">
          <!-- Botón de Editar (cuando no está editando) -->
          <pv-button
              v-if="!editingStates.observations"
              label="Agregar Observación"
              icon="pi pi-pencil"
              class="p-button-warning w-full"
              @click="enableEditing('observations')"
          />

          <!-- Botones de acción (cuando está editando) -->
          <template v-if="editingStates.observations">
            <pv-button
                label="Guardar"
                icon="pi pi-save"
                class="p-button-primary flex-1"
                :disabled="!currentObservation.description.trim()"
                :loading="isAddingNote"
                @click="addObservation"
            />
            <pv-button
                label="Cancelar"
                icon="pi pi-times"
                class="p-button-secondary flex-1"
                @click="cancelEditing('observations')"
            />
          </template>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>

:deep(.p-card-content) {
  padding: 0.5rem;
}

/* Estilos para el header de las cards */
:deep(.p-card .p-card-header) {
  background-color: #4A60D0 !important;
  color: white !important;
  border-top-left-radius: var(--border-radius) !important;
  border-top-right-radius: var(--border-radius) !important;
  padding: 0 !important;
  border-bottom: none !important;
}

/* Asegurar que la card mantenga sus bordes redondeados */
:deep(.p-card) {
  border-radius: var(--border-radius) !important;
  overflow: hidden !important;
}

/* Estilos para campos requeridos */
.text-red-500 {
  color: #ef4444;
}

/* Estilos para campos inválidos */
:deep(.p-invalid) {
  border-color: #ef4444 !important;
}

:deep(.p-invalid:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.2) !important;
}

/* Estilos para dropdown inválido */
:deep(.p-dropdown.p-invalid) {
  border-color: #ef4444 !important;
}

:deep(.p-dropdown.p-invalid:not(.p-disabled):hover) {
  border-color: #ef4444 !important;
}

:deep(.p-dropdown.p-invalid:not(.p-disabled).p-focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.2) !important;
}

/* Estilos para el dropdown de mecánicos */
:deep(.p-dropdown-panel) {
  max-height: 300px;
}

:deep(.p-dropdown-item) {
  padding: 0.75rem 1rem;
}

/* Estilos para tags de estado */
:deep(.p-tag.p-tag-success) {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

:deep(.p-tag.p-tag-warning) {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

</style>
