export type City = {
  name: string;
  lat: number;
  lon: number;
};

export type State = {
  name: string;
  lat: number;
  lon: number;
  cities: City[];
};

export type Country = {
  name: string;
  lat: number;
  lon: number;
  states: State[];
};

export const geoData: Country[] = [
  {
    name: "USA",
    lat: 37.0902,
    lon: -95.7129,
    states: [
      {
        name: "District of Columbia",
        lat: 38.9072,
        lon: -77.0369,
        cities: [
          { name: "Washington D.C.", lat: 38.9072, lon: -77.0369 },
        ],
      },
    ],
  },
  {
    name: "India",
    lat: 20.5937,
    lon: 78.9629,
    states: [
      {
        name: "Delhi",
        lat: 28.7041,
        lon: 77.1025,
        cities: [{ name: "New Delhi", lat: 28.7041, lon: 77.1025 }],
      },
      {
        name: "Karnataka",
        lat: 15.3173,
        lon: 75.7139,
        cities: [{ name: "Bangalore", lat: 12.9716, lon: 77.5946 }],
      },
    ],
  },
  {
    name: "Japan",
    lat: 36.2048,
    lon: 138.2529,
    states: [
      {
        name: "Kyoto Prefecture",
        lat: 35.0116,
        lon: 135.7681,
        cities: [{ name: "Kyoto", lat: 35.0116, lon: 135.7681 }],
      },
    ],
  },
  {
    name: "Netherlands",
    lat: 52.1326,
    lon: 5.2913,
    states: [
      {
        name: "North Holland",
        lat: 52.5205,
        lon: 4.7885,
        cities: [{ name: "Amsterdam", lat: 52.3676, lon: 4.9041 }],
      },
    ],
  },
];
