import * as React from "react";
import { Alert, Col, Container, Row } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import './css/apartmenttable.css';

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
                const mapped = res.map((data) => {
                    let apt: any = {};

                    apt.id = data.id;
                    apt.name = data.name;
                    apt.lastSeen = data.last_seen_at.substring(0, data.last_seen_at.indexOf("T"));
                    apt.totalPrice = data.json["Velaton hinta"] ? data.json["Velaton hinta"] : (
                        data.json["Myyntihinta"] ? data.json["Myyntihinta"] : ""
                    );
                    apt.configuration = data.json["Huoneiston kokoonpano"] ? data.json["Huoneiston kokoonpano"].replace(/\+/g, ' + ').replace(/,([^\s])/g, ', $1') : "";
                    apt.city = data.search_result.buildingData.city;
                    apt.district = data.search_result.buildingData.district;
                    apt.address = data.search_result.buildingData.address;
                    apt.size = data.search_result.size;
                    apt.year = data.search_result.buildingData.year;

                    return apt;
                });
                mapped.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
                this.setState({ data: mapped, isLoading: false })
            }); 
    }

    handleClick(e: any, row: any) {
        this.props.history.push(`/apartments/${row.id}`)
      }

    private columns: any[] = [
        {
            dataField: 'id',
            text: '#'
          }, {
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
            dataField: 'lastSeen',
            text: 'Last seen',
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
            sort: true,
            formatter: (cell: any, row: any) => `${row.size} m2`
          }, {
            dataField: 'totalPrice',
            text: 'Total price',
            sort: true
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
            <Container>
                <Row>
                    <Col>   
                        <BootstrapTable striped bordered hover bootsrap4 keyField='id' data={this.state.data} columns={this.columns}
                        defaultSorted={[{dataField: 'address', order: 'asc'}]}
                        rowEvents={{onClick: this.handleClick.bind(this)}} />   
                    </Col>
                </Row>
            </Container>
        );
    }
}