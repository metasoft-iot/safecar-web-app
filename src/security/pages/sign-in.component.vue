<script>
import {AuthenticationService} from "../services/authentication.service";

export default {
  name: "sign-in",

  data() {
    return {
      username: '',
      password: '',
      authenticationService: new AuthenticationService(),
      touched: {
        username: false,
        password: false
      }
    };
  },

  methods: {
    onSignIn() {
      this.touched.username = true;
      this.touched.password = true;

      if (!this.username || !this.password) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Please complete all fields', life: 3000 });
        return;
      }

      const user = {
        email: this.username,
        password: this.password
      };

      this.authenticationService.signIn(user)
          .then(response => {
            const token = response.data.token;
            const userId = response.data.id;
            const username = response.data.username;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('email', username);
            
            this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Signed in successfully', life: 3000 });
            this.$router.push({ name: 'safe-car' });
          })
          .catch(error => {
            console.error(error);
            this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid credentials', life: 3000 });
          });
    },

    onUsernameBlur() {
      this.touched.username = true;
    },

    onPasswordBlur() {
      this.touched.password = true;
    }
  }
}
</script>

<template>


  <pv-toast></pv-toast>

  <div class="flex w-full h-screen p-4" style="background-color: var(--color-background);">

    <!-- ================================ PANEL 01  -->
    <div class="w-6 h-full flex flex-column justify-content-center align-items-center border-round-xl"
         style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-hover) 100%); box-shadow: var(--shadow);">

      <!-- Main Content Card -->
      <pv-card class="w-full text-center bg-transparent border-none shadow-none">

        <!-- Main Content -->
        <template #content>
          <div class="flex flex-column gap-5">

            <!-- Title Section -->
            <div class="px-3">
              <h1 class="text-xl md:text-4xl font-bold line-height-3 m-0 pb-3" style="color: var(--color-white);">
                "Connecting technology and innovation to revolutionize your workshop"
              </h1>

              <p class="text-base font-light m-0 line-height-3" style="color: var(--color-white);">
                {{ $t('app.subtitle') }}
              </p>
            </div>

            <!-- Image Section -->
            <div class="flex justify-content-center">
              <pv-card class="bg-white-alpha-10 border-none shadow-2">
                <template #content>
                  <img src="../../assets/img/sign-in.jpg"
                       class="w-full max-w-20rem"
                       alt="SafeCar IoT Solutions" />
                </template>
              </pv-card>
            </div>

            <!-- Technology Badges -->
            <div class="flex justify-content-center flex-wrap gap-3">
              <pv-tag class="border-round-3xl px-4 py-2" style="background-color: rgba(255, 255, 255, 0.2); color: var(--color-white);">
                <template #default>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-wifi"></i>
                    <span class="font-semibold">IoT</span>
                  </div>
                </template>
              </pv-tag>

              <pv-tag class="bg-white-alpha-20 text-white border-round-3xl px-4 py-2">
                <template #default>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-cloud"></i>
                    <span class="font-semibold">Cloud</span>
                  </div>
                </template>
              </pv-tag>

              <pv-tag class="bg-white-alpha-20 text-white border-round-3xl px-4 py-2">
                <template #default>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-mobile"></i>
                    <span class="font-semibold">Smart</span>
                  </div>
                </template>
              </pv-tag>
            </div>

          </div>
        </template>
      </pv-card>
    </div >

    <!-- ================================ PANEL 02  -->
    <div class="flex flex-1 flex-column h-full justify-content-center align-items-center ">

      <div class="w-full max-w-28rem">
        <!-- Card del formulario -->
        <pv-card style="background-color: var(--color-card-background); border: var(--border-width) solid var(--color-border-cards); box-shadow: var(--shadow-lg);">
          <!-- Header del formulario -->

          <template #header>
            <div class="text-center">
              <h1 class="text-4xl font-bold m-0 pt-6" style="color: var(--color-text-gray);">
                <span style="color: var(--color-primary);">Safe</span><span style="color: var(--color-border-cards);">Car</span>
              </h1>
              <p class="text-xl m-0 pt-2" style="color: var(--color-muted);">{{ $t('auth.sign_in.subtitle') }}</p>
            </div>
          </template>



          <template #content>
            <form @submit.prevent="onSignIn">
              <div class="p-fluid">

                <!-- Campo de correo electrónico -->
                <div class="field pb-2">
                  <label for="username" class="block font-medium mb-2" style="color: var(--color-text-gray);">{{ $t('auth.sign_in.email_label') }}</label>
                  <pv-input-text
                      id="username"
                      v-model="username"
                      :class="{'p-invalid': touched.username && !username}"
                      class="w-full"
                      :placeholder="$t('auth.sign_in.email_placeholder')"
                      autocomplete="email"
                      @blur="onUsernameBlur"
                  />
                  <small v-if="touched.username && !username" class="p-error block mt-2">
                    {{ $t('auth.sign_in.email_required') }}
                  </small>
                </div>

                <!-- Campo de contraseña -->
                <div class="field mb-4">
                  <label for="password" class="block font-medium mb-2" style="color: var(--color-text-gray);">{{ $t('auth.sign_in.password_label') }}</label>
                  <pv-password
                      id="password"
                      v-model="password"
                      :class="{'p-invalid': touched.password && !password}"
                      class="w-full"
                      input-class="w-full"
                      :placeholder="$t('auth.sign_in.password_placeholder')"
                      :feedback="false"
                      toggleMask
                      autocomplete="current-password"
                      @blur="onPasswordBlur"
                  />
                  <small v-if="touched.password && !password" class="p-error block mt-2">
                    {{ $t('auth.sign_in.password_required') }}
                  </small>
                </div>

                <!-- Botón de inicio de sesión -->
                <pv-button
                    type="submit"
                    :label="$t('auth.sign_in.sign_in_button')"
                    icon="pi pi-sign-in"
                    class="w-full mt-2 p-button-primary"
                    :disabled="!username || !password"
                    style="background-color: var(--color-primary); border-color: var(--color-primary);"
                />

              </div>
            </form>
          </template>

          <template #footer>
            <!-- Link de registro -->
            <div class="text-center ">
              <p class="mb-2" style="color: var(--color-muted);">{{ $t('auth.sign_in.no_account') }}</p>
              <router-link :to="{ name: 'sign-up' }" class="no-underline">
                <pv-button
                    :label="$t('auth.sign_in.create_account')"
                    icon="pi pi-user-plus"
                    class="p-button-outlined w-full"
                    style="border-color: var(--color-primary); color: var(--color-primary);"
                />
              </router-link>
            </div>
          </template>
        </pv-card>



      </div>

    </div>

  </div>


</template>

<style scoped>
/* Sin CSS personalizado - Solo PrimeFlex y PrimeVue */
</style>