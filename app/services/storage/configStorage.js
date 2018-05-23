import BaseStorage from './baseStorage';

class ConfigStorage extends BaseStorage {
    constructor() {
        super("conf.json");
    }

    setWalletType(walletType) {
        return this.set("walletType", walletType);
    }

    getWalletType() {
        return this.get("walletType");
    }
}

export default new ConfigStorage();
