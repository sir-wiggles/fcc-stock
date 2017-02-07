import React           from 'react';
import ReactDOM        from 'react-dom';
import { Provider }    from 'react-redux';
import store           from './store';
import { AddStock }    from './components/AddStock';
import { ChartStocks } from './components/ChartStocks';
import { ListStocks }  from './components/ListStocks';
import { SockConnect } from './actions';

import './_index.css';

SockConnect(store.dispatch)

ReactDOM.render(
    <Provider store={store}>
        <div>
            <AddStock></AddStock>
            <ChartStocks></ChartStocks>
            <ListStocks></ListStocks>
        </div>
    </Provider>,
    document.getElementById('root')
);
