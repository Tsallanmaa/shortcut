import * as React from "react";
import { Table } from 'reactstrap';

export interface ApartmentTransitInfoProps {
    id: string
}

export interface ApartmentTransitInfoState {
    data: any;
}

export class ApartmentTransitInfo extends React.Component<ApartmentTransitInfoProps, ApartmentTransitInfoState> {

    constructor(props: ApartmentTransitInfoProps, state: ApartmentTransitInfoState) {
        super(props, state);

        this.state = {
            data: { summaries: [] }
        }
    }

    componentDidMount() {
        fetch(`http://localhost:3001/api/apartments/${this.props.id}/transit`)
            .then((response) => response.json())
            .then((res: any[]) => {
                this.setState({ data: res })
            }); 
    }

    private formatDuration(duration: number): string {
        if (!duration) { return ""; }
        return `${(duration/60).toFixed(0)}m ${(duration%60).toFixed(0)}s`;
    } 

    private formatKilometers(distance: number): string {
        if (!distance) { return ""; }
        return `${(distance/1000).toFixed(2)} km`;
    } 

    private safeToFixed(prop: number, arg: number): string {
        if (!prop) { return ""; }
        return prop.toFixed(arg);
    }

    render() {
        return (           
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Destination</th>
                        <th>Duration</th>
                        <th>Transit legs</th>
                        <th>Walk distance</th>
                        <th>Distance</th>
                        <th>Itineraries</th>
                    </tr>
                </thead>                           
                <tbody>
                    { this.state.data.summaries.map((sum: any) => (
                    <tr key={sum.tag}>
                        <th scope="row">{ sum.tag }</th>
                        <td>{ this.formatDuration(sum.summary.averageDuration) }</td>
                        <td>{ this.safeToFixed(sum.summary.averageTransitLegCount, 2) }</td>
                        <td>{ this.formatKilometers(sum.summary.averageWalkDistance) }</td>
                        <td>{ this.formatKilometers(sum.summary.averageDistance) }</td>
                        <td>{ this.safeToFixed(sum.summary.itineraryCount, 0) }</td>
                    </tr>
                    ))}                            
                </tbody>
            </Table>
        );
    }
}