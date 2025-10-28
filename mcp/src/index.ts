import express from 'express';
import { makeNWSRequest } from './nwsTool.js';

const app = express();
const port = 3002;

app.get('/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude (lat) and Longitude (lon) are required query parameters.' });
    }

    try {
        // Step 1: Get the forecast URL from the points endpoint
        const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pointsData = await makeNWSRequest<any>(pointsUrl);

        if (!pointsData || !pointsData.properties || !pointsData.properties.forecast) {
            return res.status(500).json({ error: 'Could not retrieve forecast URL from NWS API.' });
        }

        const forecastUrl = pointsData.properties.forecast;

        // Step 2: Get the actual forecast data
        const forecastData = await makeNWSRequest<any>(forecastUrl);

        if (!forecastData) {
            return res.status(500).json({ error: 'Could not retrieve forecast data from NWS API.' });
        }

        res.json(forecastData);
    } catch (error) {
        console.error('Error in /weather endpoint:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`Weather service listening on http://localhost:${port}`);
});
