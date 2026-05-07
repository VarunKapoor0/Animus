// AROverlay: mounts the Three.js WebXR container.
// In AR mode, Three.js renders the camera + 3D markers.
// React UI renders on top via domOverlay.

export default function AROverlay({ children, containerRef }) {
  return (
    <>
      {/* Three.js canvas mounts here when AR is active */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />
      {children}
    </>
  );
}
