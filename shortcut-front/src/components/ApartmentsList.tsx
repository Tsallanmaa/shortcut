import * as React from "react";
import { Alert, Col, Container, Row } from 'reactstrap';
import { RouteComponentProps } from "react-router-dom";
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import './css/apartmenttable.css';
import { BuildingType } from "../model/BuildingType";
import { BuildingState } from "../model/BuildingState";


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
                    apt.type = BuildingType.fromString(data.json["Rakennuksen tyyppi"] ? data.json["Rakennuksen tyyppi"] : "");
                    apt.state = BuildingType.fromString(data.json["Kunto"] ? data.json["Kunto"] : "");

                    apt.score = scoreApartment(apt, data.transit_summaries);

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
            sort: true
          }, {
            dataField: 'score',
            text: 'Score',
            sort: true,
            formatter: (cell: any, row: any) => `${row.score.toFixed(0)}` 
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
                        defaultSorted={[{dataField: 'score', order: 'desc'}]}
                        rowEvents={{onClick: this.handleClick.bind(this)}} />   
                    </Col>
                </Row>
            </Container>
        );
    }
}

function scoreApartment(apt: any, transitSummaries: any[]): number
{
    const priceScore = (((400000-apt.totalPrice.replace(/[^0-9.,]/g, ""))/10000)*4); // [-5, 10] ==> [-20, 40]
    const yearScore = (apt.year - 2000); // [-20, 20]
    const sizeScore = ((apt.size > 160 ? 160 : apt.size) - 120)/3; // [-6.66, 12]
    let typeScore: number;
    switch (apt.type) {
        case BuildingType.Independent:
          typeScore = 10;
          break;
        case BuildingType.Detached:
          typeScore = 0;
          break;
        case BuildingType.Dual:
          typeScore = -10;
          break;
        default:
          typeScore = 0;
          break;
    }

    let stateScore: number;
    switch (apt.state) {
        case BuildingState.New:
          stateScore = 10;
          break;
        case BuildingState.Good:
          stateScore = 15;
          break;
        case BuildingState.Satisfactory:
          stateScore = 0;
          break;
        case BuildingState.Tolerable:
          stateScore = -20;
          break;
        case BuildingState.Bad:
          stateScore = -40;
          break;
        default:
          stateScore = 0;
          break;
    }
    
    if (transitSummaries)
    {
      const workSummary = transitSummaries.filter((summary) => summary.tag === "WORK").map((summary) => summary.summary)[0];
      const workScore = ((50 - (workSummary.averageDuration/60))*2 - (workSummary.averageTransitLegCount-1)*5); // [-40, 40]

      const citySummary = transitSummaries.filter((summary) => summary.tag === "CITY").map((summary) => summary.summary)[0];
      const cityScore = ((50 - (citySummary.averageDuration/60)) - (citySummary.averageTransitLegCount-1)*5); // [-25, 20]
      
      return priceScore + stateScore + typeScore + yearScore + sizeScore + workScore + cityScore;
    }

    return priceScore + stateScore + typeScore + yearScore + sizeScore - 65;
}