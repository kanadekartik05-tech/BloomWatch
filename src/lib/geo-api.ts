
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY;
const API_URL = 'https://api.countrystatecity.in/v1';

if (!API_KEY) {
    console.error("Country State City API Key is not set. Please set NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY environment variable.");
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'X-CSCAPI-KEY': API_KEY
    }
});

export interface Country {
    id: number;
    name: string;
    iso2: string;
    latitude: number;
    longitude: number;
}

export interface State {
    id: number;
    name: string;
    iso2: string;
    country_code: string;
    latitude: number;
    longitude: number;
}

export interface City {
    id: number;
    name: string;
    state_code: string;
    country_code: string;
    latitude: number;
    longitude: number;
}

export async function fetchCountries(): Promise<Country[]> {
    try {
        const response = await api.get('/countries');
        // The API returns latitudes/longitudes as strings, so we parse them.
        return response.data.map((c: any) => ({
            ...c,
            latitude: parseFloat(c.latitude),
            longitude: parseFloat(c.longitude)
        }));
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw new Error('Failed to fetch countries from the API.');
    }
}

export async function fetchStates(countryIso2: string): Promise<State[]> {
    try {
        const response = await api.get(`/countries/${countryIso2}/states`);
        // The API returns latitudes/longitudes as strings, so we parse them.
        return response.data.map((s: any) => ({
            ...s,
            latitude: parseFloat(s.latitude),
            longitude: parseFloat(s.longitude)
        })).sort((a:State, b:State) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error(`Error fetching states for country ${countryIso2}:`, error);
        throw new Error(`Failed to fetch states for country ${countryIso2}.`);
    }
}

export async function fetchCities(countryIso2: string, stateIso2: string): Promise<City[]> {
    try {
        const response = await api.get(`/countries/${countryIso2}/states/${stateIso2}/cities`);
         // The API returns latitudes/longitudes as strings, so we parse them.
         return response.data.map((c: any) => ({
            ...c,
            latitude: parseFloat(c.latitude),
            longitude: parseFloat(c.longitude)
        })).sort((a:City, b:City) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error(`Error fetching cities for state ${stateIso2} in country ${countryIso2}:`, error);
        throw new Error(`Failed to fetch cities for state ${stateIso2}.`);
    }
}
