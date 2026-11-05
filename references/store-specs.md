# Thông số kỹ thuật của store

> Đã kiểm tra lại theo tài liệu của Apple và Google tính đến cuối năm 2026. Store thay đổi quy định định kỳ, nên trước một đợt phát hành lớn hãy kiểm tra lại App Store Connect Help ("Screenshot specifications") và Play Console Help ("Add preview assets").

## Mã target dùng trong `spec.json`

| Target ID | Kích thước (px) | Dùng cho | Ghi chú |
|---|---|---|---|
| `ios-6.9` | 1320 × 2868 | iPhone 6.9" (16/17 Pro Max, Plus) | **Bắt buộc**. Apple tự thu nhỏ cho các máy nhỏ hơn |
| `ios-6.5` | 1284 × 2778 | iPhone 6.5" (11 Pro Max, XS Max…) | Chỉ cần nếu không nộp 6.9" |
| `ipad-13` | 2064 × 2752 | iPad 13" | **Bắt buộc** nếu app chạy trên iPad |
| `android-phone` | 1080 × 1920 | Google Play: điện thoại | 9:16, đủ ≥ 1080px để được đề xuất trên Play |
| `android-tablet` | 1600 × 2560 | Google Play: tablet 10" | |
| `play-feature` | 1024 × 500 | Google Play Feature Graphic | Chỉ 1 ảnh, ngang |
| `showcase-16x9` | 1920 × 1080 | Landing page, deck, YouTube | |
| `showcase-1x1` | 1080 × 1080 | Instagram, Facebook feed | |
| `showcase-4x5` | 1080 × 1350 | Instagram portrait | |

Muốn dùng kích thước tuỳ biến thì khai báo dạng object: `{ "id": "linkedin", "w": 1200, "h": 627 }`.

## Apple App Store

- **Số lượng**: 1–10 ảnh mỗi kích thước thiết bị, mỗi ngôn ngữ.
- **Định dạng**: PNG hoặc JPEG, **không có kênh alpha** (engine đã flatten). Không dùng ảnh trong suốt.
- **Màu**: sRGB hoặc Display P3. Engine xuất sRGB.
- **Hướng**: dọc hoặc ngang. Engine mặc định dọc, ngang thì khai báo target tuỳ biến (ví dụ 2868 × 1320).
- **Kích thước iPhone 6.9" chấp nhận**: 1320×2868, 1290×2796, 1260×2736 (và bản ngang).
- **Kích thước iPhone 6.5" chấp nhận**: 1284×2778, 1242×2688.
- **Kích thước iPad 13" chấp nhận**: 2064×2752, 2048×2732.
- **Thứ tự**: 3 ảnh đầu hiện trong kết quả tìm kiếm. Ảnh 1 quan trọng nhất.
- **App Preview (video)**: nếu có, video chiếm vị trí đầu tiên. Ngoài phạm vi engine này.

## Google Play

- **Ảnh điện thoại**: 2–8 ảnh, PNG hoặc JPEG 24-bit (không alpha), tối đa 8 MB mỗi ảnh.
- **Kích thước**: cạnh ngắn ≥ 320px, cạnh dài ≤ 3840px, **cạnh dài không quá 2 lần cạnh ngắn**. Vì vậy không dùng 1080×2400.
- **Được đề xuất trên Play**: cần ≥ 4 ảnh có độ phân giải ≥ 1080px (dọc 1080×1920 hoặc ngang 1920×1080).
- **Tablet 7" và 10"**: tối đa 8 ảnh mỗi loại, cùng quy tắc tỉ lệ.
- **Feature Graphic**: **1024 × 500**, PNG hoặc JPEG không alpha. Bắt buộc nếu có video quảng cáo. Giữ text và logo trong vùng an toàn giữa ảnh, vì Play có thể cắt mép hoặc phủ nút play lên giữa.
- **Không được**: chèn xếp hạng hay giải thưởng không có thật, chữ "Top", "#1", "Best" khi không chứng minh được, hay call-to-action kiểu "Tải ngay", "Download now".

## Panorama (bộ ảnh nối liền)

- Engine dựng **một PSD dài** rộng `N × W` cho mỗi target, rồi cắt thành N ảnh.
- Phần tử vắt qua mép giữa hai ảnh (máy, hình trang trí) phải được thiết kế để **mỗi ảnh vẫn đọc được khi đứng một mình**: Google Play có thể hiển thị ảnh riêng lẻ, App Store hiển thị 3 ảnh đầu trong kết quả tìm kiếm.
- App Store trên iPhone hiển thị khoảng 1.3 ảnh mỗi lần lướt, nên cảm giác nối liền phải tốt ở cả mép trái và mép phải.
