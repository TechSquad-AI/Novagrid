import React, { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [open, setOpen] = useState(true);
    const toggle = useCallback(() => setOpen(prev => !prev), []);
    const close = useCallback(() => setOpen(false), []);

    return (
        <SidebarContext.Provider value={{ open, toggle, close }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
