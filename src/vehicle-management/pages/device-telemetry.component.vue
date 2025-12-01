<script>
import { TelemetryApiService } from "../services/telemetry-api.service";
import { DeviceApiService } from "../services/device-api.service";

export default {
    name: "device-telemetry",
    data() {
        return {
            telemetryRecords: [],
            deviceId: null,
            device: {},
            loading: true,
            telemetryService: null,
            deviceService: null
        };
    },
    created() {
        this.telemetryService = new TelemetryApiService();
        this.deviceService = new DeviceApiService();
        this.deviceId = this.$route.params.id;
        this.loadDevice();
        this.loadTelemetry();
    },
    methods: {
        loadDevice() {
            this.deviceService.getById(this.deviceId)
                .then(response => {
                    this.device = response.data;
                })
                .catch(e => {
                    console.error(e);
                });
        },
        loadTelemetry() {
            this.loading = true;
            this.telemetryService.getByDeviceId(this.deviceId)
                .then(response => {
                    // Sort by occurredAt inside sample.timestamp
                    this.telemetryRecords = response.data.sort((a, b) => {
                        const dateA = new Date(a.sample?.timestamp?.occurredAt || a.ingestedAt);
                        const dateB = new Date(b.sample?.timestamp?.occurredAt || b.ingestedAt);
                        return dateB - dateA;
                    });
                    this.loading = false;
                })
                .catch(e => {
                    console.error(e);
                    this.loading = false;
                    this.telemetryRecords = [];
                });
        },
        formatDate(value) {
            if (!value) return '-';
            return new Date(value).toLocaleString();
        },
        goBack() {
            this.$router.push('/safe-car/mechanic/devices');
        }
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center justify-content-between mb-4">
                    <div class="flex align-items-center">
                        <pv-button icon="pi pi-arrow-left" class="p-button-text mr-2" @click="goBack" />
                        <h5 class="m-0">Telemetry Records for Device: {{ device.macAddress || deviceId }}</h5>
                    </div>
                    <pv-button icon="pi pi-refresh" class="p-button-rounded p-button-text" @click="loadTelemetry" />
                </div>

                <pv-data-table :value="telemetryRecords" :paginator="true" :rows="10" :loading="loading" responsiveLayout="scroll"
                    class="p-datatable-sm" stripedRows>
                    <template #empty>
                        <div class="text-center p-4">No telemetry records found.</div>
                    </template>

                    <pv-column header="Timestamp" :sortable="true" sortField="sample.timestamp.occurredAt">
                        <template #body="slotProps">
                            <span class="text-color-secondary text-sm">
                                {{ formatDate(slotProps.data.sample?.timestamp?.occurredAt || slotProps.data.ingestedAt) }}
                            </span>
                        </template>
                    </pv-column>

                    <pv-column header="Severity" :sortable="true" sortField="sample.severity">
                        <template #body="slotProps">
                            <span :class="'severity-badge severity-' + (slotProps.data.sample?.severity ? slotProps.data.sample.severity.toLowerCase() : 'info')">
                                {{ slotProps.data.sample?.severity || 'INFO' }}
                            </span>
                        </template>
                    </pv-column>

                    <pv-column header="Type" field="sample.type"></pv-column>

                    <pv-column header="Engine Temp">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.sample?.engineTemperature?.value !== null && slotProps.data.sample?.engineTemperature?.value !== undefined">
                                {{ slotProps.data.sample.engineTemperature.value }} °C
                            </span>
                            <span v-else>-</span>
                        </template>
                    </pv-column>

                    <pv-column header="Cabin Temp">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.sample?.cabinTemperature?.value !== null && slotProps.data.sample?.cabinTemperature?.value !== undefined">
                                {{ slotProps.data.sample.cabinTemperature.value }} °C
                            </span>
                            <span v-else>-</span>
                        </template>
                    </pv-column>

                    <pv-column header="Humidity">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.sample?.cabinHumidity?.value !== null && slotProps.data.sample?.cabinHumidity?.value !== undefined">
                                {{ slotProps.data.sample.cabinHumidity.value }} %
                            </span>
                            <span v-else>-</span>
                        </template>
                    </pv-column>

                    <pv-column header="Speed">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.sample?.speed !== null">
                                {{ slotProps.data.sample.speed }} km/h
                            </span>
                            <span v-else>-</span>
                        </template>
                    </pv-column>

                    <pv-column header="Fuel">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.sample?.cabinGasLevel !== null">
                                {{ slotProps.data.sample.cabinGasLevel }} %
                            </span>
                            <span v-else>-</span>
                        </template>
                    </pv-column>

                    <pv-column header="Electrical">
                         <template #body="slotProps">
                            <span v-if="slotProps.data.sample?.electricalCurrent?.value !== null">
                                {{ slotProps.data.sample.electricalCurrent.value }} A
                            </span>
                            <span v-else>-</span>
                        </template>
                    </pv-column>

                    <pv-column header="Location">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.sample?.location">
                                <small>Lat: {{ slotProps.data.sample.location.latitude }}</small><br>
                                <small>Lng: {{ slotProps.data.sample.location.longitude }}</small>
                            </div>
                            <span v-else>-</span>
                        </template>
                    </pv-column>
                </pv-data-table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.severity-badge {
    border-radius: 2px;
    padding: .25em .5rem;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: .3px;
}
.severity-info {
    background: #E3F2FD;
    color: #1E88E5;
}
.severity-warn {
    background: #FFF3E0;
    color: #F57C00;
}
.severity-error {
    background: #FFEBEE;
    color: #E53935;
}
</style>
