# Paylix: quản lý chi tiêu (concept, phong cách Dribbble)

**Phong cách:** mềm mại, thân thiện, "soft UI". Tím lavender chủ đạo, nhiều bo góc lớn, có vật thể 3D (heo đất, đồng xu). Đây là concept portfolio, không phải app thật.

## Bố cục
- Ảnh 1 (hero), không có máy:
  - logo + tên app,
  - **badge nguyệt quế có logo Apple** ("Meet Your Money App"),
  - pill nhỏ "+$784 than last week",
  - headline 2 dòng,
  - pill toggle icon,
  - **thẻ tính năng nổi** ("Smart Money Control": icon + tiêu đề + mô tả),
  - dòng **tagline nhỏ ở đáy**.
- Ảnh 2: text-top, máy lớn tràn đáy, nền **gradient tím → trắng** theo chiều dọc.
- Ảnh 3: nền **trắng**, headline 2 dòng với **dòng 2 màu tím**, máy + **heo đất 3D** vắt qua mép sang ảnh 4.
- Các ảnh có **bo góc lớn** (phần trình bày portfolio). Ảnh store thật thì không bo góc.

## Khung thiết bị
- iPhone viền đen mảnh, Dynamic Island, bóng đổ mềm. Máy thẳng.

## Typography
- Sans-serif **Medium** (kiểu SF Pro Display, Inter Display), Title Case, căn giữa. Cỡ khoảng 9% chiều rộng.
- **Dòng thứ 2 đổi màu tím #9B6BF2** ("Financial Activity").

## Màu & nền
- Tím #8E63F5 → lavender #C9B5FF → trắng. Nền tím có **mảng sáng loang** như ánh sáng.
- Vật thể 3D xanh dương và cam tạo tương phản bổ sung (complementary).

## Kỹ thuật đặc trưng
1. **Hero không có máy**: dùng badge, thẻ tính năng và tagline để kể câu chuyện.
2. **Badge có logo Apple**: **không dùng.** Chỉ được dùng logo hay danh hiệu của Apple nếu app thật sự được Apple chọn (App of the Day, Editors' Choice), và phải theo đúng guideline của Apple.
3. **Vật thể 3D vắt qua mép**: cần asset PNG.

## Đối chiếu với engine
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Logo + tên app | ✅ | `logo` |
| Pill nhỏ trên headline | ✅ | `eyebrow` |
| Badge nguyệt quế | ✅ | `badge` (không có logo Apple, chỉ số liệu thật) |
| Đổi màu theo dòng | ✅ | Headline nhiều phần, mỗi phần có `color` riêng |
| Máy tràn đáy, gradient dọc | ✅ | `device.bleed`, gradient `angle: 90` |
| Vật thể 3D vắt qua mép | ⚠️ | Decoration `image` cấp panorama (cần PNG) |
| Thẻ tính năng (icon + tiêu đề + mô tả) | ✅ | `cards` |
| Tagline nhỏ ở đáy | ✅ | `footnote` |
| Mảng sáng loang trên nền | ⚠️ | Decoration `circle` mờ (chưa có blur) |
