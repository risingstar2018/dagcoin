import React, { Component } from 'react';
import { Provider } from 'react-redux';

import Router from './routers/mobileRoutes';
import configureStore from './store/configureStore';

const store = configureStore();

class Main extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router/>
            </Provider>
        );
    }
}

export default Main;
