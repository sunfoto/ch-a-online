# CREDITS — Tài nguyên bên ngoài dùng trong dự án Thiền Đường Tịnh Tâm

## Thư viện mã nguồn mở

- **Three.js r186 (0.186.1)** — MIT License — https://threejs.org
  - File local trong `lib/`: `three.module.js`, `three.core.js`, `RoomEnvironment.js`
    (tải từ jsDelivr, gói npm `three@0.186.1`).
  - Addons để local trong `lib/addons/` (cùng phiên bản, cùng giấy phép MIT):
    `postprocessing/` (EffectComposer, RenderPass, ShaderPass, MaskPass, Pass,
    UnrealBloomPass, OutputPass), `shaders/` (CopyShader, LuminosityHighPassShader,
    OutputShader), `loaders/GLTFLoader.js`, `utils/` (BufferGeometryUtils, SkeletonUtils).
- **tiktok-live-connector v2.5.0** (trong `bridge/`) — MIT License —
  https://github.com/zerodytrash/TikTok-Live-Connector

## Model 3D bên ngoài

**Không có.** Ở đợt nâng cấp 4 (31/10/2026) đã rà kỹ các kho model có giấy phép rõ
(Poly Pizza, Quaternius, KhronosGroup glTF-Sample-Models, Smithsonian/Wikimedia
Commons, GitHub, OpenGameArt) — không có tượng Phật ngồi thiền hay nhân vật ngồi
thiền nào đạt đồng thời các tiêu chí: giấy phép rõ ràng (CC0/CC-BY), tải trực tiếp
không cần tài khoản, dung lượng ≤ 15MB, tạo hình trang nghiêm. Chi tiết từng nguồn
đã thử: xem `QA.md` mục "QA — Đợt 4".

Toàn bộ tượng Phật Tổ và nhân vật trong `index3d.html` đều được dựng bằng hình học
Three.js trong mã nguồn của dự án (primitives + LatheGeometry + TubeGeometry +
InstancedMesh), vật liệu PBR tự cấu hình — không dùng tài nguyên hình ảnh/model
của bên thứ ba.

## Nhạc

- Nhạc Phật mặc định: **tự tổng hợp bằng WebAudio** trong mã nguồn (chuông bát hát
  + pad + mõ) — không dùng file nhạc của bên thứ ba.
- Nếu người vận hành bỏ file `music/nhac-phat.mp3` vào dự án thì đó là file của
  chính người vận hành; trách nhiệm bản quyền thuộc về người vận hành (xem cảnh báo
  trong `music/README.md`).
