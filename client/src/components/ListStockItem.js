import React        from 'react';
import {connect}    from 'react-redux';
import * as actions from '../actions';

export const _ListStockItem = React.createClass({
    handleRemove: function() {
        this.props.removeStockRequest(this.props.symbol);
    },

    render: function() {
        return (
            <li className="list-item">
                <div className="list-item-container">
                    <span className="list-item-left">{this.props.symbol}</span>
                    <span className="list-item-right" onClick={this.handleRemove}>x</span>
                </div>
            </li>
        )
    }
})

export const ListStockItem = connect(
    () => {return{}},
    actions,
)(_ListStockItem);

export default ListStockItem;
