# App Screenshot Designer

Project dựng ảnh App Store / Google Play / Product Showcase bằng Photoshop 2024 qua ExtendScript.

- Mọi việc thiết kế giao cho subagent **`app-screenshot-designer`** (`.claude/agents/app-screenshot-designer.md`).
- Trước concept, agent **hỏi làm rõ** (số ảnh, nối ảnh, cảm giác, tài sản thật), rồi gửi **các nhóm layout phân loại theo bố cục tổng thể** (`references/layout-groups/`, khung thô trắng đen, chỉ có **Title + Subtitle 2 dòng**). **Không chia theo nội dung / keyword, không đề xuất hướng cho cả bộ.** Người dùng tự chọn layout từng ảnh (ví dụ `L05, L01, L08`); agent ghép bộ đã chọn (`python3 scripts/wireframe.py`), gửi ảnh và sửa tới khi chốt. Khi agent chạy dạng subagent, agent chính phải gửi ảnh cho người dùng, không tóm tắt thay ảnh.
- Sau khi chốt layout, agent **bắt buộc hỏi phần background** (kiểu nền B01–B11, phối giữa các ảnh, nguồn màu, sáng / tối; ảnh `references/layout-groups/nen-01.png`, `nen-02.png`) trước khi làm concept. Không tự quyết nền.
- Bắt buộc có **cổng duyệt concept**: không dựng PSD trước khi người dùng duyệt storyboard, headline và hướng visual.
- **Dự án KHÔNG nằm trong folder này** (để tool luôn nhẹ). Folder dự án đọc từ `config.json` → `projectsRoot` (hiện tại `~/Downloads/app-screenshot-projects`). Tạo dự án mới: `scripts/new-project.sh <app-slug>`. Mỗi dự án gồm `input/`, `spec.json`, `output/`. `_example/`, `_demo-features/`, `_demo-features-2/`, `_demo-features-3/`, `_demo-mockup/`, `_demo-layouts-2/`, `_demo-connected/` trong folder dự án là mẫu, đừng sửa.
- **Adobe Stock: chỉ xem, không license hay tải** (`references/adobe-stock.md`). Người dùng tự tải tài nguyên vào `<projectsRoot>/_stock-library/`.
- **Màu thân máy (mockup): chỉ trắng hoặc đen.** Màu khác chỉ khi người dùng yêu cầu (`customColor: true`).
- **Không dùng chữ in nghiêng** trong thiết kế (engine tự chặn font Italic/Oblique).
- Mẫu tham khảo của người dùng nằm trong `samples/`. Chỉ đọc, không ghi đè.
- Chạy engine: `scripts/run-ps.sh scripts/build.jsx <projectsRoot>/<app-slug>/spec.json`. Đọc PSD mẫu: `scripts/run-ps.sh scripts/inspect-psd.jsx samples/<mau>/<file>.psd`.
- Script ExtendScript (`.jsx`) chạy bằng `$.evalFile`, nên **không đọc được ký tự UTF-8 trong mã nguồn `.jsx`**. Text tiếng Việt phải nằm trong file JSON (đọc bằng UTF-8) hoặc viết dạng `\uXXXX`.
