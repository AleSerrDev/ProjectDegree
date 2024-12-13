import {urlBackend} from "../../commos/conections";

const getApiKey = async () => {
    return '33db2a7a-fa38-4803-a447-fb77367c2b74';
};

const apiService = (endpoint, apikey, accept2) => {
    const baseUrl = `${urlBackend}/${endpoint}`;
    const accept = accept2 || "application/json";
    const jsonContentHeader = {
        "Content-type": `${accept}; charset=UTF-8`,
    };

    return {
        getAll: async (params = {}) => {
            const apiKey = apikey;
            const searchParams = new URLSearchParams(params);
            const response = await fetch(`${baseUrl}?${searchParams}`, {
                headers: { 'x-api-key': apiKey,
                    ...jsonContentHeader,
                    'Accept':accept},
            });
            return response.json();
        },

        getById: async (id) => {
            const apiKey = apikey;
            const response = await fetch(`${baseUrl}/${id}`, {
                headers: { 'x-api-key': apiKey,
                    ...jsonContentHeader,
                    'Accept':accept},
            });
            return response.json();
        },

        post: async (body) => {
            const apiKey = apikey;
            const response = await fetch(baseUrl, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    ...jsonContentHeader,
                    'x-api-key': apiKey,
                },
            });
            console.log("API", response)
            return response.json();
        },

        postAudio: async (formData) => {
            const apiKey = apikey;
            const response = await fetch(baseUrl, {
                method: "POST",
                body: formData,
                headers: {
                    'x-api-key': apiKey,
                },
            });
            return response.json();
        },

        put: async (id, body) => {
            const apiKey = apikey;
            const response = await fetch(`${baseUrl}/${id}`, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: {
                    ...jsonContentHeader,
                    'x-api-key': apiKey,
                },
            });
            return response.json();
        },

        patch: async (id, body) => {
            const apiKey = apikey;
            const response = await fetch(`${baseUrl}/${id}`, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: {
                    ...jsonContentHeader,
                    'x-api-key': apiKey,
                },
            });
            return response.json();
        },

        delete: async (id) => {
            const apiKey = apikey;
            const response = await fetch(`${baseUrl}/${id}`, {
                method: "DELETE",
                headers: { 'x-api-key': apiKey },
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar: ${response.statusText}`);
            }

            return response.status === 204 ? null : response.json();
        },
    };
};

export default apiService;
