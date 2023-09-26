/* eslint-disable @typescript-eslint/ban-ts-comment */
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
	NonEmptyObject,
	PredicateParam,
	RegisteredExtensionPoints,
} from "./types";
import { ComponentType, FC } from "react";
import { useResolver } from "./useResolver";

type PropsObject = {
	[TExtensionPoint in RegisteredExtensionPoints as GetExtensionType<TExtensionPoint> extends ComponentType<any>
		? GetKey<TExtensionPoint>
		: never]: never;
};

type ComponentKeys = keyof PropsObject;

type GetArgs<TExtensionPoint extends AnyExtensionPoint> =
	ComponentProps<TExtensionPoint> & PredicateParam<TExtensionPoint>;

type Args<
	TExtensionPoint extends AnyExtensionPoint,
	TArgs = GetArgs<TExtensionPoint>,
> = NonEmptyObject<TArgs> extends never ? [] : [TArgs];

type ReturnType<TExtensionPoint> = GetIsMulti<TExtensionPoint> extends true
	? Array<ComponentType<{}>>
	: ComponentType<{}> | null;

export function useComponentExtension<
	TKey extends ComponentKeys,
	TExtensionPoint extends AnyExtensionPoint = Extract<
		RegisteredExtensionPoints,
		{ key: TKey }
	>,
>(key: TKey, ...args: Args<TExtensionPoint>): ReturnType<TExtensionPoint> {
	const resolver = useResolver();

	const arg: any = args[0] ?? {};

	let ext: any = null;
	if ("predicateParam" in arg) {
		ext = resolver.resolve(key, arg.predicateParam);
	} else {
		// @ts-ignore TODO: fix this
		ext = resolver.resolve(key);
	}

	const Ext = ({ ext }: { ext: ComponentType<any> }) => {
		const Extension = ext;
		if ("props" in arg && typeof arg.props === "object") {
			return <Extension {...arg.props} />;
		} else {
			return <Extension />;
		}
	};

	if (Array.isArray(ext)) {
		const extArray: Array<FC> = ext.map((Extension) => () => (
			<Ext ext={Extension} />
		));
		return extArray as ReturnType<TExtensionPoint>;
	}

	if (ext) {
		const extComponent: FC = () => <Ext ext={ext} />;
		return extComponent as ReturnType<TExtensionPoint>;
	}

	return null as ReturnType<TExtensionPoint>;
}
