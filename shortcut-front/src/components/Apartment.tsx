import * as React from "react";
import { Table, Alert } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";
import { ApartmentPriceChart } from "./ApartmentPriceChart";

export interface ApartmentState { 
    data: any,
    isLoading: boolean,
    name: string
}

export interface ApartmentMatchParams {
    id: string
}

export interface ApartmentProps extends RouteComponentProps<ApartmentMatchParams> {
}

export class Apartment extends React.Component<ApartmentProps, ApartmentState> {

    constructor(props: ApartmentProps, state: ApartmentState) {
        super(props, state);

        this.state = {
            name: "",
            data: {},
            isLoading: true
        }
    }

    componentDidMount() {
        fetch(`http://localhost:3001/api/apartments/${this.props.match.params.id}`)
            .then((response) => response.json())
            .then((res: any) => {
                this.setState({ name: res.name, data: res.json, isLoading: false })
            }); 
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Alert color="primary">
                Data is still loading!
                </Alert>
            )
        }

        let items: Array<any> = [];
        Object.keys(this.state.data).forEach((key) => {
            if (key === "description") {
                return;
            }
            if (key === "links") {
                items.push(
                    <tbody key={key}>
                        <tr>
                            <td><b>{ key }</b></td>
                            <td></td>
                        </tr>
                    </tbody>
                    );
                let count = 0;
                this.state.data[key].forEach((link: any) => {
                    items.push(
                        <tbody key={`link${count}`}>
                            <tr>
                                <td></td>
                                <td><a href={link.target}>{link.title}</a></td>
                            </tr>
                        </tbody>
                        );
                    count++;
                });
            } else {
                items.push(
                <tbody key={key}>
                    <tr>
                        <td>{ key }</td>
                        <td>{ this.state.data[key] }</td>
                    </tr>
                </tbody>
                );
            }
        });

        const chartStyle: React.CSSProperties = {
            width: "40%"
        };

        const descStyle: React.CSSProperties = {
            width: "60%",
            float: "left"
        };

        return (
            <div>
                <div style={descStyle}>
                    <h1>{this.state.name}</h1>
                    <p>{this.state.data['description'] ? this.state.data['description'] : ''}</p>
                </div>
                <ApartmentPriceChart style={chartStyle} id={this.props.match.params.id} />
                <Table>
                        {items}
                </Table>
            </div>
        );
    }
}