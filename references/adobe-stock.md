# Tham khảo Adobe Stock

Adobe Stock được dùng để **nâng chất lượng thiết kế**: tìm cảm hứng, chọn mockup điện thoại, vật thể trang trí và icon phù hợp với concept.

## Quy tắc bắt buộc

1. **Chỉ xem, không tải.** **Không bao giờ** gọi `asset_license_and_download_stock`. Không license, không tải bản full, không tốn credit.
2. Thumbnail chỉ để **nhìn và phân tích**. Không đặt thumbnail vào thiết kế, không chép vào dự án. Xem xong thì xoá thư mục tạm.
3. Tài nguyên nào muốn dùng thật thì **đưa vào danh sách đề xuất** (`stock-picks.md`) để **người dùng tự tải** vào thư viện dùng chung `<projectsRoot>/_stock-library/`.
4. Thiết kế chỉ dùng file mà người dùng đã tải vào `_stock-library/`. Chưa có file thì dùng placeholder hoặc vật thể engine tự vẽ, và ghi rõ trong báo cáo.
5. Ưu tiên tài nguyên `pricing: "free"`. Tài nguyên trả phí (`core`) vẫn được đề xuất, nhưng phải ghi rõ là **trả phí**.
6. Tránh tài nguyên có `isGenTech: true` (ảnh do AI tạo) cho ảnh người thật, vì dễ gây hiểu lầm. Với vật thể 3D hay icon thì chấp nhận được.

## Công cụ

Gọi `adobe_mandatory_init` một lần ở đầu phiên, sau đó dùng:

```
asset_search  { entityScope: "StockAsset", query: "...", filters: { contentType, pricing, orientation }, limit: 12 }
```
Kết quả gồm `id`, `name`, `contentType`, `pricing` (free/core), `isGenTech`, `width`, `height`, `renditionURL` (thumbnail 240px).

**Xem thumbnail** (`asset_inline_preview` không nhận host ftcdn.net, nên dùng script):
```bash
scripts/stock-peek.sh <renditionURL> <renditionURL> ...
# in ra FOLDER /tmp/asd-stock-peek.XXXX và đường dẫn từng ảnh → mở bằng Read
rm -rf /tmp/asd-stock-peek.XXXX   # xoá ngay sau khi xem
```

Link trang tài nguyên cho người dùng: `https://stock.adobe.com/search?k=<id>`

## Từ khoá theo mục đích

| Mục đích | `contentType` | Gợi ý query (tiếng Anh cho kết quả tốt hơn) |
|---|---|---|
| **Cảm hứng bố cục** | `Template`, `Photo` | `app store screenshots <ngành> template`, `mobile app promotion banner <phong cách>`, `app showcase presentation` |
| **Mockup điện thoại PSD** | `Template` | `iphone mockup psd smart object`, `floating iphone mockup perspective`, `hand holding phone mockup`, `clay phone mockup`, `iphone 15 pro mockup` |
| **Vật thể 3D trang trí** | `Photo`, `Illustration` + `pricing: free` | `3d render <vật thể> isolated transparent background`, `3d clay icon <chủ đề>`, `3d coin stack render`, `3d piggy bank render` |
| **Ảnh người dùng** | `Photo` + `orientation: portrait` | `young vietnamese woman using smartphone`, `asian couple looking at phone home` |
| **Icon / vector** | `Vector` | `<chủ đề> line icon set`, `fintech icons outline`, `3d icon set finance` |
| **Nền, texture** | `Photo`, `Illustration` | `soft gradient mesh background <màu>`, `grain gradient background`, `abstract fluid shapes` |

Lưu ý: `contentType: "3D"` trả về **file model 3D** (.obj), không phải ảnh render. Muốn ảnh vật thể 3D thì dùng `Photo` hoặc `Illustration` kèm "3d render".

## Quy trình trong dự án

1. **Ở Bước 2 (phân tích mẫu)**: tìm 2–3 query cảm hứng cùng ngành và phong cách. Xem 6–12 thumbnail, ghi lại những điểm học được (bố cục, màu, xử lý khung máy) vào phần concept.
2. **Ở Bước 3 (concept)**: nếu concept cần mockup, vật thể 3D, ảnh người hay icon, tìm và chọn **2–3 phương án cho mỗi loại**. Ghi vào `<projectsRoot>/<app>/stock-picks.md`:

   ```markdown
   | Dùng cho | Stock ID | Tên | Free/Trả phí | AI? | Link | Lưu vào |
   |---|---|---|---|---|---|---|
   | Mockup slide 1 | 415000311 | Hand Holding Phone Mockup | Free | Không | https://stock.adobe.com/search?k=415000311 | _stock-library/mockups/415000311_hand-holding-phone.psd |
   ```
   Trình bảng này cùng concept để người dùng duyệt và tự tải.
3. **Ở Bước 4 (dựng)**: chỉ tham chiếu file đã có trong `_stock-library/` (kiểm tra bằng `ls`), ví dụ `"path": "../_stock-library/3d/1146985365_piggy-bank.png"`. Mockup PSD: chạy `scripts/inspect-psd.jsx` trước để biết tên smart object, rồi dùng `device.style: "mockup"`.
4. **Ở Bước 6 (bàn giao)**: liệt kê tài nguyên Stock đã dùng, và nhắc người dùng cập nhật `_stock-library/LICENSES.md`.

## Lưu ý pháp lý

- Ảnh Stock miễn phí vẫn có điều khoản license. Không dùng ảnh người cho nội dung nhạy cảm hay gây hiểu lầm (ví dụ: giả làm khách hàng thật kèm lời chứng thực).
- Không dùng ảnh có logo hay nhãn hiệu của bên thứ ba trong ảnh store.
