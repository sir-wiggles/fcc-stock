import React             from 'react';
import {connect}         from 'react-redux';
import { ListStockItem } from './ListStockItem';

export const _ListStocks = React.createClass({
    render: function() {
    
        let items = this.props.symbols.toJSON().map((d) => {
            return <ListStockItem key={d.symbol} symbol={d.symbol} />
        })

        return (
            <ul className="stock-list">
                {items}    
            </ul>
        )
    },
})

function mapStateToProps(state) {
    return {
        symbols: state.reducer.stockReducer.get("stocks")
    }
}

export const ListStocks = connect(
    mapStateToProps,
)(_ListStocks)

export default ListStocks;
