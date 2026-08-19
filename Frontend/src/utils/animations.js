// Reusable animation variants for NovaGrid

export const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const slideInFromBottom = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" }
};

export const hoverLift = {
    y: -6,
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
    transition: { duration: 0.3, ease: "easeOut" }
};

export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 }
};

export const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

export const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const numberCount = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};
