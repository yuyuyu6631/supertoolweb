"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { ToolSummary } from "../lib/catalog-types";
import { fetchSearchIndex } from "../lib/catalog-api";

interface ClientSearchContextValue {
    tools: ToolSummary[];
    fuse: Fuse<ToolSummary> | null;
    isLoaded: boolean;
}

const ClientSearchContext = createContext<ClientSearchContextValue>({
    tools: [],
    fuse: null,
    isLoaded: false,
});

export function ClientSearchProvider({ children }: { children: React.ReactNode }) {
    const [tools, setTools] = useState<ToolSummary[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;
        fetchSearchIndex()
            .then((data) => {
                if (mounted) {
                    setTools(data);
                    setIsLoaded(true);
                }
            })
            .catch((error) => {
                console.error("Failed to load search index", error);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const fuse = useMemo(() => {
        if (tools.length === 0) return null;
        return new Fuse(tools, {
            keys: [
                { name: "name", weight: 3 },
                { name: "summary", weight: 2 },
                { name: "tags", weight: 1.5 },
                { name: "category", weight: 1 },
            ],
            threshold: 0.3,
            ignoreLocation: true,
        });
    }, [tools]);

    const value = useMemo(
        () => ({ tools, fuse, isLoaded }),
        [tools, fuse, isLoaded]
    );

    return (
        <ClientSearchContext.Provider value={value}>
            {children}
        </ClientSearchContext.Provider>
    );
}

export function useClientSearch() {
    return useContext(ClientSearchContext);
}
