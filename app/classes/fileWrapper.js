export default class FileWrapper {
    file = null;
    manager = null;

    constructor(file, manager) {
        this.file = file;
        this.manager = manager;
    }

    getStream() {
        return this.manager.getStream(this.file);
    }

    getName() {
        return this.file.name;
    }
}
