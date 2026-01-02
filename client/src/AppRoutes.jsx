import { Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import User from "./pages/UserPage/Userpage";
import JoinRoom from "./pages/JoinRoom";
import MeetRoom from "./pages/meetRoom";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<User />} />
                <Route 
                    path="meet-room" 
                    element={
                        <ProtectedRoute>
                            <JoinRoom />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="meet-room/:roomid" 
                    element={
                        <ProtectedRoute>
                            <MeetRoom />
                        </ProtectedRoute>
                    } 
                />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
