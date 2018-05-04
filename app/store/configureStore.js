import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/rootReducer';
import initialState from '../reducers/initialState';

export default () => {
    return createStore(
        rootReducer,
        initialState,
        applyMiddleware(thunk)
    );
};
