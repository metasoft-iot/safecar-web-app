<script>
import { MechanicApiService } from "../../workshop/services/mechanic-api.service";
import { AppointmentRequestApiService } from "../../service-requests/services/appointment-request-api.service";
import http from "../../shared/services/http-common";


export default {
  name: 'dashboard-management',
  data() {
    return {
      loading: true,
      workshop: null,
      mechanics: [],
      appointments: [],
      
      // Stats
      totalMechanics: 0,
      totalAppointments: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      inProgressAppointments: 0,
      
      mechanicService: new MechanicApiService(),
      appointmentService: new AppointmentRequestApiService()
    };
  },
  
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        const workshopId = await this.mechanicService.getCurrentWorkshopId();
        
        // 1. Fetch Workshop Details
        const workshopResponse = await this.mechanicService.getWorkshopById(workshopId);
        this.workshop = workshopResponse.data;
        
        // 2. Fetch Mechanics
        const mechanicsResponse = await this.mechanicService.getAllByWorkshopId(workshopId);
        this.mechanics = mechanicsResponse.data;
        this.totalMechanics = this.mechanics.length;
        
        // 3. Fetch Appointments
        const appointmentsResponse = await this.appointmentService.getAll();
        const appointments = appointmentsResponse.data || [];
        
        // 4. Enrich appointments with vehicle and driver data
        this.appointments = await Promise.all(
          appointments.map(async (app) => {
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
                  lastName: fullName.split(' ').slice(1).join(' ') ||''
                };
              } catch (error) {
                console.warn(`Could not fetch driver profile ${app.driverId}`);
                enrichedApp.customer = null;
              }
            }

            // Add appointment request with proper date formatting
            enrichedApp.appointmentRequest = {
              scheduledDate: app.startAt || null,
              startTime: app.startAt ? app.startAt.split('T')[1]?.substring(0, 5) : null
            };

            return enrichedApp;
          })
        );
        
        // Calculate Stats
        this.totalAppointments = this.appointments.length;
        this.pendingAppointments = this.appointments.filter(a => a.status === 'PENDING').length;
        this.completedAppointments = this.appointments.filter(a => a.status === 'COMPLETED').length;
        this.inProgressAppointments = this.appointments.filter(a => a.status === 'IN_PROGRESS').length;
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data', life: 3000});
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    },

    getStatusSeverity(status) {
      switch (status) {
        case 'COMPLETED': return 'success';
        case 'IN_PROGRESS': return 'info';
        case 'PENDING': return 'warn';
        case 'CANCELLED': return 'danger';
        default: return 'secondary';
      }
    }
  },
  
  mounted() {
    this.loadDashboardData();
  }
};
</script>

<template>
  <div class="grid p-4">
    <pv-toast />
    
    <div class="col-12 mb-4">
        <h1 class="text-3xl font-bold text-900">Executive Dashboard</h1>
        <p class="text-600">Welcome back to your workshop overview.</p>
    </div>

    <div v-if="loading" class="col-12 flex justify-content-center">
        <pv-progress-spinner />
    </div>

    <template v-else>
        <!-- Workshop Info Card -->
        <div class="col-12 md:col-4">
            <div class="card h-full surface-card shadow-2 p-4 border-round">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-xl font-bold text-900">Workshop Details</span>
                    <i class="pi pi-building text-blue-500 text-2xl"></i>
                </div>
                <div v-if="workshop">
                    <div class="mb-2"><span class="font-semibold">Name:</span> {{ workshop.name || 'My Workshop' }}</div>
                    <!-- Backend might separate these or they might be in different fields, adjusting based on typical response -->
                    <div class="mb-2"><span class="font-semibold">Address:</span> {{ workshop.address || workshop.location || 'N/A' }}</div>
                    <div class="mb-2"><span class="font-semibold">Description:</span> {{ workshop.workshopDescription || 'No description available' }}</div>
                    <div><span class="font-semibold">Mechanics:</span> {{ totalMechanics }}</div>
                </div>
                <div v-else class="text-gray-500">Workshop details not available.</div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="col-12 md:col-8">
            <div class="grid">
                <div class="col-12 md:col-6 lg:col-3">
                    <div class="surface-card shadow-2 p-3 border-round">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Appointments</span>
                                <div class="text-900 font-medium text-xl">{{ totalAppointments }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width:2.5rem;height:2.5rem">
                                <i class="pi pi-calendar text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <span class="text-green-500 font-medium">Total </span>
                        <span class="text-500">scheduled</span>
                    </div>
                </div>
                <div class="col-12 md:col-6 lg:col-3">
                    <div class="surface-card shadow-2 p-3 border-round">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Pending</span>
                                <div class="text-900 font-medium text-xl">{{ pendingAppointments }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
                                <i class="pi pi-clock text-orange-500 text-xl"></i>
                            </div>
                        </div>
                        <span class="text-orange-500 font-medium">Action </span>
                        <span class="text-500">needed</span>
                    </div>
                </div>
                <div class="col-12 md:col-6 lg:col-3">
                    <div class="surface-card shadow-2 p-3 border-round">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">In Progress</span>
                                <div class="text-900 font-medium text-xl">{{ inProgressAppointments }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width:2.5rem;height:2.5rem">
                                <i class="pi pi-cog text-cyan-500 text-xl"></i>
                            </div>
                        </div>
                        <span class="text-cyan-500 font-medium">Currently </span>
                        <span class="text-500">working</span>
                    </div>
                </div>
                <div class="col-12 md:col-6 lg:col-3">
                    <div class="surface-card shadow-2 p-3 border-round">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-500 font-medium mb-3">Completed</span>
                                <div class="text-900 font-medium text-xl">{{ completedAppointments }}</div>
                            </div>
                            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width:2.5rem;height:2.5rem">
                                <i class="pi pi-check-circle text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <span class="text-green-500 font-medium">Services </span>
                        <span class="text-500">done</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Appointments Table -->
        <div class="col-12">
            <div class="card surface-card shadow-2 p-4 border-round">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5 class="m-0 text-xl font-bold">Recent Appointments</h5>
                    <pv-button icon="pi pi-arrow-right" label="View All" class="p-button-text" @click="$router.push('/safe-car/mechanic/service-request')" />
                </div>
                <pv-data-table :value="appointments.slice(0, 5)" responsiveLayout="scroll">
                    <pv-column field="appointmentId" header="ID"></pv-column>
                    <pv-column field="customer.firstName" header="Customer">
                        <template #body="slotProps">
                            {{ slotProps.data.customer ? `${slotProps.data.customer.firstName} ${slotProps.data.customer.lastName}` : 'N/A' }}
                        </template>
                    </pv-column>
                    <pv-column field="vehicle.licensePlate" header="Vehicle">
                        <template #body="slotProps">
                            {{ slotProps.data.vehicle ? `${slotProps.data.vehicle.brand} ${slotProps.data.vehicle.model} (${slotProps.data.vehicle.licensePlate})` : 'N/A' }}
                        </template>
                    </pv-column>
                    <pv-column field="appointmentRequest.scheduledDate" header="Date">
                        <template #body="slotProps">
                            {{ slotProps.data.appointmentRequest ? formatDate(slotProps.data.appointmentRequest.scheduledDate) : 'N/A' }}
                        </template>
                    </pv-column>
                    <pv-column field="status" header="Status">
                        <template #body="slotProps">
                            <pv-tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </pv-column>
                </pv-data-table>
            </div>
        </div>
    </template>
  </div>
</template>

<style scoped>
.card {
    background: var(--surface-card);
}
</style>