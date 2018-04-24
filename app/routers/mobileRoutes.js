import { StackNavigator } from 'react-navigation';

import Intro from "../intro/introScreen";
import SecuritySettings from "../settings/security/securitySettings";
import BackupSettings from "../settings/security/backup/backupSettings";
import GlobalSettings from "../settings/globalSettings";

const router = StackNavigator(
    {
        Intro: {
            screen: Intro,
        },
        SecuritySettings: {
            screen: SecuritySettings,
        },
        BackupSettings: {
            screen: BackupSettings,
        },
        GlobalSettings: {
            screen: GlobalSettings
        }
    }, {
        initialRouteName: 'Intro',
        headerMode: 'none',
        mode: 'modal'
    }
);

export default router;
