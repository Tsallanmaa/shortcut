import { TransitSummary } from "./TransitSummary";
import { BuildingType } from "./BuildingType";
import { BuildingState } from "./BuildingState";
import { ApartmentScore } from "../score/ApartmentScore";

export class Apartment
{
    id: number;
    name: string;
    lastSeen: string;
    totalPrice: number;
    configuration: string;
    city: string;
    district: string;
    address: string;
    size: number;
    year: number;
    type: BuildingType;
    state: BuildingState;
    
    private _transitSummaries: TransitSummary[];
    private _score: ApartmentScore;
    get score(): ApartmentScore
    {
        if (!this._score)
        {
            this._score = new ApartmentScore(this, this._transitSummaries);
        }
        return this._score;
    }

    constructor(id: number, name: string, lastSeenAt: string, searchResult: any, json: any, transitSummaries: TransitSummary[])
    {    
        this.id = id;
        this.name = name;
        this.lastSeen = lastSeenAt.substring(0, lastSeenAt.indexOf("T"));
        this.totalPrice = Number((json["Velaton hinta"] ? json["Velaton hinta"] : (
            json["Myyntihinta"] ? json["Myyntihinta"] : ""))
            .replace(/[^0-9.,]/g, ""));
        this.configuration = json["Huoneiston kokoonpano"] ? json["Huoneiston kokoonpano"].replace(/\+/g, ' + ').replace(/,([^\s])/g, ', $1') : "";
        this.city = searchResult.buildingData.city;
        this.district = searchResult.buildingData.district;
        this.address = searchResult.buildingData.address;
        this.size = searchResult.size;
        this.year = searchResult.buildingData.year;
        this.type = BuildingType.fromString(json["Rakennuksen tyyppi"] ? json["Rakennuksen tyyppi"] : "");
        this.state = BuildingState.fromString(json["Kunto"] ? json["Kunto"] : "");
        this._transitSummaries = transitSummaries;
    }
}