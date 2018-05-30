import bwcService from '../../bitcore-wallet-client/bwc.service';
import settingsStorage from '../../services/storage/settingsStorage';

class ProfileService {
    constructor() {
    }

    create() {
    }

    createNewProfile(opts) {
        console.log('Starting create new profile');
        /*
        if (opts.noWallet) {
            return cb(null, Profile.create());
        }
        */
        return this.seedWallet(opts)
            .then(this._cc);
    }

    _cc(walletClient) {
        const hub = settingsStorage.getHub();
        const deviceName = settingsStorage.getDeviceName();
        const device = require('core/device.js');
        const tempDeviceKey = device.genPrivKey();
        // initDeviceProperties sets my_device_address needed by walletClient.createWallet
        walletClient.initDeviceProperties(walletClient.credentials.xPrivKey, null, hub, deviceName);
        const walletName = 'Small Expenses Wallet';
    }

    bindProfile() {
    }

    seedWallet(opts) {
        const options = opts || {};
        const walletClient = bwcService.getClient();
        const network = options.networkName || 'livenet';

        return new Promise((resolve, reject) => {
            if (options.mnemonic) {
                try {
                    options.mnemonic = root.normalizeMnemonic(options.mnemonic);
                    walletClient.seedFromMnemonic(options.mnemonic, {
                        network,
                        passphrase: options.passphrase,
                        account: options.account || 0,
                        derivationStrategy: options.derivationStrategy || 'BIP44',
                    });
                } catch (ex) {
                    // $log.info(ex);
                    return reject('Could not create: Invalid wallet seed');
                }
            } else if (options.extendedPrivateKey) {
                try {
                    walletClient.seedFromExtendedPrivateKey(options.extendedPrivateKey, options.account || 0);
                } catch (ex) {
                    //$log.warn(ex);
                    return reject('Could not create using the specified extended private key');
                }
            } else if (options.extendedPublicKey) {
                try {
                    walletClient.seedFromExtendedPublicKey(options.extendedPublicKey, options.externalSource, options.entropySource, {
                        account: options.account || 0,
                        derivationStrategy: options.derivationStrategy || 'BIP44',
                    });
                } catch (ex) {
                    // $log.warn('Creating wallet from Extended Public Key Arg:', ex, options);
                    return reject('Could not create using the specified extended public key');
                }
            } else {
                const lang = 'en';// uxLanguage.getCurrentLanguage();
                console.log(`will seedFromRandomWithMnemonic for language ${lang}`);
                try {
                    walletClient.seedFromRandomWithMnemonic({
                        network,
                        passphrase: options.passphrase,
                        language: lang,
                        account: options.account || 0,
                    });
                } catch (e) {
                    // $log.info(`Error creating seed: ${e.message}`);
                    if (e.message.indexOf('language') > 0) {
                        // $log.info('Using default language for mnemonic');
                        walletClient.seedFromRandomWithMnemonic({
                            network,
                            passphrase: options.passphrase,
                            account: options.account || 0,
                        });
                    } else {
                        return reject(e);
                    }
                }
            }
            resolve(walletClient);
        });
    }

    listTransaction() {
        return null;
    }
}



export default new ProfileService();
