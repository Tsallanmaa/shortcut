import * as React from "react";
import { Table, PopoverHeader, PopoverBody, UncontrolledPopover } from 'reactstrap';

export interface ApartmentTransitInfoProps {
    id: string
}

export interface ApartmentTransitInfoState {
    data: any
}

export class ApartmentTransitInfo extends React.Component<ApartmentTransitInfoProps, ApartmentTransitInfoState> {

    constructor(props: ApartmentTransitInfoProps, state: ApartmentTransitInfoState) {
        super(props, state);

        this.state = {
            data: { summaries: [] }
        }
    }

    componentDidMount() {
        fetch(`${__API__}/api/apartments/${this.props.id}/transit`)
            .then((response) => response.json())
            .then((res: any) => {
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
        const itineraries: any = {};
        this.state.data.summaries.forEach((sum: any) => {
            itineraries[sum.tag] = this.state.data.itineraries.filter((it: any) => it.tag === sum.tag)[0].itineraries;
        });

        return (  
            <div>        
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
                    <tr key={sum.tag} id={sum.tag}>
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
            { this.state.data.summaries.map((sum: any) => (
            <UncontrolledPopover placement="bottom" trigger="click" target={sum.tag}>
                <PopoverHeader>Itineraries</PopoverHeader>
                <PopoverBody>
                    {
                        itineraries[sum.tag].map((it: any, index: number) => (
                            <div style={{marginBottom: "10px"}}>
                            <div><b>Itinerary {index+1}</b></div>
                            {
                                it.legs.map((leg: any, legIndex: number) => (
                                <div>Leg {legIndex+1}: {leg.mode} {leg.route ? `(${leg.route.shortName})` : ""} {leg.from.name} - {leg.to.name} <b>{this.formatDuration((leg.endTime-leg.startTime)/1000)}</b></div>
                                ))
                            }
                            </div>
                        ))
                    }
                </PopoverBody>
            </UncontrolledPopover>
            ))}
            </div> 
        );
    }
}