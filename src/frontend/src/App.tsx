// App.tsx — router configuration + provider wrappers only.
import { LangProvider } from "@/i18n/index";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import AvailabilityPage from "@/pages/AvailabilityPage";
import CustomerPage from "@/pages/CustomerPage";
import DeliveryConfirmPage from "@/pages/DeliveryConfirmPage";
import DriverPage from "@/pages/DriverPage";
import DriverRegisterPage from "@/pages/DriverRegisterPage";
import ShiftActivationPage from "@/pages/driver/ShiftActivationPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// ── Root route — no layout, just a passthrough ─────────────────────────────────

const rootRoute = createRootRoute();

// Redirect / → /auth
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer",
  component: CustomerPage,
});

const driverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver",
  component: DriverPage,
});

const availabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/availability",
  component: AvailabilityPage,
});

const confirmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirm",
  component: DeliveryConfirmPage,
});

const driverShiftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/shift",
  component: ShiftActivationPage,
});

const driverRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/register",
  component: DriverRegisterPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  customerRoute,
  driverRoute,
  availabilityRoute,
  confirmRoute,
  driverShiftRoute,
  driverRegisterRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

// TanStack Router type augmentation
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App root — providers wrap RouterProvider ─────────────────────────────

export default function App() {
  return (
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  );
}
