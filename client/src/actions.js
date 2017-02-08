import constants   from './constants';
import { actions } from 'react-redux-form';
import store       from './store';

let conn;

export function SockConnect(dispatch) {
    if (window["WebSocket"]) {
        //conn = new WebSocket("ws://localhost:8080/ws");
        conn = new WebSocket("ws://" + window.location.hostname + "/ws");
        conn.onmessage = function (evt) {
            var message = JSON.parse(evt.data);
            switch (message.type) {
                case constants.ADD_STOCK_SUCCESS:
                    dispatch(addStockSuccess(message));
                    break;
                case constants.REMOVE_STOCK_SUCCESS:
                    dispatch(removeStockSuccess(message));
                    break;
                case constants.ADD_STOCK_FAIL:
                    dispatch(addStockFail(message));
                    break;
                case constants.REMOVE_STOCK_FAIL:
                    dispatch(removeStockFail(message));
                    break;
                default:
                    break;
            }
        };
    } else {
        console.log("Your browser does not support WebSockets.");
    }
}

export function addStockRequest(symbol) {
    store.dispatch(actions.reset("add"));
    let msg = {type: constants.ADD_STOCK_REQUEST, symbol};
    conn.send(JSON.stringify(msg));
    return msg;
}

function addStockSuccess(resp) {
    return {type: constants.ADD_STOCK_SUCCESS, resp};
}

function addStockFail(resp) {
    return {type: constants.ADD_STOCK_FAIL, resp};
}

export function removeStockRequest(symbol) {
    let msg = {type: constants.REMOVE_STOCK_REQUEST, symbol};
    conn.send(JSON.stringify(msg));
    return msg;
}

function removeStockSuccess(resp) {
    return {type: constants.REMOVE_STOCK_SUCCESS, resp};
}

function removeStockFail(resp) {
    return {type: constants.REMOVE_STOCK_FAIL, resp};
}
