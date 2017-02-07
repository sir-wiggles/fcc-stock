import React       from 'react';
import ReactDOM    from 'react-dom';
import * as d3     from 'd3';
import { connect } from 'react-redux';

class Graph {

    constructor(element, dataset) {

        console.log(dataset);
        if (dataset.length === 0) {
            return;
        }

        var width = 360;
        var height = 360;

        var margin = {top: 20, right: 20, bottom: 70, left: 50};
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        var parseTime = d3.timeParse("%Y-%m-%d");

        var x = d3.scaleTime().rangeRound([0, width]);
        var y = d3.scaleLinear().rangeRound([height, 0]);
        var line = d3.line()
            .x(function(d) { return x(parseTime(d.tradingDay)) })
            .y(function(d) { return y(d.close) });

        var svg = d3.select(element)
            .append("svg")
            .attr('width', width)
            .attr('height', height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        let _x = [];
        let _y = [];
        for (let i = 0; i<dataset.length; i++) {
            let y_min_max = d3.extent(dataset[i].data.results, d => {
                return d.close
            });
            let x_min_max = d3.extent(dataset[i].data.results, d => {
                return parseTime(d.tradingDay);
            });
            _x = _x.concat(x_min_max);
            _y = _y.concat(y_min_max);
        }
        let dates= d3.extent(_x);
        let close= d3.extent(_y);

        y.domain(close);
        x.domain(dates);

        for (let i = 0; i < dataset.length; i++) {
            svg.append("path")
                .datum(dataset[i].data.results)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("d", line)
        }

        svg.append("g")
            .attr("transform", "translate(0," + height+ ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();

        svg.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Price ($)");
    }
}

export const _Chart = React.createClass({
    render: function(){
        return <div id='chart'></div>
    },

    componentDidMount() {
        this.chart = new Graph(
            ReactDOM.findDOMNode(this),
            this.props.data.toJSON()
        );
    },

    shouldComponentUpdate() {
        let children = Array.prototype.slice.call(
            ReactDOM.findDOMNode(this).children
        );
        children.map(d => { return d.remove() });

        return true;
    },

    componentDidUpdate() {
        this.chart = new Graph(
            ReactDOM.findDOMNode(this),
            this.props.data.toJSON()
        )
    }
})

const Chart = connect(
    (state) => {
        return{
            data: state.reducer.stockReducer.get("stocks")
        }
    },
)(_Chart)

export default Chart;
