import http from "./http-common";

/**
 * Profile API Service
 * Service for fetching profile information from the backend
 */
export class ProfileApiService {

    /**
     * Get person profile by ID
     * @param {number} profileId - The profile ID
     * @returns {Promise} - Promise with profile data
     */
    getPersonProfileById(profileId) {
        return http.get(`/person-profiles/${profileId}`);
    }

    /**
     * Get person profile by user email
     * @param {string} email - The user email
     * @returns {Promise} - Promise with profile data
     */
    getPersonProfileByEmail(email) {
        return http.get(`/person-profiles?userEmail=${email}`);
    }

    /**
     * Create a new person profile
     * @param {Object} profileData - The profile data
     * @returns {Promise} - Promise with created profile data
     */
    createPersonProfile(email, profileData) {
        return http.post(`/person-profiles?userEmail=${email}`, profileData);
    }

    /**
     * Get business profile by ID
     * @param {number} profileId - The profile ID
     * @returns {Promise} - Promise with profile data
     */
    getBusinessProfileById(profileId) {
        return http.get(`/business-profiles/${profileId}`);
    }

    /**
     * Get business profile by email
     * @param {string} email - The user email
     * @returns {Promise} - Promise with profile data
     */
    getBusinessProfileByEmail(email) {
        return http.get(`/business-profiles?email=${email}`);
    }
    /**
     * Create a new business profile
     * @param {string} email - The user email
     * @param {Object} profileData - The profile data
     * @returns {Promise} - Promise with created profile data
     */
    createBusinessProfile(email, profileData) {
        return http.post(`/business-profiles?userEmail=${email}`, profileData);
    }

    /**
     * Update business profile
     * @param {number} profileId - The profile ID
     * @param {Object} profileData - The profile data
     * @returns {Promise} - Promise with updated profile data
     */
    updateBusinessProfile(profileId, profileData) {
        return http.put(`/business-profiles/${profileId}`, profileData);
    }
}

