import * as React from "react";
import { Table, Alert, Col, Container, Row } from 'reactstrap';
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
            .then((res: any[]) => {
                res.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
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
            <Container>
                <Row>
                    <Col>            
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nimi</th>
                                    <th>Viimeksi nähty</th>
                                    <th>Kokoonpano</th>
                                    <th>Velaton hinta</th>
                                </tr>
                            </thead>                           
                            <tbody>
                                { this.state.data.map((apt) => (
                                <tr  key={apt.id} onClick={this.handleClick.bind(this, apt.id)}>
                                    <th scope="row">{ apt.id }</th>
                                    <td>{ apt.name }</td>
                                    <td>{ apt.last_seen_at.substring(0, apt.last_seen_at.indexOf("T")) }</td>
                                    <td>{ apt.json["Huoneiston kokoonpano"] ? apt.json["Huoneiston kokoonpano"] : ""}</td>
                                    <td>{ apt.json["Velaton hinta"] ? apt.json["Velaton hinta"] : "" }</td>
                                </tr>
                                ))}                            
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        );
    }
}