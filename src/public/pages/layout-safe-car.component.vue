<script>
import SidebarTrackerMobility from '../components/sidebar-safe-car.component.vue'
import ToolbarTrackerMobility from '../components/toolbar-safe-car.component.vue'
import SidebarSafeCar from "@/public/components/sidebar-safe-car.component.vue";
import ToolbarSafeCar from "@/public/components/toolbar-safe-car.component.vue";

export default {
  name: 'layout-safe-car',

  components: {
    ToolbarSafeCar,
    SidebarSafeCar
    ,

  },

  created() {
    console.log('Layout creado de manera exitosa');
  }
}
</script>

<template>
  <div class="layout-container">
    <!-- Sidebar fijo a la izquierda -->
    <sidebar-safe-car />

    <!-- Contenedor principal que incluye toolbar y contenido -->
    <div class="main-content">
      <!-- Toolbar fijo en la parte superior -->
      <toolbar-safe-car />

      <!-- Área de contenido principal donde se renderizarán las rutas -->
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px; /* Ancho del sidebar */
  height: 100vh;
  transition: margin-left 0.3s ease;
}

.content-area {
  flex: 1;
  overflow: hidden;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s ease;
}

/* Responsive design para pantallas pequeñas */
@media (max-width: 1200px) {
  .main-content {
    margin-left: 240px;
  }
}

@media (max-width: 992px) {
  /* En tablets y móviles, sin margen porque sidebar está oculto */
  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }
  
  .content-area {
    padding: 0;
  }
}

@media (max-width: 480px) {
  .content-area {
    font-size: 0.9rem;
  }
}
</style>