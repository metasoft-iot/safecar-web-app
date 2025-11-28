<script>

export default {
  name: "toolbar-safe-car",
  data() {
    return {
      // Data properties here
    }
  },

  computed: {
    currentLocale() {
      return this.$i18n.locale;
    },
    
    isEnglish() {
      return this.currentLocale === 'en';
    },
    
    title() {
      return this.$t('toolbar.title');
    }
  },

  methods: {
    toggleLanguage() {
      const newLocale = this.currentLocale === 'en' ? 'es' : 'en';
      this.$i18n.locale = newLocale;
      
      // Save to localStorage for persistence
      localStorage.setItem('preferred-language', newLocale);
      
      console.log(`Language switched to: ${newLocale === 'en' ? 'English' : 'Spanish'}`);
    },
    
    toggleMobileMenu() {
      // Emitir evento personalizado global para abrir/cerrar el sidebar
      const event = new CustomEvent('toggle-mobile-menu', { 
        detail: true 
      });
      window.dispatchEvent(event);
    }
  },

  created() {
    console.log(this.$t('toolbar.created_success'));
    
    // Load saved language preference or default to English
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    this.$i18n.locale = savedLanguage;
  }

}

</script>

<template>

  <header class="toolbar-tracker">
    <div class="toolbar-content">
      <!-- Botón hamburguesa para móvil -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <i class="pi pi-bars"></i>
      </button>
      
      <!-- Spacer para empujar el switcher a la derecha -->
      <div class="toolbar-spacer"></div>
      
      <!-- Language switcher -->
      <div class="language-switcher">
        <div 
          class="language-toggle"
          @click="toggleLanguage"
          :title="$t('toolbar.language_switch.tooltip')"
        >
          <!-- Language switcher display: EN [perilla] ES -->
          <div class="language-switcher-display">
            <span class="language-option" :class="{ 'language-option--active': isEnglish }">EN</span>
            
            <!-- Switch toggle with moving knob -->
            <div class="switch-container">
              <div class="switch-track">
                <div class="switch-knob" :class="{ 'switch-knob--es': !isEnglish }"></div>
              </div>
            </div>
            
            <span class="language-option" :class="{ 'language-option--active': !isEnglish }">ES</span>
          </div>
        </div>
      </div>
    </div>
  </header>

</template>

<style scoped>
.toolbar-tracker {
  background-color: var(--color-primary);
  position: sticky;
  border-left: 1px solid #ffffff;
  top: 0;
  z-index: 50;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
}

.toolbar-content {
  padding: 0 20px;
  display: flex;
  align-items: center;
  width: 100%;
}

.toolbar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.toolbar-spacer {
  flex: 1;
}

/* Botón hamburguesa para móvil */
.mobile-menu-btn {
  display: none; /* Oculto por defecto en desktop */
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
  transition: all 0.3s ease;
  border-radius: 8px;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* Language Switcher Styles */
.language-switcher {
  display: flex;
  align-items: center;
}

.language-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.language-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.language-switcher-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-option {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 28px;
  text-align: center;
}

.language-option--active {
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Switch container and track */
.switch-container {
  display: flex;
  align-items: center;
}

.switch-track {
  width: 44px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 11px;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.switch-knob {
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Move knob to ES position */
.switch-knob--es {
  transform: translateX(22px);
  background: #fbbf24;
}

/* Hover effects */
.language-toggle:hover .switch-track {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.language-toggle:hover .switch-knob {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

/* Responsive design */
@media (max-width: 992px) {
  /* Mostrar botón hamburguesa en tablets y móviles */
  .mobile-menu-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .toolbar-content {
    padding: 0 15px;
  }
  
  .language-toggle {
    padding: 6px 12px;
  }
  
  .language-switcher-display {
    gap: 10px;
  }
  
  .switch-track {
    width: 38px;
    height: 20px;
  }
  
  .switch-knob {
    width: 16px;
    height: 16px;
  }
  
  .switch-knob--es {
    transform: translateX(18px);
  }
  
  .language-option {
    font-size: 0.8rem;
    min-width: 24px;
  }
  
  .mobile-menu-btn {
    font-size: 1.3rem;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .toolbar-content {
    padding: 0 10px;
  }
  
  .language-toggle {
    padding: 4px 8px;
  }
  
  .language-switcher-display {
    gap: 8px;
  }
  
  .switch-track {
    width: 32px;
    height: 18px;
  }
  
  .switch-knob {
    width: 14px;
    height: 14px;
  }
  
  .switch-knob--es {
    transform: translateX(14px);
  }
  
  .language-option {
    font-size: 0.75rem;
    min-width: 20px;
    padding: 2px 4px;
  }
  
  .mobile-menu-btn {
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    margin-right: 0.5rem;
  }
}
</style>