/* eslint-disable @typescript-eslint/no-explicit-any */

import {
	ExtensionPoint,
	GetExtensionType,
	GetKey,
	GetPredicateParam,
	Predicate,
} from "./extensionPoint";

export type Binder<TExtensionPoints, TKeys> = {
	bind: <
		TKey extends TKeys,
		TExtensionPoint extends Extract<TExtensionPoints, { key: TKey }>,
	>(
		key: TKey,
		extension: GetExtensionType<TExtensionPoint>,
		predicate?: Predicate<GetPredicateParam<TExtensionPoint>>,
	) => void;
};

export function createBinder<
	TExtensionPointArray extends Array<ExtensionPoint<any, any, any, any>>,
	TExtensionPoints extends TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
>(
	extensionPoints: TExtensionPointArray,
	plugin?: string,
): Binder<TExtensionPoints, TKeys> {
	return {
		bind: <
			TKey extends TKeys,
			TExtensionPoint extends Extract<TExtensionPoints, { key: TKey }>,
		>(
			key: TKey,
			extension: GetExtensionType<TExtensionPoint>,
			predicate?: Predicate<GetPredicateParam<TExtensionPoint>>,
		) => {
			const ep = extensionPoints.find((e) => e.key === key);
			if (!ep) {
				throw new Error(`Extension point '${key}' not found.`);
			}

			ep.bind({
				extension,
				predicate,
				plugin,
			});
		},
	};
}
