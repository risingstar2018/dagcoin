import { createBrowserRouter } from 'found';
import Intro from "../intro/index";
import SplashRegistration from "../splash/splashRegistration";
import SplashWalletType from "../splash/splashWalletType";
import SplashDeviceName from "../splash/splashDeviceName";
import GlobalSettings from "../settings/globalSettings";
import SystemSettings from "../settings/system/systemSettings";
import DeviceNameSettings from "../settings/system/deviceNameSettings";
import AboutDeviceSettings from "../settings/aboutDeviceSettings";
import AboutDagcoinSettings from "../settings/aboutDagcoin/aboutDagcoinSettings";
import Terms from "../terms/terms";
import SecuritySettings from "../settings/security/securitySettings";
import BackupSettings from "../settings/security/backup/backupSettings";

const routeConfig = [
    {
        path: '/',
        Component: Intro
    },
    {
        path: '/splash/registration',
        Component: SplashRegistration
    },
    {
        path: '/splash/wallet-type',
        Component: SplashWalletType
    },
    {
        path: '/splash/device-name',
        Component: SplashDeviceName
    },
    {
        path: '/settings/global',
        Component: GlobalSettings
    },
    {
        path: '/settings/system',
        Component: SystemSettings
    },
    {
        path: '/settings/system/device-name',
        Component: DeviceNameSettings
    },
    {
        path: '/settings/security',
        Component: SecuritySettings
    },
    {
        path: '/settings/security/backup',
        Component: BackupSettings
    },
    {
        path: '/settings/about-device',
        Component: AboutDeviceSettings
    },
    {
        path: '/settings/about-dagcoin',
        Component: AboutDagcoinSettings
    },
    {
        path: '/terms',
        Component: Terms
    }
];

const router = createBrowserRouter({ routeConfig });

export default router;
