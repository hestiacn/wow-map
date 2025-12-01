---
layoutClass: map-page
---

<div class="not-found">
  <div class="map-content">
    <ClientOnly>
      <MapViewer />
    </ClientOnly>
  </div>
</div>

<style>
.not-found {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  width: 100vw;
  height: calc(100vh - var(--vp-nav-height));
  z-index: 100;
  background: #1a1a1a;
}

.map-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>