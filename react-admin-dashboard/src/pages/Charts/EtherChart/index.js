import React from "react";
import _ from "underscore";


// Pond
import { TimeSeries } from "pondjs";
import {
    Baseline ,
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    Resizable,
    ScatterChart,
    EventMarker,
    Legend,
    styler
} from "react-timeseries-charts";


const temperatures = require("./data.json");

const points = [];
_.each(temperatures, val => {
    const index = `${val.year}`;
    const temperature = val.value;
    const fiveyear = val.fiveyr;
    points.push([index, temperature, fiveyear]);
});

const temperatureSeries = new TimeSeries({
    name: "temperature anomoly",
    columns: ["index", "temperature", "five_year"],
    points
});

//
// Styles
//

const baselineStyle = {
    line: {
        stroke: "gray",
        strokeWidth: 1
    }
};

const style = styler([
    { key: "temperature", color: "#ccc", width: 1 },
    { key: "five_year", color: "black", width: 2 }
]);

const Ether = React.createClass({
    getInitialState() {
        return {
            tracker: null,
            trackerValue: "-- °C",
            trackerEvent: null,
            markerMode: "flag"
        };
    },
    handleTrackerChanged(t) {
        if (t) {
            const e = temperatureSeries.atTime(t);
            const eventTime = new Date(
                e.begin().getTime() + (e.end().getTime() - e.begin().getTime()) / 2
            );
            const eventValue = e.get("temperature");
            const v = `${eventValue > 0 ? "+" : ""}${eventValue}°C`;
            this.setState({ tracker: eventTime, trackerValue: v, trackerEvent: e });
        } else {
            this.setState({ tracker: null, trackerValue: null, trackerEvent: null });
        }
    },

    renderMarker() {
        if (!this.state.tracker) {
            return <g />;
        }
        if (this.state.markerMode === "flag") {
            return (
                <EventMarker
                    type="flag"
                    axis="axis"
                    event={this.state.trackerEvent}
                    column="temperature"
                    info={[{ label: "Anomaly", value: this.state.trackerValue }]}
                    infoTimeFormat="%Y"
                    infoWidth={120}
                    markerRadius={2}
                    markerStyle={{ fill: "black" }}
                />
            );
        } else {
            return (
                <EventMarker
                    type="point"
                    axis="axis"
                    event={this.state.trackerEvent}
                    column="temperature"
                    markerLabel={this.state.trackerValue}
                    markerLabelAlign="left"
                    markerLabelStyle={{ fill: "#2db3d1", stroke: "white" }}
                    markerRadius={3}
                    markerStyle={{ fill: "#2db3d1" }}
                />
            );
        }
    },

    renderChart() {
        const min = -0.5;
        const max = 1.0;

        const axisStyle = {
            labels: {
                labelColor: "grey", // Default label color
                labelWeight: 100,
                labelSize: 11
            },
            axis: {
                axisColor: "grey",
                axisWidth: 1
            }
        };

        return (
            <ChartContainer
                timeRange={temperatureSeries.range()}
                timeAxisStyle={axisStyle}
                onTrackerChanged={this.handleTrackerChanged}
            >
                <ChartRow height="300">
                    <YAxis
                        id="axis"
                        label="Temperature Anomaly (°C)"
                        transition={300}
                        style={axisStyle}
                        labelOffset={0}
                        min={min}
                        max={max}
                        format=",.1f"
                        width="60"
                        type="linear"
                    />
                    <Charts>
                        <LineChart
                            axis="axis"
                            series={temperatureSeries}
                            columns={["temperature"]}
                            style={style}
                        />
                        <ScatterChart
                            axis="axis"
                            series={temperatureSeries}
                            columns={["temperature"]}
                            style={style}
                        />
                        <LineChart
                            axis="axis"
                            series={temperatureSeries}
                            columns={["five_year"]}
                            style={style}
                            interpolation="curveBasis"
                        />
                        <Baseline
                            axis="axis"
                            value={0.0}
                            label="1951-1980 average"
                            style={baselineStyle}
                        />
                        {this.renderMarker()}
                    </Charts>
                </ChartRow>
            </ChartContainer>
        );
    },
    render() {
        const linkStyle = {
            fontWeight: 600,
            color: "grey",
            cursor: "default"
        };

        const linkStyleActive = {
            color: "steelblue",
            cursor: "pointer"
        };
        return (
            <div>
                <div className="row">
                    <div className="col-md-12" style={{ fontSize: 14, color: "#777" }}>
                        <span
                            style={this.state.markerMode !== "point" ? linkStyleActive : linkStyle}
                            onClick={() => this.setState({ markerMode: "point" })}
                        >
                            Point marker
                        </span>
                        <span> | </span>
                        <span
                            style={this.state.markerMode !== "flag" ? linkStyleActive : linkStyle}
                            onClick={() => this.setState({ markerMode: "flag" })}
                        >
                            Flag marker
                        </span>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="col-md-12">
                        <Resizable>
                            {this.renderChart()}
                        </Resizable>
                    </div>
                </div>
            </div>
        );
    }
});

export default Ether;