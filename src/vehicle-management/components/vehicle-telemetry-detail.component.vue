<script>
import { TelemetryApiService } from "../services/telemetry-api.service.js";

export default {
  name: 'vehicle-telemetry-detail',
  
  props: {
    telemetry: {
      type: Object,
      default: null
    },
    iotDevice: {
      type: Object,
      default: null
    },
    vehicleId: {
      type: [Number, String],
      required: false
    }
  },

  data() {
    return {
      telemetryService: new TelemetryApiService(),
      historyData: [],
      loadingHistory: false,
      engineTempChartData: {
        labels: [],
        datasets: [
          {
            label: 'Engine Temperature (°C)',
            data: [],
            fill: true,
            borderColor: '#FFA726',
            backgroundColor: 'rgba(255, 167, 38, 0.2)',
            tension: 0.4
          }
        ]
      },
      speedChartData: {
        labels: [],
        datasets: [
          {
            label: 'Speed (km/h)',
            data: [],
            fill: true,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            tension: 0.4
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#495057'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#495057'
            },
            grid: {
              color: '#ebedef'
            }
          },
          y: {
            ticks: {
              color: '#495057'
            },
            grid: {
              color: '#ebedef'
            }
          }
        }
      }
    };
  },

  computed: {
    hasActiveAlert() {
      return this.telemetry?.activeAlert || false;
    },

    alertSeverity() {
      if (!this.hasActiveAlert) return 'success';
      return this.telemetry?.alertType === 'critical' ? 'danger' : 'warn';
    },

    batteryStatus() {
      const t = this.$t;
      const voltage = this.telemetry?.batteryVoltage || 0;
      if (voltage >= 13.5) return { severity: 'success', label: t('vehicle_management.detail.telemetry.engine_performance.status.good') };
      if (voltage >= 12.5) return { severity: 'warn', label: t('vehicle_management.detail.telemetry.engine_performance.status.low') };
      return { severity: 'danger', label: t('vehicle_management.detail.telemetry.engine_performance.status.critical') };
    },

    engineTempStatus() {
      const t = this.$t;
      const temp = this.telemetry?.engineTemperature || 0;
      if (temp <= 90) return { severity: 'success', label: t('vehicle_management.detail.telemetry.engine_performance.status.normal') };
      if (temp <= 105) return { severity: 'warn', label: t('vehicle_management.detail.telemetry.engine_performance.status.warning') };
      return { severity: 'danger', label: t('vehicle_management.detail.telemetry.engine_performance.status.overheating') };
    },

    fuelLevelStatus() {
      const t = this.$t;
      const level = this.telemetry?.fuelLevel || 0;
      if (level >= 25) return { severity: 'success', label: t('vehicle_management.detail.telemetry.engine_performance.status.good') };
      if (level >= 10) return { severity: 'warn', label: t('vehicle_management.detail.telemetry.engine_performance.status.low') };
      return { severity: 'danger', label: t('vehicle_management.detail.telemetry.engine_performance.status.very_low') };
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return this.$t('common.na');
      try {
        const date = new Date(dateString);
        return date.toLocaleString();
      } catch (error) {
        return dateString;
      }
    },

    getSignalStrengthColor(strength) {
      if (!strength) return 'text-500';
      if (strength >= -50) return 'text-green-500';
      if (strength >= -70) return 'text-yellow-500';
      return 'text-red-500';
    },

    async fetchTelemetryHistory() {
      if (!this.vehicleId) return;
      
      this.loadingHistory = true;
      try {
        const response = await this.telemetryService.getByVehicleId(this.vehicleId);
        // Sort by date ascending for charts
        this.historyData = (response.data || []).sort((a, b) => new Date(a.ingestedAt) - new Date(b.ingestedAt));
        
        // Limit to last 20 points for readability
        const recentHistory = this.historyData.slice(-20);
        
        this.prepareCharts(recentHistory);
      } catch (error) {
        console.error("Error fetching telemetry history:", error);
        // Ensure charts are prepared even if error (empty)
        this.prepareCharts([]);
      } finally {
        this.loadingHistory = false;
      }
    },

    prepareCharts(data) {
      // Always prepare charts, even if data is empty
      const safeData = data || [];

      const labels = safeData.map(item => {
        const date = new Date(item.ingestedAt);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      });

      // Engine Temperature Chart
      this.engineTempChartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('vehicle_management.detail.telemetry.engine_performance.engine_temperature') + ' (°C)',
            data: safeData.map(item => item.sample?.engineTemperature || 0),
            fill: true,
            borderColor: '#FFA726',
            backgroundColor: 'rgba(255, 167, 38, 0.2)',
            tension: 0.4
          }
        ]
      };

      // Speed Chart
      this.speedChartData = {
        labels: labels,
        datasets: [
          {
            label: this.$t('vehicle_management.detail.telemetry.engine_performance.speed') + ' (km/h)',
            data: safeData.map(item => item.sample?.speed || 0),
            fill: true,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            tension: 0.4
          }
        ]
      };
    }
  },

  mounted() {
    if (this.vehicleId) {
      this.fetchTelemetryHistory();
    }
  },

  watch: {
    vehicleId(newVal) {
      if (newVal) {
        this.fetchTelemetryHistory();
      }
    }
  }
};
</script>

