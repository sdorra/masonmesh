import { extensionPoint } from "@masonmesh/core";
import { RouteObject } from "react-router-dom";

const rootRoutes = extensionPoint<RouteObject>().multi("root.routes");

export const extensionPoints = [rootRoutes];

declare module "@masonmesh/react" {
	interface Register {
		extensionPoints: typeof extensionPoints;
	}
}
