# Tandem: tiết kiệm theo mục tiêu cho cặp đôi (App Store, Finance)

**Phong cách:** ấm áp, tinh tế, "editorial". Bảng màu xanh mint dịu, headline dùng **serif mảnh**, nhiều khoảng trắng. Cảm giác tin cậy nhưng thân thiện, không lạnh như fintech thông thường.

## Bố cục
- Ảnh dọc. Ảnh 1 (hero) nền **xanh rêu đậm #0F3D33**, các ảnh sau nền **mint nhạt #DDF1EC**. Hero được tách khỏi phần còn lại bằng màu nền tương phản.
- Hero: wordmark "tandem" (serif nghiêng; **khi áp dụng thì dùng chữ đứng**) → headline 3 dòng → **"Featured in" + hàng logo báo chí** (PYMNTS, TechCrunch, TODAY, The Hustle) → **máy nghiêng** ở góc dưới phải, tràn mép.
- Các ảnh sau xen kẽ:
  - text-top + máy tràn đáy (ảnh 2, 4, 6),
  - **máy tràn đỉnh + text-bottom** (ảnh 3 "Earn Huge Interest", ảnh 5 "Better Together").
- Ảnh 2: hàng **thẻ danh mục** (Vacation, Pet, Wedding…) chạy ngang, cắt ở 2 mép, nằm phía trên máy.
- Ảnh 6: nhãn **"Swipe! →"** kèm thẻ giao dịch đang vuốt dở, minh hoạ cử chỉ.

## Khung thiết bị
- iPhone viền đen mảnh, có Dynamic Island, bóng đổ rất nhẹ. Hero dùng máy **nghiêng khoảng 20°**, có phối cảnh.

## Typography
- Headline **serif Light/Regular** (kiểu Tiempos, Canela), chữ thường, 2 dòng, căn giữa. Cỡ khoảng 7% chiều rộng.
- **Từ khoá được nhấn** bằng màu mint sáng + **gạch chân** ("easiest").
- Subheadline sans-serif nhỏ (~3.5% chiều rộng), xám xanh đậm.

## Màu & nền
- Màu phẳng (không gradient): #0F3D33 (hero), #DDF1EC (nền), #14A085 (accent, nút).
- Icon $ và túi tiền nhỏ rải rác làm điểm nhấn vui.

## Kỹ thuật đặc trưng
1. **Hero tương phản màu**: ảnh 1 khác hẳn nền các ảnh còn lại.
2. **Hàng logo báo chí** "Featured in" làm social proof (chỉ dùng khi thật sự được báo nhắc tới).
3. **Từ khoá accent có gạch chân** trong headline.
4. **Thẻ nổi tràn khỏi máy** (thẻ sofa, thẻ "+$54.78") rất lớn, gần bằng chiều rộng máy.

## Đối chiếu với engine
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Nền phẳng, nền riêng cho hero | ✅ | `slides[].background` |
| Text-top / text-bottom xen kẽ, máy tràn mép | ✅ | `layout`, `device.bleed` |
| Wordmark trên headline | ✅ | `logo` với `text` (không có icon) |
| Thẻ nổi tràn khỏi máy | ✅ | `callouts` với `relativeTo: "device"` |
| Headline serif | ⚠️ | Máy đã có `Georgia`, `PTSerif-Regular` (hỗ trợ tiếng Việt). Font giống mẫu hơn (Canela, Tiempos) thì phải cài thêm |
| Từ khoá accent đổi màu + gạch chân | ✅ | `[từ khoá]` + `accentUnderline` |
| Hàng logo báo chí "Featured in" | ✅ | `pressLogos` (chỉ khi thật sự được báo nhắc tới) |
| Máy nghiêng | ✅ | `device.rotate` (xoay phẳng, chưa có phối cảnh) |
| Hàng thẻ chạy ngang tràn mép | ⚠️ | Nhiều `callouts` cạnh nhau, căn tay |
