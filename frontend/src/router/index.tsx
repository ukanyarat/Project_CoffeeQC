import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/user/home/HomePage";
import LoginPage from "../pages/user/login/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import TakeOrderPage from "../pages/take-order/TakeOrderPage";
import TodaysOrdersPage from "../pages/todays-orders/TodaysOrdersPage";
import ProductsPage from "../pages/products/ProductsPage";
import CustomersPage from "../pages/customers/CustomersPage";
import EmployeesPage from "../pages/employees/EmployeesPage";
import SalesHistoryPage from "../pages/sales-history/SalesHistoryPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <App />,
                children: [
                    { index: true, element: <HomePage /> },
                    { path: "take-order", element: <TakeOrderPage /> },
                    { path: "todays-orders", element: <TodaysOrdersPage /> },
                    { path: "products", element: <ProductsPage /> },
                    { path: "sales-history", element: <SalesHistoryPage /> },
                    { path: "customers", element: <CustomersPage /> },
                    { path: "employees", element: <EmployeesPage /> },
                ]
            }
        ]
    },
]);

export default router;