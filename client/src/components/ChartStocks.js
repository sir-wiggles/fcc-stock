import React       from 'react';
import Chart       from './Chart';

export const ChartStocks = React.createClass({
    render: function() {
        return (
            <div>
                <h1>ChartStocks</h1>
                <Chart />
            </div>
        )
    },
})

export default ChartStocks;
