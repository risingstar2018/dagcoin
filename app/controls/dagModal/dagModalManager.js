class DagModalManager {
    static modalContainer = null;
    static content = null;

    static registerModal(modalContainer) {
        DagModalManager.modalContainer = modalContainer;
    }

    static show(content) {
        DagModalManager.content = content;
        DagModalManager.modalContainer.update();
    }

    static hide() {
        DagModalManager.content = null;
        DagModalManager.modalContainer.update();
    }
}

export default DagModalManager;


