# Mẫu tham khảo

Bỏ vào đây các mẫu bạn muốn agent làm theo:

- **Ảnh mẫu** (PNG/JPG): ảnh store của app khác, moodboard, ảnh bạn thích. Agent sẽ phân tích khung máy, bố cục, typography, màu nền.
- **File PSD thiết kế**: agent đọc bằng `scripts/inspect-psd.jsx` để lấy số liệu chính xác (font, cỡ chữ, màu, gradient, hiệu ứng, vị trí theo từng artboard), rồi chuyển thành `notes.md` và `spec-from-psd.json`. Kết quả đọc nằm trong thư mục `<tên file>_inspect/` cạnh file PSD.
- **Mockup PSD** có smart object chứa màn hình: agent dùng trực tiếp với `device.style = "mockup"`. Hãy cho agent biết tên smart object (ví dụ `SCREEN`) và các layer cần ẩn.
- **Brand guideline** (PDF, ảnh, hoặc file .md ghi màu và font).

Nên đặt mỗi bộ mẫu trong một thư mục con, ví dụ `samples/fintech-dark/`, kèm một dòng ghi chú bạn thích điểm gì ở mẫu đó.

## Danh mục mẫu hiện có

| Thư mục | App | Phong cách | Dùng khi |
|---|---|---|---|
| [bevel-health/](bevel-health/notes.md) | Bevel: Health & Performance | Cao cấp, tối giản, nền bạc, thẻ UI nổi | App sức khoẻ, lifestyle, premium |
| [flooz-crypto/](flooz-crypto/notes.md) | Flooz: Crypto Analyst | Vui nhộn, 3D mascot, panorama, chữ phát sáng | App trẻ, Gen Z, AI chat, social |
| [moneta-crypto/](moneta-crypto/notes.md) | Moneta: Crypto Exchange | Fintech tối, IN HOA đậm, xanh cobalt | Ngân hàng, sàn giao dịch, B2B tin cậy |
| [tandem-savings/](tandem-savings/notes.md) | Tandem: tiết kiệm cho cặp đôi | Editorial, serif mảnh, xanh mint, hero tối | Tiết kiệm, lifestyle, app gia đình/cặp đôi |
| [finmate-finance/](finmate-finance/notes.md) | Finmate (concept) | Glassy, gradient grain xanh, từ khoá nghiêng | Quản lý tài chính cá nhân, ví |
| [paylix-money/](paylix-money/notes.md) | Paylix (concept) | Soft UI tím lavender, 3D, hero không có máy | Quản lý chi tiêu, app thân thiện |
| [alinea-invest/](alinea-invest/notes.md) | Alinea: đầu tư cho người mới | Poster condensed IN HOA, tím neon, 3D clay, ảnh người thật | Đầu tư, Gen Z, giáo dục tài chính |

## Kỹ thuật các mẫu dùng và trạng thái engine

Sắp theo số mẫu cần đến. **Tất cả đã có** (xem `references/spec-format.md`, demo ở `_demo-features/` và `_demo-features-2/` trong folder dự án `~/Downloads/app-screenshot-projects`):

| # | Kỹ thuật | Bevel | Flooz | Moneta |
|---|---|:-:|:-:|:-:|
| 1 | ✅ **Thẻ UI nổi (callout card)** `callouts`: cắt một vùng từ screenshot, phóng to, bo góc, đổ bóng, đè lên mép máy | ✓ | ✓ | ✓ |
| 2 | ✅ **Badge social proof** `badge` có vòng nguyệt quế (điểm đánh giá, số review) | ✓ |  | ✓ |
| 3 | ✅ **Logo / pill tag phía trên headline** `logo`, `eyebrow` | ✓ |  | ✓ |
| 4 | ✅ **Bố cục tự do** `layout: sandwich`, `device.style: none`: text trên + dưới máy, slide không có máy chỉ có thẻ hoặc danh sách | ✓ | ✓ | ✓ |
| 5 | ✅ **Danh sách lợi ích có icon** `bullets` |  |  | ✓ |
| 6 | ✅ **Hiệu ứng chữ**: viền, phát sáng, in hoa, trộn nhiều cỡ chữ, chữ watermark `typography.effects`, `uppercase`, headline nhiều phần, `watermark` |  | ✓ | ✓ |
| 7 | ✅ **Bong bóng chat** `bubbles` |  | ✓ |  |
| 8 | ✅ **2 máy chồng nhau** `secondDevice` | ✓ |  |  |

Vật thể 3D, mascot và ảnh nền chụp đã làm được bằng decoration `image`, nhưng cần bạn cung cấp file PNG.

## Kỹ thuật từ đợt mẫu thứ 2

**Đã có hết** (demo `_demo-features-3/`). Riêng chữ in nghiêng **không dùng** theo quy tắc thiết kế: nhấn từ khoá bằng màu hoặc gạch chân.

| # | Kỹ thuật | Tandem | Finmate | Paylix | Alinea |
|---|---|:-:|:-:|:-:|:-:|
| 9 | ✅ **Đổi màu / gạch chân một từ** trong headline `[từ khoá]` (không in nghiêng) | ✓ | ✓ |  | ✓ |
| 10 | ✅ **Máy nghiêng** `device.rotate` (xoay phẳng) | ✓ | ✓ |  |  |
| 11 | ✅ **Footnote / tagline nhỏ ở đáy** `footnote` (chú thích pháp lý, câu kết) |  |  | ✓ | ✓ |
| 12 | ✅ **Thẻ tính năng tự vẽ** `cards` (icon + tiêu đề + mô tả), không cắt từ screenshot |  |  | ✓ |  |
| 13 | ✅ **Cột số liệu** `stats`: số to + nhãn nhỏ |  | ✓ |  |  |
| 14 | ✅ **Hàng logo báo chí** `pressLogos` | ✓ |  |  |  |
| 15 | ✅ **Nền grain** `grain` |  | ✓ |  |  |
| 16 | ✅ **Pill viền** `eyebrow.outline`, **icon vuông bo góc** `bullets.iconShape` |  | ✓ |  | ✓ |

Không áp dụng: nút CTA "Download now" (Google Play cấm) và badge có logo Apple (chỉ dùng khi app thật sự được Apple chọn).

