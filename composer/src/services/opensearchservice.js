import https from "https"
import axios from "axios"

const agent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: true,
    maxSockets: 2500,
    keepAliveMsecs: 3600000, //1 Hr
});

const opensearchClient = axios.create({
    baseURL: process.env.OPEN_SEARCH_URL, // Replace with your OpenSearch endpoint
    auth: {
        username: process.env.OPEN_SEARCH_USERNAME, // Replace with your OpenSearch username
        password: process.env.OPEN_SEARCH_PASSWORD, // Replace with your OpenSearch password
    },
    headers: {
        'Content-Type': 'application/json',
    },
    httpsAgent: agent,
});

const opensearchClientMsearch = axios.create({
    baseURL: process.env.OPEN_SEARCH_URL, // Replace with your OpenSearch endpoint
    auth: {
        username: process.env.OPEN_SEARCH_USERNAME, // Replace with your OpenSearch username
        password: process.env.OPEN_SEARCH_PASSWORD, // Replace with your OpenSearch password
    },
    headers: {
        'Content-Type': 'application/x-ndjson',
    },
    httpsAgent: agent,
});

const axiosCall = async (requestPayload) => {
    let index = process.env.OPEN_SEARCH_INDEX;
    try {
        const openSearchUrl = `${process.env.OPEN_SEARCH_URL}/${index}/_search/template`;
        const result = await opensearchClient.post(openSearchUrl, requestPayload);
        return result.data.hits.hits;

    } catch (error) {
        return [];
    }
}

const axiosCallQuery = async (requestPayload) => {
    let index = process.env.OPEN_SEARCH_INDEX;
    try {

        const openSearchUrl = `${process.env.OPEN_SEARCH_URL}/${index}/_search`;
        const result = await opensearchClient.post(openSearchUrl, requestPayload);
        return result;
    } catch (error) {
        return [];
    }
}
const axiosMultipleCall = async (requestPayload) => {

    try {
        //console.log(requestPayload);
        const openSearchUrl = `${process.env.OPEN_SEARCH_URL}/${process.env.OPEN_SEARCH_INDEX}/_msearch/template`;

        const result = await opensearchClientMsearch.post(
            openSearchUrl,
            requestPayload,
        );
        return result.data.responses;
    } catch (error) {
        return [];
    }
}

const axiosCallHistory = async (requestPayload) => {
    try {
        const openSearchUrl = `${process.env.OPEN_SEARCH_URL}/${process.env.ELASTIC_HISTORY_INDEX}/_search/template`;

        const result = await axios({
            url: openSearchUrl,
            method: 'GET',
            timeout: 0,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `ApiKey ${process.env.OPEN_SEARCH_API_KEY}`,
            },
            httpsAgent: agent,
            data: requestPayload,
        });
        return result;
    } catch (error) {
        return [];
    }
}


export default {
    axiosCall,
    axiosCallQuery,
    axiosMultipleCall,
    axiosCallHistory
}