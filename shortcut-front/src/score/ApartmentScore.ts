import { BuildingType } from "../model/BuildingType";
import { BuildingState } from "../model/BuildingState";
import { TransitSummary, TransitTag } from "../model/TransitSummary";

export class ApartmentScore
{
    private _priceScore: number;
    get priceScore(): number {
        return this._priceScore;
    }

    private _yearScore: number;
    get yearScore(): number {
        return this._yearScore;
    }

    private _sizeScore: number;
    get sizeScore(): number {
        return this._sizeScore;
    }

    private _typeScore: number;
    get typeScore(): number {
        return this._typeScore;
    }

    private _stateScore: number;
    get stateScore(): number {
        return this._stateScore;
    }

    private _workScore: number;
    get workScore(): number {
        return this._workScore;
    }

    private _cityScore: number;
    get cityScore(): number {
        return this._cityScore;
    }

    get totalScore(): number {
        return this.priceScore + this.yearScore + this.sizeScore + this.typeScore + this.stateScore + this.workScore + this.cityScore;
    }

    constructor(apt: any, transitSummaries: TransitSummary[])
    {
        this._priceScore = (((400000-apt.totalPrice)/10000)*4); // [-5, 10] ==> [-20, 40]
        this._yearScore = (apt.year - 2000); // [-20, 20]
        this._sizeScore = ((apt.size > 160 ? 160 : apt.size) - 120)/3; // [-6.66, 12]

        switch (apt.type) {
            case BuildingType.Independent:
                this._typeScore = 10;
                break;
            case BuildingType.Detached:
                this._typeScore = 0;
                break;
            case BuildingType.Dual:
                this._typeScore = -10;
                break;
            default:
                this._typeScore = 0;
                break;
        }
    
        switch (apt.state) {
            case BuildingState.New:
                this._stateScore = 10;
                break;
            case BuildingState.Good:
                this._stateScore = 15;
                break;
            case BuildingState.Satisfactory:
                this._stateScore = 0;
                break;
            case BuildingState.Tolerable:
                this._stateScore = -20;
                break;
            case BuildingState.Bad:
                this._stateScore = -40;
                break;
            default:
                this._stateScore = 0;
                break;
        }
        
        if (transitSummaries)
        {
            const workSummary = transitSummaries.filter((summary) => summary.tag === TransitTag.Work).map((summary) => summary.summary)[0];
            this._workScore = ((50 - (workSummary.averageDuration/60))*2 - (workSummary.averageTransitLegCount-1)*5); // [-40, 40]
        
            const citySummary = transitSummaries.filter((summary) => summary.tag === TransitTag.City).map((summary) => summary.summary)[0];
            this._cityScore = ((50 - (citySummary.averageDuration/60)) - (citySummary.averageTransitLegCount-1)*5); // [-25, 20]
        } else {
            this._workScore = -40;
            this._cityScore = -25;
        }
    }   
}