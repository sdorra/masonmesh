// src/ext.ts
import { createPluginRegistry, extensionPoint } from "@masonmesh/core";
var rootRoutes = extensionPoint().multi("root.routes");
var navBarItems = extensionPoint().multi("root.navbar.items");
var widgets = extensionPoint().multi("dashboard.widgets");
var extensionPoints = [rootRoutes, widgets, navBarItems];
var pluginRegistry = createPluginRegistry(extensionPoints, {
  autoActivate: true
});

// src/plugin-api.ts
var definePlugin = pluginRegistry.register;
export {
  definePlugin
};
