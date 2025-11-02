import axios from "axios";
const http = axios.create({
    baseURL: "https://my-json-server.typicode.com/MetaSoft-IOT/subscriptions-fake-api"
});

export class SubscriptionApiService {

    constructor(_resourceEndpoint = '/plans') {
        this.resourceEndpoint = _resourceEndpoint;
    }

    getAllPlans() {
        return http.get(this.resourceEndpoint);
    }

    createSubscription(subscriptionData) {

        return http.post('/subscriptions', subscriptionData);
    }
}