import http from "../../shared/services/http-common";

export class MechanicApiService {

    getAllByWorkshopId(workshopId) {
        return http.get(`/mechanics?workshop=${workshopId}`);
    }

    getWorkshopByBusinessProfileId(businessProfileId) {
        return http.get(`/workshops?business-profile=${businessProfileId}`);
    }

    getWorkshopById(workshopId) {
        return http.get(`/workshops/${workshopId}`);
    }

    getBusinessProfileByEmail(email) {
        return http.get(`/business-profiles?email=${email}`);
    }

    getMechanicByProfileId(profileId) {
        return http.get(`/mechanics?profile=${profileId}`);
    }

    updateWorkshop(workshopId, data) {
        return http.patch(`/workshops/${workshopId}`, data);
    }

    assignToWorkshop(mechanicId, workshopId) {
        return http.patch(`/mechanics/${mechanicId}/workshop`, { workshopId });
    }

    updateMechanic(mechanicId, data) {
        return http.patch(`/mechanics/${mechanicId}`, data);
    }

    // Helper to get the current workshop ID based on logged in user
    async getCurrentWorkshopId() {
        const email = localStorage.getItem('email'); // Assuming email is stored on login
        if (!email) throw new Error("No email found in localStorage");

        const profileResponse = await this.getBusinessProfileByEmail(email);
        const profileId = profileResponse.data.id;

        const workshopResponse = await this.getWorkshopByBusinessProfileId(profileId);
        return workshopResponse.data.id;
    }
}
