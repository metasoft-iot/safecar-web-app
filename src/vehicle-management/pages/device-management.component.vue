<script>
import { DeviceApiService } from "../services/device-api.service";

export default {
    name: "device-management",
    data() {
        return {
            devices: [],
            deviceDialog: false,
            device: {},
            submitted: false,
            deviceService: null,
            filters: {},
            deleteDeviceDialog: false,
            deviceTypes: [
                { label: 'CABINE', value: 'CABINE' },
                { label: 'MOTOR', value: 'MOTOR' }
            ]
        };
    },
    created() {
        this.deviceService = new DeviceApiService();
        this.loadDevices();
    },
    methods: {
        loadDevices() {
            this.deviceService.getAll()
                .then(response => {
                    this.devices = response.data;
                })
                .catch(e => {
                    console.error(e);
                    this.devices = [];
                });
        },
        openNew() {
            this.device = {};
            this.submitted = false;
            this.deviceDialog = true;
        },
        hideDialog() {
            this.deviceDialog = false;
            this.submitted = false;
        },
        editDevice(device) {
            this.device = { ...device };
            this.deviceDialog = true;
        },
        viewTelemetry(device) {
            this.$router.push(`/safe-car/mechanic/devices/${device.id}/telemetry`);
        },
        confirmDeleteDevice(device) {
            this.device = device;
            this.deleteDeviceDialog = true;
        },
        deleteDevice() {
            this.deviceService.delete(this.device.id)
                .then(() => {
                    this.devices = this.devices.filter(val => val.id !== this.device.id);
                    this.deleteDeviceDialog = false;
                    this.device = {};
                    this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Device Deleted', life: 3000 });
                })
                .catch(error => {
                    console.error(error);
                    this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete device', life: 3000 });
                });
        },
        saveDevice() {
            this.submitted = true;

            if (this.device.macAddress && this.device.deviceType && this.device.licensePlate) {
                if (this.device.id) {
                    this.deviceService.update(this.device.id, this.device)
                        .then(response => {
                            // Update local list
                            const index = this.devices.findIndex(d => d.id === this.device.id);
                            if (index !== -1) {
                                this.devices[index] = response.data ? response.data : this.device;
                            } else {
                                this.loadDevices();
                            }
                            this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Device Updated', life: 3000 });
                            this.deviceDialog = false;
                            this.device = {};
                        })
                        .catch(error => {
                            console.error(error);
                            const errorMessage = error.response && error.response.data && error.response.data.message
                                                ? error.response.data.message
                                                : 'Failed to update device';
                            this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
                        });
                } else {
                    this.deviceService.create(this.device)
                        .then(response => {
                            this.devices.push(response.data);
                            this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Device Created', life: 3000 });
                            this.deviceDialog = false;
                            this.device = {};
                        })
                        .catch(error => {
                            console.error(error);
                            const errorMessage = error.response && error.response.data && error.response.data.message
                                                ? error.response.data.message
                                                : 'Failed to create device';
                            this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
                        });
                }
            }
        }
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <pv-toolbar class="mb-4">
                    <template #start>
                        <div class="my-2">
                            <pv-button label="New Device" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                        </div>
                    </template>
                </pv-toolbar>

                <pv-data-table :value="devices" :paginator="true" :rows="10" responsiveLayout="scroll"
                    class="p-datatable-sm">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Devices</h5>
                        </div>
                    </template>

                    <pv-column field="macAddress" header="MAC Address" :sortable="true"></pv-column>
                    <pv-column field="deviceType" header="Device Type" :sortable="true"></pv-column>
                    <pv-column field="licensePlate" header="License Plate" :sortable="true"></pv-column>
                    <pv-column field="status" header="Status" :sortable="true">
                        <template #body="slotProps">
                            <span :class="'product-badge status-' + (slotProps.data.status ? slotProps.data.status.toLowerCase() : '')">
                                {{ slotProps.data.status || 'Unknown' }}
                            </span>
                        </template>
                    </pv-column>
                    <pv-column :exportable="false" style="min-width:12rem">
                        <template #body="slotProps">
                            <pv-button icon="pi pi-chart-line" class="p-button-rounded p-button-info mr-2" @click="viewTelemetry(slotProps.data)" v-tooltip.top="'View Telemetry'" />
                            <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editDevice(slotProps.data)" />
                            <pv-button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteDevice(slotProps.data)" />
                        </template>
                    </pv-column>
                </pv-data-table>

                <pv-dialog v-model:visible="deviceDialog" :style="{ width: '450px' }" header="Device Details" :modal="true" class="p-fluid">
                    <div class="field mb-4">
                        <label for="macAddress" class="font-bold block mb-2">MAC Address</label>
                        <pv-input-text id="macAddress" v-model.trim="device.macAddress" required="true" autofocus :class="{ 'p-invalid': submitted && !device.macAddress }" placeholder="Example: 00:11:22:33:44:55" />
                        <small class="p-error block mt-1" v-if="submitted && !device.macAddress">MAC Address is required.</small>
                    </div>
                    <div class="field mb-4">
                        <label for="deviceType" class="font-bold block mb-2">Device Type</label>
                        <pv-dropdown id="deviceType" v-model="device.deviceType" :options="deviceTypes" optionLabel="label" optionValue="value" placeholder="Select a Type" :class="{ 'p-invalid': submitted && !device.deviceType }" />
                        <small class="p-error block mt-1" v-if="submitted && !device.deviceType">Device Type is required.</small>
                    </div>
                    <div class="field mb-4">
                        <label for="licensePlate" class="font-bold block mb-2">License Plate</label>
                        <pv-input-text id="licensePlate" v-model.trim="device.licensePlate" required="true" :class="{ 'p-invalid': submitted && !device.licensePlate }" placeholder="Example: ABC-123" />
                        <small class="p-error block mt-1" v-if="submitted && !device.licensePlate">License Plate is required.</small>
                    </div>

                    <template #footer>
                        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <pv-button label="Save" icon="pi pi-check" class="p-button-text" @click="saveDevice" />
                    </template>
                </pv-dialog>

                <pv-dialog v-model:visible="deleteDeviceDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
                    <div class="confirmation-content flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="device">Are you sure you want to delete <b>{{device.macAddress}}</b>?</span>
                    </div>
                    <template #footer>
                        <pv-button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDeviceDialog = false"/>
                        <pv-button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteDevice" />
                    </template>
                </pv-dialog>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-badge {
    border-radius: 2px;
    padding: .25em .5rem;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: .3px;
}
.status-active {
    background: #C8E6C9;
    color: #256029;
}
.status-inactive {
    background: #FFCDD2;
    color: #C63737;
}
</style>
