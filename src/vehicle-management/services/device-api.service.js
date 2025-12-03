import http from "../../shared/services/http-common";

export class DeviceApiService {
    getAll() {
        return http.get('/devices');
    }

    getById(id) {
        return http.get(`/devices/${id}`);
    }

    create(data) {
        return http.post('/devices', data);
    }

    searchByMacAddress(macAddress) {
        return http.get(`/devices?mac-address=${macAddress}`);
    }

    update(id, data) {
        return http.put(`/devices/${id}`, data);
    }

    delete(id) {
        return http.delete(`/devices/${id}`);
    }
}
