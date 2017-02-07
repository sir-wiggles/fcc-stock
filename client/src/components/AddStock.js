import React        from 'react';
import { connect }  from 'react-redux';
import {
    Form,
    Control,
}                   from 'react-redux-form';
import * as actions from '../actions';

export const _AddStock = React.createClass({
    handleSubmit: function() {
        if (!this.props.form.symbol) {
            return
        }
        this.props.addStockRequest(this.props.form.symbol);
    },

    render: function() {
        return (
            <Form model="add" onSubmit={this.handleSubmit}>
                <label>Symbol:</label>                
                <Control.text placeholder="Enter Symbol" model=".symbol" ></Control.text>
                <button type="submit">Add</button>
            </Form>
        )
    },
})

function mapStateToProps(state) {
    return {
        form: state.forms.add,
    }
}

export const AddStock = connect(
    mapStateToProps,
    actions, 
)(_AddStock);

export default AddStock;
