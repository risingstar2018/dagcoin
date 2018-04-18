class Navigator {
    static to(action) {
        history.pushState({}, '', action);
        history.go();
    }
}

export default Navigator;
