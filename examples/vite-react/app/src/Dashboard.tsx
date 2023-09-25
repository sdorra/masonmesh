import { ExtensionPoint } from "@masonmesh/react";

export function Dashboard() {
	return (
		<div>
			<h1>Dashboard</h1>
			<div>
				<ExtensionPoint	id="dashboard.widgets" />
			</div>
		</div>
	);
}
