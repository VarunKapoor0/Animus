// AROverlay: mounts the Three.js WebXR container.
// When AR is active, Three.js canvas sits on top and renders passthrough + 3D elements.
// React UI renders on top of everything via domOverlay.

export default function AROverlay({ children, containerRef, isARActive }) {
  return (
    <>
      {/* Three.js canvas container:
          - Inactive: z-0, hidden behind camera feed
          - Active: z-10, on top of everything so WebXR passthrough is visible */}
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: isARActive ? 10 : 0 }}
      />
      {children}
    </>
  );
}
