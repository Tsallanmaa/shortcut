export class TransitSummary
{
    tag: TransitTag;
    summary: TransitSummaryValues;
}

class TransitSummaryValues
{
    averageDistance: number;
    averageDuration: number;
    averageTransitLegCount: number;
    averageWalkDistance: number;
    itineraryCount: number;
}

export enum TransitTag
{
    Work = "WORK",
    City = "CITY"
}