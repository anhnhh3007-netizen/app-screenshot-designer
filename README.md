# App Screenshot Designer

Subagent cho [Claude Code](https://claude.com/claude-code) đóng vai **Senior Graphic Designer (10+ năm Photoshop)**, chuyên thiết kế:

- **App Store / Google Play screenshots**: iPhone 6.9" và 6.5", iPad 13", Android phone và tablet, Play Feature Graphic
- **Bộ ảnh panorama nối liền**
- **Product Showcase**: 16:9, 1:1, 4:5 cho landing page, deck, social

Agent không vẽ tay. Nó viết một file `spec.json` rồi **điều khiển Adobe Photoshop bằng ExtendScript** để dựng PSD có layer (screenshot là smart object, text sửa được) và xuất PNG đúng chuẩn store: đúng kích thước, không có kênh alpha, sRGB.

## Yêu cầu

- macOS, **Adobe Photoshop 2024** trở lên
- Claude Code (CLI hoặc desktop app)
- `python3` (có sẵn trên macOS)

## Cài đặt

```bash
git clone https://github.com/anhnhh3007-netizen/app-screenshot-designer.git
cd app-screenshot-designer
cp config.example.json config.json   # sửa projectsRoot nếu muốn đổi chỗ chứa dự án
```

Lần đầu chạy, macOS hỏi quyền cho Terminal/Claude điều khiển Photoshop. Bấm **OK** (System Settings → Privacy & Security → Automation).

## Cách dùng

Mở Claude Code trong folder này rồi nói, ví dụ:

> Dùng app-screenshot-designer làm bộ ảnh App Store cho app ví điện tử của tôi

Agent sẽ:
1. Hỏi thông tin app, đầu ra cần làm, ngôn ngữ copy
2. Phân tích mẫu tham khảo trong `samples/` (ảnh hoặc PSD)
3. **Trình concept để bạn duyệt** (bắt buộc, chưa duyệt thì chưa dựng)
4. Tạo dự án, viết `spec.json`, dựng PSD và xuất PNG
5. Tự mở ảnh ra soát theo checklist QA rồi bàn giao

## Cấu trúc

```
.claude/agents/app-screenshot-designer.md   persona và quy trình của agent
references/      kích thước store, nguyên tắc thiết kế, checklist QA, định dạng spec.json
scripts/
  build.jsx        engine: spec.json → PSD + PNG
  inspect-psd.jsx  đọc PSD mẫu: layer, font, màu, gradient, hiệu ứng, artboard
  list-fonts.jsx   tìm font có trên máy
  lib/asd.jsx      thư viện hàm Photoshop dùng chung
  run-ps.sh        chạy .jsx trên Photoshop qua osascript
  new-project.sh   tạo dự án mới (ngoài folder tool)
  stock-peek.sh    xem thumbnail Adobe Stock (không license, không lưu)
samples/         mẫu tham khảo + bản phân tích (notes.md)
templates/       spec mẫu cho dự án mới
config.example.json   vị trí folder chứa dự án (projectsRoot)
```

**Dự án không nằm trong repo này.** `scripts/new-project.sh <ten-app>` tạo dự án trong `projectsRoot` (mặc định `~/Downloads/app-screenshot-projects`), để folder tool luôn nhẹ.

## Chạy thủ công

```bash
scripts/new-project.sh my-app
# chép ảnh chụp màn hình vào ~/Downloads/app-screenshot-projects/my-app/input/, sửa spec.json
scripts/run-ps.sh scripts/build.jsx ~/Downloads/app-screenshot-projects/my-app/spec.json
```

## Engine làm được

Khung máy vector (Dynamic Island), frameless, mockup PSD có smart object · bố cục text-top, text-bottom, sandwich, side, không có máy · máy tràn mép · panorama · gradient · logo và pill tag · thẻ UI nổi (cắt từ screenshot) · badge xếp hạng có vòng nguyệt quế · danh sách lợi ích có icon · bong bóng chat · 2 máy chồng nhau · máy nghiêng · chữ viền và phát sáng, IN HOA, trộn nhiều cỡ chữ, từ khoá accent (màu, gạch chân), watermark · thẻ tính năng · cột số liệu · hàng logo báo chí · footnote · nền grain · tự thu nhỏ và cân bằng dòng headline.

**Quy tắc thiết kế:** không dùng chữ in nghiêng (engine tự chặn font Italic/Oblique).

**Adobe Stock:** agent tìm và xem thumbnail Adobe Stock qua Adobe for creativity connector để lấy cảm hứng và đề xuất mockup, vật thể 3D, icon. Agent **không license hay tải**: bạn tự tải tài nguyên vào `<projectsRoot>/_stock-library/`. Xem [`references/adobe-stock.md`](references/adobe-stock.md).

Chi tiết: [`references/spec-format.md`](references/spec-format.md).

## Lưu ý

Ảnh trong `samples/` là ảnh chụp trang store công khai của các app khác, chỉ dùng để tham khảo và phân tích phong cách. Bản quyền thuộc về chủ sở hữu.
