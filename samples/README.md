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
