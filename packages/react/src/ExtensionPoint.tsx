/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import {
	AnyExtensionPoint,
	GetExtensionType,
	GetIsMulti,
	GetKey,
} from "@masonmesh/core";
import {
	ComponentProps,
	PredicateParam,
	RegisteredExtensionPoints,
} from "./types";
import React, { ComponentType, ReactNode } from "react";
import { useResolver } from "./useResolver";

type MultiProps<TExtensionPoint> = GetIsMulti<TExtensionPoint> extends true
	? {
			wrapper?:
				| ComponentType<{ children: ReactNode }>
				| keyof JSX.IntrinsicElements;
	  }
	: {};

type ExtensionPointProps<TExtensionPoint extends AnyExtensionPoint> = {
	id: GetKey<TExtensionPoint>;
	children?: ReactNode;
} & ComponentProps<TExtensionPoint> &
	PredicateParam<TExtensionPoint> &
	MultiProps<TExtensionPoint>;

type PropsObject = {
	[TExtensionPoint in RegisteredExtensionPoints as GetExtensionType<TExtensionPoint> extends ComponentType<any>
		? GetKey<TExtensionPoint>
		: never]: ExtensionPointProps<TExtensionPoint>;
};

type Props = {
	[K in keyof PropsObject]: PropsObject[K];
}[keyof PropsObject];

export function ExtensionPoint(props: Props) {
	const resolver = useResolver();

	let ext: any = null;
	if ("predicateParam" in props) {
		ext = resolver.resolve(props.id, props.predicateParam);
	} else {
		ext = resolver.resolve(props.id);
	}

	const Ext = ({ ext }: { ext: ComponentType<any> }) => {
		const Extension = ext;
		if ("props" in props && typeof props.props === "object") {
			return <Extension {...props.props} />;
		} else {
			return <Extension />;
		}
	};

	if (Array.isArray(ext)) {
		if (ext.length === 0) {
			return props.children ?? null;
		}

		if ("wrapper" in props && props.wrapper) {
			const Wrapper = props.wrapper;
			return (
				<>
					{ext.map((e, i) => (
						<Wrapper key={i}>
							<Ext key={i} ext={e} />
						</Wrapper>
					))}
				</>
			);
		}

		return (
			<>
				{ext.map((e, i) => (
					<Ext key={i} ext={e} />
				))}
			</>
		);
	}

	if (ext) {
		return <Ext ext={ext} />;
	}

	return props.children ?? null;
}
