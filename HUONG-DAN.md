# THIỀN ĐƯỜNG TỊNH TÂM — Hướng dẫn: từ bản mẫu tới LIVE thật trên TikTok

> Kết quả nghiên cứu (31/10/2026): **Không tìm thấy sản phẩm/dịch vụ nào bán sẵn đúng concept "Thiền Đường Tịnh Tâm"** (ngồi thiền 24 chỗ, tặng quà được ngồi, xếp hàng) để tải về dùng ngay.
> Format này thuộc họ **"TikTok LIVE interactive game" (live tương tác / game hóa livestream)** — các phiên dạng này đều tự dựng bằng một game/app chạy trên PC + cầu nối bắt sự kiện comment/gift từ TikTok. Vì vậy Misa đã dựng **bản mẫu chạy được** trong thư mục này (`index.html`) để Lão tổng xem đúng cơ chế, và bên dưới là kiến trúc nối thật.

---

## 1. Cách chạy bản mẫu

- Mở file `index.html` bằng trình duyệt (Chrome/Edge) — không cần cài đặt, không cần server.
- Khung bên trái = màn hình LIVE 9:16 (cái người xem thấy). Panel bên phải = giả lập người xem TikTok:
  - **Gửi bình luận** → người đó vào ngồi bồ đoàn trống, có bảng tên. Gõ đúng từ `nam` / `nữ` / `su` (hoặc `sư`) → đổi kiểu nhân vật.
  - **Tặng quà giả lập** (Hoa hồng/Hoa sen/Tràng hạt/Hoa đăng) → được ưu tiên ngồi, cộng điểm bảng **Công Đức**, hiện banner + đọc **xướng tên hồi hướng**.
  - Đầy 24 chỗ → vào **hàng chờ FIFO**; người tặng quà được xếp trước người chờ thường. Hết giờ ngồi (mặc định 120 giây, chỉnh được) → rời ghế, người đầu hàng chờ vào thay.
  - Nút "Thêm 20 người" để xem cảnh đầy ghế + xếp hàng; nút Reset để làm lại.
- Kiểm chứng: xem `QA.md`.

## 2. Kiến trúc nối THẬT vào TikTok LIVE

```
Người xem TikTok (comment / gift / like / follow)
        │
        ▼
TikTok Webcast (luồng sự kiện nội bộ của TikTok — TikTok KHÔNG có API live chính thức cho việc này)
        │  WebSocket đã ký (signed URL)
        ▼
CẦU NỐI (Bridge) — 1 trong 3 lựa chọn:
  (1) TikTok-Live-Connector (Node.js, mã nguồn mở của zerodytrash) + EulerStream ký URL
  (2) TikFinity (dịch vụ sẵn: free / Pro 19 USD/tháng) — dễ nhất, không cần code cầu nối
  (3) Các platform game sẵn: Zonee, Livecade, ScrollPlay, TikXander... (chỉ có game của họ, không có concept thiền đường)
        │  sự kiện dạng JSON: {type:"chat"|"gift", user, text/giftName, coins}
        ▼
GAME / MÀN HÌNH LIVE (Unity 3D hoặc Web như bản mẫu này)
  - comment → joinOrQueue() · từ khóa nam/nữ/sư → đổi nhân vật
  - gift    → ưu tiên ghế + bảng Công Đức + xướng tên (TTS)
        │
        ▼
TikTok LIVE Studio (Windows) hoặc OBS — bắt cửa sổ game (Window/Game Capture)
hoặc dán link Browser Source → phát lên TikTok LIVE
```

- Bản mẫu web này đã tách sẵn 2 hàm `handleComment(name, text)` và `handleGift(name, giftName, coins)` — khi nối thật, chỉ cần cho Bridge gọi đúng 2 hàm này với dữ kiện thật (qua WebSocket từ một server Node.js nhỏ chạy cạnh trình duyệt, hoặc nhúng luôn logic vào game Unity).
- Đường chuyên nghiệp hơn (đúng cách các source Việt Nam đang bán): **Unity (cảnh 3D) + Node.js TikTok Bridge + bảng luật Master Rules** (gán từng quà/lệnh chat → hành động). Bộ full source gần nhất đang bán ở Việt Nam: **"TikTok LIVE Bar Địa Phủ" — Ông Chú MMO, 299.000đ (giá gốc 999.000đ)** — chủ đề quán bar nhưng kiến trúc tách game–bridge–luật để **đổi concept thành thiền đường được** (đổi asset + luật). Cùng shop còn source "Chọc Chó Online" cùng khung giá. Lưu ý: bán theo hiện trạng, không kèm hỗ trợ kỹ thuật.

## 3. Điều kiện cần có để LIVE thật (Lão tổng cần tự chuẩn bị — Misa không tự làm thay được)

1. **Tài khoản TikTok đủ điều kiện LIVE trên PC**: tối thiểu **1.000 follower**, chủ tài khoản **18+** mới nhận được quà (16+ chỉ live được, không nhận quà), tài khoản không vi phạm gần đây. TikTok LIVE Studio chỉ chạy trên **Windows** (tải từ trang chính thức của TikTok).
2. **Máy tính Windows** chạy cùng lúc: game (Unity/web) + LIVE Studio/OBS + Bridge — nên RAM ≥ 8GB, mạng ổn định. (Máy Windows của Lão tổng là DESKTOP-Q7FIFCP.)
3. **Tài khoản/dịch vụ cầu nối** nếu chọn đường trả phí: TikFinity Pro 19 USD/tháng, hoặc EulerStream (có gói trả phí cho khóa ký API dùng lâu dài).
4. Nếu mua source Ông Chú MMO (299.000đ): cần người biết Unity căn bản để thay asset bar → thiền đường, hoặc thuê/Misa hỗ trợ chỉnh qua AI agent (source mở, không khóa).

## 4. Các bước đề xuất để lên sóng thật

1. Xem bản mẫu, chốt luật chơi (số ghế 24, thời gian ngồi, quà nào = quyền gì, có đọc TTS xướng tên không).
2. Chốt đường kỹ thuật: **nhanh nhất** = mua source 299.000đ rồi đổi concept; **rẻ nhất** = dùng bản mẫu web này + tự viết Bridge Node.js bằng TikTok-Live-Connector; **dễ vận hành nhất cho game có sẵn** = TikFinity/Zonee (nhưng không có concept thiền đường).
3. Chạy thử ở chế độ demo/test (không công khai), kiểm tra độ trễ sự kiện gift → hiệu ứng.
4. Kiểm tra lại điều kiện tài khoản (1.000 follower, 18+), cài LIVE Studio trên máy Windows, bắt cửa sổ game, test một phiên kín.
5. Lên sóng thật với luật chơi ghi rõ trên màn hình — **tránh câu chữ kêu gọi/xin quà trực tiếp** (xem mục rủi ro dưới đây), chỉ mô tả luật tham gia.

## 5. Rủi ro chính sách — ĐỌC KỸ trước khi live

- **TikTok cấm ép/ dụ dỗ/ xin quà**: Chính sách kiếm tiền của TikTok Creator Network ghi rõ creator bị cấm "coercing, encouraging or soliciting gifts" (ép buộc, khuyến khích, xin quà); nội dung "begging" (ăn xin quà, lấy nhu cầu cá nhân đổi quà mà thiếu tương tác thật) là vi phạm. Từ 2025, nhiều nguồn tổng hợp chính sách TikTok cho biết creator **không được chủ động kêu gọi tặng quà**, kể cả bằng mục tiêu quà/đếm ngược ghim trên màn hình — có thể bị giảm phân phối hoặc thu hồi tính năng nhận quà. → Cơ chế "tặng quà thì được ngồi/xướng tên" phải trình bày như **luật tham gia của game**, không hô hào xin quà, không đặt mục tiêu quà.
- **Nhạy cảm tôn giáo**: dùng hình tượng Phật + chữ "Công Đức / cúng dường / hồi hướng" gắn với quà tặng quy đổi tiền được là vùng rủi ro cao: chính sách nội dung thương hiệu của TikTok cấm sản phẩm tôn giáo/tâm linh với mục đích thương mại; trong nước, việc lợi dụng tín ngưỡng để trục lợi có thể bị dư luận/pháp luật soi. Giả danh tu sĩ/chùa thật khi không phải là rủi ro lớn nhất — nếu làm, nên giữ khung "game thiền thư giãn", không mạo danh cơ sở tôn giáo thật.
- **Rủi ro kỹ thuật/phiên live**: cầu nối dùng API không chính thức (reverse-engineered) — TikTok đổi giao thức là gãy kết nối; live dạng treo máy lặp hình tĩnh dễ bị gắn nhãn nội dung chất lượng thấp/phát lại.
- **Tiền lệ bị khóa riêng cho format thiền đường**: qua tìm kiếm ngày 31/10/2026, **không tìm thấy** tin/bài nào ghi nhận phiên "thiền đường tịnh tâm" bị TikTok khóa — các kênh "Tịnh Tâm" vẫn xuất hiện LIVE đều. Nhưng "không tìm thấy tiền lệ" không có nghĩa là an toàn tuyệt đối với 2 rủi ro trên.

## 6. Nguồn tham khảo chính

- Full Source TikTok LIVE Bar Địa Phủ (Unity + Node Bridge, 299.000đ): https://ongchummo.com/store/full-source-tiktok-live-bar-dia-phu
- TikTok-Live-Connector (kiến trúc, EulerStream): https://deepwiki.com/zerodytrash/TikTok-Live-Connector
- TikFinity (free/Pro 19 USD/tháng): theo tổng hợp tại https://streamchime.com/blog/web-based-tikfinity-alternative
- Zonee (10/15/49 USD/tháng, 24+ game): https://www.zonee.pro/
- Livecade (game xếp hàng/ghế chờ do chat điều khiển, free 60 phút/ngày): https://github.com/livecade/take-the-crown-tiktok-live-game
- Điều kiện LIVE tại Việt Nam (1.000 follower, 18+ nhận quà): https://fptshop.com.vn/tin-tuc/danh-gia/cach-bat-live-tiktok-tren-pc-176485
- Chính sách kiếm tiền TikTok Creator Network (cấm soliciting gifts, begging): https://lf16-live-backstage.tiktokcdn.com/obj/ies-hotsoon-draft-sg/webcast-union-platform-i18n/5ac5119e-1781-4c05-9f6d-47fddcaf2790.html

---

## 7. VẬN HÀNH THẬT bằng Bridge đã dựng sẵn (cập nhật 31/10/2026)

> Đợt phát triển này đã biến "đường rẻ nhất" ở mục 4 thành **bộ công cụ có sẵn**: thư mục `bridge/` chứa sẵn Bridge Node.js dùng thư viện `tiktok-live-connector`. Trang `index.html` tự nhận sự kiện thật khi mở qua bridge. Không cần mua source Unity nữa — chỉ còn các bước chuẩn bị phía tài khoản/máy móc dưới đây.

### (a) Cài đặt và chạy Bridge trên máy Windows

