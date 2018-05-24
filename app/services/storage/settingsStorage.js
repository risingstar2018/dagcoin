import BaseStorage from './baseStorage';

class SettingsStorage extends BaseStorage {
    constructor() {
        super("settings.json");
    }

    setDeviceName(deviceName) {
        return this.set("deviceName", deviceName);
    }

    getDeviceName() {
        return this.get("deviceName");
    }
}

export default new SettingsStorage();
