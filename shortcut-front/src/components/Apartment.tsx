import * as React from "react";
import { Table, Alert } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";

export interface ApartmentState { 
    data: any,
    isLoading: boolean
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
            data: {},
            isLoading: true
        }
    }

    componentDidMount() {
        fetch('http://localhost:3001/api/apartments')
            .then((response) => response.json())
            .then((res: Array<any>) => {
                let result = res.filter((apt => apt.id.toString() === this.props.match.params.id));
                this.setState({ data: result.length > 0 ? result[0].json : undefined, isLoading: false })
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

        return (
            <Table>
                    {items}
            </Table>
        );
    }
}