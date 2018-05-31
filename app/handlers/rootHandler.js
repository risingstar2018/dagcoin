import BackButtonHandler from './backButtonHandler';

export default class RootHandler {
    static handlers = [
      BackButtonHandler,
    ];

    static register() {
      RootHandler.handlers.forEach(x => x.register());
    }
}
