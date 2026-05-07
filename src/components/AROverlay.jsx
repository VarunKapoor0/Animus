// AROverlay: mounts the Three.js WebXR canvas container.
// The canvas itself handles its own z-index via inline style in three-scene.js.
// React UI sits above everything via z-20 on the inner div.

export default function AROverlay({ children, containerRef }) {
  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />
      {children}
    </>
  );
}
