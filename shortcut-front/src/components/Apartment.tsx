import * as React from "react";
import { Table, Alert, Container, Row, Col, CardBody, Card, CardText } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";
import { ApartmentPriceChart } from "./ApartmentPriceChart";
import { ApartmentTransitInfo } from "./ApartmentTransitInfo";
import { Apartment as ApartmentModel } from '../model/Apartment'
import { ApartmentScore } from "../score/ApartmentScore";
import { ApartmentScoring } from "./ApartmentScoring";

export interface ApartmentState { 
    data: any,
    isLoading: boolean,
    name: string,
    searchResult: any,
    apt: ApartmentModel|undefined
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
            isLoading: true,
            apt: undefined
        }
    }

    componentDidMount() {
        fetch(`${__API__}/api/apartments/${this.props.match.params.id}`)
            .then((response) => response.json())
            .then((res: any) => {
                const apt = new ApartmentModel(res.id, res.name, res.last_seen_at, res.search_result, res.json, res.transit_summaries);
                this.setState({ name: res.name, data: res.json, searchResult: res.search_result, apt: apt, isLoading: false })
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
            if (key === "description" || key === "id") {
                return;
            }
            if (key === "links") {
                items.push(
                    <tr key={key}>
                        <td><b>Linkit</b></td>
                        <td></td>
                    </tr>
                    );
                let count = 0;
                this.state.data[key].forEach((link: any) => {
                    items.push(
                        <tr key={`link${count}`}>
                            <td></td>
                            <td><a href={link.target} rel="noreferrer nofollow">{link.title}</a></td>
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
                        <Card style={{marginBottom: "20px"}}>
                            <CardBody>
                                <CardText><h4>{this.state.apt ? `${this.state.apt.totalPrice.toFixed()} €` : ""}</h4></CardText>
                                <CardText>{this.state.apt ? this.state.apt.year : ""} / {this.state.apt ? `${this.state.apt.size} m2` : ""}</CardText>
                                <CardText>{this.state.apt ? this.state.apt.configuration : ""}</CardText>
                            </CardBody>       
                        </Card>
                        <a className="btn btn-primary" style={{width: "100%"}} href={this.state.searchResult.url} rel="noreferrer nofollow">See original ad</a>
                        <ApartmentPriceChart id={this.props.match.params.id} />
                    </Col> 
                </Row>
                <Row style={{marginBottom: "20px"}}>
                    <Col>
                        <h4>Transit</h4>
                        <ApartmentTransitInfo id={this.props.match.params.id} />
                    </Col>
                </Row>
                <Row style={{marginBottom: "20px"}}>
                    <Col>
                        <h4>Scoring</h4>
                        <ApartmentScoring score={this.state.apt ? this.state.apt.score : undefined} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h4>Properties</h4>
                        <Table striped bordered>
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