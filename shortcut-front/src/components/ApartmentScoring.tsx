import * as React from "react";
import { Table } from 'reactstrap';
import { ApartmentScore } from "../score/ApartmentScore";

export interface ApartmentScoringProps {
    score: ApartmentScore | undefined
}

export interface ApartmentScoringState {
}

export class ApartmentScoring extends React.Component<ApartmentScoringProps, ApartmentScoringState> {

    constructor(props: ApartmentScoringProps, state: ApartmentScoringState) {
        super(props, state);

        this.state = {
        }
    }

    render() {
        const score = this.props.score;

        if (!score) {
            return (<div></div>);
        }

        return (           
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Price</th>
                        <th>Year</th>
                        <th>Size</th>
                        <th>Type</th>
                        <th>State</th>
                        <th>Work</th>
                        <th>City</th>
                        <th><b>Total</b></th>
                    </tr>
                </thead>                           
                <tbody>
                    <tr>
                        <td>{ score.priceScore.toFixed() }</td>
                        <td>{ score.yearScore.toFixed() }</td>
                        <td>{ score.sizeScore.toFixed() }</td>
                        <td>{ score.typeScore.toFixed() }</td>
                        <td>{ score.stateScore.toFixed() }</td>
                        <td>{ score.workScore.toFixed() }</td>
                        <td>{ score.cityScore.toFixed() }</td>
                        <td><b>{ score.totalScore.toFixed() }</b></td>
                    </tr>                           
                </tbody>
            </Table>
        );
    }
}