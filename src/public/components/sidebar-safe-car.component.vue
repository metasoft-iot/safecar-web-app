<script>

export default {

  name: 'sidebar-safe-car',


  data() {
    return {
      drawer: true,
      visible: true,
      isMobileMenuOpen: false
    };
  },


  computed: {

    items() {
      return [
        { label: this.$t('sidebar.menu.dashboard'), icon: 'pi pi-fw pi-chart-line', to: `/safe-car/mechanic/dashboard` },
        { label: this.$t('sidebar.menu.appointments'), icon: 'pi pi-fw pi-file-edit', to: `/safe-car/mechanic/service-request` },
        { label: "Completed Services", icon: 'pi pi-fw pi-check-circle', to: `/safe-car/mechanic/service-history` },
        { label: this.$t('sidebar.menu.vehicles'), icon: 'pi pi-fw pi-chart-bar', to: `/safe-car/mechanic/vehicle-management` },
        { label: 'Devices', icon: 'pi pi-fw pi-box', to: `/safe-car/mechanic/devices` },
        { label: 'Mechanics', icon: 'pi pi-fw pi-users', to: `/safe-car/mechanic/management` },
        { label: 'Subscriptions', icon: 'pi pi-fw pi-credit-card', to: `/safe-car/mechanic/subscriptions` },
        { label: 'Profile', icon: 'pi pi-fw pi-user', to: `/safe-car/mechanic/profile` },

      ];
    }
  },

  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      // Emitir evento para que el layout lo reciba
      this.$emit('toggle-mobile-menu', this.isMobileMenuOpen);
    },

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      this.$emit('toggle-mobile-menu', false);
    },

    logout() {
      // Implementar lógica de cierre de sesión
      this.$router.push('/login');
    }
  },

  created() {
    console.log(this.$t('sidebar.created_success'));
  },

  mounted() {
    // Escuchar cambios del evento global
    window.addEventListener('toggle-mobile-menu', (e) => {
      this.isMobileMenuOpen = e.detail;
    });
  },

  beforeUnmount() {
    window.removeEventListener('toggle-mobile-menu', () => {});
  }

}

</script>

<template>
  <!-- Overlay para móvil -->
  <div
    v-if="isMobileMenuOpen"
    class="mobile-overlay"
    @click="closeMobileMenu"
  ></div>

  <div class="sidebar-fixed" :class="{ 'sidebar-fixed--mobile-open': isMobileMenuOpen }">
    <aside class="sidebar-safe">
      <!-- Header del sidebar -->
      <div class="w-full sidebar-header justify-content-center align-items-center">
        <div class="sidebar-brand ">
          <i class="pi pi-mobile brand-icon"></i>
          <h3 class="brand-title">{{ $t('sidebar.brand_title') }}</h3>
        </div>
        <!-- Botón de cerrar para móvil -->
        <button class="mobile-close-btn" @click="closeMobileMenu">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Contenido del sidebar -->
      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <ul class="sidebar-menu">
            <li
              v-for="item in items"
              :key="item.label"
              class="sidebar-item"
            >
              <router-link
                :to="item.to"
                class="sidebar-link"
                @click="closeMobileMenu"
              >
                <i :class="item.icon" class="sidebar-icon"></i>
                <span class="sidebar-label">{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Footer del sidebar -->
      <div class="sidebar-footer">
        <button
          class="sidebar-logout-btn"
          @click="logout"
        >
          <i class="pi pi-sign-out"></i>
          <span>{{ $t('sidebar.logout') }}</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
:root {
  --color-primary: #1e40af;
}

/* Overlay para móvil */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: none;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  width: 260px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-safe {
  width: 100%;
  height: 100vh;
  background: var(--color-primary);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #ffffff;
  background: var(--color-primary);
  min-height: 70px;
  display: flex;
  align-items: center;
  position: relative;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

.brand-icon {
  color: #ffffff;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.brand-title {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Botón de cerrar para móvil - oculto en desktop */
.mobile-close-btn {
  display: none;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
}

.mobile-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-50%) rotate(90deg);
}

.sidebar-content {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  margin: 0.375rem 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
  position: relative;
  border-left: 4px solid transparent;
  font-weight: 500;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #3b82f6;
  padding-left: 1.25rem;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-link.router-link-active {
  background: rgba(59, 130, 246, 0.2);
  border-left-color: #60a5fa;
  color: #ffffff;
}

.sidebar-icon {
  margin-right: 1rem;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.sidebar-label {
  font-size: 0.95rem;
  letter-spacing: 0.025em;
}

.sidebar-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid #ffffff;
  background: var(--color-primary);
}

.sidebar-logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px solid #ef4444;
  color: #ef4444;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #f87171;
  color: #f87171;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Responsive design */
@media (max-width: 1200px) {
  .sidebar-fixed {
    width: 240px;
  }
}

@media (max-width: 992px) {
  /* En tablets y móviles, ocultar el sidebar por defecto */
  .sidebar-fixed {
    transform: translateX(-100%);
  }

  /* Mostrar sidebar cuando está abierto en móvil */
  .sidebar-fixed--mobile-open {
    transform: translateX(0);
  }

  /* Mostrar overlay en móvil */
  .mobile-overlay {
    display: block;
  }

  /* Mostrar botón de cerrar en móvil */
  .mobile-close-btn {
    display: flex;
  }

  .sidebar-brand {
    justify-content: flex-start;
    padding-left: 0.5rem;
  }
}

@media (max-width: 768px) {
  .sidebar-fixed {
    width: 280px;
    max-width: 80vw;
  }

  .sidebar-link {
    padding: 0.875rem 1rem;
  }

  .brand-title {
    font-size: 1.1rem;
  }

  .sidebar-content {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .sidebar-fixed {
    width: 260px;
    max-width: 85vw;
  }

  .sidebar-header {
    padding: 1rem 0.75rem;
    min-height: 60px;
  }

  .brand-title {
    font-size: 1rem;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .sidebar-link {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }

  .sidebar-icon {
    font-size: 1.1rem;
    margin-right: 0.75rem;
  }

  .sidebar-footer {
    padding: 1rem 0.75rem;
  }

  .sidebar-logout-btn {
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
  }
}
</style>
