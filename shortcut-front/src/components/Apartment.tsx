import * as React from "react";
import { Table, Alert, Container, Row, Col, CardBody, Card, CardText, Button } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";
import { ApartmentPriceChart } from "./ApartmentPriceChart";

export interface ApartmentState { 
    data: any,
    isLoading: boolean,
    name: string,
    searchResult: any
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
            searchResult: {},
            isLoading: true
        }
    }

    componentDidMount() {
        fetch(`http://localhost:3001/api/apartments/${this.props.match.params.id}`)
            .then((response) => response.json())
            .then((res: any) => {
                this.setState({ name: res.name, data: res.json, searchResult: res.search_result, isLoading: false })
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
                    <tr key={key}>
                        <td><b>{ key }</b></td>
                        <td></td>
                    </tr>
                    );
                let count = 0;
                this.state.data[key].forEach((link: any) => {
                    items.push(
                        <tr key={`link${count}`}>
                            <td></td>
                            <td><a href={link.target}>{link.title}</a></td>
                        </tr>
                        );
                    count++;
                });
            } else {
                items.push(
                    <tr key={key}>
                        <td>{ key }</td>
                        <td>{ this.state.data[key] }</td>
                    </tr>
                );
            }
        });

        return (
            <Container>
                <Row>
                    <Col>
                        <h1 style={{marginTop: "20px", marginBottom: "20px"}}>{this.state.name}</h1>
                    </Col>
                </Row>
                <Row style={{marginBottom: "20px"}}>
                    <Col xs="8">   
                        <Card>
                            <CardBody>
                                <CardText>{this.state.data['description'] ? this.state.data['description'] : ''}</CardText>
                            </CardBody>       
                        </Card>
                    </Col>
                    <Col xs="4">
                        <a className="btn btn-primary" style={{width: "100%"}} href={this.state.searchResult.url} rel="noreferrer nofollow">See original ad</a>
                        <ApartmentPriceChart id={this.props.match.params.id} />
                    </Col> 
                </Row>
                <Row>
                    <Col>
                        <Table striped>
                            <tbody>
                                {items}
                            </tbody>
                        </Table>
                    </Col>
                </Row>

            </Container>
        );
    }
}