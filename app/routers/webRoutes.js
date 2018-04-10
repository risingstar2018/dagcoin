import { createBrowserRouter } from 'found';
import Intro from "../intro/index";

const routeConfig = [
    {
        path: '/',
        Component: Intro
    },
];

const router = createBrowserRouter({ routeConfig });

export default router;
