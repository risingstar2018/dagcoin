export default class DagSideMenuManager {
    static sideMenu = null;

    static registerSideMenu(sideMenu) {
      DagSideMenuManager.sideMenu = sideMenu;
    }

    static toggle() {
      DagSideMenuManager.sideMenu.toggle();
    }

    static enable() {
      DagSideMenuManager.sideMenu.enable();
    }

    static disable() {
      DagSideMenuManager.sideMenu.disable();
    }
}
