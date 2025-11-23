import http from "../../shared/services/http-common";
import { MechanicApiService } from "../../workshop/services/mechanic-api.service";

export class AppointmentRequestApiService {
    constructor() {
        this.mechanicApiService = new MechanicApiService();
    }

    async getWorkshopId() {
        // Try to get from localStorage first
        let workshopId = localStorage.getItem('workshopId');

        if (!workshopId) {
            // If not found, fetch from API
            try {
                const response = await this.mechanicApiService.getWorkshopByBusinessProfile();
                if (response.data && response.data.id) {
                    workshopId = response.data.id;
                    localStorage.setItem('workshopId', workshopId);
                }
            } catch (error) {
                console.error("Failed to fetch workshop ID", error);
                throw error;
            }
        }
        return workshopId;
    }

    async getAll() {
        const workshopId = await this.getWorkshopId();
        return http.get(`/workshops/${workshopId}/appointments`);
    }

    async getById(id) {
        const workshopId = await this.getWorkshopId();
        return http.get(`/workshops/${workshopId}/appointments/${id}`);
    }

    async create(appointmentData) {
        const workshopId = await this.getWorkshopId();
        return http.post(`/workshops/${workshopId}/appointments`, appointmentData);
    }

    async update(id, appointmentData) {
        const workshopId = await this.getWorkshopId();
        return http.put(`/workshops/${workshopId}/appointments/${id}`, appointmentData);
    }

    async delete(id) {
        const workshopId = await this.getWorkshopId();
        return http.delete(`/workshops/${workshopId}/appointments/${id}`);
    }

    // Método para obtener mecánicos disponibles
    async getAvailableMechanics() {
        const workshopId = await this.getWorkshopId();
        return http.get(`/workshops/${workshopId}/mechanics`);
    }

    // Método para actualizar solo el estado
    async updateStatus(id, status) {
        const workshopId = await this.getWorkshopId();
        return http.patch(`/workshops/${workshopId}/appointments/${id}/status`, { status });
    }

    // Método para asignar mecánico
    async assignMechanic(appointmentId, mechanicId) {
        const workshopId = await this.getWorkshopId();
        return http.patch(`/workshops/${workshopId}/appointments/${appointmentId}/mechanics/${mechanicId}`);
    }

}