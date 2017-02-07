import { fromJS }          from 'immutable';
import { combineReducers } from 'redux';
import constants           from './constants';
//import store               from './store';

const initialState = fromJS(
    {
        'waiting': false,
        'stocks': []
    }    
)

function stockReducer(state=initialState, action) {
    let index, next;
    switch (action.type) {

        case constants.ADD_STOCK_REQUEST:
            return state.set('waiting', true )
        case constants.ADD_STOCK_SUCCESS:
            index = state.get("stocks").findIndex(
                d => {return d.get("symbol") === action.resp.symbol}
            );
            if (index !== -1) {
                break;
            }
            action.resp.data = JSON.parse(action.resp.data);
            next = state.update("stocks", 
                stocks => stocks.push(fromJS(action.resp))
            );
            return next.set('waiting', false);
        case constants.ADD_STOCK_FAIL:
            break;

        case constants.REMOVE_STOCK_REQUEST:
            return state.set('waiting', true );
        case constants.REMOVE_STOCK_SUCCESS:
            index = state.get("stocks").findIndex(
                d => {return d.get("symbol") === action.resp.symbol}
            );
            next = state.update("stocks", 
                stocks => stocks.delete(index)
            );
            return next.set("waiting", false);
        case constants.REMOVE_STOCK_FAIL:
            break;

        default:
            break;
    }
    return state
}


const reducer = combineReducers({
    stockReducer,
})

export default reducer;
