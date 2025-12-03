import http from "../../shared/services/http-common";

export class InsightsApiService {
    getVehicleInsights(vehicleId) {
        return http.get(`/insights?vehicle=${vehicleId}`);
    }
}

