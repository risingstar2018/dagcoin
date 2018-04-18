import Router from '../mobileRoutes';

class Navigator {
    static to(action) {
        Router.navigate(action);
    }
}

export default Navigator;
