import http from "../../shared/services/http-common";
import { MechanicApiService } from "../../workshop/services/mechanic-api.service";

export class AppointmentRequestApiService {
    constructor() {
        this.mechanicApiService = new MechanicApiService();
    }

    async getWorkshopId() {
        // Get current user email to make workshopId user-specific
        const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');

        if (!userEmail) {
            console.error("No user email found in localStorage");
            throw new Error("User not authenticated");
        }

        // Create a user-specific key for workshopId
        const workshopIdKey = `workshopId_${userEmail}`;

        // Try to get from localStorage first (user-specific)
        let workshopId = localStorage.getItem(workshopIdKey);

        if (!workshopId) {
            // If not found, fetch from API
            try {
                // Use the helper method from MechanicApiService that handles the full flow
                workshopId = await this.mechanicApiService.getCurrentWorkshopId();

                if (workshopId) {
                    // Store with user-specific key
                    localStorage.setItem(workshopIdKey, workshopId);
                    console.log(`Workshop ID ${workshopId} cached for user ${userEmail}`);
                }
            } catch (error) {
                console.error("Failed to fetch workshop ID", error);
                throw error;
            }
        } else {
            console.log(`Using cached workshop ID ${workshopId} for user ${userEmail}`);
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