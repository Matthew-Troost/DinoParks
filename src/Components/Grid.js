import React, { Component } from "react";
import '../Styles/Grid.css';
import { times, find, forEach, remove, findIndex, filter } from 'lodash';
import axios from 'axios';
import wrench from '../Assets/dino-parks-wrench.png';
import loading from '../Assets/loading.gif';

class Grid extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            logs: [],
            dinosaurs: [],
            maintainedZones: []
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        axios.get('https://dinoparks.net/nudls/feed')
            .then((response) => {
                this.setState({
                    logs: response.data
                });

                this.filterData();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    filterData() {
        const dinosaurs = [];
        const maintainedZones = [];

        forEach(this.state.logs, function (log) {

            var index = findIndex(dinosaurs, { id: log.dinosaur_id });
            var dino = find(dinosaurs, ['id', log.dinosaur_id]);

            switch (log.kind) {
                case 'dino_added':
                    index = findIndex(dinosaurs, { id: log.id });
                    if (index > -1) {
                        dinosaurs[index].digestion_period = log.digestion_period_in_hours;
                    } else {
                        dinosaurs.push(
                            {
                                id: log.id,
                                digestion_period: log.digestion_period_in_hours
                            });
                    }
                    break;
                case 'dino_removed':
                    if (dino) {
                        remove(dinosaurs, function (existingDino) {
                            return existingDino === dino;
                        });
                    }
                    else {
                        dinosaurs.push(
                            {
                                id: log.dinosaur_id,
                                removed: true
                            });
                    }
                    break;
                case 'dino_location_updated':
                    if (dino) {
                        if (dino.location) {
                            if (dino.time_of_locating < new Date(log.time)) {
                                dinosaurs[index].location = log.location;
                                dinosaurs[index].time_of_locating = new Date(log.time);
                            }
                        }
                        else {
                            dinosaurs[index].location = log.location;
                            dinosaurs[index].time_of_locating = new Date(log.time);
                        }
                    }
                    else {
                        dinosaurs.push(
                            {
                                id: log.dinosaur_id,
                                location: log.location,
                                time_of_locating: new Date(log.time)
                            });
                    }
                    break;
                case 'dino_fed':
                    if (dino) {
                        if (dino.time_of_feed) {
                            if (dino.time_of_feed < new Date(log.time)) {
                                dinosaurs[index].time_of_feed = new Date(log.time);
                            }
                        }
                        else {
                            dinosaurs[index].time_of_feed = new Date(log.time);
                        }
                    } else {
                        dinosaurs.push(
                            {
                                id: log.dinosaur_id,
                                time_of_feed: new Date(log.time)
                            });
                    }
                    break;
                case 'maintenance_performed':
                    index = findIndex(maintainedZones, { location: log.location });

                    if (index > -1) {
                        var zone = find(maintainedZones, ['location', log.location]);
                        if (zone.last_kept < new Date(log.time)) {
                            maintainedZones[index].last_kept = new Date(log.time);
                        }
                    } else {
                        maintainedZones.push(
                            {
                                location: log.location,
                                last_kept: new Date(log.time)
                            });
                    }
                    break;
                default:
                    break;
            }
        });

        remove(dinosaurs, { removed: true });

        this.setState({
            dinosaurs: dinosaurs,
            maintainedZones: maintainedZones,
            loading: false
        });
    }

    needsMaintenance(location) {
        const zone = find(this.state.maintainedZones, ['location', location]);
        var date = new Date();

        if (zone && zone.last_kept < date.setDate(date.getDate() - 30))
            return true;
        else
            return null;
    }

    safeToEnter(location) {
        const dinosInLocation = filter(this.state.dinosaurs, { location: location });
        var date = new Date();

        if (dinosInLocation.length)
            return false;

        else {
            const hungryDinos = filter(dinosInLocation, function (dino) {
                return dino.time_of_feed < date.setHours(date.getHours() - dino.digestion_period);
            });

            if (hungryDinos.length)
                return false;
            else
                return true;
        }
    }


    map() {
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        return (
            <div>
                {times(16, (i) =>
                    <div className="row">
                        <div className="key">{i + 1}</div>
                        {times(26, (x) =>
                            <div className={"block " + (this.safeToEnter(alphabet[x] + (i + 1)) ? (filter(this.state.maintainedZones, { location: (alphabet[x] + (i + 1)) }).length ? "block-safe" : "") : "block-danger")}>
                                {this.needsMaintenance(alphabet[x] + (i + 1)) ? <img alt="needs maintenance" src={wrench} /> : ''}
                            </div>
                        )}
                    </div>
                )}
                <div className="row">
                    {times(26, (i) =>
                        <div className='block block-transparent'>{alphabet[i]}</div>
                    )}
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="map">
                <div className="header">
                    <h1 className="pull-left">Park Zones</h1>
                    <h2 className="pull-right">{new Date().toDateString()}</h2>
                </div>
                {this.state.loading ? <img alt="loading park..." src={loading} /> : this.map()}
            </div>
        );
    }
}

export default Grid;