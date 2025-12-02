import http from "../../shared/services/http-common";
import { MechanicApiService } from "../../workshop/services/mechanic-api.service";

export class VehicleApiService {
    constructor() {
        this.mechanicApiService = new MechanicApiService();
    }

    async getWorkshopId() {
        // Try to get from localStorage first
        let workshopId = localStorage.getItem('workshopId');

        if (!workshopId) {
            // If not found, fetch from API
            try {
                const response = await this.mechanicApiService.getCurrentWorkshopId();
                workshopId = response;
                localStorage.setItem('workshopId', workshopId);
            } catch (error) {
                console.error("Failed to fetch workshop ID", error);
                throw error;
            }
        }
        return workshopId;
    }

    async getAll() {
        const workshopId = await this.getWorkshopId();
        // We should fetch appointments and extract vehicles from them since there is no direct "workshop vehicles" endpoint yet
        // or if the user requested specifically to see vehicles from appointments.
        // However, let's check if the backend supports /workshops/{id}/vehicles. 
        // Based on project analysis, it seems we need to derive it from appointments for now.
        return http.get(`/workshops/${workshopId}/appointments`);
    }

    getById(id) {
        return http.get(`/vehicles/${id}`);
    }

}