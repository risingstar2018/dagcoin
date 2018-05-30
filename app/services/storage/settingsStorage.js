import BaseStorage from './baseStorage';

class SettingsStorage extends BaseStorage {
    constructor() {
        super("settings.json");
    }

    setDeviceName(deviceName) {
        return this.set("deviceName", deviceName);
    }

    getHub() {
        return new Promise((resolve) => {
            resolve('wss://test-hub.dagcoin.org/spoon/');
        })
    }

    getDeviceName() {
        return this.get("deviceName");
    }
}

export default new SettingsStorage();
