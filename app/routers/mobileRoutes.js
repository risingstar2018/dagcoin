import { StackNavigator } from 'react-navigation';

import Intro from "../intro/introScreen";

const router = StackNavigator(
    {
        Intro: {
            screen: Intro,
        }
    }, {
        initialRouteName: 'Intro',
        headerMode: 'none',
        mode: 'modal'
    }
);

export default router;