1. Cài **Node.js bản LTS** từ https://nodejs.org (cài xong mở Command Prompt gõ `node -v` thấy số phiên bản là được).
2. Sao chép **cả thư mục dự án** `thien-duong-tinh-tam` sang máy Windows (DESKTOP-Q7FIFCP).
3. Mở Command Prompt trong thư mục `bridge`, chạy:
   ```
   npm install
   copy .env.example .env
   notepad .env
   ```
   Trong file `.env`: điền `TIKTOK_USERNAME=` là username kênh TikTok của mình (không có dấu @). `EULER_API_KEY` xem mục (b); `PORT` để mặc định 8080.
4. Chạy bản thật: `node server.js` — thấy dòng `✅ ĐÃ KẾT NỐI tới live của @...` là bridge đã bắt được kênh (kênh phải đang live; nếu kênh chưa live, bridge tự chờ và nối lại — cứ để chạy trước rồi mở live sau cũng được).
5. Mở trình duyệt Chrome tới **http://localhost:8080** → thấy thiền đường và dòng log "🔌 Đã nối tới Bridge". Từ lúc này comment/gift thật của người xem sẽ tự chạy vào ghế/bảng Công Đức. Kiểm tra nhanh tình trạng bridge: http://localhost:8080/status

### (b) Lấy API key EulerStream (miễn phí) — nên có để kết nối ổn định

1. Vào https://www.eulerstream.com → **Sign Up** (đăng ký bằng Google/GitHub) — có gói miễn phí.
2. Trong trang quản trị (Dashboard), tìm mục **API Keys** → tạo một key mới → sao chép lại.
3. Điền vào file `bridge/.env`: `EULER_API_KEY=<key vừa sao chép>` rồi khởi động lại bridge.
4. Không có key thì bridge **vẫn chạy** (thư viện ký qua máy chủ công cộng của EulerStream) nhưng dễ bị giới hạn tần suất ký khi đông người dùng chung → dễ rớt kết nối giữa phiên dài. Live nghiêm túc thì nên có key. **Không chia sẻ key/file .env cho người khác.**

### (c) Đưa hình lên TikTok LIVE

1. Điều kiện tài khoản: **≥ 1.000 follower, chủ tài khoản 18+** (mới nhận được quà), tài khoản không vi phạm gần đây.
2. Cài **TikTok LIVE Studio** (chỉ có bản Windows) từ trang chính thức của TikTok, đăng nhập đúng tài khoản kênh.
3. Cách đưa hình thiền đường vào LIVE Studio — chọn 1 trong 2:
   - **LIVE Studio trực tiếp**: thêm nguồn hình ảnh dạng **Window Capture / Bắt cửa sổ** → chọn cửa sổ Chrome đang mở http://localhost:8080 → dùng tính năng **cắt (crop)** giữ đúng **khung 9:16 bên trái** (khung thiền đường). Panel điều khiển bên phải chỉ để mình xem, không cho khán giả thấy.
   - **OBS (khuyên dùng nếu muốn có tiếng TTS xướng tên)**: thêm nguồn **Browser Source**, dán `http://localhost:8080`, đặt khung dọc 1080×1920 và cắt lấy phần khung thiền đường. OBS bắt được cả âm thanh trang (tiếng đọc xướng tên) đưa vào live; rồi kết nối OBS tới TikTok bằng khóa luồng (stream key) trong LIVE Studio hoặc tính năng phát trực tiếp của tài khoản. Lưu ý giọng TTS là giọng của trình duyệt trên máy — muốn giọng hay hơn thì tắt TTS trong panel và chỉ hiện banner chữ.
4. Thứ tự mở mỗi buổi: mở live TikTok (hoặc mở LIVE Studio sẵn) → chạy bridge (`node server.js`) → mở trang localhost → kiểm tra log đã "kết nối" rồi mới bắt đầu phiên.

### (d) Quy trình test kín TRƯỚC buổi live thật đầu tiên (bắt buộc)

1. **Test không cần live**: trong thư mục `bridge`, chạy `node server.js --demo`, mở http://localhost:8080 — bridge tự phát comment/gift giả lập. Kiểm: ghế tăng dần, người tặng quà lên bảng Công Đức + hiện banner xướng tên, đầy 24 ghế thì xếp hàng, hết giờ thì nhường ghế. (Đợt QA 31/10/2026 đã kiểm chứng chuỗi này đạt — xem QA.md.)
2. **Test live kín**: dùng một tài khoản TikTok phụ mở live thử (hoặc live kênh chính vào giờ vắng), dùng tài khoản khác vào comment + tặng một món quà nhỏ nhất → đối chiếu: sự kiện hiện trong log của bridge, nhân vật vào đúng ghế, tên lên bảng Công Đức, đo **độ trễ** từ lúc gửi quà tới lúc hiệu ứng hiện (thường vài giây).
3. Chỉ khi bước 2 đạt mới lên lịch buổi live chính thức.

### (e) Nguyên tắc an toàn khi lên sóng (nhắc lại — quan trọng)

- Trình bày cơ chế như **luật tham gia của game** ghi sẵn trên màn hình ("bình luận để vào thiền", "tặng quà được xướng tên hồi hướng") — **không hô hào, không kêu gọi xin quà**, không đặt mục tiêu quà/đếm ngược quà (TikTok cấm soliciting gifts — xem mục 5).
- Giữ khung **"game thiền thư giãn"**: không mạo danh chùa, tu sĩ hay cơ sở tôn giáo có thật; tên các "thầy" trên màn hình là nhân vật của game.
- Sẵn sàng phương án dự phòng: cầu nối dùng API không chính thức nên TikTok đổi giao thức là có thể rớt — bridge đã có tự reconnect; nếu rớt hẳn giữa phiên, khởi động lại bridge là trang tự nối lại, không cần tải lại trang.

---

## 8. PHIÊN BẢN 3D (index3d.html — cập nhật 31/10/2026)

> Bản 3D dùng **Three.js** (thư viện để sẵn trong thư mục `lib/` — `three.module.js` + `three.core.js` + `RoomEnvironment.js`, bản three@0.186.1, chạy offline không cần CDN). Bản 2D (`index.html`) giữ nguyên, không bị ảnh hưởng.

### Cách mở bản 3D

- **Bắt buộc mở qua bridge** (hoặc một server tĩnh bất kỳ): chạy bridge như mục 7(a), rồi mở **http://localhost:8080/index3d.html**. Lý do: bản 3D nạp thư viện bằng ES module — trình duyệt **chặn module khi mở bằng file://**, nên mở file trực tiếp sẽ không chạy (khác bản 2D mở file:// được).
- Nối Bridge giống hệt bản 2D: trang tự nối WebSocket `/live`; chat → vào ngồi/đổi hình, gift → ưu tiên ngồi + Công Đức + xướng tên TTS + vòng sáng dưới bồ đoàn. Avatar TikTok thật của người xem (bridge đã gửi kèm) hiện trên bảng tên 3D; nếu ảnh avatar không tải được (CORS) thì bảng tên tự dùng chữ cái đầu của tên.
- **Toàn bộ luật chơi giữ nguyên y hệt bản 2D**: 24 ghế 4×6, hàng chờ FIFO + chen hàng bằng quà, đang ngồi tặng quà → +60 giây, đếm ngược phiên 10 phút, reset phiên.

### Cảnh 3D có gì

- **Tượng Phật Tổ** dựng bằng hình học Three.js (primitives + lathe): thân/bệ sen tiện theo biên dạng, chân kiết già, tay thiền định trong lòng, búi tóc ushnisha, tai dài — một chất liệu **vàng đồng PBR** (metalness 0,9, roughness ~0,33) phản chiếu môi trường IBL (RoomEnvironment qua PMREM, cường độ thấp 0,45 theo nguyên tắc ánh sáng mềm của lemo-opuscar TECHNIQUE.md §9). Hào quang: đĩa gradient phát sáng + vòng torus emissive + PointLight ấm phía trước tượng.
  - *Về model GLB*: đã tìm nguồn model tượng Phật giấy phép CC0/CC-BY tải trực tiếp được nhưng không có nguồn đạt (các kết quả đều khóa sau đăng nhập/VIP hoặc giấy phép royalty-free không rõ ràng, file rất nặng) → chọn dựng bằng primitives để chủ động hoàn toàn về giấy phép và dung lượng.
- **Người ngồi thiền**: figure dựng bằng code theo tỷ lệ người thật (chân bắt chéo, thân, tay về lòng, đầu/cổ) — áo lam/xám cho "nam", nâu/trắng + búi tóc cho "nữ", vàng cam + đầu trọc cho "sư"; có **hoạt ảnh hơi thở** (thân phồng/xẹp rất nhẹ, đầu gật siêu nhẹ, lệch pha từng người), hiệu ứng xuất hiện bằng trụ sáng + trồi lên, người tặng quà có **vòng sáng nhấp nháy dưới bồ đoàn** và viền vàng trên bảng tên.
- **Hiệu ứng**: khói hương 140 hạt xoáy lên từ lư hương trên bàn thờ, 220 hạt bụi sáng lơ lửng khắp sảnh, lửa nến sprite phấp phới kèm 2 PointLight nhấp nháy, camera trôi rất chậm qua lại. 3 thầy cố định (Thầy Minh Đạo, Sư Trụ Trì, Thầy Tâm Từ) ngồi phía trước, quay mặt ra khán giả.
- **Hiệu năng đã đo** (xem QA.md đợt 3): ~510–590 draw calls (gồm lượt vẽ bóng), ~160–185 nghìn tam giác, 360 hạt tổng cộng — nhẹ với máy có GPU; khuyến nghị máy **16GB RAM** như mục 3 nếu chạy cùng LIVE Studio. Tắt bóng đổ (shadow) là cách giảm tải đầu tiên nếu máy yếu: sửa `renderer.shadowMap.enabled = false` trong `index3d.html`.

### Nhạc Phật (riêng bản 3D)

- Panel có nút **"▶ Bật nhạc Phật"** + thanh trượt âm lượng. Nhạc chỉ phát sau khi bấm (chính sách autoplay của trình duyệt) — khi live bằng OBS/LIVE Studio: mở trang, bấm nút một lần, rồi mới bắt đầu phiên.
- Mặc định trang phát **bản thiền tự tổng hợp bằng WebAudio** (pad trầm + chuông bát hát ngân dài + mõ nhẹ) — tự sinh trong trình duyệt, không dính bản quyền.
- Muốn dùng nhạc thật: bỏ file nhạc **có quyền sử dụng** vào thư mục `music/`, đặt tên `nhac-phat.mp3` — trang tự dùng file đó thay bản tổng hợp. Chi tiết + cảnh báo bản quyền: xem `music/README.md`.

### Chọn bản nào khi live

