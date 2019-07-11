import React, { Component } from "react";
import '../Styles/Custom.css';
import { times, find, forEach, remove, findIndex } from 'lodash';
import axios from 'axios';

class Grid extends Component {

    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            dinosaurs: []
        }
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

                        }
                        else {
                            dinosaurs[index].location = log.location;
                            dinosaurs[index].time_of_locating = log.time;
                        }
                    }
                    else {
                        dinosaurs.push(
                            {
                                id: log.dinosaur_id,
                                location: log.location,
                                time_of_locating: log.time
                            });
                    }
                    break;
                default:
                    break;
            }
        });

        this.setState({
            dinosaurs: dinosaurs
        });
    }

    render() {
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
            'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        return (
            <div>
                <button onClick={() => this.fetchData()}>Fetch Data</button>
                {times(16, (i) =>
                    <div className="row">
                        <span>{i + 1}</span>
                        {times(26, (x) =>
                            <div className="block">
                                {alphabet[x] + (i + 1)}
                            </div>
                        )}
                    </div>
                )}
            </div>

        );
    }

}

export default Grid;