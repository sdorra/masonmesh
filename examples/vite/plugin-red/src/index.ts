import { definePlugin } from "@masonmesh/example-vite";

export default definePlugin({
	name: "red",
	description: "red plugin",
	onActivate: (binder) => {
		binder.bind("colors", "red");
	},
});
