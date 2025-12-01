import http from "../../shared/services/http-common";

export class TelemetryApiService {
    getByDeviceId(deviceId) {
        return http.get(`/telemetry/device/${deviceId}`);
    }
}
