import axios from "axios";

const baseURL = import.meta.env.VITE_MOCK_API_BASE_URL;

if (!baseURL) {
    throw new Error(
        "VITE_MOCK_API_BASE_URL is not defined. Please set it in your Vite environment file.",
    );
}

const mockApi = axios.create({
    baseURL,
});

export default mockApi;
