// third imports
import { combineForms } from 'react-redux-form';
import {
    createStore,
    applyMiddleware,
    combineReducers,
}                       from 'redux'
import createLogger     from 'redux-logger'
import thunk            from 'redux-thunk'
import reducer          from './reducers'


const middleware = [thunk]

if (process.env.NODE_ENV === "development") {
    middleware.push(createLogger({}))
}

const store = createStore(combineReducers({
        reducer,
        forms: combineForms({
            add: {},
        })
    }),
    applyMiddleware(...middleware)
)

export default store;
