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
      "name": "Delhi, India",
      "lat": 28.7041,
      "lon": 77.1025,
      "ndvi": [
        {"month": "Jan", "value": 0.32},
        {"month": "Feb", "value": 0.38},
        {"month": "Mar", "value": 0.56},
        {"month": "Apr", "value": 0.71},
        {"month": "May", "value": 0.68},
        {"month": "Jun", "value": 0.42},
        {"month": "Jul", "value": 0.55},
        {"month": "Aug", "value": 0.61},
        {"month": "Sep", "value": 0.58},
        {"month": "Oct", "value": 0.49},
        {"month": "Nov", "value": 0.39},
        {"month": "Dec", "value": 0.33}
      ],
      "latest_bloom": "2024-04-10"
    },
    {
      "name": "Bangalore, India",
      "lat": 12.9716,
      "lon": 77.5946,
      "ndvi": [
        {"month": "Jan", "value": 0.40},
        {"month": "Feb", "value": 0.45},
        {"month": "Mar", "value": 0.60},
        {"month": "Apr", "value": 0.75},
        {"month": "May", "value": 0.70},
        {"month": "Jun", "value": 0.50},
        {"month": "Jul", "value": 0.62},
        {"month": "Aug", "value": 0.68},
        {"month": "Sep", "value": 0.72},
        {"month": "Oct", "value": 0.65},
        {"month": "Nov", "value": 0.55},
        {"month": "Dec", "value": 0.48}
      ],
      "latest_bloom": "2024-04-20"
    },
    {
        "name": "Kyoto, Japan",
        "lat": 35.0116,
        "lon": 135.7681,
        "ndvi": [
          {"month": "Jan", "value": 0.25},
          {"month": "Feb", "value": 0.30},
          {"month": "Mar", "value": 0.55},
          {"month": "Apr", "value": 0.78},
          {"month": "May", "value": 0.72},
          {"month": "Jun", "value": 0.65},
          {"month": "Jul", "value": 0.68},
          {"month": "Aug", "value": 0.66},
          {"month": "Sep", "value": 0.60},
          {"month": "Oct", "value": 0.50},
          {"month": "Nov", "value": 0.40},
          {"month": "Dec", "value": 0.30}
        ],
        "latest_bloom": "2024-04-05"
      },
      {
        "name": "Amsterdam, Netherlands",
        "lat": 52.3676,
        "lon": 4.9041,
        "ndvi": [
          {"month": "Jan", "value": 0.15},
          {"month": "Feb", "value": 0.20},
          {"month": "Mar", "value": 0.35},
          {"month": "Apr", "value": 0.65},
          {"month": "May", "value": 0.80},
          {"month": "Jun", "value": 0.75},
          {"month": "Jul", "value": 0.70},
          {"month": "Aug", "value": 0.65},
          {"month": "Sep", "value": 0.55},
          {"month": "Oct", "value": 0.40},
          {"month": "Nov", "value": 0.25},
          {"month": "Dec", "value": 0.18}
        ],
        "latest_bloom": "2024-05-15"
      },
      {
        "name": "Washington D.C., USA",
        "lat": 38.9072,
        "lon": -77.0369,
        "ndvi": [
          {"month": "Jan", "value": 0.20},
          {"month": "Feb", "value": 0.22},
          {"month": "Mar", "value": 0.40},
          {"month": "Apr", "value": 0.72},
          {"month": "May", "value": 0.78},
          {"month": "Jun", "value": 0.74},
          {"month": "Jul", "value": 0.70},
          {"month": "Aug", "value": 0.68},
          {"month": "Sep", "value": 0.62},
          {"month": "Oct", "value": 0.50},
          {"month": "Nov", "value": 0.35},
          {"month": "Dec", "value": 0.25}
        ],
        "latest_bloom": "2024-04-02"
      }
];
