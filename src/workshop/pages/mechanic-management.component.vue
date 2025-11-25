<script>
import {MechanicApiService} from "../services/mechanic-api.service";
import {AuthenticationService} from "../../security/services/authentication.service";
import {ProfileApiService} from "../../shared/services/profile-api.service";

export default {
  name: "mechanic-management",
  data() {
    return {
      mechanics: [],
      loading: false,
      saving: false,
      mechanicService: new MechanicApiService(),
      authService: new AuthenticationService(),
      profileService: new ProfileApiService(),
      showDialog: false,
      editMode: false,
      editingMechanic: null,
      newMechanic: {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        dni: '',
        city: '',
        country: 'Peru', // Default
        roles: ['ROLE_MECHANIC']
      },
      mechanicData: {
        specializations: [],
        yearsOfExperience: 0
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
      this.editMode = false;
      this.editingMechanic = null;
      this.newMechanic = { 
          email: '', 
          password: '', 
          confirmPassword: '', 
          firstName: '',
          lastName: '',
          phone: '',
          dni: '',
          city: '',
          country: 'Peru',
          roles: ['ROLE_MECHANIC'] 
      };
      this.mechanicData = {
          specializations: [],
          yearsOfExperience: 0
      };
      this.submitted = false;
      this.showDialog = true;
    },
    openEdit(mechanic) {
      this.editMode = true;
      this.editingMechanic = mechanic;
      this.mechanicData = {
          specializations: mechanic.specializations ? [...mechanic.specializations] : [],
          yearsOfExperience: mechanic.yearsOfExperience || 0
      };
      this.submitted = false;
      this.showDialog = true;
    },
    hideDialog() {
      this.showDialog = false;
      this.editMode = false;
      this.editingMechanic = null;
      this.submitted = false;
    },
    async saveMechanic() {
      this.submitted = true;
      
      if (this.editMode) {
        // Edit mode - update mechanic
        if (this.mechanicData.yearsOfExperience < 0) {
          return;
        }
        
        this.saving = true;
        try {
          await this.mechanicService.updateMechanic(this.editingMechanic.id, this.mechanicData);
          this.$toast.add({severity: 'success', summary: 'Success', detail: 'Mechanic updated successfully.', life: 3000});
          this.hideDialog();
          this.loadMechanics();
        } catch (error) {
          console.error("Error updating mechanic:", error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update mechanic';
          this.$toast.add({severity: 'error', summary: 'Error', detail: errorMessage, life: 5000});
        } finally {
          this.saving = false;
        }
      } else {
        // Create mode
        if (!this.newMechanic.email || !this.newMechanic.password || this.newMechanic.password !== this.newMechanic.confirmPassword) {
          return;
        }

        this.saving = true;
        try {
          // 1. Sign Up User
          const signUpResponse = await this.authService.signUp({
              email: this.newMechanic.email,
              password: this.newMechanic.password,
              confirmPassword: this.newMechanic.confirmPassword,
              roles: this.newMechanic.roles
          });
          const userId = signUpResponse.data.id;

          // 2. Create Person Profile (Triggers Mechanic Creation on Backend)
          const profileData = {
              fullName: `${this.newMechanic.firstName} ${this.newMechanic.lastName}`,
              city: this.newMechanic.city,
              country: this.newMechanic.country,
              phone: this.newMechanic.phone,
              dni: this.newMechanic.dni,
              email: this.newMechanic.email // Pass email to link profile
          };
          
          const profileResponse = await this.profileService.createPersonProfile(this.newMechanic.email, profileData);
          const profileId = profileResponse.data.profileId;

          // 3. Fetch the newly created Mechanic by Profile ID
          // Retry logic to handle async event processing on the backend
          let mechanicResponse = null;
          const maxRetries = 5;
          
          for (let i = 0; i < maxRetries; i++) {
              try {
                  mechanicResponse = await this.mechanicService.getMechanicByProfileId(profileId);
                  if (mechanicResponse && mechanicResponse.data && mechanicResponse.data.id) {
                      break;
                  }
              } catch (e) {
                  console.log(`Attempt ${i+1} to fetch mechanic failed, retrying...`);
                  
                  // If it's the last attempt, throw the error
                  if (i === maxRetries - 1) throw e;
                  
                  // Wait 1s before retry
                  await new Promise(resolve => setTimeout(resolve, 1000)); 
              }
          }
          
          if (!mechanicResponse || !mechanicResponse.data) {
              throw new Error("Failed to retrieve mechanic details after creation");
          }
          
          const mechanicId = mechanicResponse.data.id;

          // 4. Get Current Workshop ID
          const workshopId = await this.mechanicService.getCurrentWorkshopId();

          // 5. Assign Mechanic to Workshop
          await this.mechanicService.assignToWorkshop(mechanicId, workshopId);

          this.$toast.add({severity: 'success', summary: 'Success', detail: 'Mechanic created and assigned successfully.', life: 3000});
          this.hideDialog();
          this.loadMechanics(); // Reload list
        } catch (error) {
          console.error("Error creating mechanic:", error);
          // Extract specific error message if available
          const errorMessage = error.response?.data?.message || error.message || 'Failed to create mechanic or assign to workshop';
          this.$toast.add({severity: 'error', summary: 'Error', detail: errorMessage, life: 5000});
        } finally {
          this.saving = false;
        }
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
      <pv-column field="fullName" header="Full Name"></pv-column>
      <pv-column field="yearsOfExperience" header="Experience (Years)"></pv-column>
      <pv-column header="Specializations">
        <template #body="slotProps">
            <span v-for="spec in slotProps.data.specializations" :key="spec" class="mr-2">{{ spec }}</span>
        </template>
      </pv-column>
      <pv-column header="Actions">
        <template #body="slotProps">
            <pv-button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="openEdit(slotProps.data)" />
        </template>
      </pv-column>
    </pv-data-table>

    <pv-dialog v-model:visible="showDialog" :style="{width: '450px'}" :header="editMode ? 'Edit Mechanic' : 'Create Mechanic'" :modal="true" class="p-fluid">
      <!-- Create Mode Form -->
      <div v-if="!editMode">
        <div class="field">
          <label for="email">Email</label>
          <pv-input-text id="email" v-model.trim="newMechanic.email" required="true" autofocus :class="{'p-invalid': submitted && !newMechanic.email}" />
          <small class="p-error" v-if="submitted && !newMechanic.email">Email is required.</small>
        </div>
        
        <div class="formgrid grid">
          <div class="field col">
              <label for="firstName">First Name</label>
              <pv-input-text id="firstName" v-model.trim="newMechanic.firstName" required="true" :class="{'p-invalid': submitted && !newMechanic.firstName}" />
              <small class="p-error" v-if="submitted && !newMechanic.firstName">First Name is required.</small>
          </div>
          <div class="field col">
              <label for="lastName">Last Name</label>
              <pv-input-text id="lastName" v-model.trim="newMechanic.lastName" required="true" :class="{'p-invalid': submitted && !newMechanic.lastName}" />
              <small class="p-error" v-if="submitted && !newMechanic.lastName">Last Name is required.</small>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col">
              <label for="dni">DNI</label>
              <pv-input-text id="dni" v-model.trim="newMechanic.dni" required="true" :class="{'p-invalid': submitted && !newMechanic.dni}" />
              <small class="p-error" v-if="submitted && !newMechanic.dni">DNI is required.</small>
          </div>
          <div class="field col">
              <label for="phone">Phone</label>
              <pv-input-text id="phone" v-model.trim="newMechanic.phone" required="true" :class="{'p-invalid': submitted && !newMechanic.phone}" />
              <small class="p-error" v-if="submitted && !newMechanic.phone">Phone is required.</small>
          </div>
        </div>

        <div class="formgrid grid">
          <div class="field col">
              <label for="city">City</label>
              <pv-input-text id="city" v-model.trim="newMechanic.city" required="true" :class="{'p-invalid': submitted && !newMechanic.city}" />
              <small class="p-error" v-if="submitted && !newMechanic.city">City is required.</small>
          </div>
          <div class="field col">
              <label for="country">Country</label>
              <pv-input-text id="country" v-model.trim="newMechanic.country" required="true" :class="{'p-invalid': submitted && !newMechanic.country}" />
              <small class="p-error" v-if="submitted && !newMechanic.country">Country is required.</small>
          </div>
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
      </div>

      <!-- Edit Mode Form -->
      <div v-else>
        <div class="field">
          <label for="yearsOfExperience">Years of Experience</label>
          <pv-input-number id="yearsOfExperience" v-model="mechanicData.yearsOfExperience" :min="0" showButtons />
        </div>
        
        <div class="field">
          <label for="specializations">Specializations</label>
          <pv-chips id="specializations" v-model="mechanicData.specializations" separator="," placeholder="Add specializations (comma-separated)" />
          <small class="p-text-secondary">Press Enter or comma to add specializations</small>
        </div>
      </div>

      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
        <pv-button label="Save" icon="pi pi-check" class="p-button-text" @click="saveMechanic" :loading="saving" />
      </template>
    </pv-dialog>
  </div>
</template>
```
