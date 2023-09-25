import * as _masonmesh_core from '@masonmesh/core';
import * as react_router_dom from 'react-router-dom';
import { NonIndexRouteObject } from 'react-router-dom';
import * as react from 'react';
import { FC } from 'react';

type NavBarItemProps = {
    location: string;
};
declare const extensionPoints: ({
    key: "root.routes";
    bind(extension: {
        extension: NonIndexRouteObject;
        predicate?: _masonmesh_core.Predicate<undefined> | undefined;
        plugin?: string | undefined;
    }): void;
    unbindAllFromPlugin(plugin: string): void;
    extensions: () => {
        extension: NonIndexRouteObject;
        predicate?: _masonmesh_core.Predicate<undefined> | undefined;
        plugin?: string | undefined;
    }[];
    isMulti: true;
} | {
    key: "dashboard.widgets";
    bind(extension: {
        extension: FC;
        predicate?: _masonmesh_core.Predicate<undefined> | undefined;
        plugin?: string | undefined;
    }): void;
    unbindAllFromPlugin(plugin: string): void;
    extensions: () => {
        extension: FC;
        predicate?: _masonmesh_core.Predicate<undefined> | undefined;
        plugin?: string | undefined;
    }[];
    isMulti: true;
} | {
    key: "root.navbar.items";
    bind(extension: {
        extension: FC<NavBarItemProps>;
        predicate?: _masonmesh_core.Predicate<undefined> | undefined;
        plugin?: string | undefined;
    }): void;
    unbindAllFromPlugin(plugin: string): void;
    extensions: () => {
        extension: FC<NavBarItemProps>;
        predicate?: _masonmesh_core.Predicate<undefined> | undefined;
        plugin?: string | undefined;
    }[];
    isMulti: true;
})[];
declare module "@masonmesh/react" {
    interface Register {
        extensionPoints: typeof extensionPoints;
    }
}

declare const definePlugin: (plugin: {
    name: string;
    description?: string | undefined;
    version?: string | undefined;
    onActivate?: ((binder: {
        bind: <TKey extends "root.routes" | "dashboard.widgets" | "root.navbar.items", TExtensionPoint extends Extract<{
            key: "root.routes";
            bind(extension: {
                extension: react_router_dom.NonIndexRouteObject;
                predicate?: _masonmesh_core.Predicate<undefined> | undefined;
                plugin?: string | undefined;
            }): void;
            unbindAllFromPlugin(plugin: string): void;
            extensions: () => {
                extension: react_router_dom.NonIndexRouteObject;
                predicate?: _masonmesh_core.Predicate<undefined> | undefined;
                plugin?: string | undefined;
            }[];
            isMulti: true;
        }, {
            key: TKey;
        }> | Extract<{
            key: "dashboard.widgets";
            bind(extension: {
                extension: react.FC;
                predicate?: _masonmesh_core.Predicate<undefined> | undefined;
                plugin?: string | undefined;
            }): void;
            unbindAllFromPlugin(plugin: string): void;
            extensions: () => {
                extension: react.FC;
                predicate?: _masonmesh_core.Predicate<undefined> | undefined;
                plugin?: string | undefined;
            }[];
            isMulti: true;
        }, {
            key: TKey;
        }> | Extract<{
            key: "root.navbar.items";
            bind(extension: {
                extension: react.FC<NavBarItemProps>;
                predicate?: _masonmesh_core.Predicate<undefined> | undefined;
                plugin?: string | undefined;
            }): void;
            unbindAllFromPlugin(plugin: string): void;
            extensions: () => {
                extension: react.FC<NavBarItemProps>;
                predicate?: _masonmesh_core.Predicate<undefined> | undefined;
                plugin?: string | undefined;
            }[];
            isMulti: true;
        }, {
            key: TKey;
        }>>(key: TKey, extension: _masonmesh_core.GetExtensionType<TExtensionPoint>, predicate?: _masonmesh_core.Predicate<_masonmesh_core.GetPredicateParam<TExtensionPoint>> | undefined) => void;
    }) => void) | undefined;
    onDeactivate?: (() => void) | undefined;
}) => void;

export { definePlugin };
