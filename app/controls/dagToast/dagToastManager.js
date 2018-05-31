class DagToastManager {
    static toast;

    static registerToast(toast) {
      DagToastManager.toast = toast;
    }

    static show(content, position, duration, style) {
      DagToastManager.toast.show(content, position, duration, style);
    }
}

export default DagToastManager;

const POSITION = {
  CENTER: 'center',
  TOP: 'top',
  BOTTOM: 'bottom',
};

const DURATION = {
  SHORT: 0,
  LONG: 500,
};

export { POSITION, DURATION };
