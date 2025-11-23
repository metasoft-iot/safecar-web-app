<script>
import {MechanicApiService} from "../services/mechanic-api.service";
import {AuthenticationService} from "../../security/services/authentication.service";

export default {
  name: "mechanic-management",
  data() {
    return {
      mechanics: [],
      loading: false,
      mechanicService: new MechanicApiService(),
      authService: new AuthenticationService(),
      showDialog: false,
      newMechanic: {
        email: '',
        password: '',
        confirmPassword: '',
        roles: ['ROLE_MECHANIC']
      },
      submitted: false
    };
  },
  methods: {
    async loadMechanics() {
      this.loading = true;
      try {
        const workshopId = await this.mechanicService.getCurrentWorkshopId();
        const response = await this.mechanicService.getAllByWorkshopId(workshopId);
        this.mechanics = response.data;
      } catch (error) {
        console.error("Error loading mechanics:", error);
        this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to load mechanics', life: 3000});
      } finally {
        this.loading = false;
      }
    },
    openNew() {
      this.newMechanic = { email: '', password: '', confirmPassword: '', roles: ['ROLE_MECHANIC'] };
      this.submitted = false;
      this.showDialog = true;
    },
    hideDialog() {
      this.showDialog = false;
      this.submitted = false;
    },
    async saveMechanic() {
      this.submitted = true;
      if (!this.newMechanic.email || !this.newMechanic.password || this.newMechanic.password !== this.newMechanic.confirmPassword) {
        return;
      }

      try {
        await this.authService.signUp(this.newMechanic);
        this.$toast.add({severity: 'success', summary: 'Success', detail: 'Mechanic created. Please assign manually.', life: 5000});
        this.hideDialog();
        // We cannot reload mechanics list because the new mechanic is not assigned yet
      } catch (error) {
        console.error("Error creating mechanic:", error);
        this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to create mechanic', life: 3000});
      }
    }
  },
  mounted() {
    this.loadMechanics();
  }
};
</script>

<template>
  <div class="card">
    <pv-toast />
    <pv-toolbar class="mb-4">
      <template #start>
        <pv-button label="New Mechanic" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
      </template>
    </pv-toolbar>

    <pv-data-table :value="mechanics" :loading="loading" responsiveLayout="scroll">
      <template #header>
        <div class="table-header">
          Manage Mechanics
        </div>
      </template>
      <pv-column field="id" header="ID"></pv-column>
      <pv-column field="profileId" header="Profile ID"></pv-column>
      <pv-column field="yearsOfExperience" header="Experience (Years)"></pv-column>
      <pv-column header="Specializations">
        <template #body="slotProps">
            <span v-for="spec in slotProps.data.specializations" :key="spec.id" class="mr-2">{{ spec.name }}</span>
        </template>
      </pv-column>
    </pv-data-table>

    <pv-dialog v-model:visible="showDialog" :style="{width: '450px'}" header="Mechanic Details" :modal="true" class="p-fluid">
      <div class="field">
        <label for="email">Email</label>
        <pv-input-text id="email" v-model.trim="newMechanic.email" required="true" autofocus :class="{'p-invalid': submitted && !newMechanic.email}" />
        <small class="p-error" v-if="submitted && !newMechanic.email">Email is required.</small>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <pv-password id="password" v-model="newMechanic.password" required="true" :class="{'p-invalid': submitted && !newMechanic.password}" toggleMask />
        <small class="p-error" v-if="submitted && !newMechanic.password">Password is required.</small>
      </div>
      <div class="field">
        <label for="confirmPassword">Confirm Password</label>
        <pv-password id="confirmPassword" v-model="newMechanic.confirmPassword" required="true" :class="{'p-invalid': submitted && (newMechanic.password !== newMechanic.confirmPassword)}" toggleMask :feedback="false" />
        <small class="p-error" v-if="submitted && (newMechanic.password !== newMechanic.confirmPassword)">Passwords do not match.</small>
      </div>
      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
        <pv-button label="Save" icon="pi pi-check" class="p-button-text" @click="saveMechanic" />
      </template>
    </pv-dialog>
  </div>
</template>
