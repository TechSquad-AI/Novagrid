import axios from "axios";
import { supabase } from "../supabase";


const api = axios.create({

    baseURL: "http://127.0.0.1:8000",

    headers: {

        "Content-Type": "application/json",

    },

});


// Request interceptor: attach Supabase auth token
api.interceptors.request.use(

    async (config) => {

        try {

            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {

                config.headers.Authorization = `Bearer ${session.access_token}`;

            }

        } catch (err) {

            console.warn("Could not get auth session:", err.message);

        }

        return config;

    },

    (error) => Promise.reject(error)

);


// Response interceptor: handle common errors
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response) {

            console.error("API Error:", error.response.status, error.response.data);

        } else if (error.request) {

            console.error("Network Error: No response from server");

        }

        return Promise.reject(error);

    }

);


export default api;