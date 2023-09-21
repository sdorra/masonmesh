import {
	GetExtensionType,
	GetKey,
	GetPredicateParam,
	GetIsMulti,
	AnyExtensionPoint,
} from "./extensionPoint";

type GetResolveReturnType<TExtensionPoint> =
	GetIsMulti<TExtensionPoint> extends true
		? Array<GetExtensionType<TExtensionPoint>>
		: GetExtensionType<TExtensionPoint> | null;

export function createResolver<
	TExtensionPointArray extends Array<AnyExtensionPoint>,
	TExtensionPoints extends TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
>(extensionPoints: TExtensionPointArray) {
	return {
		resolve: <
			TKey extends TKeys,
			TExtensionPoint extends Extract<TExtensionPoints, { key: TKey }>,
			TReturnType = GetResolveReturnType<TExtensionPoint>,
		>(
			key: TKey,
			...args: GetPredicateParam<TExtensionPoint> extends undefined
				? []
				: [GetPredicateParam<TExtensionPoint>]
		): TReturnType => {
			const ep = extensionPoints.find((e) => e.key === key);
			if (!ep) {
				throw new Error(`Extension point '${key}' not found.`);
			}

			const extensions = ep.extensions().filter((e) => {
				if (e.predicate) {
					return e.predicate(args[0]);
				}

				return true;
			});

			if (ep.isMulti) {
				return extensions.map(
					(e) => e.extension,
					// TODO can we get rid of the type cast here?
				) as TReturnType;
			}

			if (extensions.length === 0) {
				// TODO can we get rid of the type cast here?
				return null as TReturnType;
			}

			return extensions[0].extension;
		},
	};
}
