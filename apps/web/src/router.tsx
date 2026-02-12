import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "./App";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/app/DashboardPage";
import { PeoplePage } from "./pages/app/PeoplePage";
import { InventoryPage } from "./pages/app/InventoryPage";
import { IssuesPage } from "./pages/app/IssuesPage";
import { SignaturePage } from "./pages/public/SignaturePage";
import { NotFoundPage } from "./pages/public/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "sign/:token", element: <SignaturePage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "people", element: <PeoplePage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "issues", element: <IssuesPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
