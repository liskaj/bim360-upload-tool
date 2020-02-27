import axios from 'axios';

export class ServiceClient {
    public async get(url: string, inputs?: any): Promise<any> {
        try {
            const response = await axios.get(url);

            return response.data;
        }
        catch (err) {
            let msg = err.message;

            if (err.response && err.response.statusText) {
                msg = err.response.statusText
            }
            throw new Error(msg);
        }
    }

    public async put(url: string, inputs?: any, headers?: any): Promise<any> {
        try {
            const response = await axios.put(url, inputs, {
                headers
            });

            return response.data;
        }
        catch (err) {
            let msg = err.message;

            if (err.response && err.response.statusText) {
                msg = err.response.statusText;
            }
            throw new Error(msg);
        }
    }

    public async post(url: string, inputs?: any): Promise<any> {
        try {
            const response = await axios.post(url, inputs);

            return response.data;
        }
        catch (err) {
            let msg = err.message;

            if (err.response && err.response.statusText) {
                msg = err.response.statusText;
            }
            throw new Error(msg);
        }
    }
}
