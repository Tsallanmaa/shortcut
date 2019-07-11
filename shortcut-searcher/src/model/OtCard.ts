export class NextViewing {
  start: string;
  date: string;
}

export class Images {
  wide: string;
  thumb: string;
  feed: string;
}

export class BuildingData {
  address: string;
  district: string;
  city: string;
  year: number;
  buildingType: number;
}

export class Coordinates {
  latitude: number;
  longitude: number;
}

export class Brand {
  image: string;
  name: string;
  id: number;
}

export class Card {
  id: number;
  url: string;
  description: string;
  rooms: number;
  roomConfiguration: string;
  price: string;
  nextViewing: NextViewing;
  images: Images;
  newDevelopment: boolean;
  published: Date;
  size: number;
  sizeLot?: number;
  cardType: number;
  contractType: number;
  onlineOffer?: any;
  extraVisibility?: any;
  extraVisibilityString?: any;
  buildingData: BuildingData;
  coordinates: Coordinates;
  brand: Brand;
  priceChanged?: Date;
  visits: number;
  visits_weekly: number; // tslint:disable-line
  cardSubType: number[];
  condition?: any;
  status: number;
}

export class Root {
  cards: Card[];
  found: number;
  start: number;
}
