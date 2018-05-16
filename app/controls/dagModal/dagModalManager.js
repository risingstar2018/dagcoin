class DagModalManager {
    static container = null; //container
    static content = null; //modal
    static modal = null; //modal (core)

    static registerContainer(container) {
        DagModalManager.container = container;
    }

    static registerModal(modal) {
        DagModalManager.modal = modal;
    }

    static show(content) {
        DagModalManager.content = content;
        DagModalManager.container.update();
    }

    static hide() {
        DagModalManager.content = null;
        DagModalManager.modal = null;
        DagModalManager.container.update();
    }

    static close() {
        if (DagModalManager.modal.props.onClose) {
            DagModalManager.modal.props.onClose();
        }

        DagModalManager.hide();
    }

    static canClose() {
        return DagModalManager.modal && DagModalManager.modal.props.canClose;
    }

    static isOpened() {
        return !!DagModalManager.content;
    }
}

export default DagModalManager;


