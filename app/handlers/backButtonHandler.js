import {BackHandler, Platform} from "react-native";
import DagModalManager from "../controls/dagModal/dagModalManager";
import NavigationManager from "../navigator/navigationManager";

class BackButtonHandler {
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
            return false;
        });
    }
}

export default BackButtonHandler;