<template>
  <div class="flex flex-column pb-4 gap-4">
    
    <!-- ====================== Card -> Telemetry Charts ====================== -->
    <div class="grid">
        <div class="col-12 md:col-6">
            <pv-card class="w-full h-full">
                <template #header>
                    <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
                        <i class="pi pi-chart-line" style="color: white;"></i>
                        <span class="text-lg font-bold">Engine Temperature History</span>
                    </div>
                </template>
                <template #content>
                    <div style="height: 300px">
                        <pv-chart type="line" :data="engineTempChartData" :options="chartOptions" class="h-full" />
                    </div>
                </template>
            </pv-card>
        </div>
        <div class="col-12 md:col-6">
            <pv-card class="w-full h-full">
                <template #header>
                    <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
                        <i class="pi pi-chart-bar" style="color: white;"></i>
                        <span class="text-lg font-bold">Speed History</span>
                    </div>
                </template>
                <template #content>
                    <div style="height: 300px">
                        <pv-chart type="line" :data="speedChartData" :options="chartOptions" class="h-full" />
                    </div>
                </template>
            </pv-card>
        </div>
    </div>

    <!-- ====================== Card -> Engine & Performance Data ====================== -->
    <pv-card class="w-full" v-if="telemetry">
      <template #header>
        <div class="flex align-items-center justify-content-between px-3 py-2" style="background-color: #4A60D0; color: white;">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-cog" style="color: white;"></i>
            <span class="text-lg font-bold">{{ $t('vehicle_management.detail.telemetry.engine_performance.title') }}</span>
          </div>
          <pv-tag 
            :value="hasActiveAlert ? $t('vehicle_management.detail.telemetry.diagnostics_alerts.alert_active') : $t('vehicle_management.detail.telemetry.diagnostics_alerts.normal')" 
            :severity="alertSeverity"
            :icon="hasActiveAlert ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle'"
            class="text-sm"
          />
        </div>
      </template>
      <template #content>
        <div class="formgrid grid">
          <!-- First row: RPM, Speed, Engine Temp, Oil Pressure -->
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-circle text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.rpm') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.rpm || $t('common.na') }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.engine_performance.units.rpm') }}</span>
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-gauge text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.speed') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.speed || $t('common.na') }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.engine_performance.units.kmh') }}</span>
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-sun text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.engine_temperature') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.engineTemperature || $t('common.na') }}{{ $t('vehicle_management.detail.telemetry.engine_performance.units.celsius') }}</p>
              <pv-tag 
                :value="engineTempStatus.label" 
                :severity="engineTempStatus.severity"
                class="text-xs"
              />
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-tint text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.oil_pressure') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.oilPressure || $t('common.na') }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.engine_performance.units.psi') }}</span>
            </div>
          </div>
          
          <!-- Second row: Battery Voltage, Fuel Level, Odometer, Heading -->
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-bolt text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.battery_voltage') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.batteryVoltage || $t('common.na') }}{{ $t('vehicle_management.detail.telemetry.engine_performance.units.volts') }}</p>
              <pv-tag 
                :value="batteryStatus.label" 
                :severity="batteryStatus.severity"
                class="text-xs"
              />
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-stop-circle text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.fuel_level') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.fuelLevel || $t('common.na') }}{{ $t('vehicle_management.detail.telemetry.engine_performance.units.percent') }}</p>
              <pv-tag 
                :value="fuelLevelStatus.label" 
                :severity="fuelLevelStatus.severity"
                class="text-xs"
              />
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-clock text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.odometer_reading') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.odometer?.toLocaleString() || $t('common.na') }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.engine_performance.units.km') }}</span>
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-compass text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.engine_performance.vehicle_heading') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-xl">{{ telemetry.heading || $t('common.na') }}°</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.engine_performance.units.degrees') }}</span>
            </div>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> GPS Location ====================== -->
    <pv-card class="w-full" v-if="telemetry && telemetry.gpsCoordinates">
      <template #header>
        <div class="flex align-items-center gap-2 px-3 py-2" style="background-color: #4A60D0; color: white;">
          <i class="pi pi-map-marker" style="color: white;"></i>
          <span class="text-lg font-bold">{{ $t('vehicle_management.detail.telemetry.location_data.title') }}</span>
        </div>
      </template>
      <template #content>
        <div class="formgrid grid">
          <!-- GPS Coordinates -->
          <div class="field col-12 md:col-6">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-globe text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.location_data.latitude') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg font-mono">{{ telemetry.gpsCoordinates.latitude || $t('common.na') }}</p>
          </div>
          <div class="field col-12 md:col-6">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-globe text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.location_data.longitude') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg font-mono">{{ telemetry.gpsCoordinates.longitude || $t('common.na') }}</p>
          </div>
          
          <!-- Additional location info if available -->
          <div class="field col-12 md:col-6" v-if="telemetry.altitude">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-arrow-up text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.location_data.altitude') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-lg">{{ telemetry.altitude }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.location_data.units.meters') }}</span>
            </div>
          </div>
          <div class="field col-12 md:col-6" v-if="telemetry.gpsAccuracy">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-target text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.location_data.gps_accuracy') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-lg">{{ telemetry.gpsAccuracy }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.location_data.units.meters') }}</span>
            </div>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> IoT Device Status ====================== -->
    <pv-card class="w-full" v-if="iotDevice">
      <template #header>
        <div class="flex align-items-center justify-content-between px-3 py-2" style="background-color: #4A60D0; color: white;">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-wifi" style="color: white;"></i>
            <span class="text-lg font-bold">{{ $t('vehicle_management.detail.telemetry.iot_device_status.title') }}</span>
          </div>
          <pv-tag 
            :value="iotDevice.isActive ? $t('vehicle_management.detail.telemetry.iot_device_status.active') : $t('vehicle_management.detail.telemetry.iot_device_status.inactive')" 
            :severity="iotDevice.isActive ? 'success' : 'danger'"
            :icon="iotDevice.isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'"
            class="text-sm"
          />
        </div>
      </template>
      <template #content>
        <div class="formgrid grid">
          <!-- First row: Device Model, Firmware Version, Signal Strength, Data Frequency -->
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-microchip text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.device_model') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg">{{ iotDevice.deviceModel || $t('common.na') }}</p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-code text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.firmware_version') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ iotDevice.firmwareVersion || $t('common.na') }}</p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-wifi text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.signal_strength') }}
            </label>
            <div class="flex align-items-center gap-2">
              <span 
                class="font-semibold m-0 text-lg"
                :class="getSignalStrengthColor(iotDevice.signalStrength)"
              >
                {{ iotDevice.signalStrength || $t('common.na') }}
              </span>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.iot_device_status.units.dbm') }}</span>
            </div>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-sync text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.data_frequency') }}
            </label>
            <p class="font-semibold text-dark m-0 text-lg">{{ iotDevice.dataFrequency || $t('common.na') }}</p>
          </div>
          
          <!-- Second row: Installation Date, Last Communication, Device ID, Connection Status -->
          <div class="field col-12 md:col-3" v-if="iotDevice.installationDate">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-calendar-plus text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.installation_date') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ formatDate(iotDevice.installationDate) }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="iotDevice.lastCommunication">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-clock text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.last_communication') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ formatDate(iotDevice.lastCommunication) }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="iotDevice.deviceId">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-id-card text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.device_id') }}
            </label>
            <p class="font-semibold text-dark m-0 font-mono text-sm">{{ iotDevice.deviceId }}</p>
          </div>
          <div class="field col-12 md:col-3" v-if="iotDevice.connectionStatus">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-link text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.iot_device_status.connection_status') }}
            </label>
            <pv-tag 
              :value="iotDevice.connectionStatus === 'Connected' ? $t('vehicle_management.detail.telemetry.iot_device_status.connected') : iotDevice.connectionStatus" 
              :severity="iotDevice.connectionStatus === 'Connected' ? 'success' : 'danger'"
              class="mt-1"
            />
          </div>
        </div>
      </template>
    </pv-card>

    <!-- ====================== Card -> Diagnostics & Alerts ====================== -->
    <pv-card class="w-full" v-if="telemetry">
      <template #header>
        <div class="flex align-items-center justify-content-between px-3 py-2" style="background-color: #4A60D0; color: white;">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-exclamation-triangle" style="color: white;"></i>
            <span class="text-lg font-bold">{{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.title') }}</span>
          </div>
          <pv-tag 
            :value="telemetry.obdCode ? 'Code Present' : 'No Codes'" 
            :severity="telemetry.obdCode ? 'warn' : 'success'"
            class="text-sm"
          />
        </div>
      </template>
      <template #content>
        <div class="formgrid grid">
          <!-- First row: OBD Code, Active Alert, Last Update, Alert Count -->
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-code text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.obd_diagnostic_code') }}
            </label>
            <p class="font-semibold m-0 font-mono" 
               :class="telemetry.obdCode ? 'text-orange-600 text-lg' : 'text-dark'">
              {{ telemetry.obdCode || $t('vehicle_management.detail.telemetry.diagnostics_alerts.none') }}
            </p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-bell text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.active_alert_status') }}
            </label>
            <pv-tag 
              :value="hasActiveAlert ? telemetry.alertType || $t('vehicle_management.detail.telemetry.diagnostics_alerts.alert_active') : $t('vehicle_management.detail.telemetry.diagnostics_alerts.no_alerts')" 
              :severity="alertSeverity"
              :icon="hasActiveAlert ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle'"
              class="mt-1"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-refresh text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.last_telemetry_update') }}
            </label>
            <p class="font-semibold text-dark m-0">{{ formatDate(telemetry.lastUpdate) }}</p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-chart-line text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.total_alerts_count') }}
            </label>
            <div class="flex align-items-center gap-2">
              <p class="font-semibold text-dark m-0 text-lg">{{ telemetry.alertCount || 0 }}</p>
              <span class="text-sm text-color-secondary">{{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.units.alerts') }}</span>
            </div>
          </div>
          
          <!-- Second row: Fault Description, System Status, Error Severity, Diagnostic Level -->
          <div class="field col-12 md:col-6">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-info-circle text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.fault_description') }}
            </label>
            <p class="font-semibold text-dark m-0" 
               :class="telemetry.faultDescription && telemetry.faultDescription !== $t('vehicle_management.detail.telemetry.diagnostics_alerts.no_faults_detected') ? 'text-orange-600' : ''">
              {{ telemetry.faultDescription || $t('vehicle_management.detail.telemetry.diagnostics_alerts.no_faults_detected') }}
            </p>
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-shield text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.system_status') }}
            </label>
            <pv-tag 
              :value="telemetry.systemStatus === 'Error' ? $t('vehicle_management.detail.telemetry.diagnostics_alerts.error') : telemetry.systemStatus === 'Warning' ? $t('vehicle_management.detail.telemetry.engine_performance.status.warning') : $t('vehicle_management.detail.telemetry.diagnostics_alerts.normal')" 
              :severity="telemetry.systemStatus === 'Error' ? 'danger' : telemetry.systemStatus === 'Warning' ? 'warn' : 'success'"
              class="mt-1"
            />
          </div>
          <div class="field col-12 md:col-3">
            <label class="font-semibold text-color-secondary flex align-items-center gap-2">
              <i class="pi pi-exclamation-triangle text-primary"></i>
              {{ $t('vehicle_management.detail.telemetry.diagnostics_alerts.error_severity') }}
            </label>
            <pv-tag 
              :value="telemetry.errorSeverity === 'Critical' ? $t('vehicle_management.detail.telemetry.diagnostics_alerts.critical') : telemetry.errorSeverity === 'High' ? $t('vehicle_management.detail.telemetry.diagnostics_alerts.high') : $t('vehicle_management.detail.telemetry.diagnostics_alerts.none')" 
              :severity="telemetry.errorSeverity === 'Critical' ? 'danger' : telemetry.errorSeverity === 'High' ? 'warn' : 'info'"
              class="mt-1"
            />
          </div>
        </div>
      </template>
    </pv-card>

    <!-- No telemetry data message -->
    <div v-if="!telemetry" class="flex flex-column align-items-center justify-content-center py-8">
      <i class="pi pi-info-circle text-6xl text-400 mb-4"></i>
      <h3 class="text-600 text-xl m-0 mb-2">{{ $t('vehicle_management.detail.telemetry.no_data') }}</h3>
      <p class="text-500 text-center m-0">{{ $t('vehicle_management.detail.telemetry.no_data_message') }}</p>
    </div>

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

.text-xl p {
  font-size: 1.25rem !important;
}

.text-lg p, .text-lg {
  font-size: 1.125rem !important;
}

/* Signal strength color classes */
.text-green-500 {
  color: #10B981 !important;
}

.text-yellow-500 {
  color: #F59E0B !important;
}

.text-red-500 {
  color: #EF4444 !important;
}

.text-orange-600 {
  color: #EA580C !important;
}

/* Enhanced spacing for formgrid in cards */
.formgrid.grid {
  row-gap: 1.5rem;
}

/* Card content padding adjustment */
:deep(.p-card-content) {
  padding-top: 0 !important;
}

/* Header styling consistent with other components */
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