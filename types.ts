export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  timestamp: number;
}

export interface Memory {
  id: string;
  title: string;
  locationName: string;
  coordinates: Coordinate;
  date: string;
  description: string;
  photos: Photo[];
}

export interface GeoFeature {
  type: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface GeoJSON {
  type: string;
  features: GeoFeature[];
}
