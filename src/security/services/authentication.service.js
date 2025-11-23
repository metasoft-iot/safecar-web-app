import http from "../../shared/services/http-common";

export class AuthenticationService {
    signIn(user) {
        return http.post("/authentication/sign-in", user);
    }

    signUp(user) {
        return http.post("/authentication/sign-up", user);
    }

    createBusinessProfile(email, profile) {
        return http.post(`/business-profiles?userEmail=${email}`, profile);
    }
}
