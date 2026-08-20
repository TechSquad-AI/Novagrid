// Premium Motion Primitives — Spring physics, stagger, gestures

// ── Page Transitions ──
export const pageIn = {
    initial: { opacity: 0, y: 20, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export const pageOut = {
    opacity: 0, y: -12, filter: "blur(4px)",
    transition: { duration: 0.3 }
};

// ── Stagger Container ──
export const stagger = {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};

export const staggerFast = {
    animate: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } }
};

// ── Stagger Children ──
export const staggerChild = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export const staggerChildLeft = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

// ── Fade Variants ──
export const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export const fadeUpDelay = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
});

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

// ── Card Hover Effects ──
export const hoverLift = {
    whileHover: { y: -6, boxShadow: "0 12px 40px rgba(0,0,0,0.15)" },
    transition: { duration: 0.25, ease: "easeOut" }
};

export const hoverGlow = (color = "#00d4aa") => ({
    whileHover: { y: -4, boxShadow: `0 8px 32px ${color}15`, borderColor: `${color}40` },
    transition: { duration: 0.2 }
});

// ── Button Effects ──
export const tapScale = {
    whileTap: { scale: 0.96 },
    whileHover: { scale: 1.02 },
    transition: { duration: 0.15 }
};

export const buttonPulse = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.04, boxShadow: "0 4px 20px rgba(0,212,170,0.3)" }
};

// ── Number Counter ──
export const numberPop = {
    initial: { opacity: 0, scale: 0.5, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 20 }
};

// ── Score Circle ──
export const circleReveal = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }
};

// ── Slide Variants ──
export const slideRight = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
};

export const slideLeft = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
};

// ── Hover Slide ──
export const hoverSlide = {
    whileHover: { x: 6 },
    transition: { duration: 0.2 }
};

// ── Table Row ──
export const tableRow = {
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
};

// ── Chip / Badge ──
export const chipPop = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
};

// ── Loading Skeleton ──
export const shimmer = {
    animate: { backgroundPosition: ["200% 0", "-200% 0"] },
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
};

// ── Pulse Dot ──
export const pulseDot = {
    animate: { opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
};

// ── Bounce In ──
export const bounceIn = {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 500, damping: 15 }
};

// ── Rotate ──
export const rotateHover = {
    whileHover: { rotate: 10, scale: 1.1 },
    transition: { type: "spring", stiffness: 300 }
};

// ── Navigation ──
export const navItem = (index) => ({
    initial: { opacity: 0, x: -15 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.1 + index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
});

// ── Alert Slide ──
export const alertSlide = {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: -10, height: 0 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};
