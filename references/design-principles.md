# Nguyên tắc thiết kế App Screenshot & Product Showcase

## 1. Chiến lược trước, hình ảnh sau

- **Người dùng không đọc, họ lướt.** Mỗi ảnh có khoảng 1–2 giây. Headline phải truyền tải được một lợi ích ngay lần nhìn đầu.
- **Cấu trúc bộ ảnh điển hình** (5–8 ảnh):
  1. **Hero**: giá trị cốt lõi + màn hình đẹp nhất của app.
  2. **Tính năng #1**: lý do số 1 khiến người dùng tải app.
  3. **Tính năng #2, #3…**: mỗi ảnh một tính năng.
  4. **Bằng chứng (social proof)**: đánh giá, số người dùng, giải thưởng. **Chỉ dùng khi có số liệu thật** do người dùng cung cấp.
  5. **Kết bài**: bảo mật, đa nền tảng, cá nhân hoá, hoặc một tính năng "wow".
- **Lợi ích, không phải tính năng**: "Quản lý chi tiêu không cần nhập tay" tốt hơn "Tự động đồng bộ giao dịch".

## 2. Copywriting

| Quy tắc | Ví dụ tốt | Ví dụ kém |
|---|---|---|
| Ngắn: headline 2–6 từ, tối đa 2 dòng | **Chuyển tiền trong 3 giây** | Ứng dụng giúp bạn chuyển tiền nhanh chóng và an toàn |
| Động từ mạnh, chủ động | **Theo dõi** mọi khoản chi | Các khoản chi được theo dõi |
| Một ý mỗi ảnh | **Tiết kiệm tự động** | Tiết kiệm, đầu tư và vay |
| Có thể nhấn mạnh 1–2 từ khoá bằng màu accent (engine chưa tự làm: chỉnh tay text layer trong PSD) | Ngủ **sâu hơn** mỗi đêm | Tô màu cả câu |
| Subheadline (tuỳ chọn) giải thích "bằng cách nào" | AI phân loại giao dịch cho bạn | Lặp lại headline |

- **Tiếng Việt**: dài hơn tiếng Anh khoảng 20–30%. Viết bản tiếng Việt trước rồi rút gọn. Kiểm tra dấu trên chữ in hoa (Ầ, Ẩ, Ữ) không bị cắt ở mép trên.
- **Bản địa hoá**: mỗi ngôn ngữ là một spec riêng (`spec.vi.json`, `spec.en.json`) dùng chung bố cục, chỉ khác text.
- Tránh CTA kiểu "Tải ngay" (Google Play cấm), giá cả, khuyến mãi có thời hạn.

## 3. Typography

- **Headline**: sans-serif đậm (Bold/ExtraBold). Kích thước khoảng **7–8% chiều rộng ảnh** cho ảnh dọc, **10–12% chiều cao** cho ảnh ngang.
- **Subheadline**: Regular/Medium, khoảng **55–60% cỡ headline**, độ tương phản thấp hơn một bậc.
- **Leading** 1.05–1.15 cho headline. **Tracking** hơi âm (-10 đến -20) với font đậm cỡ lớn.
- **Căn giữa** là mặc định an toàn cho ảnh dọc. Căn trái hợp phong cách editorial hoặc bố cục ngang.
- Tối đa **2 font** mỗi bộ ảnh, thường là 1 family với 2 độ đậm.
- Font phải hỗ trợ đầy đủ tiếng Việt: Inter, Be Vietnam Pro, SF Pro, Roboto, Montserrat, Manrope, Plus Jakarta Sans.

## 4. Bố cục

### Ảnh dọc (iPhone, Android phone, 4:5)
- **text-top** (phổ biến nhất): headline trong khoảng 6–24% chiều cao, máy bắt đầu từ ~28%.
- **text-bottom**: máy ở trên, text ở dưới. Dùng xen kẽ để phá nhịp hoặc khi UI quan trọng nằm ở nửa trên màn hình.
- **Bleed**: máy tràn khỏi mép dưới (cắt khoảng 10–20%). Trông hiện đại và cho máy to hơn, đổi lại phần dưới UI bị che.
- **Lề an toàn**: ≥ 6% chiều rộng hai bên cho text.

### Ảnh ngang (Feature Graphic, 16:9)
- **side**: text bên trái (~45% chiều rộng), máy bên phải.
- Feature Graphic: giữ logo và text trong vùng **giữa 80%**, tránh tâm ảnh nếu có video (nút play phủ lên).

### iPad
- Màn hình to: headline có thể chỉ chiếm 1 dòng. Máy chiếm ~70% chiều rộng, tránh để quá nhiều khoảng trống.

## 5. Khung thiết bị

| Kiểu | Khi nào dùng | Trong spec |
|---|---|---|
| **frame** (viền vector) | Mặc định, sạch sẽ, không lo bản quyền | `"style": "frame"` |
| **frameless** (chỉ bo góc màn hình) | App có UI full-bleed đẹp, phong cách tối giản | `"style": "frameless"` |
| **mockup** (PSD smart object) | Mẫu tham khảo dùng máy 3D, nghiêng, hoặc có chất liệu thật | `"style": "mockup"` |

- Bóng đổ nhẹ (opacity 25–40%, blur ~5% chiều rộng) giúp máy tách khỏi nền.
- Ảnh chụp màn hình phải **sạch**: thanh trạng thái 9:41, pin đầy, sóng đầy, không có thông báo, dữ liệu mẫu đẹp và thực tế (không phải "Test 123"), không lộ dữ liệu cá nhân thật.

## 6. Màu sắc

- Lấy màu chủ đạo từ brand. Mỗi ảnh có thể đổi sắc độ nhưng vẫn cùng một họ màu.
- Nền gradient 2 stop cùng tông (lệch hue ≤ 30°) trông cao cấp hơn gradient cầu vồng.
- Tương phản text/nền tối thiểu **4.5:1**. Với headline lớn có thể chấp nhận 3:1, nhưng nên đạt 4.5:1.
- Nền phải tương phản với UI app: app nền trắng thì nền ảnh nên đậm, và ngược lại.

## 7. Panorama (bộ ảnh nối liền)

- Dùng **một nền liền** (`"panorama": true`) với gradient chạy dọc cả dải.
- Thêm **phần tử nối** vắt qua mép: blob, đường cong, dải màu, hoặc máy đặt lệch (`deviceOffsetX`).
- **Không đặt text vắt qua mép.** Text luôn nằm gọn trong một ảnh.
- Kiểm tra từng ảnh đứng riêng: vẫn phải hiểu được thông điệp.

## 8. Product Showcase UI

- Mục tiêu khác store: **kể chuyện tính năng** cho landing page, deck, social. Có thể nhiều chữ hơn một chút: headline + 1 câu mô tả + 2–3 bullet ngắn.
- Ảnh ngang 16:9: text trái, máy phải. Ảnh 1:1 hoặc 4:5: text trên, máy dưới, có thể bleed.
- Có thể thêm logo app ở góc (decoration dạng `image`).
