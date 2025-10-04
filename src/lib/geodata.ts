
export type City = {
    name: string;
    lat: number;
    lon: number;
  };
  
  export type State = {
    name: string;
    lat: number;
    lon: number;
    cities?: City[];
  };
  
  export type Country = {
    name: string;
    lat: number;
    lon: number;
    states: State[];
  };
  
  export const geodata: Country[] = [
    {
      name: 'United States',
      lat: 37.0902,
      lon: -95.7129,
      states: [
        {
          name: 'California',
          lat: 36.7783,
          lon: -119.4179,
          cities: [
            { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
            { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
          ],
        },
        {
          name: 'New York',
          lat: 43.2994,
          lon: -74.2179,
          cities: [{ name: 'New York City', lat: 40.7128, lon: -74.006 }],
        },
      ],
    },
    {
      name: 'India',
      lat: 20.5937,
      lon: 78.9629,
      states: [
        {
          name: 'Delhi',
          lat: 28.7041,
          lon: 77.1025,
          cities: [{ name: 'New Delhi', lat: 28.6139, lon: 77.209 }],
        },
        {
          name: 'Karnataka',
          lat: 15.3173,
          lon: 75.7139,
          cities: [{ name: 'Bangalore', lat: 12.9716, lon: 77.5946 }],
        },
      ],
    },
    {
        name: 'Japan',
        lat: 36.2048,
        lon: 138.2529,
        states: [
          { name: 'Tokyo', lat: 35.6762, lon: 139.6503, cities: [{ name: 'Tokyo City', lat: 35.6895, lon: 139.6917 }] },
          { name: 'Kyoto', lat: 35.0116, lon: 135.7681, cities: [{ name: 'Kyoto City', lat: 35.0116, lon: 135.7681 }] },
          { name: 'Hokkaido', lat: 43.2203, lon: 142.8635, cities: [] },
          { name: 'Aomori', lat: 40.7369, lon: 140.9412, cities: [] },
          { name: 'Iwate', lat: 39.584, lon: 141.3534, cities: [] },
          { name: 'Miyagi', lat: 38.3375, lon: 140.924, cities: [] },
          { name: 'Akita', lat: 39.6984, lon: 140.4688, cities: [] },
          { name: 'Yamagata', lat: 38.4116, lon: 140.1333, cities: [] },
        ],
    },
    {
      name: 'Afghanistan',
      lat: 33.93911,
      lon: 67.709953,
      states: [
        { name: 'Badakhshan', lat: 36.7347725, lon: 70.8119953, cities: [] },
        { name: 'Badghis', lat: 35.1671339, lon: 63.7695384, cities: [] },
        { name: 'Baghlan', lat: 36.1789026, lon: 68.7453165, cities: [] },
        { name: 'Balkh', lat: 36.7550603, lon: 66.8975372, cities: [] },
        { name: 'Bamyan', lat: 34.8166667, lon: 67.8166667, cities: [] },
        { name: 'Daykundi', lat: 33.6666667, lon: 66.0, cities: [] },
        { name: 'Farah', lat: 32.5, lon: 62.5, cities: [] },
        { name: 'Faryab', lat: 36.0, lon: 65.0, cities: [] },
        { name: 'Ghazni', lat: 33.5, lon: 68.0, cities: [] },
        { name: 'Ghor', lat: 34.5, lon: 65.0, cities: [] },
        { name: 'Helmand', lat: 31.5, lon: 64.0, cities: [] },
        { name: 'Herat', lat: 34.5, lon: 62.0, cities: [] },
        { name: 'Jowzjan', lat: 36.75, lon: 66.0, cities: [] },
        { name: 'Kabul', lat: 34.5, lon: 69.0, cities: [] },
        { name 'Kandahar', lat: 31.0, lon: 65.5, cities: [] },
        { name: 'Kapisa', lat: 35.0, lon: 69.5, cities: [] },
        { name: 'Khost', lat: 33.3333333, lon: 69.9166667, cities: [] },
        { name: 'Kunar', lat: 35.0, lon: 71.0, cities: [] },
        { name: 'Kunduz', lat: 36.75, lon: 68.75, cities: [] },
        { name: 'Laghman', lat: 34.6666667, lon: 70.0, cities: [] },
        { name: 'Logar', lat: 34.0, lon: 69.0, cities: [] },
        { name: 'Nangarhar', lat: 34.25, lon: 70.5, cities: [] },
        { name: 'Nimruz', lat: 31.0, lon: 62.0, cities: [] },
        { name: 'Nuristan', lat: 35.5, lon: 70.5, cities: [] },
        { name: 'Paktia', lat: 33.5, lon: 69.5, cities: [] },
        { name: 'Paktika', lat: 32.5, lon: 68.5, cities: [] },
        { name: 'Panjshir', lat: 35.5, lon: 69.75, cities: [] },
        { name: 'Parwan', lat: 35.0, lon: 69.0, cities: [] },
        { name: 'Samangan', lat: 36.0, lon: 67.75, cities: [] },
        { name: 'Sar-e Pol', lat: 35.5, lon: 66.0, cities: [] },
        { name: 'Takhar', lat: 36.75, lon: 69.75, cities: [] },
        { name: 'Urozgan', lat: 32.75, lon: 66.0, cities: [] },
        { name: 'Zabul', lat: 32.0, lon: 67.0, cities: [] },
      ],
    },
    // Add all other countries similarly...
  ];
