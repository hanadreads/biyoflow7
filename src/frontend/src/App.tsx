// App.tsx — router configuration + provider wrappers only.
import { LangProvider } from "@/i18n/index";
import CustomerPage from "@/pages/CustomerPage";
import DriverPage from "@/pages/DriverPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// ── Root route — no layout, just a passthrough ─────────────────────────────────

const rootRoute = createRootRoute();

// Redirect / → /customer
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/customer" });
  },
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  customerRoute,
  driverRoute,
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
