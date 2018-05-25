import {Linking, Platform} from "react-native";

class ExternalUrlService {
    open(url) {
        if (Platform.OS === "web") {
            if (window.nw) {
                window.require('nw.gui').Shell.openExternal(url);
            } else {
                window.open(url);
            }
        } else {
            Linking.openURL(url).catch(err => console.error('An error occurred', err));
        }
    }
}

export default new ExternalUrlService();
