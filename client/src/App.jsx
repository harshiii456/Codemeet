import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";
import 'animate.css';


export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}