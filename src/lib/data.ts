export type NDVIReading = {
  month: string;
  value: number;
};

export type Region = {
  name: string;
  lat: number;
  lon: number;
  ndvi: NDVIReading[];
  latest_bloom: string;
  predicted_next_bloom?: string;
};

export const regions: Region[] = [
    {
      "name": "Delhi",
      "lat": 28.7041,
      "lon": 77.1025,
      "ndvi": [],
      "latest_bloom": "2024-04-10"
    },
    {
      "name": "Bangalore",
      "lat": 12.9716,
      "lon": 77.5946,
      "ndvi": [],
      "latest_bloom": "2024-04-20"
    },
    {
        "name": "Kyoto",
        "lat": 35.0116,
        "lon": 135.7681,
        "ndvi": [],
        "latest_bloom": "2024-04-05"
      },
      {
        "name": "Amsterdam",
        "lat": 52.3676,
        "lon": 4.9041,
        "ndvi": [],
        "latest_bloom": "2024-05-15"
      },
      {
        "name": "Washington D.C.",
        "lat": 38.9072,
        "lon": -77.0369,
        "ndvi": [],
        "latest_bloom": "2024-04-02"
      }
];
