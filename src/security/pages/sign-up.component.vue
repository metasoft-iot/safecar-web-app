<script>
import {AuthenticationService} from "../services/authentication.service";
import {ProfileApiService} from "../../shared/services/profile-api.service";

export default {
  name: "sign-up",

  data() {
    return {
      // Datos del Taller
      nombreTaller: '',
      ruc: '',
      direccionTaller: '',
      correoTaller: '',
      telefonoTaller: '',
      loading: false,

      // Datos del Propietario / Cuenta (Simplificado)
      // nombrePropietario: '',
      password: '',
      confirmPassword: '',
      aceptarTerminos: false,

      authenticationService: new AuthenticationService(),
      profileService: new ProfileApiService(),

      touched: {
        nombreTaller: false,
        ruc: false,
        direccionTaller: false,
        correoTaller: false,
        telefonoTaller: false,
        password: false,
        confirmPassword: false,
        aceptarTerminos: false
      }
    };
  },

  computed: {
    isFormValid() {
      return this.nombreTaller &&
             this.ruc &&
             this.direccionTaller &&
             this.correoTaller &&
             this.telefonoTaller &&
             this.password &&
             this.confirmPassword &&
             this.aceptarTerminos &&
             this.password === this.confirmPassword;
    },

    passwordsMatch() {
      return this.password === this.confirmPassword;
    }
  },

  methods: {
    async onSignUp() {
      if (this.loading) return;
      
      // Marcar todos los campos como tocados
      Object.keys(this.touched).forEach(key => {
        this.touched[key] = true;
      });

      // Validar campos obligatorios
      if (!this.isFormValid) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Please complete all fields correctly', life: 3000 });
        return;
      }

      // Validar que las contraseñas coincidan
      if (!this.passwordsMatch) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 });
        return;
      }

      // Validar términos y condiciones
      if (!this.aceptarTerminos) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'You must accept the terms and conditions', life: 3000 });
        return;
      }

      const user = {
        email: this.correoTaller,
        password: this.password,
        confirmPassword: this.confirmPassword,
        roles: ["ROLE_WORKSHOP"]
      };

      try {
        this.loading = true;
        // 1. Sign Up
        await this.authenticationService.signUp(user);

        // 1.5 Auto Sign In to get token
        const signInResponse = await this.authenticationService.signIn({
            email: user.email,
            password: user.password
        });
        
        const token = signInResponse.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', signInResponse.data.id);
        localStorage.setItem('email', signInResponse.data.username);

        // 2. Create Business Profile
        const profileData = {
          businessName: this.nombreTaller,
          ruc: this.ruc,
          businessAddress: this.direccionTaller,
          contactPhone: this.telefonoTaller,
          contactEmail: this.correoTaller,
          description: ''
        };

        await this.profileService.createBusinessProfile(this.correoTaller, profileData);
        
        this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Account and Profile created successfully. Please log in.', life: 3000 });
        
        // Redirect to sign-in
        setTimeout(() => {
          this.$router.push({ name: 'sign-in' });
        }, 2000);

      } catch (error) {
        console.error(error);
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.response && error.response.data && error.response.data.message) {
            if (error.response.data.message.includes('Email already exists')) {
                errorMessage = 'This email is already registered. Please use a different email or log in.';
            } else {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
             if (error.message.includes('Email already exists')) {
                errorMessage = 'This email is already registered. Please use a different email or log in.';
            } else {
                errorMessage = error.message;
            }
        }
        
        this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 5000 });
      } finally {
        this.loading = false;
      }
    },

    onFieldBlur(fieldName) {
      this.touched[fieldName] = true;
    },

    goToSignIn() {
      this.$router.push({ name: 'sign-in' });
    },

    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<template>
  <pv-toast></pv-toast>

  <div class="w-full h-screen overflow-auto" style="background-color: var(--color-background);">
    <!-- Header simplificado -->
    <div class="flex align-items-center py-3 px-4 shadow-2 sticky top-0 z-5" style="background-color: var(--color-white); border-bottom: 1px solid var(--color-border-cards);">
      <!-- Flecha para regresar -->
      <pv-button
          icon="pi pi-arrow-left"
          class="p-button-text p-button-rounded p-button-sm mr-3"
          @click="goBack"
          style="color: var(--color-primary);"
      />

      <!-- Título centrado -->
      <div class="flex-1 text-center">
        <h1 class="text-2xl font-bold m-0" style="color: var(--color-text-gray);">
          <span style="color: var(--color-primary);">Safe</span><span style="color: var(--color-border-cards);">Car</span>
        </h1>
      </div>
      
      <!-- Espacio para equilibrar el botón de la izquierda -->
      <div style="width: 2.5rem;"></div>
    </div>

    <!-- Formulario -->
    <div class="p-4 pb-6 md:px-6 lg:px-8 xl:px-12 max-w-6xl mx-auto">
      <form @submit.prevent="onSignUp">
        <div class="p-fluid">

          <!-- Sección: Información de Cuenta -->
          <div class="border-round-lg p-4 mb-5" style="background-color: var(--color-card-background); border: var(--border-width) solid var(--color-border-cards); box-shadow: var(--shadow);">
            <div class="flex align-items-center gap-3 mb-4 pb-3" style="border-bottom: 1px solid var(--color-border-cards);">
              <div class="border-circle w-3rem h-3rem flex align-items-center justify-content-center" style="background-color: var(--color-primary);">
                <i class="pi pi-user-plus text-xl" style="color: var(--color-white);"></i>
              </div>
              <div>
                <h3 class="font-semibold m-0" style="color: var(--color-primary);">Create Account</h3>
                <p class="text-sm m-0" style="color: var(--color-muted);">Enter your email and password to get started.</p>
              </div>
            </div>

            <!-- Fila principal -->
            <div class="grid mb-3">
              <!-- Business Name -->
              <div class="col-12">
                <label for="nombreTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-briefcase mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.workshop_info.workshop_name') }} *
                </label>
                <pv-input-text
                    id="nombreTaller"
                    v-model="nombreTaller"
                    :class="{'p-invalid': touched.nombreTaller && !nombreTaller}"
                    class="w-full"
                    :placeholder="$t('auth.sign_up.workshop_info.workshop_name_placeholder')"
                    @blur="onFieldBlur('nombreTaller')"
                />
                <small v-if="touched.nombreTaller && !nombreTaller" class="p-error block mt-1">
                  {{ $t('auth.sign_up.workshop_info.workshop_name_required') }}
                </small>
              </div>

              <!-- RUC -->
              <div class="col-12 lg:col-6">
                <label for="ruc" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-id-card mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.workshop_info.ruc') }} *
                </label>
                <pv-input-text
                    id="ruc"
                    v-model="ruc"
                    :class="{'p-invalid': touched.ruc && !ruc}"
                    class="w-full"
                    :placeholder="$t('auth.sign_up.workshop_info.ruc_placeholder')"
                    @blur="onFieldBlur('ruc')"
                />
                <small v-if="touched.ruc && !ruc" class="p-error block mt-1">
                  {{ $t('auth.sign_up.workshop_info.ruc_required') }}
                </small>
              </div>

              <!-- Phone -->
              <div class="col-12 lg:col-6">
                <label for="telefonoTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-phone mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.workshop_info.phone') }} *
                </label>
                <pv-input-text
                    id="telefonoTaller"
                    v-model="telefonoTaller"
                    :class="{'p-invalid': touched.telefonoTaller && !telefonoTaller}"
                    class="w-full"
                    :placeholder="$t('auth.sign_up.workshop_info.phone_placeholder')"
                    @blur="onFieldBlur('telefonoTaller')"
                />
                <small v-if="touched.telefonoTaller && !telefonoTaller" class="p-error block mt-1">
                  {{ $t('auth.sign_up.workshop_info.phone_required') }}
                </small>
              </div>

              <!-- Address -->
              <div class="col-12">
                <label for="direccionTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-map-marker mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.workshop_info.address') }} *
                </label>
                <pv-input-text
                    id="direccionTaller"
                    v-model="direccionTaller"
                    :class="{'p-invalid': touched.direccionTaller && !direccionTaller}"
                    class="w-full"
                    :placeholder="$t('auth.sign_up.workshop_info.address_placeholder')"
                    @blur="onFieldBlur('direccionTaller')"
                />
                <small v-if="touched.direccionTaller && !direccionTaller" class="p-error block mt-1">
                  {{ $t('auth.sign_up.workshop_info.address_required') }}
                </small>
              </div>



              <div class="col-12">
                <label for="correoTaller" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-envelope mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.workshop_info.email') }} *
                </label>
                <pv-input-text
                    id="correoTaller"
                    v-model="correoTaller"
                    :class="{'p-invalid': touched.correoTaller && !correoTaller}"
                    class="w-full"
                    :placeholder="$t('auth.sign_up.workshop_info.email_placeholder')"
                    type="email"
                    @blur="onFieldBlur('correoTaller')"
                />
                <small v-if="touched.correoTaller && !correoTaller" class="p-error block mt-1">
                  {{ $t('auth.sign_up.workshop_info.email_required') }}
                </small>
              </div>
              
              <div class="col-12 lg:col-6">
                <label for="password" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-lock mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.account_security.password') }} *
                </label>
                <pv-password
                    id="password"
                    v-model="password"
                    :class="{'p-invalid': touched.password && !password}"
                    class="w-full"
                    input-class="w-full"
                    :placeholder="$t('auth.sign_up.account_security.password_placeholder')"
                    :feedback="true"
                    toggleMask
                    @blur="onFieldBlur('password')"
                />
                <small v-if="touched.password && !password" class="p-error block mt-1">
                  {{ $t('auth.sign_up.account_security.password_required') }}
                </small>
              </div>
              <div class="col-12 lg:col-6">
                <label for="confirmPassword" class="block font-medium mb-2" style="color: var(--color-text-gray);">
                  <i class="pi pi-verified mr-2" style="color: var(--color-primary);"></i>{{ $t('auth.sign_up.account_security.confirm_password') }} *
                </label>
                <pv-password
                    id="confirmPassword"
                    v-model="confirmPassword"
                    :class="{'p-invalid': touched.confirmPassword && (!confirmPassword || !passwordsMatch)}"
                    class="w-full"
                    input-class="w-full"
                    :placeholder="$t('auth.sign_up.account_security.confirm_password_placeholder')"
                    :feedback="false"
                    toggleMask
                    @blur="onFieldBlur('confirmPassword')"
                />
                <small v-if="touched.confirmPassword && !confirmPassword" class="p-error block mt-1">
                  {{ $t('auth.sign_up.account_security.confirm_password_required') }}
                </small>
                <small v-else-if="touched.confirmPassword && !passwordsMatch" class="p-error block mt-1">
                  {{ $t('auth.sign_up.account_security.passwords_no_match') }}
                </small>
              </div>
            </div>

            <!-- Fila de aceptación: Términos con diseño destacado -->
            <div class="border-round-md p-3 mt-3" style="background-color: var(--bg-info-light); border-left: 3px solid var(--color-primary);">
              <div class="flex align-items-start gap-3">
                <pv-checkbox
                    id="aceptarTerminos"
                    v-model="aceptarTerminos"
                    :class="{'p-invalid': touched.aceptarTerminos && !aceptarTerminos}"
                    binary
                    @change="onFieldBlur('aceptarTerminos')"
                />
                <div class="flex-1">
                  <label for="aceptarTerminos" class="font-medium cursor-pointer" style="color: var(--color-text-gray);">
                    <i class="pi pi-shield mr-2" style="color: var(--color-primary);"></i>
                    {{ $t('auth.sign_up.account_security.accept_terms') }} *
                  </label>
                  <small v-if="touched.aceptarTerminos && !aceptarTerminos" class="block mt-1" style="color: var(--color-error);">
                    {{ $t('auth.sign_up.account_security.accept_terms_required') }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de registro mejorado -->
          <div class="mt-5">
            <pv-button
                type="submit"
                :label="loading ? 'Creating Account...' : $t('auth.sign_up.create_account_button')"
                :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
                class="w-full px-6 py-3 text-lg font-semibold p-button-primary"
                :disabled="!isFormValid || loading"
                style="background-color: var(--color-primary); border-color: var(--color-primary);"
            />
            
            <!-- Indicador de progreso visual -->
            <div class="flex align-items-center justify-content-center gap-2 mt-3" v-if="isFormValid">
              <i class="pi pi-check-circle text-sm" style="color: var(--color-success);"></i>
              <span class="text-sm font-medium" style="color: var(--color-success);">{{ $t('auth.sign_up.form_complete') }}</span>
            </div>
            <div class="flex align-items-center justify-content-center gap-2 mt-3" v-else>
              <i class="pi pi-info-circle text-sm" style="color: var(--color-warning);"></i>
              <span class="text-sm" style="color: var(--color-muted);">{{ $t('auth.sign_up.complete_required_fields') }}</span>
            </div>
          </div>

        
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>


