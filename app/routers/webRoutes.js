import { createBrowserRouter } from 'found';
import Intro from "../intro/index";
import SplashRegistration from "../splash/splashRegistration";

const routeConfig = [
    {
        path: '/',
        Component: Intro
    },
    {
        path: '/splash/registration',
        Component: SplashRegistration
    }
];

const router = createBrowserRouter({ routeConfig });

export default router;
