import http from "../../shared/services/http-common";

export class MechanicApiService {

    getAllByWorkshopId(workshopId) {
        return http.get(`/workshops/${workshopId}/mechanics`);
    }

    getWorkshopByBusinessProfileId(businessProfileId) {
        return http.get(`/workshops/by-business-profile/${businessProfileId}`);
    }

    getBusinessProfileByEmail(email) {
        return http.get(`/business-profiles?email=${email}`);
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
