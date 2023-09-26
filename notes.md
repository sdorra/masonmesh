## Questions and TODO's

* Validation of ExtensionPoint id's
* Render only the first extension of a multi ExtensionPoint? Diw we need this?
*

### How to render multi ExtensionPoint's which requires wrapping?

#### Option 1: useComponentExtension hook?

```tsx
export function NavBar() {
	const location = useLocation();
	const extensions = useComponentExtension("root.navbar.items");

	return (
		<nav className="navbar">
			<ul>
				<li>
					<NavLink to="/">Dashboard</NavLink>
				</li>
				{extensions.map((Extension, i) => (
					<li key={i}>
						<Extension location={location.pathname} />
					</li>
				))}
				<li>
					<NavLink to="/about">About</NavLink>
				</li>
			</ul>
		</nav>
	);
}
```

#### Option 2: useComponentExtension with props applied by the hook?

```tsx
export function NavBar() {
	const location = useLocation();
	const extensions = useComponentExtension("root.navbar.items", {
		props: { location: location.pathname },
	});

	return (
		<nav className="navbar">
			<ul>
				<li>
					<NavLink to="/">Dashboard</NavLink>
				</li>
				{extensions.map((Extension, i) => (
					<li key={i}>
						<Extension />
					</li>
				))}
				<li>
					<NavLink to="/about">About</NavLink>
				</li>
			</ul>
		</nav>
	);
}
```

### Option 3: Wrapper prop on ExtensionPoint component?

```tsx
import { ExtensionPoint } from "@masonmesh/react";
import { NavLink, useLocation } from "react-router-dom";

export function NavBar() {
	const location = useLocation();
	return (
		<nav className="navbar">
			<ul>
				<li>
					<NavLink to="/">Dashboard</NavLink>
				</li>
				<ExtensionPoint
					id="root.navbar.items"
					props={{ location: location.pathname }}
					wrapper={"li"}
				/>
				<li>
					<NavLink to="/about">About</NavLink>
				</li>
			</ul>
		</nav>
	);
}
```

Wrapper can be a string or a component with children.

