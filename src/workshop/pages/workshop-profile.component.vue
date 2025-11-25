<script>
import { AuthenticationService } from "../../security/services/authentication.service";

import { ProfileApiService } from "../../shared/services/profile-api.service";
import { MechanicApiService } from "../services/mechanic-api.service";

export default {
  name: "workshop-profile",
  data() {
    return {
      loading: true,
      saving: false,
      
      // Profile Data
      businessProfile: {
        id: null,
        businessName: '',
        ruc: '',
        businessAddress: '',
        contactPhone: '',
        contactEmail: ''
      },
      
      workshop: {
        id: null,
        description: ''
      },
      
      userEmail: '',
      hasBusinessProfile: false,
      
      authService: new AuthenticationService(),
      profileService: new ProfileApiService(),
      mechanicService: new MechanicApiService()
    };
  },
  
  methods: {
    async loadProfileData() {
        this.loading = true;
        this.userEmail = localStorage.getItem('email');
        
        if (!this.userEmail) {
            this.$toast.add({severity: 'error', summary: 'Error', detail: 'User email not found', life: 3000});
            this.loading = false;
            return;
        }

        try {
            // 1. Check if Business Profile Exists
            const profileResponse = await this.profileService.getBusinessProfileByEmail(this.userEmail);
            
            if (profileResponse.data && profileResponse.data.id) {
                this.hasBusinessProfile = true;
                this.businessProfile = {
                    id: profileResponse.data.id,
                    businessName: profileResponse.data.businessName,
                    ruc: profileResponse.data.ruc,
                    businessAddress: profileResponse.data.businessAddress,
                    contactPhone: profileResponse.data.contactPhone,
                    contactEmail: profileResponse.data.contactEmail,
                    description: profileResponse.data.description || ''
                };

                // 2. Fetch Workshop Details
                try {
                    const workshopResponse = await this.mechanicService.getWorkshopByBusinessProfileId(this.businessProfile.id);
                    if (workshopResponse.data) {
                        this.workshop = {
                            id: workshopResponse.data.id,
                            description: workshopResponse.data.workshopDescription || ''
                        };
                        // Use workshop description if available, otherwise fall back to profile description
                        if (this.workshop.description) {
                             this.businessProfile.description = this.workshop.description;
                        }
                    }
                } catch (e) {
                    console.log("Workshop not found for profile:", e);
                }
            }
        } catch (error) {
            // It's okay if profile doesn't exist yet, user will create it
            console.log("Profile not found or error loading:", error);
        } finally {
            this.loading = false;
        }
    },
    
    async saveProfile() {
        this.saving = true;
        try {
            // 1. Create or Update Business Profile
            const profileData = {
                businessName: this.businessProfile.businessName,
                ruc: this.businessProfile.ruc,
                businessAddress: this.businessProfile.businessAddress,
                contactPhone: this.businessProfile.contactPhone,
                contactEmail: this.businessProfile.contactEmail || this.userEmail,
                description: this.businessProfile.description
            };

            if (!this.hasBusinessProfile) {
                await this.profileService.createBusinessProfile(this.userEmail, profileData);
                this.hasBusinessProfile = true;
                this.$toast.add({severity: 'success', summary: 'Success', detail: 'Profile created successfully', life: 3000});
            } else {
                await this.profileService.updateBusinessProfile(this.businessProfile.id, profileData);
                
                // Update Workshop Description if workshop exists
                if (this.workshop.id) {
                    await this.mechanicService.updateWorkshop(this.workshop.id, {
                        workshopDescription: this.businessProfile.description
                    });
                }
                
                this.$toast.add({severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000});
            }
            
            // Refresh to get IDs and latest data
            await this.loadProfileData();
            
        } catch (error) {
            console.error("Error saving profile:", error);
            this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to save profile', life: 3000});
        } finally {
            this.saving = false;
        }
    }
  },
  
  mounted() {
    this.loadProfileData();
  }
};
</script>

<template>
  <div class="grid p-4">
    <pv-toast />
    
    <div class="col-12 mb-4">
        <h1 class="text-3xl font-bold text-900">Workshop Profile</h1>
        <p class="text-600">Manage your business details and workshop information.</p>
    </div>

    <div v-if="loading" class="col-12 flex justify-content-center">
        <pv-progress-spinner />
    </div>

    <div v-else class="col-12 flex justify-content-center">
        <div class="card surface-card shadow-2 p-4 border-round w-full md:w-8 lg:w-6">
            <form @submit.prevent="saveProfile">
                
                <!-- Business Profile Section -->
                <h3 class="text-xl font-bold mb-3 text-900">Business Details</h3>
                <div class="grid p-fluid">
                    <div class="col-12 md:col-6 mb-3">
                        <label for="businessName" class="font-medium text-900 block mb-2">Business Name</label>
                        <pv-input-text id="businessName" v-model="businessProfile.businessName" required class="w-full" />
                    </div>
                    
                    <div class="col-12 md:col-6 mb-3">
                        <label for="ruc" class="font-medium text-900 block mb-2">RUC</label>
                        <pv-input-text id="ruc" v-model="businessProfile.ruc" required class="w-full" />
                    </div>
                    
                    <div class="col-12 mb-3">
                        <label for="address" class="font-medium text-900 block mb-2">Address</label>
                        <pv-input-text id="address" v-model="businessProfile.businessAddress" required class="w-full" />
                    </div>
                    
                    <div class="col-12 md:col-6 mb-3">
                        <label for="phone" class="font-medium text-900 block mb-2">Contact Phone</label>
                        <pv-input-text id="phone" v-model="businessProfile.contactPhone" required class="w-full" />
                    </div>
                    
                    <div class="col-12 md:col-6 mb-3">
                        <label for="email" class="font-medium text-900 block mb-2">Contact Email</label>
                        <pv-input-text id="email" v-model="businessProfile.contactEmail" type="email" required class="w-full" />
                    </div>
                </div>
                
                <pv-divider class="my-4" />
                
                <!-- Workshop Details Section -->
                <h3 class="text-xl font-bold mb-3 text-900">Workshop Settings</h3>
                <div class="grid p-fluid">
                    <div class="col-12 mb-3">
                        <label for="description" class="font-medium text-900 block mb-2">Description</label>
                        <pv-textarea id="description" v-model="businessProfile.description" rows="5" placeholder="Describe your workshop services, specialties, etc." class="w-full" />
                        <small class="text-500 block mt-1">This description will be visible to customers.</small>
                    </div>
                </div>
                
                <div class="flex justify-content-end mt-4">
                    <pv-button type="submit" label="Save Changes" icon="pi pi-save" :loading="saving" />
                </div>
                
            </form>
        </div>
    </div>
  </div>
</template>

