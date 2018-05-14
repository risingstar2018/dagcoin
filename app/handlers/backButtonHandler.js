import {BackHandler, Platform} from "react-native";
import DagModalManager from "../controls/dagModal/dagModalManager";
import NavigationManager from "../navigator/navigationManager";
import DagToastManager, {POSITION} from "../controls/dagToast/dagToastManager";

class BackButtonHandler {
    static shownExitMessage = false;

    static register() {
        if (Platform.OS !== 'android') {
            return;
        }

        BackHandler.addEventListener('hardwareBackPress', () => {
            if (DagModalManager.isOpened() && DagModalManager.canClose()) {
                DagModalManager.close();
                return true;
            }

            if (NavigationManager.canBack()) {
                NavigationManager.back();
                return true;
            }

            if (!BackButtonHandler.shownExitMessage) {
                BackButtonHandler.shownExitMessage = true;
                DagToastManager.show('Press again to exit', POSITION.BOTTOM);
                setTimeout(() => {
                    BackButtonHandler.shownExitMessage = false;
                }, 2000);
                return true;
            } else {
                return false;
            }
        });
    }
}

export default BackButtonHandler;
