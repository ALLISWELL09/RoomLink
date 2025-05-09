
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

// Debug environment variables
console.log("Environment Variables in main.jsx:");
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("MODE:", import.meta.env.MODE);
console.log("DEV:", import.meta.env.DEV);
console.log("PROD:", import.meta.env.PROD);

createRoot(document.getElementById('root')).render(
<BrowserRouter>
    <App />
</BrowserRouter>

)
