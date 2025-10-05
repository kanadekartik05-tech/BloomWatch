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
