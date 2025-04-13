import React from "react";
import { Routes, Route } from "react-router";
import ContentGini from "../../AI/ContentGini";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ContentGini />} />
        </Routes>
    )
}

export default AppRoutes;
