import { createBrowserRouter } from 'found';
import Intro from "../intro/index";
import SplashRegistration from "../splash/splashRegistration";
import SplashWalletType from "../splash/splashWalletType";
import SplashDeviceName from "../splash/splashDeviceName";

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
    }
];

const router = createBrowserRouter({ routeConfig });

export default router;
