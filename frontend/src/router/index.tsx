import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import App from "../App"; // Import the main App layout
import { Spin } from "antd";

// Lazy load all the page components
const LoginPage = lazy(() => import("../pages/user/login/LoginPage"));
const HomePage = lazy(() => import("../pages/user/home/HomePage"));
const TakeOrderPage = lazy(() => import("../pages/take-order/TakeOrderPage"));
const TodaysOrdersPage = lazy(
  () => import("../pages/todays-orders/TodaysOrdersPage")
);
const SalesHistoryPage = lazy(
  () => import("../pages/sales-history/SalesHistoryPage")
);
const ProductsPage = lazy(() => import("../pages/products/ProductsPage"));
const CustomersPage = lazy(() => import("../pages/customers/CustomersPage"));
const EmployeesPage = lazy(() => import("../pages/employees/EmployeesPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<Spin size="large" />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />, // Protects all nested routes
    children: [
      {
        path: "/",
        element: <App />, // App component is the layout for protected pages
        children: [
          {
            path: "/",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <HomePage />
              </Suspense>
            ),
          },
          {
            path: "/take-order",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <TakeOrderPage />
              </Suspense>
            ),
          },
          {
            path: "/todays-orders",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <TodaysOrdersPage />
              </Suspense>
            ),
          },
          {
            path: "/sales-history",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <SalesHistoryPage />
              </Suspense>
            ),
          },
          {
            path: "/products",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <ProductsPage />
              </Suspense>
            ),
          },
          {
            path: "/customers",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <CustomersPage />
              </Suspense>
            ),
          },
          {
            path: "/employees",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <EmployeesPage />
              </Suspense>
            ),
          },
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<Spin size="large" />}>
                <DashboardPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;