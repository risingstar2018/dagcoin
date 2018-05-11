import GlobalSettings from "../settings/globalSettings";
import ContactInfo from "../contact/contactInfo";
import SplashRegistration from "../splash/splashRegistration";
import AboutDagcoinSettings from "../settings/aboutDagcoin/aboutDagcoinSettings";
import DeviceNameSettings from "../settings/system/deviceNameSettings";
import Contacts from "../contact/contacts/contacts";
import AboutDeviceSettings from "../settings/aboutDeviceSettings";
import SecuritySettings from "../settings/security/securitySettings";
import RecoverSettings from "../settings/security/recover/recoverSettings";
import NewWallet from "../newWallet/newWallet";
import SplashDeviceName from "../splash/splashDeviceName";
import SystemSettings from "../settings/system/systemSettings";
import BackupSettings from "../settings/security/backup/backupSettings";
import SplashWalletType from "../splash/splashWalletType";
import ConfirmationScreen from "../intro/confirmationScreen";
import Home from "../home/home";
import Intro from "../intro/introScreen";
import NewContact from "../contact/newContact";
import EditContact from "../contact/editContact";
import Terms from "../terms/terms";

export const routes = {
    Intro: 'Intro',
    ConfirmationScreen: 'ConfirmationScreen',

    SplashRegistration: 'SplashRegistration',
    SplashWalletType: 'SplashWalletType',
    SplashDeviceName: 'SplashDeviceName',

    GlobalSettings: 'GlobalSettings',
    SystemSettings: 'SystemSettings',
    DeviceNameSettings: 'DeviceNameSettings',
    SecuritySettings: 'SecuritySettings',
    BackupSettings: 'BackupSettings',
    RecoverSettings: 'RecoverSettings',
    AboutDeviceSettings: 'AboutDeviceSettings',
    AboutDagcoinSettings: 'AboutDagcoinSettings',

    NewWallet: 'NewWallet',

    Home: 'Home',

    NewContact: 'NewContact',
    EditContact: 'EditContact',
    ContactInfo: 'ContactInfo',
    Contacts: 'Contacts',

    Terms: 'Terms'
};

export function getView(name) {
    switch (name) {
        case routes.Intro:
            return Intro;
        case routes.ConfirmationScreen:
            return ConfirmationScreen;

        case routes.SplashRegistration:
            return SplashRegistration;
        case routes.SplashWalletType:
            return SplashWalletType;
        case routes.SplashDeviceName:
            return SplashDeviceName;

        case routes.GlobalSettings:
            return GlobalSettings;
        case routes.SystemSettings:
            return SystemSettings;
        case routes.DeviceNameSettings:
            return DeviceNameSettings;
        case routes.SecuritySettings:
            return SecuritySettings;
        case routes.BackupSettings:
            return BackupSettings;
        case routes.RecoverSettings:
            return RecoverSettings;
        case routes.AboutDeviceSettings:
            return AboutDeviceSettings;
        case routes.AboutDagcoinSettings:
            return AboutDagcoinSettings;

        case routes.NewWallet:
            return NewWallet;

        case routes.Home:
            return Home;

        case routes.NewContact:
            return NewContact;
        case routes.EditContact:
            return EditContact;
        case routes.ContactInfo:
            return ContactInfo;
        case routes.Contacts:
            return Contacts;

        case routes.Terms:
            return Terms;
        default:
            throw 'View not implemented';
    }
}

export default routes;
