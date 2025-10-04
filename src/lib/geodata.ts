
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
            { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
            { name: 'Sacramento', lat: 38.5816, lon: -121.4944 },
          ],
        },
        {
          name: 'New York',
          lat: 43.2994,
          lon: -74.2179,
          cities: [
            { name: 'New York City', lat: 40.7128, lon: -74.006 },
            { name: 'Buffalo', lat: 42.8864, lon: -78.8784 },
            { name: 'Rochester', lat: 43.1566, lon: -77.6088 },
          ],
        },
        {
            name: 'Texas',
            lat: 31.9686,
            lon: -99.9018,
            cities: [
                { name: 'Houston', lat: 29.7604, lon: -95.3698 },
                { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
                { name: 'Austin', lat: 30.2672, lon: -97.7431 },
            ],
        },
        {
            name: 'Florida',
            lat: 27.6648,
            lon: -81.5158,
            cities: [
                { name: 'Miami', lat: 25.7617, lon: -80.1918 },
                { name: 'Orlando', lat: 28.5383, lon: -81.3792 },
                { name: 'Tampa', lat: 27.9506, lon: -82.4572 },
            ],
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
          cities: [
              { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
              { name: 'Mysore', lat: 12.2958, lon: 76.6394 }
            ],
        },
        {
            name: 'Maharashtra',
            lat: 19.7515,
            lon: 75.7139,
            cities: [
                { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
                { name: 'Pune', lat: 18.5204, lon: 73.8567 },
            ],
        },
        {
            name: 'Tamil Nadu',
            lat: 11.1271,
            lon: 78.6569,
            cities: [
                { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
                { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
            ],
        },
      ],
    },
    {
        name: 'Germany',
        lat: 51.1657,
        lon: 10.4515,
        states: [
          { name: 'Berlin', lat: 52.5200, lon: 13.4050, cities: [{ name: 'Berlin', lat: 52.5200, lon: 13.4050 }] },
          { name: 'Bavaria', lat: 48.7904, lon: 11.4979, cities: [{ name: 'Munich', lat: 48.1351, lon: 11.5820 }] },
          { name: 'Hamburg', lat: 53.5511, lon: 9.9937, cities: [{ name: 'Hamburg', lat: 53.5511, lon: 9.9937 }] },
          { name: 'Hesse', lat: 50.6521, lon: 9.1624, cities: [{ name: 'Frankfurt', lat: 50.1109, lon: 8.6821 }] },
        ],
    },
    {
        name: 'Brazil',
        lat: -14.2350,
        lon: -51.9253,
        states: [
          { name: 'São Paulo', lat: -23.5505, lon: -46.6333, cities: [{ name: 'São Paulo', lat: -23.5505, lon: -46.6333 }] },
          { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, cities: [{ name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 }] },
          { name: 'Bahia', lat: -12.9714, lon: -38.5014, cities: [{ name: 'Salvador', lat: -12.9714, lon: -38.5014 }] },
          { name: 'Minas Gerais', lat: -18.5122, lon: -44.5550, cities: [{ name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 }] },
        ],
    },
    {
        name: 'Australia',
        lat: -25.2744,
        lon: 133.7751,
        states: [
          { name: 'New South Wales', lat: -33.8688, lon: 151.2093, cities: [{ name: 'Sydney', lat: -33.8688, lon: 151.2093 }] },
          { name: 'Victoria', lat: -37.8136, lon: 144.9631, cities: [{ name: 'Melbourne', lat: -37.8136, lon: 144.9631 }] },
          { name: 'Queensland', lat: -27.4698, lon: 153.0251, cities: [{ name: 'Brisbane', lat: -27.4698, lon: 153.0251 }] },
          { name: 'Western Australia', lat: -31.9505, lon: 115.8605, cities: [{ name: 'Perth', lat: -31.9505, lon: 115.8605 }] },
        ],
    },
    {
      name: 'Japan',
      lat: 36.2048,
      lon: 138.2529,
      states: [
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, cities: [{ name: 'Tokyo City', lat: 35.6895, lon: 139.6917 }] },
        { name: 'Kyoto', lat: 35.0116, lon: 135.7681, cities: [{ name: 'Kyoto City', lat: 35.0116, lon: 135.7681 }] },
        { name: 'Hokkaido', lat: 43.2203, lon: 142.8635, cities: [{ name: 'Sapporo', lat: 43.0618, lon: 141.3545 }] },
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
        { name: 'Kandahar', lat: 31.0, lon: 65.5, cities: [] },
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
  ];
  
  // A simple function to add more countries with empty states, for global coverage in UI
  const allCountries = [
    { name: 'Albania', lat: 41.1533, lon: 20.1683, states: [] },
    { name: 'Algeria', lat: 28.0339, lon: 1.6596, states: [] },
    { name: 'Andorra', lat: 42.5063, lon: 1.5218, states: [] },
    { name: 'Angola', lat: -11.2027, lon: 17.8739, states: [] },
    { name: 'Antigua and Barbuda', lat: 17.0608, lon: -61.7964, states: [] },
    { name: 'Argentina', lat: -38.4161, lon: -63.6167, states: [] },
    { name: 'Armenia', lat: 40.0691, lon: 45.0382, states: [] },
    { name: 'Austria', lat: 47.5162, lon: 14.5501, states: [] },
    { name: 'Azerbaijan', lat: 40.1431, lon: 47.5769, states: [] },
    { name: 'Bahamas', lat: 25.0343, lon: -77.3963, states: [] },
    { name: 'Bahrain', lat: 26.0667, lon: 50.5577, states: [] },
    { name: 'Bangladesh', lat: 23.6850, lon: 90.3563, states: [] },
    { name: 'Barbados', lat: 13.1939, lon: -59.5432, states: [] },
    { name: 'Belarus', lat: 53.7098, lon: 27.9534, states: [] },
    { name: 'Belgium', lat: 50.8333, lon: 4.0, states: [] },
    { name: 'Belize', lat: 17.1899, lon: -88.4976, states: [] },
    { name: 'Benin', lat: 9.3077, lon: 2.3158, states: [] },
    { name: 'Bhutan', lat: 27.5142, lon: 90.4336, states: [] },
    { name: 'Bolivia', lat: -16.2902, lon: -63.5887, states: [] },
    { name: 'Bosnia and Herzegovina', lat: 43.9159, lon: 17.6791, states: [] },
    { name: 'Botswana', lat: -22.3285, lon: 24.6849, states: [] },
    { name: 'Brunei', lat: 4.5353, lon: 114.7277, states: [] },
    { name: 'Bulgaria', lat: 42.7339, lon: 25.4858, states: [] },
    { name: 'Burkina Faso', lat: 12.2383, lon: -1.5616, states: [] },
    { name: 'Burundi', lat: -3.3731, lon: 29.9189, states: [] },
    { name: 'Cambodia', lat: 12.5657, lon: 104.9910, states: [] },
    { name: 'Cameroon', lat: 7.3697, lon: 12.3547, states: [] },
    { name: 'Canada', lat: 56.1304, lon: -106.3468, states: [] },
    { name: 'Cape Verde', lat: 16.5388, lon: -23.0418, states: [] },
    { name: 'Central African Republic', lat: 6.6111, lon: 20.9394, states: [] },
    { name: 'Chad', lat: 15.4542, lon: 18.7322, states: [] },
    { name: 'Chile', lat: -35.6751, lon: -71.5430, states: [] },
    { name: 'China', lat: 35.8617, lon: 104.1954, states: [] },
    { name: 'Colombia', lat: 4.5709, lon: -74.2973, states: [] },
    { name: 'Comoros', lat: -11.8750, lon: 43.8722, states: [] },
    { name: 'Congo', lat: -4.0383, lon: 21.7587, states: [] },
    { name: 'Costa Rica', lat: 9.7489, lon: -83.7534, states: [] },
    { name: 'Croatia', lat: 45.1, lon: 15.2, states: [] },
    { name: 'Cuba', lat: 21.5218, lon: -77.7812, states: [] },
    { name: 'Cyprus', lat: 35.1264, lon: 33.4299, states: [] },
    { name: 'Czech Republic', lat: 49.8175, lon: 15.4730, states: [] },
    { name: 'Denmark', lat: 56.2639, lon: 9.5018, states: [] },
    { name: 'Djibouti', lat: 11.8251, lon: 42.5903, states: [] },
    { name: 'Dominica', lat: 15.4150, lon: -61.3710, states: [] },
    { name: 'Dominican Republic', lat: 18.7357, lon: -70.1627, states: [] },
    { name: 'Ecuador', lat: -1.8312, lon: -78.1834, states: [] },
    { name: 'Egypt', lat: 26.8206, lon: 30.8025, states: [] },
    { name: 'El Salvador', lat: 13.7942, lon: -88.8965, states: [] },
    { name: 'Equatorial Guinea', lat: 1.6508, lon: 10.2679, states: [] },
    { name: 'Eritrea', lat: 15.1794, lon: 39.7823, states: [] },
    { name: 'Estonia', lat: 58.5953, lon: 25.0136, states: [] },
    { name: 'Eswatini', lat: -26.5225, lon: 31.4659, states: [] },
    { name: 'Ethiopia', lat: 9.1450, lon: 40.4897, states: [] },
    { name: 'Fiji', lat: -17.7134, lon: 178.0650, states: [] },
    { name: 'Finland', lat: 61.9241, lon: 25.7482, states: [] },
    { name: 'France', lat: 46.2276, lon: 2.2137, states: [] },
  ].map(c => ({...c, states: []})));
  
  // Merge detailed data with the comprehensive country list
  allCountries.forEach(country => {
    const existingCountry = geodata.find(c => c.name === country.name);
    if (!existingCountry) {
        geodata.push(country);
    }
  });

  // Sort geodata alphabetically by country name
  geodata.sort((a, b) => a.name.localeCompare(b.name));
  
  