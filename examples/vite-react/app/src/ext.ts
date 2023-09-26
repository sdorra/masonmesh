import { createPluginRegistry, extensionPoint } from "@masonmesh/core";
import { NonIndexRouteObject } from "react-router-dom";
import { FC } from "react";

export const rootRoutes =
	extensionPoint<NonIndexRouteObject>().multi("root.routes");

export type NavBarItemProps = {
	location: string;
};

export const navBarItems =
	extensionPoint<FC<NavBarItemProps>>().multi("root.navbar.items");
export const widgets = extensionPoint<FC>().multi("dashboard.widgets");

export const extensionPoints = [rootRoutes, widgets, navBarItems];

export const pluginRegistry = createPluginRegistry(extensionPoints, {
	autoActivate: true,
});

declare module "@masonmesh/react" {
	interface Register {
		extensionPoints: typeof extensionPoints;
	}
}
