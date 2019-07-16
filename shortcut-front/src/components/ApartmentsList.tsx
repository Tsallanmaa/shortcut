import * as React from "react";
import { Alert, Col, Container, Row } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import './css/apartmenttable.css';
import { Apartment } from "../model/Apartment";


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
        fetch(`${__API__}/api/apartments`)
            .then((response) => response.json())
            .then((res: any[]) => {
                const mapped = res.map((data) => new Apartment(data.id, data.name, data.last_seen_at, data.search_result, data.json, data.transit_summaries));
                this.setState({ data: mapped, isLoading: false })
            }); 
    }

    handleClick(e: any, row: any) {
        this.props.history.push(`/apartments/${row.id}`)
      }

    private columns: any[] = [
          {
            dataField: 'address',
            text: 'Address',
            sort: true
          }, {
            dataField: 'district',
            text: 'District',
            sort: true
          }, {
            dataField: 'city',
            text: 'City',
            sort: true
          }, {
            dataField: 'configuration',
            text: 'Configuration'
          }, {
            dataField: 'year',
            text: 'Year',
            sort: true
          }, {
            dataField: 'size',
            text: 'Size',
            sort: true
          }, {
            dataField: 'totalPrice',
            text: 'Price',
            sort: true,
            formatter: (cell: any, row: any) => `${row.totalPrice} €`
          }, {
            dataField: 'score.totalScore',
            text: 'Score',
            sort: true,
            formatter: (cell: any, row: any) => `${row.score.totalScore.toFixed(0)}` 
          }
    ];

    render() {
        if (this.state.isLoading) {
            return (
                <Alert color="primary">
                Data is still loading!
                </Alert>
            )
        }

        return (
            <Container className="list-container">
                <Row>
                    <Col>   
                        <BootstrapTable striped bordered hover bootsrap4 keyField='id' data={this.state.data} columns={this.columns}
                        defaultSorted={[{dataField: 'score.totalScore', order: 'desc'}]}
                        rowEvents={{onClick: this.handleClick.bind(this)}} />   
                    </Col>
                </Row>
            </Container>
        );
    }
}