import * as React from "react";
import { VictoryChart, VictoryLine, VictoryTheme } from "victory";
export interface ApartmentPriceChartProps {
    id: string
}

export interface ApartmentPriceChartState {
    data: any[];
}

export class ApartmentPriceChart extends React.Component<ApartmentPriceChartProps, ApartmentPriceChartState> {

    constructor(props: ApartmentPriceChartProps, state: ApartmentPriceChartState) {
        super(props, state);

        this.state = {
            data: []
        }
    }

    componentDidMount() {
        fetch(`http://localhost:3001/api/apartments/${this.props.id}/prices`)
            .then((response) => response.json())
            .then((res: Array<any>) => {
                const transformed = res.map((orig) => {
                    return {
                        price_date: orig.price_date.substring(0, orig.price_date.indexOf("T")),
                        price: orig.price / 1000 + "k"
                    }
                });
                this.setState({ data: transformed })
            }); 
    }

    render() {
        const {data} = this.state;

        return (
            <div style={{float: "right"} as React.CSSProperties}>
                <VictoryChart theme={VictoryTheme.material} width={450}>
                    <VictoryLine
                        style={{
                            data: { stroke: "#c43a31" },
                            parent: { border: "1px solid #ccc"}
                        }}
                        data={data}
                        x="price_date"
                        y="price"
                    />
                </VictoryChart>
            </div>
        );
    }
}