export enum BuildingState
{
    New,
    Good,
    Satisfactory,
    Tolerable,
    Bad,
    Unknown
}

export namespace BuildingState {
    export function fromString(value: string): BuildingState {
        switch (value.toLowerCase())
        {
            case "uusi":
                return BuildingState.New;
            case "hyvä":
                return BuildingState.Good;
            case "tyydyttävä":
                return BuildingState.Satisfactory;
            case "välttävä":
                return BuildingState.Tolerable;
            case "huono":
                return BuildingState.Bad;
            default:
                return BuildingState.Unknown;
        }
    }
} 