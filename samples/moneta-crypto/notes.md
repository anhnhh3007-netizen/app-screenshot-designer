# Moneta: Crypto Exchange (App Store, Finance/Crypto)

**Phong cách:** chuyên nghiệp, mạnh mẽ, "fintech tối". Một tông xanh cobalt, chữ in hoa đậm, cảm giác tin cậy và kỹ thuật.

## Bố cục
- Ảnh dọc, nhịp **xen kẽ**:
  - Ảnh 1 (hero): headline in hoa rất to **căn trái** ở trên, quote + badge review, đồng xu 3D ở đáy, **không có máy**.
  - Ảnh 2: subheadline ở trên, máy giữa, **headline in hoa ở dưới** cùng logo.
  - Ảnh 3: logo + headline trên, **danh sách lợi ích có icon** (3 dòng), thẻ UI nổi ở đáy.
  - Ảnh 4: máy **tràn mép trên**, logo + headline ở dưới.
- Logo app nhỏ đặt cạnh mỗi headline.

## Khung thiết bị
- iPhone đen, viền mảnh. Màn hình UI tối khớp với nền, nên máy gần như hoà vào nền.

## Typography
- Sans-serif **ExtraBold, IN HOA**, leading rất chặt (~0.9), căn trái ở ảnh hero và căn giữa ở các ảnh còn lại.
- Có icon inline trong headline (quả địa cầu, ghim vị trí).
- Subheadline nhỏ, chữ thường, độ tương phản thấp.

## Màu & nền
- Gradient **xanh cobalt #1E3FD8 → xanh navy đậm**, có ánh sáng loang (light leak) và vệt cong mờ.
- Chữ trắng tuyệt đối, chỉ một màu nhấn duy nhất.

## Kỹ thuật đặc trưng
1. **Danh sách lợi ích có icon** thay cho máy ở ảnh 3.
2. **Social proof**: "100,000+ reviews" có vòng nguyệt quế. **Chỉ dùng số liệu thật.**
3. **Đồng xu 3D** (asset PNG) làm hero visual.
4. Thẻ UI nằm ngang xếp hàng (carousel), cắt mép.

## Đối chiếu với engine hiện tại
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Gradient xanh, chữ trắng | ✅ | `theme.background` gradient |
| Text-bottom, máy tràn đỉnh | ✅ | `layout: text-bottom`, `device.bleed` |
| Căn trái headline | ✅ | `typography.align: left` |
| Chữ IN HOA | ✅ | `typography.uppercase` |
| Subheadline phía trên, headline phía dưới máy | ✅ | `layout: sandwich` |
| Logo cạnh headline | ✅ | `logo` |
| Danh sách lợi ích có icon | ✅ | `bullets` |
| Badge review nguyệt quế | ✅ | `badge` (chỉ số liệu thật) |
| Đồng xu 3D, light leak | ⚠️ | Decoration `image` (cần asset) + circle mờ |

> **Lưu ý ngôn ngữ:** copy của mẫu này có lỗi ngữ pháp ("MANAGE CRYPTO SECURELY ASSETS", "THE WORLD'S FOR PREMIER NCY EXCHANGE"). Chỉ học phong cách, không học copy.
