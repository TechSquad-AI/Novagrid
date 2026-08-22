import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Hook to subscribe to a specific Socket.io event type.
 *
 * Usage:
 *   useSocketEvent("health_update", (data) => {
 *       console.log("Health updated:", data);
 *       refreshDashboard();
 *   });
 *
 * @param {string} eventType - Event name (e.g., "health_update", "change_detected")
 * @param {Function} handler - Callback with event data
 * @param {boolean} autoRefresh - If true, also call handler on "monitoring_tick"
 */
export function useSocketEvent(eventType, handler, autoRefresh = false) {
    const { subscribe } = useSocket();
    const handlerRef = useRef(handler);

    // Always use latest handler
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!subscribe) return;

        // Subscribe to the specific event type
        const unsub1 = subscribe(eventType, (data) => {
            handlerRef.current(data);
        });

        // Also subscribe to monitoring_tick for auto-refresh
        let unsub2 = null;
        if (autoRefresh) {
            unsub2 = subscribe("monitoring_tick", () => {
                handlerRef.current(null);
            });
        }

        return () => {
            unsub1();
            if (unsub2) unsub2();
        };
    }, [subscribe, eventType, autoRefresh]);
}
