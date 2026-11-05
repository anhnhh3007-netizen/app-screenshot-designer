# QA checklist trước khi bàn giao

Mở từng PNG đã xuất để kiểm tra bằng mắt. Không chỉ nhìn file PSD.

## Kỹ thuật
- [ ] Kích thước pixel đúng từng target (`sips -g pixelWidth -g pixelHeight <file>`).
- [ ] PNG không có alpha (`sips -g hasAlpha <file>` trả về `no`).
- [ ] Profile màu sRGB.
- [ ] Số lượng ảnh nằm trong giới hạn store (App Store 1–10, Google Play 2–8).
- [ ] Tên file đánh số đúng thứ tự (`01_…`, `02_…`).
- [ ] Mỗi target có file PSD gốc trong `output/psd/` với layer đặt tên rõ ràng.

## Typography & copy
- [ ] Không có lỗi chính tả. Dấu tiếng Việt hiển thị đúng, không bị thay bằng ô vuông hay font fallback.
- [ ] Headline tối đa 2 dòng, không tràn ra khỏi lề an toàn, không bị cắt.
- [ ] Font đúng như concept đã duyệt (engine ghi cảnh báo nếu phải dùng font thay thế).
- [ ] Không có CTA bị cấm ("Tải ngay"), không có số liệu hay giải thưởng chưa xác minh.
- [ ] Bản địa hoá: mỗi ngôn ngữ đã được kiểm tra riêng.

## Visual
- [ ] Ảnh chụp màn hình nằm gọn trong khung, không lệch, không méo, không mờ (ảnh gốc ≥ độ phân giải màn hình trong khung).
- [ ] Các ảnh trong bộ có cùng kích thước máy và cùng vị trí text, trừ khi phá nhịp có chủ đích.
- [ ] Tương phản headline/nền đủ đọc khi thu nhỏ còn ~25%.
- [ ] Panorama: các mép nối khớp liền mạch, mỗi ảnh đứng riêng vẫn đọc được.
- [ ] Feature Graphic: nội dung quan trọng nằm trong vùng an toàn giữa ảnh.

## Nội dung
- [ ] UI trong ảnh khớp với app thật (quy định của cả Apple và Google).
- [ ] Không lộ dữ liệu cá nhân thật (tên, số tài khoản, số điện thoại).
- [ ] Thanh trạng thái sạch (9:41, pin đầy).
