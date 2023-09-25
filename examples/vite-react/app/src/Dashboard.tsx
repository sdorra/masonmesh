import { ExtensionPoint } from "@masonmesh/react";

export function Dashboard() {
	return (
		<>
			<h1>Dashboard</h1>
			<div className="dashboard">
				<ExtensionPoint	id="dashboard.widgets" />
			</div>
		</>
	);
}
