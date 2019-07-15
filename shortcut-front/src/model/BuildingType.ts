export enum BuildingType
{
    Independent,
    Detached,
    Dual,
    Unknown
}

export namespace BuildingType {
    export function fromString(value: string): BuildingType {
        switch (value.toLowerCase())
        {
            case "omakotitalo":
                return BuildingType.Independent;
            case "paritalo":
                return BuildingType.Dual;
            case "erillistalo":
                return BuildingType.Detached;
            default:
                return BuildingType.Unknown;
        }
    }
} 