| Tiêu chí | Bản 2D (`index.html`) | Bản 3D (`index3d.html`) |
|---|---|---|
| Hình ảnh | Emoji + CSS, phẳng | 3D thật: tượng Phật vàng, người có hơi thở, khói hương, nến |
| Máy yếu / laptop cũ | **Hợp** — chạy nhẹ, mở file:// cũng được | Không hợp — cần GPU + mở qua bridge |
| Ổn định khi live dài | Rất ổn định | Ổn định, nhưng nặng hơn; nên test kín trước |
| Nhạc Phật tích hợp | Không có | **Có** (tự tổng hợp hoặc file `music/nhac-phat.mp3`) |
| Luật chơi / nối Bridge | Giống hệt nhau | Giống hệt nhau |

Khuyến nghị: live chính thức bằng **bản 3D** trên máy Windows có GPU (kể cả GPU tích hợp đời mới) sau khi test kín; giữ **bản 2D** làm phương án dự phòng khi máy trục trặc.

### Đợt 4 — Nâng độ thật (bổ sung 31/10/2026)

- **Tượng Phật + người đã có khuôn mặt đầy đủ** (mắt nhắm, lông mày, mũi, miệng, tai): Phật thêm **tai dài chạm vai**, **~150 lọn tóc xoắn ốc**, chấm urna, **nếp gấp áo cà sa**, ngón tay; người thêm thân lathe mềm, tay có khuỷu + ngón, bàn chân, nếp gấp vải. Toàn bộ vẫn dựng bằng hình học trong code — đã rà kỹ các kho model CC0/CC-BY (Poly Pizza, Quaternius, Khronos, Smithsonian, GitHub, OpenGameArt) và **không có model tượng Phật/người ngồi thiền nào đạt chuẩn giấy phép + tải trực tiếp + trang nghiêm** (chi tiết: `QA.md` đợt 4, ghi công: `CREDITS.md`).
- **Hiệu ứng phát sáng (bloom)**: hào quang, lửa nến, vòng sáng ghế quà phát sáng thật nhờ hậu kỳ UnrealBloom rất nhẹ. **An toàn hiệu năng 2 lớp**: (1) trang **tự tắt bloom** nếu FPS trung bình của 5 giây đầu < 40 (có ghi log trong panel — đã kiểm chứng chạy thật); (2) tắt thủ công bằng tham số **`?nopost=1`** khi biết máy yếu.
- **Góc xem cận cảnh tượng** (để kiểm tra/so sánh, không dùng khi live): mở `index3d.html?cam=phat` (kèm `&shot=1` nếu muốn ẩn panel). Ảnh mẫu: `qa-screenshot-3d-v2-phat.png`; ảnh toàn cảnh bản mới: `qa-screenshot-3d-v2.png`.
- **Thả model thật sau này**: nếu tìm được tượng Phật GLB đạt chuẩn (CC0/CC-BY, ≤ ~15MB), đặt tên file **`buddha.glb`** vào thư mục `models/` — trang tự thay tượng dựng bằng code bằng model thật, giữ nguyên bệ sen + hào quang (hướng dẫn: `models/README.md`; nếu là CC-BY nhớ ghi tác giả vào `CREDITS.md`).
- Khói hương đã làm mềm và chậm hơn; sàn có tối vignette nhẹ quanh mép để tập trung mắt vào chính điện.

## 9. PHIÊN BẢN 2D CHÂN THẬT (index-real.html — bổ sung 31/10/2026)

Theo chỉ đạo của Lão tổng sau khi xem bản 3D đợt 4 (góc nhìn chưa đủ rộng, tượng Phật và dáng người dựng bằng khối chưa đủ thật): chuyển sang **2D nhưng hình ảnh phải chân thật và thiêng liêng** — dùng ẢNH VẼ AI chi tiết cao làm nền + sprite nhân vật, thay hoàn toàn hình dựng bằng code. Luật chơi, HUD, panel giả lập, TTS, nhạc Phật và giao thức bridge **giữ nguyên 100%** như các bản trước; các bản cũ (`index.html`, `index3d.html`) vẫn giữ nguyên làm phương án dự phòng.

### Cách mở bản 2D chân thật

- Mở qua bridge như thường: chạy bridge (mục 7) rồi vào `http://localhost:8080/index-real.html` — trang tự nối WebSocket nhận sự kiện thật; bridge đã phục vụ sẵn `.jpg/.png` nên không cần sửa gì.
- Mở file trực tiếp (`file://.../index-real.html`) vẫn chạy chế độ giả lập bằng panel.
- Tham số hỗ trợ QA: `?qa` = chỉ hiện khung live 540×960 (ẩn panel) để chụp kiểm chứng; `?fill` = tự đổ đầy 24 ghế + hàng chờ + vài món quà (chỉ dùng khi kiểm tra).

### Tài sản ảnh (thư mục `assets/` — prompt gốc đầy đủ trong `assets/PROMPTS.md`)

| File | Nội dung |
|---|---|
| `nen-chanh-dien.jpg` | Nền chánh điện 9:16 (1152×2048): tượng Phật Tổ vàng mặt trước, kiết già trên đài sen, hào quang; bàn thờ nến + lư hương + hoa sen; cột đỏ, đèn lồng; nửa dưới là thảm đỏ TRỐNG để phủ lưới ghế |
| `nam.png` / `nu.png` / `su.png` | Sprite gốc trên nền xanh lá đặc: nam áo tràng lam tóc ngắn; nữ áo nâu viền trắng tóc búi cao; sư đầu trọc cà sa vàng cam — tất cả nhìn từ phía sau, ngồi kiết già trên bồ đoàn mây |
| `nam-tach-nen.png` / `nu-tach-nen.png` / `su-tach-nen.png` | Bản đã tách nền (chroma key bằng PIL: ngưỡng xanh 25→85, despill, mờ cạnh 1px) — trang web dùng 3 file này |

### Bố cục + hiệu ứng

- **Lưới ghế phối cảnh** 4 cột × 6 hàng phủ lên vùng thảm đỏ của ảnh nền: hàng xa (gần bàn thờ) sprite rộng 11,8% khung, hàng gần 21,6%; mốc đáy bồ đoàn từ 68,5% → 95% chiều cao; độ tỏa ngang của cột khớp hình thang thảm. 3 thầy cố định (sprite sư) ngồi sát bậc thềm ở mốc 63,2%.
- Ghế trống chỉ hiện bồ đoàn vẽ CSS + số ghế mờ; ghế có người hiện sprite + bảng tên (avatar TikTok thật nếu bridge gửi, không có thì chữ cái đầu) + đồng hồ đếm ngược ngay trên đầu; người tặng quà có quầng sáng vàng dưới bồ đoàn + viền bảng tên phát sáng.
- Hiệu ứng 2D nhẹ phủ trên nền: tia hào quang xoay rất chậm quanh tượng, 4 quầng sáng nến nhấp nháy đúng vị trí nến trong ảnh, khói hương hạt canvas bốc lên từ lư hương ở giữa bàn thờ, hạt sáng vàng lơ lửng, tối vignette nhẹ ở mép. Vào ghế: nhân vật hiện dần + vòng sáng lan tỏa; nhân vật có chuyển động "thở" rất nhẹ (scale 1↔1,014).
- Nhạc Phật: y hệt bản 3D (WebAudio tự tổng hợp mặc định, tự dùng `music/nhac-phat.mp3` nếu có, nút bật/tắt + âm lượng trong panel).

### Thay ảnh nền / sprite mới

1. Tạo ảnh mới theo prompt trong `assets/PROMPTS.md` (giữ đúng: nền 9:16 có vùng thảm trống phía dưới; sprite nền xanh đặc, nhìn từ sau, toàn thân trong khung).
2. Nếu là sprite: chạy lại tách nền (công thức trong PROMPTS.md) và ghi đè file `*-tach-nen.png`.
3. Nếu ảnh nền mới có vùng thảm lệch so với ảnh hiện tại: chỉnh bảng `ROWS` (base/w/spread) trong `index-real.html`, chụp lại bằng `?qa` và đối chiếu — mỗi hàng ghế phải nằm gọn trên thảm, bồ đoàn không trồi lên bậc thềm.

### Chọn bản nào khi live

Bản 2D chân thật là bản **nhẹ nhất và hình ảnh thật nhất** hiện có — ưu tiên dùng khi máy live yếu hoặc khi muốn hình ảnh trang nghiêm như tranh. Bản 3D giữ làm phương án khi muốn chuyển động camera/không gian 3D thật.

### Nhạc nền — Đợt 8: file nhạc thật có mõ + chuông, loop liền mạch (31/10/2026)

Từ Đợt 8, thư mục `music/` đã có sẵn **`nhac-phat.mp3`** — bản phối do dự án tự
sản xuất từ nguồn giấy phép sạch (dùng thương mại được, không cần ghi công),
thay cho việc phải tự tìm nhạc:

