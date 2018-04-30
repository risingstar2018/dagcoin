import { StackNavigator } from 'react-navigation';

import Intro from "../intro/introScreen";
import SecuritySettings from "../settings/security/securitySettings";
import BackupSettings from "../settings/security/backup/backupSettings";
import GlobalSettings from "../settings/globalSettings";
import NewWallet from "../newWallet/newWallet";
import Wallet from "../wallet/wallet";

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
        },
        NewWallet: {
            screen: NewWallet
        },
        Wallet: {
            screen: Wallet
        }
    }, {
        initialRouteName: 'Wallet',
        headerMode: 'none',
        mode: 'modal'
    }
);

export default router;
