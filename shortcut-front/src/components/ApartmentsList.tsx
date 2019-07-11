import * as React from "react";
import { Table, Alert } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";

export interface ApartmentsListState { 
    data: any[],
    isLoading: boolean
}

export interface ApartmentsListProps extends RouteComponentProps<any> {

}

export class ApartmentsList extends React.Component<ApartmentsListProps, ApartmentsListState> {

    constructor(props: ApartmentsListProps, state: ApartmentsListState) {
        super(props, state);

        this.state = {
            data: [],
            isLoading: true
        }
    }

    componentDidMount() {
        fetch('http://localhost:3001/api/apartments')
            .then((response) => response.json())
            .then((res) => {
                this.setState({ data: res, isLoading: false })
            }); 
    }

    handleClick(id: number) {
        this.props.history.push(`/apartments/${id}`)
      }

    render() {
        if (this.state.isLoading) {
            return (
                <Alert color="primary">
                Data is still loading!
                </Alert>
            )
        }

        return (
            <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Last Seen</th>
                        </tr>
                    </thead>
                    { this.state.data.map((apt) => (
                    <tbody key={apt.id}>
                        <tr onClick={this.handleClick.bind(this, apt.id)}>
                            <th scope="row">{ apt.id }</th>
                            <td>{ apt.name }</td>
                            <td>{ apt.last_seen_at }</td>
                        </tr>
                    </tbody>
                    ))
                    }
            </Table>
        );
    }
}