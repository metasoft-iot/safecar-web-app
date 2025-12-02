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
      businessProfile: null,
      mechanics: [],
      appointments: [],
      
      // Stats
      totalMechanics: 0,
      totalAppointments: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      inProgressAppointments: 0,
      cancelledAppointments: 0,
      
      // Chart Data
      appointmentStatusChart: null,
      appointmentTrendChart: null,
      serviceTypeChart: null,
      
      // Chart Options
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      },
      
      mechanicService: new MechanicApiService(),
      appointmentService:new AppointmentRequestApiService()
    };
  },
  
  methods: {
    async loadDashboardData() {
      this.loading = true;
      try {
        // Get user email from localStorage (saved as 'email' during login)
        const userEmail = localStorage.getItem('email');
        console.log('🔍 Dashboard - User email from localStorage:', userEmail);
        
        // 0. Fetch Business Profile (to get username)
        if (userEmail) {
          try {
            console.log('📡 Fetching business profile for:', userEmail);
            const profileResponse = await http.get(`/business-profiles?email=${userEmail}`);
            this.businessProfile = profileResponse.data;
            console.log('✅ Business Profile loaded:', this.businessProfile);
            console.log('👤 Username:', this.businessProfile?.username);
          } catch (error) {
            console.error('❌ Could not fetch business profile:', error);
          }
        } else {
          console.warn('⚠️ No userEmail found in localStorage');
        }
        
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
        this.cancelledAppointments = this.appointments.filter(a => a.status === 'CANCELLED').length;
        
        // Generate Charts
        this.generateCharts();
        
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data', life: 3000});
      } finally {
        this.loading = false;
      }
    },
    
    generateCharts() {
      // 1. Appointment Status Chart (Pie)
      this.appointmentStatusChart = {
        labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        datasets: [
          {
            data: [
              this.pendingAppointments,
              this.inProgressAppointments,
              this.completedAppointments,
              this.cancelledAppointments
            ],
            backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350'],
            hoverBackgroundColor: ['#FB8C00', '#1E88E5', '#43A047', '#E53935']
          }
        ]
      };
      
      // 2. Appointment Trend Chart (Line) - Last 6 months
      const monthlyData = this.getMonthlyAppointmentTrend();
      this.appointmentTrendChart = {
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Appointments',
            data: monthlyData.data,
            fill: true,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            tension: 0.4
          }
        ]
      };
      
      // 3. Service Type Chart (Doughnut)
      const serviceData = this.getServiceTypeDistribution();
      this.serviceTypeChart = {
        labels: serviceData.labels,
        datasets: [
          {
            data: serviceData.data,
            backgroundColor: ['#AB47BC', '#26A69A', '#FF7043', '#FFCA28', '#5C6BC0'],
            hoverBackgroundColor: ['#8E24AA', '#00897B', '#F4511E', '#FFB300', '#3949AB']
          }
        ]
      };
    },
    
    getMonthlyAppointmentTrend() {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const last6Months = [];
      const monthCounts = new Array(6).fill(0);
      
      // Get last 6 months labels
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        last6Months.push(months[monthIndex]);
      }
      
      // Count appointments per month
      this.appointments.forEach(app => {
        if (app.startAt) {
          const appDate = new Date(app.startAt);
          const appMonth = appDate.getMonth();
          const monthsAgo = (currentMonth - appMonth + 12) % 12;
          
          if (monthsAgo < 6) {
            monthCounts[5 - monthsAgo]++;
          }
        }
      });
      
      return {
        labels: last6Months,
        data: monthCounts
      };
    },
    
    getServiceTypeDistribution() {
      const serviceTypes = {};
      
      this.appointments.forEach(app => {
        const type = app.serviceType || 'Other';
        serviceTypes[type] = (serviceTypes[type] || 0) + 1;
      });
      
      return {
        labels: Object.keys(serviceTypes),
        data: Object.values(serviceTypes)
      };
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
  <div class="dashboard-container">
    <div class="grid p-4">
    <pv-toast />
    
    <div class="col-12 mb-4">
        <h1 class="text-3xl font-bold text-900">Executive Dashboard</h1>
        <p class="text-600 text-xl mt-2">
          Welcome back<template v-if="businessProfile && businessProfile.username">, 
            <span class="username-highlight">{{ businessProfile.username }}</span></template> to your workshop overview.
        </p>
    </div>

    <div v-if="loading" class="col-12 flex justify-content-center">
        <pv-progress-spinner />
    </div>

    <template v-else>
        <!-- Stats Cards -->
        <div class="col-12 lg:col-3 md:col-6">
            <div class="surface-card shadow-2 p-3 border-round">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total Appointments</span>
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
        
        <div class="col-12 lg:col-3 md:col-6">
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
        
        <div class="col-12 lg:col-3 md:col-6">
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
        
        <div class="col-12 lg:col-3 md:col-6">
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

        <!-- Charts Row -->
        <div class="col-12 lg:col-4">
            <div class="card surface-card shadow-2 p-4 border-round" style="height: 400px">
                <h5 class="mb-4 text-xl font-bold">Appointment Status</h5>
                <pv-chart type="pie" :data="appointmentStatusChart" :options="chartOptions" style="height: 300px" />
            </div>
        </div>

        <div class="col-12 lg:col-8">
            <div class="card surface-card shadow-2 p-4 border-round" style="height: 400px">
                <h5 class="mb-4 text-xl font-bold">Appointment Trend (Last 6 Months)</h5>
                <pv-chart type="line" :data="appointmentTrendChart" :options="chartOptions" style="height: 300px" />
            </div>
        </div>

        <div class="col-12 lg:col-6">
            <div class="card surface-card shadow-2 p-4 border-round" style="height: 400px">
                <h5 class="mb-4 text-xl font-bold">Service Type Distribution</h5>
                <pv-chart type="doughnut" :data="serviceTypeChart" :options="chartOptions" style="height: 300px" />
            </div>
        </div>

        <!-- Workshop Info Card -->
        <div class="col-12 lg:col-6">
            <div class="card surface-card shadow-2 p-4 border-round" style="height: 400px">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-xl font-bold text-900">Workshop Details</span>
                    <i class="pi pi-building text-blue-500 text-2xl"></i>
                </div>
                <div v-if="workshop" class="overflow-y-auto" style="max-height: 320px">
                    <div class="mb-3" v-if="businessProfile && businessProfile.username">
                        <span class="font-semibold text-600">Owner:</span>
                        <p class="mt-1 text-900">{{ businessProfile.username }}</p>
                    </div>
                    <div class="mb-3">
                        <span class="font-semibold text-600">Name:</span>
                        <p class="mt-1 text-900">{{ workshop.name || 'My Workshop' }}</p>
                    </div>
                    <div class="mb-3">
                        <span class="font-semibold text-600">Address:</span>
                        <p class="mt-1 text-900">{{ workshop.address || workshop.location || 'N/A' }}</p>
                    </div>
                    <div class="mb-3">
                        <span class="font-semibold text-600">Description:</span>
                        <p class="mt-1 text-900">{{ workshop.workshopDescription || businessProfile?.description || 'No description available' }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-600">Mechanics:</span>
                        <p class="mt-1 text-900">{{ totalMechanics }}</p>
                    </div>
                </div>
                <div v-else class="text-gray-500">Workshop details not available.</div>
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
                    <pv-column field="id" header="ID">
                        <template #body="slotProps">
                            APT-{{ slotProps.data.id }}
                        </template>
                    </pv-column>
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
  </div>
</template>

<style scoped>
.dashboard-container {
    width: 100%;
    min-height: 100%;
}

.card {
    background: var(--surface-card);
}

.username-highlight {
    font-weight: 700;
    font-size: 1.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
    padding: 0 4px;
}
</style>