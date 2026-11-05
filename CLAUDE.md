# App Screenshot Designer

Project dựng ảnh App Store / Google Play / Product Showcase bằng Photoshop 2024 qua ExtendScript.

- Mọi việc thiết kế giao cho subagent **`app-screenshot-designer`** (`.claude/agents/app-screenshot-designer.md`).
- Bắt buộc có **cổng duyệt concept**: không dựng PSD trước khi người dùng duyệt storyboard, headline và hướng visual.
- **Dự án KHÔNG nằm trong folder này** (để tool luôn nhẹ). Folder dự án đọc từ `config.json` → `projectsRoot` (hiện tại `~/Downloads/app-screenshot-projects`). Tạo dự án mới: `scripts/new-project.sh <app-slug>`. Mỗi dự án gồm `input/`, `spec.json`, `output/`. `_example/`, `_demo-features/`, `_demo-features-2/`, `_demo-features-3/` trong folder dự án là mẫu, đừng sửa.
- **Không dùng chữ in nghiêng** trong thiết kế (engine tự chặn font Italic/Oblique).
- Mẫu tham khảo của người dùng nằm trong `samples/`. Chỉ đọc, không ghi đè.
- Chạy engine: `scripts/run-ps.sh scripts/build.jsx <projectsRoot>/<app-slug>/spec.json`. Đọc PSD mẫu: `scripts/run-ps.sh scripts/inspect-psd.jsx samples/<mau>/<file>.psd`.
- Script ExtendScript (`.jsx`) chạy bằng `$.evalFile`, nên **không đọc được ký tự UTF-8 trong mã nguồn `.jsx`**. Text tiếng Việt phải nằm trong file JSON (đọc bằng UTF-8) hoặc viết dạng `\uXXXX`.
