# Finmate: quản lý tài chính (concept, phong cách Dribbble)

**Phong cách:** hiện đại, sáng, "glassy". Gradient xanh dương – cyan có **hạt nhiễu (grain)**, chữ đen đậm, từ khoá **in nghiêng màu xanh**. Đây là thiết kế concept (portfolio), không phải app thật trên store.

## Bố cục
- **Panorama**: máy và thẻ UI **vắt qua mép nối** giữa ảnh 2–3 và 3–4. Một chiếc máy lớn nghiêng nằm giữa 2 ảnh.
- Headline **căn trái**, đặt ở góc trên trái, 3 dòng.
- Ảnh 2: **danh sách 7 tính năng có icon** (ô vuông trắng bo góc chứa icon xanh), không có máy.
- Ảnh 3: **cột số liệu** căn phải ("811 K+ / Users active", "3,90 K+ / Daily transaction", "$11,2 B+ / Balance in total"): số to màu xanh, nhãn nhỏ xám.
- Ảnh 4: máy tràn đỉnh, headline căn giữa phía dưới, **nút CTA "Download now"** dạng pill gradient.
- Ảnh 1 có **ảnh chụp tiền giấy** làm nền.

## Khung thiết bị
- iPhone viền đen, **nghiêng khoảng 15°**, vắt qua mép panorama.

## Typography
- Sans-serif geometric **Medium/Semibold** (kiểu Satoshi, General Sans), chữ thường, leading chặt.
- **Từ khoá in nghiêng đậm màu xanh #1C6FE8** ("growth", "future", "easily"), nằm ngay trong câu.
- Danh sách tính năng: Regular, xám đậm, cỡ khoảng 4% chiều rộng.

## Màu & nền
- Gradient **#B9D3F7 → #8FD3E8** có **grain** (nhiễu hạt) cho cảm giác mềm, cao cấp.
- Accent xanh dương #1C6FE8, nhấn phụ cyan.

## Kỹ thuật đặc trưng
1. **Từ khoá đổi màu ngay trong câu** (mẫu dùng thêm in nghiêng; khi áp dụng **chỉ đổi màu, không in nghiêng**).
2. **Cột số liệu (stat block)**: số to + nhãn nhỏ. **Chỉ dùng số liệu thật.**
3. **Máy và thẻ vắt qua mép panorama.**
4. **Nền grain.**

> **Lưu ý store:** nút CTA "Download now" **vi phạm chính sách Google Play** (cấm call-to-action như "tải ngay"). Không áp dụng vào ảnh store.

## Đối chiếu với engine
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Panorama, gradient | ✅ | `panorama: true`, `theme.background` |
| Headline căn trái | ✅ | `typography.align: "left"` |
| Danh sách tính năng có icon | ✅ | `bullets` với `icon`. Engine vẽ nền icon hình tròn, mẫu dùng ô vuông bo góc |
| Thẻ UI vắt qua mép | ⚠️ | `callouts` trên từng slide, phải tự căn để khớp mép. Chưa có callout cấp panorama |
| Từ khoá đổi màu trong câu | ✅ | `[từ khoá]`. **Không in nghiêng** (quy tắc thiết kế), chỉ đổi màu |
| Cột số liệu (stat block) | ✅ | `stats` (chỉ số liệu thật) |
| Máy nghiêng | ✅ | `device.rotate` |
| Nền grain | ✅ | `grain` |
| Ảnh chụp làm nền | ⚠️ | Decoration `image` |
| Nền icon bullet hình vuông bo góc | ✅ | `bullets.iconShape: "square"` |