- **Thành phần**: nền pad thiền "Beautiful Meditation" (AtlasAudio, Pixabay
  Music) + tiếng gõ mõ thật (Freesound #607215, CC0) gõ đều mỗi 2 giây +
  tiếng chuông thật (Freesound #561807, CC0) điểm ở đầu vòng và mỗi ~110 giây.
  Chi tiết nguồn + giấy phép + các ứng viên đã loại: `music/NGUON-VA-GIAY-PHEP.md`.
- **Thông số**: dài 330 giây (5:30), vòng lặp liền mạch đã kiểm chứng bằng số
  (không click, không nhảy âm lượng tại điểm nối), −22,3 LUFS, true peak
  −6,8 dBTP — êm dưới giọng đọc TTS. Bản master WAV + file gốc từng thành
  phần: `music/sources/`.
- **Cách thay file khác**: ghi đè `music/nhac-phat.mp3` bằng file MP3 khác CÓ
  QUYỀN SỬ DỤNG (tự thu hoặc nguồn giấy phép rõ ràng); mỗi lần thay, ghi bổ
  sung nguồn + giấy phép vào `music/NGUON-VA-GIAY-PHEP.md`. Tuyệt đối không
  dùng nhạc tải từ YouTube/TikTok không rõ quyền khi live kiếm tiền.
- **Trạng thái nối vào trang**: Đợt 8 chỉ giao FILE + tài liệu, không sửa
  trang. Trang hiện đã có sẵn cơ chế tự nhận diện đúng đường dẫn
  `music/nhac-phat.mp3` (có file thì dùng file, thiếu thì dùng bản WebAudio tự
  tổng hợp, thuộc tính loop bật sẵn) — đợt nâng cấp **Pro Max** sẽ chốt cơ chế
  chọn nguồn nhạc/nút chọn nhạc chung với hệ thống nghi lễ.

## 10. ĐỢT 6 — QUÀ TIKTOK THẬT + THANG GIỜ QUÀ + GHẾ VIP + HIỆU ỨNG ĐỔI NGƯỜI (index-real.html, 31/10/2026)

Áp dụng cho bản 2D chân thật (`index-real.html`). Ba thay đổi luật ở đợt này:
giờ ghế tính theo giá trị quà (bỏ +60s cố định), 5 ghế VIP cho người tặng quà
giá trị cao, và bộ ba tượng Phật (Tam Thế Phật) thay 3 thầy cố định trên thềm.

### Bảng quà TikTok (cấu hình `GIFT_TABLE` trong trang)

Đối chiếu **2 nguồn độc lập**, đọc trực tiếp ngày 31/10/2026:

- **Nguồn A — ReelShift** (reelshift.app/blog/tiktok-gift-values, cập nhật
  16/10/2026): tuyên bố trích từ danh sách quà mà trình phát LIVE web của
  TikTok nạp (trường diamond_count), đối chiếu US + global.
- **Nguồn B — Coinvertify** (coinvertify.com/tiktok-gifts, crawl 31/10/2026):
  liệt kê 234 quà kèm giá.

Hai nguồn **khớp nhau ở mọi mốc chung đã kiểm**. Bảng rút gọn 42 quà đã nhúng
vào trang (tên tiếng Anh như TikTok hiển thị → giá xu):

| Quà | Xu | Quà | Xu |
|---|---|---|---|
| Rose | 1 | Swan | 699 |
| TikTok | 1 | Galaxy | 1.000 |
| GG | 1 | Chasing the Dream | 1.500 |
| Ice Cream Cone | 1 | Whale diving | 2.150 † |
| Heart Me | 1 | Meteor Shower | 3.000 |
| Team Bracelet | 2 † | Private Jet | 4.888 |
| Finger Heart | 5 | Leon the Kitten | 4.888 |
| Panda | 5 | Drama Queen | 5.000 |
| Rosa | 10 † | Sports Car | 7.000 |
| Perfume | 20 | Interstellar | 10.000 |
| Doughnut | 30 | Rosa Nebula | 15.000 |
| Sign language love | 49 † | TikTok Shuttle | 20.000 |
| Paper Crane | 99 † | Phoenix | 25.999 |
| Cap | 99 | Dragon Flame | 26.999 |
| Hand Heart | 100 | Lion | 29.999 |
| Confetti | 100 | Gorilla | 30.000 |
| Sunglasses | 199 | Leon and Lion | 34.000 |
| Corgi | 299 | Zeus | 34.000 |
| Money Gun | 500 | TikTok Universe+ | 34.999 |
| | | Thunder Falcon / TikTok Stars | 39.999 |
| | | Fire Phoenix | 41.999 |
| | | Pegasus | 42.999 |
| | | **TikTok Universe (đắt nhất hiện hành)** | **44.999** |

† = chỉ có ở 1 nguồn (Coinvertify), **chưa kiểm chứng chéo** — các món còn lại
đều khớp ≥ 2 nguồn.

**Lưu ý quan trọng:**
- Giá xu **có thể lệch theo khu vực/thời điểm**; TikTok thay đổi bảng quà theo
  đợt. Khi cần số chính xác tại thời điểm live, lấy số từ sự kiện bridge (mục
  dưới) — bảng trong trang chỉ là dự phòng.
- **Heart Me hiện là 1 xu** theo cả 2 nguồn tháng 10/2026 (một số bảng cũ ghi
  25 xu — đã lỗi thời).
- **TikTok Universe hiện hành = 44.999 xu**; con số 34.999 ở các bảng cũ là
  của **TikTok Universe+** (vẫn tồn tại song song).
- Có 2 quà trùng tên "Sports Car" (4.999 và 7.000 xu) ở một số danh sách —
  trang dùng mốc 7.000; khi bridge gửi số xu thật thì số bridge thắng.

**Bảng quà dùng để:** (a) hiển thị đúng tên quà trong banner xướng tên;
(b) **dự phòng** tính xu khi sự kiện bridge thiếu số xu (`coins = 0`):
`xu = GIFT_TABLE[tên quà] × số lượng`. Số xu chính luôn lấy từ bridge.

### Xử lý quà combo (tránh cộng trùng)

Quà streak (giftType 1 của TikTok) phát sự kiện theo từng nhịp combo. Bridge
(`bridge/server.js`) **chỉ phát 1 sự kiện gift duy nhất khi combo kết thúc**
(`repeatEnd = true`), với `coins = giá 1 món × tổng số lượng` và `count = tổng
số lượng`. Trang cộng đúng 1 lần theo tổng đó — không cộng theo từng nhịp.
Quà thường (không streak) phát ngay, `count` thường = 1.

### Thang giờ ghế theo quà (cấu hình `GIFT_SECONDS` trong trang)

| Giá trị quà (xu) | Giờ cộng |
|---|---|
| 1 | **+5 giây (mức thấp nhất)** |
| 2–9 | +10 giây |
| 10–49 | +30 giây |
| 50–99 | +60 giây |
| 100–299 | +120 giây |
| 300–499 | +240 giây |
| 500–999 | +300 giây |
| 1.000–4.999 | +600 giây |
| ≥ 5.000 | +900 giây |

- **Cộng dồn không giới hạn:** đang ngồi tặng tiếp → cộng vào giờ còn lại.
- Chưa ngồi mà tặng → ghi Công Đức + giữ **"tín dụng thời gian"**; khi vào
  ngồi (kể cả sau thời gian chờ hàng) tín dụng được cộng vào giờ ghế đầu tiên.
- Giờ ngồi cơ bản khi vào bằng comment giữ nguyên (ô "Thời gian ngồi cơ bản"
  ở panel, mặc định 120 giây — khi live thật nên đặt 600 giây = 10 phút).
- Banner xướng tên luôn ghi rõ "+Xs" của món quà vừa nhận.

### 5 ghế VIP (cấu hình `VIP_MIN_SINGLE = 1000`, `VIP_CUMULATIVE = 2000`)

- Hàng 5 ghế **đệm vàng** (nhãn "✦ VIP ✦", bảng tên viền vàng + chip ✦ VIP +
  vầng hào quang vàng sau đầu người ngồi) nằm ngay trước bậc thềm, dưới bộ ba
  tượng Phật. HUD có chip **"VIP n/5"** cạnh chip số người đang thiền.
- **Điều kiện đạt chuẩn VIP:** 1 lần tặng ≥ **1.000 xu**, HOẶC tổng tặng trong
  phiên ≥ **2.000 xu**. Đạt chuẩn mà đang chờ/chưa ngồi → vào thẳng ghế VIP
  nếu còn trống (vượt hàng chờ thường); đang ngồi ghế thường mà đạt chuẩn và
  VIP còn trống → thăng hạng lên VIP, giữ nguyên giờ còn lại.
- **Ghế VIP trống thì người thường KHÔNG được xếp vào** (comment thường chỉ
  vào ghế thường/hàng chờ). Ghế VIP trống cũng không tự lấp từ hàng chờ trừ
  người đã đạt chuẩn VIP.
- **Thay chỗ:** VIP đã đầy mà có người tặng 1 lần ≥ 1.000 xu **cao hơn** mức
  đạt chuẩn của người VIP đang ngồi thấp nhất → người mới vào thay chỗ đó.
  Người bị nhường ghế **giữ nguyên thời gian còn lại**, chuyển lên **ĐẦU hàng
  chờ thường**, không mất Công Đức (có hiệu ứng bay về hàng chờ + dòng thông
  báo trong panel log).
- Người ngồi VIP vẫn được cộng dồn giờ từ quà như thường; hết giờ VIP thì
  rời ghế như ghế thường. Bảng Công Đức cộng theo xu cho mọi trường hợp.

### Hiệu ứng đổi người (CSS/JS thuần, mọi hiệu ứng ≤ ~1 giây)

Vào ghế mới (nhô lên + vòng sáng + bảng tên lật vào) · từ hàng chờ lên ghế
(phiên bản kéo dài hơn của hiệu ứng vào) · rời ghế hết giờ (mờ dần + chìm
xuống) · đổi hình nam/nữ/sư (crossfade 2 sprite + nảy nhẹ + vòng sáng nhỏ) ·
vào ghế VIP (bùng sáng vàng + cánh sen/hạt vàng rơi + bảng tên quét sáng) ·
bị nhường ghế VIP (mờ dần bay về phía hàng chờ). Sự kiện đến dồn dập thì hiệu
ứng chỉ cộng lớp CSS rồi tự gỡ — không chặn nhịp xử lý.

### Bộ ba tượng Phật thay 3 thầy

3 nhân vật thầy cố định (Thầy Minh Đạo, Sư Trụ Trì, Thầy Tâm Từ) đã gỡ khỏi
cảnh. Thay bằng sprite **Tam Thế Phật** (`assets/tam-the-phat-tach-nen.png` —
3 tượng vàng kiết già trên đài sen liền, tách nền cùng công thức chroma) đặt
trên bậc thềm ở đúng vị trí cũ, nhỏ hơn tượng Phật Tổ chính trong ảnh nền,
không gắn bảng tên. Hàng ghế VIP nằm ngay trước thềm, không chồng lấn tượng.

## 11. CHẾ ĐỘ MƯỢT THÍCH ỨNG (Đợt 7 — index-real.html, 31/10/2026)

Trang tự đo FPS chạy nền và tự giảm hiệu ứng môi trường khi máy yếu, để buổi
live không bị khựng hình. Có 3 chế độ, chọn theo 2 cách:

- **Bấm nút "🎛 Mượt:"** trên thanh HUD (cạnh pill Phiên): mỗi lần bấm luân
  phiên **Tự động → Cao → Thấp → Tự động…**
- **Tham số URL** khi mở trang: `?perf=auto` / `?perf=high` / `?perf=low`
  (ví dụ nguồn Browser Source trong OBS: `http://localhost:8080/?perf=auto`).
  Không ghi gì thì mặc định là **Tự động**.

Hành vi từng chế độ:

- **Tự động (nên dùng khi live):** bắt đầu ở chất lượng đầy đủ. Nếu FPS trung
  bình tụt dưới 45 trong 3 giây liên tục, trang tự hạ 1 nấc (tối đa 2 lần).
  Đã hạ thì không tự nâng lại giữa buổi (tránh hình lúc đẹp lúc xấu qua lại);
  muốn về đầy đủ thì bấm nút về **Cao** hoặc **Tự động** lại.
- **Cao:** khóa chất lượng đầy đủ, không tự hạ — chỉ dùng khi máy phát mạnh.
- **Thấp:** khóa ở mức nhẹ nhất ngay từ đầu — dùng khi máy phát yếu hoặc vừa
  phát vừa chạy nhiều phần mềm nặng.

Các nấc cắt gì (chỉ cắt hiệu ứng MÔI TRƯỜNG, không cắt hiệu ứng đổi người):

- **Nấc 1:** số hạt sáng giảm một nửa, khói hương thưa hơn, tia hào quang quanh
  tượng Phật đứng yên thay vì xoay.
- **Nấc 2:** tắt hẳn khói/hạt, quầng nến đứng tĩnh (vẫn sáng), người ngồi hết
  "thở" nhẹ, bỏ các bóng đổ trang trí còn lại (khung viền, bảng tên, đệm ghế).
- Hiệu ứng **vào ghế / rời ghế / đổi hình / vào ghế VIP / nhường ghế** và banner
  xướng tên quà chạy ĐẦY ĐỦ ở mọi nấc — khán giả không thấy khác biệt về luật chơi.

Khuyến nghị vận hành: cứ để **Tự động**. Nếu thấy hình vẫn khựng sau khi trang
đã tự hạ nấc (nhật ký hoạt động trong panel sẽ ghi "Chế độ mượt: chuyển xuống
nấc…"), chuyển hẳn sang **Thấp**; nếu máy khỏe và muốn đẹp nhất, chọn **Cao**.

---

# Đợt 9 · PRO MAX — nghi lễ quà, khu đứng đại chúng, mục tiêu chung (31/10/2026)

## Bản đồ quà → nghi lễ hiện hình

Mỗi món quà (theo TÊN từ bridge/bảng quà) hiện một nghi lễ ở lối giữa + bàn
thờ; combo gộp chỉ kích hoạt 1 lần theo tổng xu. Quà ngoài danh sách: vẫn
banner xướng tên + cộng giờ/Công Đức như cũ.

- **Hoa hồng** → người tặng tự lên thắp hương (mục dưới) + mưa cánh sen nhẹ.
- **TikTok** → nến sen bừng sáng trên bàn thờ.
- **Tim ngón tay** → nến sen nhỏ + tim sáng bay lên từ chỗ người tặng.
- **Nước hoa** → hoa sen hồng lớn nở giữa sân.
- **Bánh donut** → thỉnh chuông (chuông đồng bên phải rung + sóng âm + tiếng).
- **Tay bắn tim** → mâm ngũ quả trên bàn thờ, ở ~20 giây rồi mờ.
- **Corgi** → đàn cá chép 2 màu bơi ngang dưới cảnh.
- **Súng tiền** → thả 6 hoa đăng bay lên.
- **Thiên hà** → hoa đăng lớn + bùng sáng vàng (đồng thời vẫn tính mốc VIP).
- **Sư tử** → ĐẠI CÔNG ĐỨC: rồng vàng bay ngang + mưa tiền vàng + băng rôn.
- **TikTok Universe** → rồng + mưa tiền + quét sáng toàn cảnh + chuông điểm.

## Luật khu đứng phía dưới (thay lớp đại chúng ngồi — chốt 14:19 31/10)

- Người mới vào phòng, hoặc bình luận khi 24 ghế đã đầy (đang ở hàng chờ), sẽ
  hiện hình NGƯỜI ÁO LAM ĐỨNG ở khu tiền cảnh dưới cùng của sân (14 vị trí, 2
  hàng so le, chừa lối giữa): đi bộ từ cổng dưới vào vị trí rồi đứng yên.
- Người đứng không có đồng hồ ghế, ở tới hết phiên; khi được vào ghế/VIP thì
  hình đứng tự rời đi. Số trên HUD vẫn chỉ đếm ghế thật (24 + 5 VIP).
- Bình luận tiếp theo của người đang ngồi/đang đứng hiện thành BONG BÓNG LỜI
  CẦU trên đầu ~4 giây (mỗi người tối thiểu 6 giây mới hiện lại, tối đa 6
  bong bóng cùng lúc; gõ đúng từ khóa nam/nữ/sư thì là lệnh đổi hình, không
  hiện bong bóng).

## Luật thắp hương cá nhân

- Tặng **Hoa hồng** hoặc **Bó hoa** → CHÍNH nhân vật của người tặng đi bộ dọc
  lối giữa lên lư hương giữa trước bàn thờ, khom người thắp hương (nén hương
  bừng sáng + cột khói) rồi quay về đúng vị trí cũ. Mỗi lượt ~5 giây; nhiều
  người cùng tặng thì xếp hàng lần lượt; nghi lễ lớn không bị hàng này chặn.
- Người đi thắp hương KHÔNG mất ghế: vị trí và giờ ghế/VIP giữ nguyên trong
  lúc đi (hình ngồi mờ đi làm dấu giữ chỗ).

## Luật TIẾNG thắp hương (chốt 14:40 31/10)

- Khi nhân vật khom người thắp hương: phát **3 tiếng GÕ MÕ** liên tiếp, nhịp
  chậm trang nghiêm (cách nhau 0,9 giây), mẫu mõ CC0 trong music/sources/.
- Riêng **Bó hoa** (quà lớn hơn Hoa hồng): thêm **1 TIẾNG CHUÔNG** ngân sau
  nhịp mõ cuối (mốc 2.900ms).
- Âm lượng vừa phải (mõ 0,7 · chuông 0,8): nổi trên nhạc nền nhưng không giật
  mình. Mọi tiếng nghi lễ (mõ/chuông thỉnh chuông/Đại lễ/Universe) đi qua một
  HÀNG ĐỢI TIẾNG chung — đang có nghi lễ khác phát tiếng thì xếp hàng, không
  chồng tiếng. Tiếng chỉ phát sau khi trang được mở khóa âm thanh bằng tương
  tác đầu tiên của chủ phòng (như cơ chế nhạc: bấm bất kỳ đâu một lần khi mở
  trang lên sóng).

## Mục tiêu Công Đức toàn phòng + Đại lễ

- Thanh tiến trình ngay dưới HUD cộng dồn tổng xu cả phòng trong phiên; các
  mốc **200 / 1.000 / 5.000** (đổi tại hằng số ROOM_MILESTONES trong trang).
- Chạm mốc → **ĐẠI LỄ DÂNG HƯƠNG**: chuông điểm 3 lần, sen nở lớn giữa sân,
  quét sáng vàng, băng rôn thông báo và **+30 giây cho mọi người đang ngồi**
  (ghế thường + VIP). Mỗi mốc chỉ diễn 1 lần/phiên.

## Nhạc nền + mẫu tiếng

- Nhạc nền: file **music/nhac-phat.mp3** (đợt 8) — trang tự dùng + lặp vòng
  khi có file; thiếu file thì dùng nhạc WebAudio tự tổng hợp dự phòng.
- Tiếng chuông/mõ cho nghi lễ: **music/sources/bell.mp3** (chuông) và
  **music/sources/mo.mp3** (mõ) — bản sao ngắn từ các file nguồn CC0 cùng thư
  mục; nguồn + giấy phép: music/NGUON-VA-GIAY-PHEP.md.

# Đợt 10 · Ghế khán giả nam/nữ + lễ BÁI đi–quỳ–lạy–đứng + ngưỡng 50 xu (31/10/2026)

Theo phản hồi trực tiếp của Lão tổng 14:58 + 2 luật bổ sung 15:01 ngày 31/10. Trang chính vẫn là `index-real.html`.

## Phân tầng người xem (MỚI — thay hẳn khu đứng đợt 9)

1. **Vào phòng / bình luận → GHẾ KHÁN GIẢ phía dưới sân**: 2 khối trái/phải (chừa đường giữa), mỗi khối 3 hàng × 5 ghế = **30 ghế khán giả**. Người vào được **đi bộ** từ cổng (giữa, dưới sân) vào ngồi ghế trống; không tính giờ, ở tới hết phiên. Đầy 30 ghế → người mới được ghi nhận (ghế thiền/hàng chờ như thường) nhưng không hiện hình khán giả.
2. **Hình khán giả CHỈ NAM hoặc NỮ** (luật 15:01): dùng chính sprite nam/nữ chân thật của trang, thu nhỏ theo cỡ khán giả — KHÔNG dùng sprite áo lam đại chúng nữa. Hình theo lệnh đổi hình của chính người đó (gõ `nam`/`nữ`); chưa chọn → hệ thống **gán luân phiên nam/nữ** theo thứ tự vào cho đám đông tự nhiên. Gõ đổi hình khi đang ở ghế khán giả → hình đổi ngay tại chỗ.
3. **Tặng quà bất kỳ → LỄ BÁI** (xem dưới) rồi quay về đúng chỗ cũ (ghế khán giả / ghế thiền / ghế VIP).
4. **Tặng 1 lần từ 50 xu → sau khi bái xong được LÊN GHẾ THIỀN** có giờ theo thang `GIFT_SECONDS` như cũ (cấu hình `SEAT_GIFT_MIN = 50`). Hết ghế thiền → vào hàng chờ như luật cũ, vẫn được bái trước.
5. **Quà dưới 50 xu → chỉ bái + cộng Công Đức + cộng tín dụng giờ** như cơ chế cũ (đang ngồi thì +5 giây; đang chờ thì giữ tín dụng trong "bank"/hàng chờ). ĐÂY LÀ THAY ĐỔI so với trước: trước đợt 10, quà nhỏ cũng có thể nhận ghế thiền ngay khi còn ghế; từ đợt 10, **ghế thiền trực tiếp chỉ mở cho quà 1 lần ≥ 50 xu** (hoặc vào ghế bằng bình luận khi còn ghế trống như cũ — đường bình luận không đổi).
6. **VIP giữ nguyên luật đợt 6**: 1.000 xu/lần hoặc 2.000 xu/phiên, luật nhường ghế không đổi. Người đạt VIP từ ghế khán giả → đi bộ thẳng lên ghế VIP.

## Lễ BÁI (nâng cấp thắp hương đợt 9)

- Chuỗi động tác đầy đủ, chuyển động liền mạch: **đi bộ dọc đường giữa → QUỲ (chắp tay) → LẠY 2 lạy (cúi rạp, trán gần chạm đất) → ĐỨNG dậy → đi bộ về đúng vị trí cũ**. Chuyển tư thế bằng crossfade ảnh (bộ tư thế đứng/quỳ/lạy riêng cho nam/nữ/sư — xem `assets/PROMPTS.md` mục 14), chuyển vị trí bằng easing; tổng 1 lượt ~8–10 giây.
- Hoa hồng / Bó hoa: kèm **thắp hương** — hương trước bàn thờ bừng sáng + khói ở nhịp lạy đầu. TIẾNG giữ nguyên luật đợt 9: 3 tiếng mõ nhịp 0,9 giây khi bắt đầu lạy; Bó hoa thêm 1 tiếng chuông.
- Trong lúc đi bái: **ghế + giờ giữ nguyên** (hình ngồi mờ làm dấu giữ chỗ), Công Đức cộng như thường. Người đi bái xong mới nhận ghế thiền (nếu đạt ngưỡng 50 xu) — thứ tự luôn là bái trước, nhận ghế sau.

## Hết giờ ghế thiền → VỀ GHẾ KHÁN GIẢ (luật 15:01 — thay "biến mất")

- Người hết giờ sẽ **đứng dậy, đi bộ về khu khán giả** và ngồi lại vào ghế khán giả trống (tiếp tục làm khán giả bình luận như trước).
- Chỉ khi **khu khán giả đã đầy** mới mờ dần biến mất như cách cũ. Cuối phiên (reset) mọi người vẫn mờ dần như cũ.

## Người nhỏ hơn + hiệu ứng hòa cảnh hơn (theo phản hồi "giả trân")

- Cỡ hiển thị: ghế thiền + VIP giảm ~20% so với đợt 9 (hàng xa nhỏ hơn hàng gần như cũ); khán giả nhỏ rõ rệt; bảng tên thu gọn theo.
- Mọi nhân vật có **bóng ellipse mềm nướng sẵn** dưới chân/ghế; sprite mới chỉnh tông ấm khớp nền, mép alpha feather nhẹ.
- Hiệu ứng nghi lễ đợt 9 giữ đủ nhưng **giảm chói/bão hòa** (mưa tiền thưa và chậm hơn, rồng vàng dịu màu + bay chậm, bùng sáng nhẹ hơn), vật thể nghi lễ có bóng đổ mềm, cánh sen có độ mờ theo khoảng cách (cánh xa nhỏ + mờ hơn).

## Không đổi ở đợt 10

Thang `GIFT_SECONDS`, 5 ghế VIP + luật nhường ghế, bảng quà `GIFT_TABLE`, Tam Thế Phật, giao thức bridge, TTS xướng tên, bản đồ quà → nghi lễ đợt 9, hàng đợi tiếng `Sfx` + luật tiếng thắp hương, nhạc nền đợt 8, chế độ mượt 3 nấc.

# Đợt 11 · TOP xếp hạng + KHU ĐỨNG 100 người + đi–bái theo bảng tư thế + chánh điện rộng (31/10/2026)

## TOP LÀ XẾP HẠNG (luật MỚI — THAY THẾ luật VIP của đợt 6)
- 5 ghế TOP vàng thuộc về **5 người có TỔNG Công Đức (xu) trong phiên cao nhất**, cập nhật ngay sau mỗi món quà. **Không còn ngưỡng** 1.000 xu/lần hay 2.000 xu/phiên của luật VIP cũ.
- Người ngoài TOP mà tổng vượt người thấp nhất đang ở TOP → **đổi chỗ**: người bị vượt đi xuống (về đầu hàng chờ nếu còn giờ, không thì về khu đứng), cả hai giữ nguyên Công Đức và giờ còn lại.
- Chưa đủ 5 người tặng quà thì TOP lấp theo thứ hạng bất kể số xu (người tặng 49 xu đầu tiên vẫn lên TOP). Người ở TOP tiếp tục tặng → hạng tính lại theo tổng mới.
- Người ở TOP hết giờ hoặc tự rời → về khu đứng và không tự quay lại TOP cho tới khi tặng quà mới.
- Tên gọi đổi hẳn: pill "✦ TOP n/5", đệm "✦ TOP ✦" (không còn chữ VIP trên màn hình).

## KHU ĐỨNG phía dưới (thay hẳn khu ghế ngồi của đợt 10)
- Sân chia 2 phần: phần trên là ghế thiền + TOP hai bên đường giữa; phần dưới (dưới vạch "KHU ĐỨNG") là lưới đứng phối cảnh **tối đa 100 người** (10 hàng × 10 cột, hàng xa nhỏ hơn).
- Vào phòng/bình luận → đứng ở một vị trí trống (hình nam/nữ rất nhỏ, không bảng tên cố định vì quá đông). Bình luận → bong bóng lời cầu hiện trên đầu đúng người đó (tối đa 8 bong bóng cùng lúc); tặng quà/bình luận → chip tên nhỏ hiện 3–4 giây để nhận ra ai giữa đám đông.
- Hết giờ ghế thiền → đi bộ về khu đứng (chỉ khi khu đứng đầy 100 mới biến mất). Lên ghế thiền/TOP/bái đều đi bộ từ vị trí đứng của mình. HUD: pill "👥 Đứng n/100".

## Động tác đi – đứng – lạy (theo 2 bảng tư thế tham chiếu)
- Đi dọc đường giữa theo chu kỳ: nghiêng người về phía chân sắp bước → bước chân đó → nghiêng phía ngược lại → bước chân kia (~2 bước/giây, thân nhún theo nhịp) — không còn trượt. Đi ngang (rẽ vào ghế, từ khu đứng sang bên) dùng khung bước ngang 3/4: chân ngoài bước trước, chân trong theo sau.
- Lễ bái: đi → đứng nghiêm → nghiêng hạ người → quỳ (ngồi trên gót chân) → rạp dần → lạy ngũ thể đầu địa (thân rạp hẳn, trán chạm đất, hai tay duỗi thẳng úp đất, đế chân hướng về phía người xem) giữ ~0,8 giây → về quỳ → lạy lần 2 → đứng → đi về. Bỏ bước "quỳ nửa" cũ.
- Sprite lạy của nam/nữ/sư đã tạo lại đúng tư thế tham chiếu; sprite nghiêng + bước ngang là bộ khung mới của đợt này (prompt và kết quả từng lượt: `assets/PROMPTS.md` mục 15).

## Không gian chánh điện rộng hơn
- Ảnh nền mới: chánh điện rộng thoáng hơn hẳn — tượng Phật và bàn thờ nhỏ hơn, cao hơn trong khung; sàn/thảm lớn hơn nhiều; cột và đèn lồng dạt sát hai mép. Khu ghế thiền + TOP trải rộng ra hai bên, khu đứng phía dưới rộng và thưa hơn; người nhỏ đi tương ứng so với không gian là chủ ý.

## Không đổi ở đợt 11
Thang giây theo xu, ngưỡng 50 xu lên ghế thiền sau bái, bản đồ quà → nghi lễ, tiếng mõ/chuông thắp hương, mục tiêu Công Đức chung + Đại lễ, nhạc nền, giao thức bridge, TTS, chế độ mượt 3 nấc — tất cả giữ nguyên như đợt 8–10.

# Đợt 12 · Khử random vị trí + hàng TOP theo bục vinh danh (31/10/2026)

## Điểm bái CỐ ĐỊNH duy nhất (sửa lỗi "đi đến nơi vị trí random")
- Mọi lượt bái — bất kể người ở ghế thiền, ghế TOP, khu đứng hay mới vào — đều diễn ra tại ĐÚNG MỘT ĐIỂM trên trục đường giữa, trên thảm ngay trước bậc thềm. Không lệch trái/phải, không đổi theo lượt, không đổi theo kiểu người; kích cỡ người khi bái cũng được chuẩn hoá theo kiểu người (nam/nữ/sư) sao cho khung lạy cao bằng nhau. Tại một thời điểm vẫn chỉ 1 người ở điểm bái (hàng đợi như cũ).

## Khu đứng: thứ tự lấp ô CỐ ĐỊNH + nhớ ô của từng người
- Ô đứng được lấp theo thứ tự cố định: **hàng gần trước → xa sau; trong hàng, từ đường giữa ra hai phía (hoà khoảng cách thì phía trái trước)** — hàng gần nhất lấp theo x: 41 → 59 → 32 → 68 → 23 → 77 → 14 → 86 → 5 → 95, rồi tới hàng trên.
- Mỗi người giữ nguyên ô của mình suốt phiên. Hết giờ ghế thiền/TOP trở về: về ĐÚNG ô cũ nếu còn trống; nếu ô cũ đã có người khác đứng thì về ô trống đầu tiên theo thứ tự lấp ở trên.

## Hàng TOP: xếp chỗ theo BỤC VINH DANH (luật gán ghế MỚI)
- 5 ghế TOP vẫn là xếp hạng theo TỔNG Công Đức trong phiên (luật đợt 11 giữ nguyên), nhưng CHỖ NGỒI nay theo bục vinh danh: **hạng 1 ngồi chính giữa; hạng 2 bên trái hạng 1; hạng 3 bên phải hạng 1; hạng 4 ngoài cùng trái; hạng 5 ngoài cùng phải**. Các ghế thẳng một đường ngang, khoảng cách đều, cùng tỉ lệ, cân đối quanh trục giữa.
- Chip tên hàng TOP rút gọn còn một dòng: **"hạng · tên · ⏱ giờ còn"**, và các chip SO LE 2 CAO ĐỘ xen kẽ nhau (ghế 1–3–5 cao, ghế 2–4 thấp hơn một nấc) để không bao giờ đè lên nhau dù đủ 5 người cùng lúc.
- Đổi chỗ có thứ tự: người bị giáng hạng rời ghế và đi xuống TRƯỚC, người thăng hạng mới vào ghế SAU — không có khoảnh khắc hai người chồng lên cùng một ghế, không ai "nhảy cóc" vào ghế mới.

## Không đổi ở đợt 12
Thang giây theo xu, ngưỡng 50 xu lên ghế thiền sau bái, bản đồ quà → nghi lễ, tiếng mõ/chuông, mục tiêu Công Đức chung + Đại lễ, nhạc nền, bridge, TTS, chế độ mượt 3 nấc, bộ khung tư thế đợt 11 — tất cả giữ nguyên.

# Đợt 13 · KHU ĐỨNG RẢI TỰ NHIÊN — bỏ đứng xếp hàng (31/10/2026)

Theo lệnh trực tiếp của Lão tổng 19:04 31/10: khu đứng theo lưới hàng/cột (đợt 11) + thứ tự lấp ô cố định (đợt 12) nhìn lộn xộn/giả trân — **bỏ hẳn kiểu xếp hàng**, đổi sang đứng tự nhiên như đám đông thật. Mục này THAY THẾ luật bố cục khu đứng của đợt 11 và phần khu đứng của đợt 12 (điểm bái cố định + TOP bục vinh danh của đợt 12 giữ nguyên; hệ di chuyển/đi/bái không đụng).

## Luật khu đứng MỚI
- **Vị trí rải tự nhiên, xác định tuyệt đối:** 100 vị trí (50 trái + 50 phải) trong vùng đứng (y 88,6–99,2% chiều cao sân; x trái 3,5–41,5 / phải 58,5–96,5 — hành lang giữa 43–57 luôn trống). Bố cục sinh bằng PRNG có **seed cố định 20261031** (mulberry32): mở lại trang bao nhiêu lần, bố cục vẫn y hệt — không random theo phiên.
- **Ba cổng khi sinh mỗi vị trí:** (1) khoảng cách elip tới mọi vị trí đã có dE ≥ 1 (bán trục ngang 0,58 × bề rộng hình trung bình của cặp vị trí, bán trục dọc 0,30 × — chiều sâu nén nên dọc được gần hơn): không chồng khít, cho phép chạm nhẹ như đám đông thật, trước/sau phân bằng z-index theo độ sâu; (2) chống thẳng hàng bằng cửa sổ trượt chính xác: không cửa sổ ngang 0,17% nào chứa ≥ 4 vị trí, không cửa sổ dọc 1,25% nào (từng phía) chứa ≥ 4 vị trí; (3) tỉ lệ người theo độ sâu (xa 3,1% → gần 5,5% bề ngang sân) cộng nhiễu ±8% từng người.
- **Sức chứa giữ nguyên 100 người** ở đúng các thông số trên (không phải hạ khoảng cách — khoảng cách elip tối thiểu đạt 1,008 ≥ ngưỡng 1,0). HUD vẫn "👥 Đứng n/100" theo số thật.
- **Vị trí nhà:** người vào được gán vị trí theo thứ tự sinh bố cục; mỗi người nhớ vị trí nhà của mình suốt phiên. Hết giờ ghế thiền/TOP trở về: về ĐÚNG vị trí nhà nếu còn trống; bị lấp → về vị trí trống GẦN NHẤT (khoảng cách nén dọc ×1,6 theo phối cảnh, hòa thì vị trí sinh trước thắng). Đường đi về dùng nguyên cơ chế đi bộ hiện có.
- Giữ nguyên: sprite đứng nam/nữ (không sư), đung đưa nhẹ, chip tên tạm 3,5s, bong bóng bình luận trên đầu, đi bộ từ cổng vào vị trí.

# Đợt 14 · Bỏ hiển thị đếm đứng + luật 1 hình khi bái + đóng băng TOP khi bái + chuẩn hoá tư thế (31/10/2026)

Theo lệnh trực tiếp của Lão tổng 19:25 31/10. Mục này THAY THẾ các mô tả cũ mâu thuẫn ở đợt 10 (hình ngồi mờ giữ chỗ), đợt 11/13 (pill đếm đứng trên HUD).

## HUD không còn đếm đứng
- Pill "👥 Đứng n/100" đã gỡ khỏi màn hình — người xem không còn thấy số đếm khu đứng ở bất kỳ đâu. Sức chứa 100 và mọi luật khu đứng (đợt 13) giữ nguyên; hệ thống vẫn đếm nội bộ để vận hành, chỉ không hiển thị.

## Luật MỘT HÌNH khi đi bái / đi lên ghế (thay "hình mờ giữ chỗ" của đợt 10)
- Trong suốt một lượt bái, mỗi người chỉ có ĐÚNG 1 hình trên sân: khi walker khởi hành, hình tại chỗ cũ **ẩn hẳn** (không còn hình mờ giữ chỗ); hình tại chỗ chỉ hiện lại khi walker đã về tới nơi và bàn giao xong. Ghế + giờ vẫn giữ nguyên trong lúc bái như cũ.
- Bái xong đi lên ghế thiền/ghế TOP: hình ngồi ở ghế đích chỉ hiện khi walker ĐÃ TỚI NƠI (không hiện trước từ đầu chặng nữa).

## TOP đóng băng cho người đang bái
- Người đang trong lượt bái (đang đi / đang bái / đang về) **không bị thăng/giáng/dời ghế TOP giữa chừng**: đang ở TOP thì giữ nguyên ghế; chưa ở TOP mà đủ hạng thì được **giữ chỗ trước** đúng ghế bục của mình — hàng TOP đứng yên trọn vẹn trong lúc bái (người khác vẫn đổi chỗ bình thường quanh các ghế còn lại). Công Đức vẫn ghi nhận ngay.
- Lượt bái kết thúc hoàn toàn → đối chiếu TOP còn nợ được áp dụng ngay: người vừa bái lên đúng hạng của mình, người bị vượt nhường chỗ theo luật thường.

## Chuỗi bái chuẩn hoá kích thước (hết nhảy cỡ)
- Mọi tư thế bái (đứng/nghiêng/cúi nửa/quỳ/lạy của nam/nữ/sư) được chuẩn hoá bằng số đo thật của từng sprite: chung một neo chân tại điểm bái cố định; chiều cao theo tiến trình **đứng 1,00 · nghiêng 0,95 · cúi nửa 0,85 · quỳ 0,625** so với chiều cao đứng; khung lạy cao đều ~8,5% sân. Bảng hệ số nằm trong code (`POSE_FIX` cạnh `BOW_W`).
- Khi đi lên điểm bái, bề rộng người đi nội suy dần về bề rộng bái ở cuối chặng (và ngược lại khi đi về) — các điểm bàn giao không còn giật cỡ.

# Đợt 16 · Hàng TOP còn 4 người — bỏ ghế giữa, NHƯỜNG VỊ TRÍ LẠY (31/10/2026)

Theo lệnh trực tiếp của Lão tổng 20:02 31/10 ("TOP còn 4 người thôi để nhường vị trí lạy"). Mục này THAY THẾ mọi mô tả "5 ghế TOP / TOP n/5" ở đợt 11 và phần gán ghế bục của đợt 12; luật xếp hạng theo TỔNG Công Đức (đợt 11), đổi chỗ 3 pha (đợt 12) và đóng băng/giữ chỗ TOP khi bái (đợt 14) giữ nguyên — chỉ áp cho 4 ghế.

## Luật TOP 4 người MỚI
- Hàng TOP còn **4 ghế**, thuộc về **4 người có TỔNG Công Đức (xu) trong phiên cao nhất**, cập nhật ngay sau mỗi món quà; **người hạng 5 không vào TOP** (ở ghế thường/hàng chờ/khu đứng như luật cũ áp cho hạng 6 trước đây). Chưa đủ 4 người tặng thì TOP lấp theo thứ hạng bất kể số xu.
- **Bỏ ghế giữa đúng trục giữa x=50**: 4 ghế giữ nguyên hàng ngang và bước lưới đều 12,6% của đợt 12 tại x = **24,8 · 37,4 · 62,6 · 75,2** (khe giữa rộng gấp đôi). Nhờ vậy trục giữa tại điểm bái (50, 61,5) **hoàn toàn trống** — không còn ghế/người/chip TOP nào phía sau người lạy, hình lạy không bị chip ghế giữa che như giới hạn hình học đã ghi ở đợt 12.
- **Gán ghế theo bục (4 ghế):** hạng 1 → ghế trong-trái (x=37,4); hạng 2 → ghế trong-phải (x=62,6); hạng 3 → ngoài cùng trái (x=24,8); hạng 4 → ngoài cùng phải (x=75,2). Chip vẫn 1 dòng "hạng · tên · ⏱ giờ còn", SO LE 2 cao độ xen kẽ (ghế 1–3 cao độ A, ghế 2–4 thấp hơn 1,55em — ghế kề nhau luôn khác cao độ). Đệm ghế vẫn "✦ TOP ✦".
- Tên hiển thị: pill HUD "✦ TOP n/4"; panel hướng dẫn và phần luật trong trang đã sửa 5 → 4.

## Không đổi ở đợt 16
Luật Công Đức/xếp hạng trực tiếp, ngưỡng 50 xu lên ghế thiền thường, khu đứng đợt 13, điểm bái cố định + chuỗi bái + chuẩn tỉ lệ đợt 14, thang giây theo xu, bản đồ quà → nghi lễ, mục tiêu chung + Đại lễ, tiếng, nhạc nền, bridge, TTS, chế độ mượt — tất cả giữ nguyên. Engine đi bộ tổng thể không đụng (việc riêng của Đợt 15).

# Đợt 17 · Lượt bái CHỈ LẠY (bỏ bước thắp hương) + HUD bỏ pill đếm TOP (31/10/2026)

Theo hai lệnh trực tiếp của Lão tổng 20:19 31/10. Mục này THAY THẾ mọi mô tả cũ về "lượt bái kèm thắp hương / hương bừng ở nhịp lạy đầu" (đợt 9/10) và mô tả "pill HUD ✦ TOP n/4" (đợt 16).

## Luật MỚI
- **Lượt bái chỉ còn LẠY:** người tặng quà đi đường giữa lên điểm bái cố định → đứng nghiêm → nghiêng → quỳ → cúi nửa → lạy ×2 → đứng dậy → đi về. KHÔNG còn bước thắp hương: không khom thắp hương, không hương bừng/khói tại điểm bái, không nén hương trên tay. **Tiếng mõ lễ bái giữ nguyên** (3 tiếng mõ nhịp 0,9s ở nhịp lạy đầu; Bó hoa thêm 1 tiếng chuông) — chỉ bỏ phần HÌNH của bước hương.
- **Nghi lễ quà Hoa hồng KHÔNG đổi:** trong hệ nghi lễ hiện hình, Hoa hồng vẫn kích hoạt chính lượt bái này cho người tặng + kèm mưa cánh sen nhẹ; Bó hoa cũng kích hoạt lượt bái (và tiếng chuông phụ như trên). Khói hương môi trường ở bàn thờ và lư hương trong ảnh nền giữ nguyên — đợt này chỉ bỏ hương CỦA LƯỢT BÁI.
- **HUD không còn pill đếm TOP:** pill "✦ TOP n/4" đã gỡ khỏi thanh HUD (như pill đếm khu đứng đã gỡ ở đợt 14). Hàng TOP vẫn 4 ghế với chip "hạng · tên · ⏱ giờ còn" trên từng ghế — muốn biết TOP đang có mấy người thì nhìn 4 ghế vàng; bảng Công Đức bên phải vẫn là nơi xem thứ hạng theo tổng xu.

## Không đổi ở đợt 17
Luật Công Đức/xếp hạng TOP 4 ghế (đợt 16), giữ chỗ/đóng băng TOP khi bái (đợt 14), điểm bái cố định + chuỗi pha + chuẩn tỉ lệ, khu đứng đợt 13, thang giây theo xu, bản đồ quà → nghi lễ, mục tiêu chung + Đại lễ, nhạc nền, bridge, TTS, chế độ mượt — tất cả giữ nguyên. Engine đi bộ tổng thể không đụng (việc riêng của Đợt 15).

# Đợt 18 · Tư thế LẠY làm lại theo bảng tư thế chuẩn (31/10/2026)

Theo lệnh + ảnh chuẩn của Lão tổng 20:35 31/10. Mục này THAY THẾ hình lạy cũ (dáng "lều/chuông" do bộ ảnh tư thế đời trước dùng góc máy từ trên cao nhìn xuống) ở cả hai nơi:

## Luật MỚI
- **Sprite lạy trên trang chính (cả 3 kiểu nam/nữ/sư):** ảnh mới đúng góc SAU ngang tầm mắt như bảng chuẩn — từ quỳ ngồi trên gót, thân gập trải dài về phía trước thành khối THẤP–DÀI–RỘNG (tỉ lệ rộng/cao: nữ 1,65 · nam 1,65 · sư 1,37; ảnh chuẩn 1,34; sprite cũ chỉ 0,37–0,48), mông thấp gần gót, đầu khuất sau lưng, hai tay duỗi thẳng qua khỏi đầu úp đất, hai đế chân hướng về người xem khép sát nhau. Chiều cao khối lạy trên sân vẫn giữ mốc ~8,5% như đợt 14 nhưng bề rộng lớn hơn hẳn (walker khi lạy rộng ~21–25% sân). Neo chân tại điểm bái không đổi. Sprite cũ lưu ở `assets/lay-cu-dot17/`.
- **Bản mẫu bái (`bow-preview/`):** rig đã sửa cùng chuẩn (gập từ hông trên nền quỳ ngồi gót, đầu khuất, tay duỗi qua đầu), clip + contact sheet render lại. Mẫu vẫn CHỜ DUYỆT, chưa gộp vào trang chính.

## Không đổi ở đợt 18
Mọi pose khác (đứng/nghiêng/bước/quỳ/cúi nửa), chuỗi pha + điểm bái cố định, luật quà/Công Đức/TOP 4 ghế/khu đứng, giữ chỗ TOP khi bái, nhạc, bridge, TTS — tất cả giữ nguyên. Selftest vẫn 190/190.

# Đợt 19 · Engine hình người MỚI: dải sprite + canvas (31/10/2026)

Theo lệnh của Lão tổng 22:15 31/10, cách làm hình người của bản áp dụng thử (theo repo chanh-dien-online) đã được GỘP vào bản chính `index-real.html`. Mục này thay thế các mô tả cũ về "sprite từng tư thế + walker DOM" ở các đợt trước.

## Thay đổi gì khi xem live
- **Toàn bộ hình người nay vẽ bằng DẢI SPRITE cắt từ chính 2 bảng ảnh của Lão tổng** (nam + nữ): đi bộ bước theo khung hình thật, đứng/quỳ/lạy đều là khung thật trong bảng — đặc biệt **khung LẠY là ảnh thật trong bảng, không còn là hiệu ứng ép dẹp (squash) như repo mẫu**.
- **Đi bộ mượt kiểu mới**: người đi theo hành lang giữa, bước chân khóa theo quãng đường đã đi (hết trượt chân), càng ra xa hình càng nhỏ và đi càng chậm (đúng phối cảnh). Một lượt đi từ khu đứng lên điểm bái mất khoảng 6 giây. **Nhịp bước chỉnh được**: mặc định 2,2 bước/giây; muốn nhanh/chậm hơn thì mở trang thêm `?cadence=2.6` (hoặc số khác 0,5–6) — khi nào Lão tổng chốt nhịp cuối thì Misa khóa cứng vào trang.
- **Chỉ còn 2 kiểu người NAM + NỮ**: gõ "sư" không còn đổi hình nữa; người xem gõ `nam` / `nữ` như cũ.
- Hình "ngồi thiền" trên ghế là **khung quỳ** (bảng ảnh không có tư thế ngồi xếp bằng) và khối lạy nhỏ hơn bản sprite AI đợt 18 — vì nay mọi khung dùng chung một tỉ lệ thật như trong bảng gốc. Nam đi ngang tạm dùng khung đi từ sau (chưa có bảng bước ngang cho nam).

## Không đổi
Toàn bộ luật chơi và vận hành: bridge + EulerStream, thang giờ theo quà, ngưỡng 50 xu, nghi lễ theo quà, mốc Công Đức toàn phòng + Đại lễ, TOP 4 ghế vàng, khu đứng, bong bóng lời cầu, tiếng mõ/chuông, nhạc thiền, chế độ mượt, cách mở trang/đi live ở các mục trước — tất cả giữ nguyên. File xem thử/gộp thử `ap-dung-repo/` chỉ còn là tài liệu tham khảo, bản chạy thật vẫn là `index-real.html` (+ bridge như cũ).

## Kiểm chứng đợt 19
Tự kiểm chứng tự động **183/183 PASS**; ảnh chụp kiểm chứng trong thư mục `qa-dot19/` (cảnh bận đầy phòng · khung đang lạy tại điểm bái · đo điểm ảnh khớp tọa độ điểm bái/ô đứng); FPS cảnh bận 47 (đo headless render phần mềm). Gói `thien-duong-tinh-tam.zip` đã đóng lại kèm bản này.


## Đợt 20 · Làm nét hình + xóa nền chuẩn (31/10/2026)
- **Xóa nền làm lại từ ảnh gốc** (không sửa trên khung cũ): tách nền theo mặt nạ mềm, khử viền sáng quanh người (decontaminate), giữ đế tất trắng nhưng bỏ khe sáng giữa chân và mảng bóng cứng dưới chân — nay hình đứng trên thảm đỏ hay nền tối đều không còn quầng sáng/mảng trắng, cạnh mượt không răng cưa. Bản sprite Đợt 19 giữ ở `assets/engine-dot19/` để đối chiếu/khôi phục; pipeline mới ở `dot20-pipeline/build_sprites.py`.
- **Làm nét**: dựng khung bằng kỹ thuật supersample (vẽ 2× rồi thu về bằng Lanczos + khử mờ vừa phải) và canvas nhân vật nay vẽ ở độ phân giải cao hơn theo màn hình máy (tối đa 1,5× — đã đo FPS cảnh bận: mức 1,5× đạt ~53 fps, mức 2× tụt còn ~43 nên không dùng). Trần độ nét phụ thuộc ảnh gốc 1170×780 (khung đứng cao ~421–427px) — muốn nét hơn nữa phải có bảng ảnh gốc lớn hơn.
- **Không đổi luật chơi và mọi tính năng**; tự kiểm chứng tự động vẫn **183/183 PASS**, ảnh kiểm chứng trong thư mục `qa-dot20/` (cảnh bận · khung đang lạy · crop phóng 400% người đi và khung lạy · bảng so sánh cũ/mới trên nền tối và nền đỏ). Gói `thien-duong-tinh-tam.zip` đã đóng lại kèm bản này.


# Đợt 21 · Khung trung gian bái + giọng đọc tên/lời khấn + chế độ OBS (31/10/2026)

Ý hay học từ một repo chùa online khác (chỉ học CÁCH LÀM — toàn bộ hình và code là của mình; phân tích ở `phan-tich-repo-tiktok-live-temple-rpc.md`).

## 1) Chuỗi bái liền mạch hơn — thêm 2 khung trung gian
- Chuỗi lạy nay đi: quỳ → **cúi nửa** → lạy → **lạy sâu** (mức thấp/sát đất nhất, giữ ở giữa lượt) → lạy → cúi nửa → quỳ → đứng dậy. Khung cúi nửa và lạy sâu được SUY RA từ chính khung quỳ/lạy trong bảng ảnh của Lão tổng (nội suy theo đường cong khoảng cách ký hiệu + ép thấp neo đáy), chạy qua cùng pipeline xóa nền/làm nét của Đợt 20 nên cạnh và độ nét đồng nhất với bộ khung cũ.
- Giới hạn nói thẳng: nhìn từ sau + nội suy 2D nên "cúi nửa" đọc như tư thế quỳ khom sâu (chưa phải cúi đứng 45° như người thật), và "lạy sâu" chỉ khác "lạy thường" một mức tinh tế (thấp hơn ~13%). Contact sheet toàn chuỗi ở `qa-dot21/contact-bai-nu.png` và `contact-bai-nam.png`.

## 2) Giọng đọc tên + lời khấn khi lên bái
- Khi một Phật tử đi tới điểm bái, trang **đọc thành tiếng**: "Phật tử <tên> thành tâm lễ Phật." và nếu người đó từng bình luận lời cầu (bình luận chứa "cầu/mong/ước…") thì đọc thêm "Lời khấn: <lời khấn>." (lời khấn đọc tối đa ~120 ký tự). Nhạc nền **tự nhỏ xuống** trong lúc đọc và trở lại khi đọc xong.
- **Bật/tắt**: ô "🔊 Đọc tên + lời khấn khi lên bái" trong panel (mặc định BẬT). Đây là kênh riêng với ô "xướng tên khi có quà" cũ.
- **Chống spam + lọc chữ** (tự viết): mỗi người tối thiểu 8 giây giữa 2 lần đọc, hàng đợi tối đa 5 lượt; tên/lời khấn được chuẩn hoá Unicode, gỡ ký tự lạ/dấu chồng (Zalgo)/emoji và chặn từ phản cảm cơ bản trước khi đọc.
- **Engine giọng (chạy local, không tốn phí)**:
  - Ưu tiên **ZeroTTS** giọng **Mai Chi** (model ~1GB tại `bridge/tts-models/zerotts/` — xem mục cài đặt dưới đây; KHÔNG nằm trong gói zip vì quá nặng). Đã kiểm chứng trên máy này: nạp model ~12 giây, đọc một câu mất ~12–20 giây nên giọng đọc đi theo HÀNG ĐỢI — người lên bái sau có thể nghe đọc hơi trễ, đó là bình thường. Muốn đổi giọng: chạy bridge với `TDTT_TTS_VOICE=giahuy` (có sẵn: maichi, baotrang, giahuy, hamy, huuduc, kimoanh, quangminh, tiendat).
  - Không có model ZeroTTS → tự rơi xuống **Piper** giọng `vi_VN-vais1000-medium` (chạy offline, đọc nhanh ~1 giây/câu; model 63MB nằm sẵn trong gói zip ở `bridge/tts-models/`). Ép dùng Piper: chạy bridge với `TDTT_TTS_ENGINE=piper`. Tắt hẳn giọng phía server: `TDTT_TTS=off`.
  - Âm thanh đã đọc được **lưu cache** tại `bridge/tts-cache/` — câu giống hệt nhau chỉ tổng hợp một lần.
  - Kiểm tra engine đang chạy: mở `http://localhost:8080/status` — trường `tts.engine` (ví dụ `zerotts:maichi`).
- **Khi mở file tĩnh** (kéo thả `index-real.html`, không chạy bridge): trang dùng giọng Web Speech tiếng Việt của trình duyệt/hệ điều hành nếu có; không có thì **im lặng** (mọi thứ khác vẫn chạy bình thường).
- **Cài đặt phía bridge** (làm 1 lần trên máy chạy live): trong thư mục `bridge/`, tạo môi trường Python và cài 2 gói: `python3 -m venv tts-venv && ./tts-venv/bin/pip install zerotts piper-tts`. Model ZeroTTS: tải snapshot của `zeroweight-ai/ZeroTTS` từ HuggingFace rồi **sao chép thành thư mục thật** (không để dạng symlink của cache HF — onnxruntime sẽ từ chối) vào `bridge/tts-models/zerotts/`. Piper không cần cài thêm gì (gói `piper-tts` ở trên đã gồm).

## 3) Chế độ OBS sạch — `?obs=1`
- Mở trang dạng `http://localhost:8080/index-real.html?obs=1`: ẩn toàn bộ panel điều khiển/giả lập, ô hướng dẫn, hàng chờ, nút chỉnh mượt và con trỏ chuột; chỉ còn sân khấu 9:16 giữa màn hình nền tối — sẵn sàng thêm vào OBS / TikTok LIVE Studio dưới dạng **Browser Source** (đặt khung 1080×1920).
- Giữ lại tối thiểu để đọc trạng thái phòng khi live: tiêu đề, pill "đang thiền" + pill phiên, thanh Công Đức toàn phòng và hộp Công Đức góc phải (đây là lựa chọn có chủ đích: sạch nhưng vẫn đọc được tình hình phòng).
- Ảnh kiểm chứng: `qa-dot21/c-obs-sach.png`.

**Không đổi ở Đợt 21**: luật chơi (thang giờ quà, ngưỡng 50 xu, ngân hàng giờ, TOP 4, mốc phòng + Đại lễ), nhạc nền, nghi lễ quà, bridge WebSocket `/live` + `/status` + chế độ `--demo`. Tự kiểm chứng tự động: xem QA.md mục Đợt 21.
