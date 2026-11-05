# Flooz: Crypto Analyst (App Store, Finance/Crypto)

**Phong cách:** vui nhộn, Gen Z, meme-culture. Năng lượng cao, nhiều vật thể 3D, panorama liền mạch.

## Bố cục
- **Panorama**: nền xanh dương liền mạch, các vật thể (mũi tên 3D, mèo thần tài, ếch Pepe) **vắt qua mép nối** giữa các ảnh.
- Bố cục xen kẽ để giữ nhịp: ảnh 2 text-top, ảnh 3 **text-bottom** ("Trade Right where You Chat"), ảnh 4 text-top.
- Ảnh 1 (hero) dùng **ảnh nền đồng cỏ** + mascot 3D + bong bóng chat, **không có máy**.
- Máy bị **cắt mạnh** (chỉ thấy nửa trên hoặc nửa dưới), như đang nhìn cận.

## Khung thiết bị
- iPhone viền đen dày, có Dynamic Island, gần như không có bóng đổ.

## Typography
- Sans-serif **Black/ExtraBold**, rất to (headline ~12–14% chiều rộng), Title Case, leading chặt (~0.95).
- **Chữ trắng có viền/phát sáng** (outer glow, stroke trắng) trên nền xanh, tạo hiệu ứng "neon/sticker".
- Ảnh 1 trộn nhiều cỡ chữ: "Meet Your" nhỏ, "Crypto" cực to, "Analyst" vừa.
- Nền có **chữ khổng lồ mờ (watermark)** lặp lại headline phía sau.

## Màu & nền
- Xanh dương sáng **#2F8CFF** chủ đạo, trắng, có thêm grid mờ. Điểm nhấn xanh lá (Buy, mũi tên) và đỏ (Sell).

## Kỹ thuật đặc trưng
1. **Bong bóng chat nổi** (kiểu iMessage) đè lên máy: kể chuyện bằng hội thoại AI.
2. **Vật thể 3D/mascot** (PNG trong suốt) vắt qua mép panorama.
3. **Thẻ UI nổi** (card "Ready to execute this trade?", danh sách token) phóng to, đè mép máy.
4. **Ảnh dán (sticker)**: ảnh thumbnail nghiêng chồng lên máy ("IMG_1992.JPG").

## Đối chiếu với engine hiện tại
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Panorama + nền liền | ✅ | `panorama: true` |
| Xen kẽ text-top / text-bottom | ✅ | `slides[].layout` |
| Máy tràn mép | ✅ | `device.bleed`, `device.scale` |
| Vật thể 3D vắt qua mép | ⚠️ | Decoration `image` với `x` tính theo chiều rộng ảnh (ví dụ `x: 1.8`). Cần file PNG 3D do bạn cung cấp |
| Headline cực đậm, leading chặt | ✅ | `typography.headlineScale`, `leading` |
| Chữ phát sáng/viền | ✅ | `typography.effects` |
| Trộn nhiều cỡ chữ trong headline | ✅ | `headline` dạng mảng nhiều phần |
| Thẻ nổi | ✅ | `callouts` |
| Bong bóng chat | ✅ | `bubbles` (chưa có đuôi nhọn) |
| Ảnh nền đồng cỏ, không có máy | ⚠️ | Decoration `image` + `device.style: none` |
| Chữ watermark mờ phía sau | ✅ | `watermark` |
