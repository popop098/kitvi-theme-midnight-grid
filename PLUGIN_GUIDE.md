# 내 테마 만들고 공유하기

[English](#english) · [Kitvi SDK 2 전체 가이드](https://github.com/popop098/Kitvi/blob/main/docs/theme-sdk.md)

이 저장소를 포크하거나 복사하면 Kitvi 소스 없이 선언형 테마를 만들 수 있습니다. Node.js 24 이상에서 `npm run build`로 패키징하세요. 정확한 스키마·타입·선택적 설정 UI API는 위 Kitvi 문서를 기준으로 합니다.

## 1. 내 플러그인 정보 지정

`kitvi-plugin.json`과 `theme.json`의 `id`를 **같은 고유한 소문자 dotted ID**로 바꿉니다(예: `myname.theme.study-room`). 다른 제작자의 ID를 재사용하지 마세요. 배포한 뒤에는 ID를 유지합니다.

매니페스트의 `name`, `description`, `author`를 수정하고, `version`과 `package.json`의 버전을 맞춥니다. `package.json`의 `name`도 자신의 소문자 저장소 이름으로 바꾸세요. 빌드 파일명이 이 값으로 정해집니다. SDK 2는 `apiVersion: 2`, `kind: "theme"`, `minKitviVersion: "0.7.0"` 이상을 사용합니다. 제작자 이름과 선택적 `authorEmail`은 자기 기재 정보이며 인증되지 않습니다. 공개해도 되는 실제 연락처만 넣으세요.

## 2. theme.json 수정

| 항목 | 수정할 내용 |
| --- | --- |
| `modes.light`, `modes.dark` | `canvas`, `panel`, `surface`, `text`, `muted`, `border`, `accent`, `accentText`, `accentSoft`, `cpu`, `memory`, `gpu` 전체 색상. `#RRGGBB` 또는 `#RRGGBBAA` |
| `typography` | `fontFamily`: `pretendard` / `system` / `custom`; `baseSize`: 14–20. custom은 `fontAsset`에 `assets/` 안 글꼴 경로 지정 |
| `shape` | `radius`: 0–20, `spacing`: 0.8–1.3 |
| `background` | `asset`: `assets/` 안 PNG/JPEG/GIF/WebP, `opacity`: 0–1, `fit`: `cover` / `contain` |
| `layout` | `order`, `hidden`, `columns`: 1/2/3. 카드: summary/performance/storage/displays/devices/bgm. summary/performance는 숨길 수 없음 |
| `bgm` | 제목·트랙·반복·음량. 로컬 `asset` MP3/OGG/WAV/M4A 또는 `youtube` 영상 ID |

예를 들어 `shape.radius`를 `10`, `layout.columns`를 `2`로 바꾸고 밝은/어두운 `accent` 색을 함께 조정해 보세요. 배경·글꼴·오디오 파일은 `assets/` 아래에 두고 JSON에서 정확히 같은 대소문자의 `/` 상대 경로로 참조합니다. 사용할 권리와 라이선스 고지를 확보하세요. 원시 CSS, 외부 자산 URL, 호스트 스크립트는 테마 필드로 넣을 수 없습니다.

BGM이 있으면 매니페스트에 `theme`와 `playback` 권한이 필요합니다. 음악을 없애려면 `bgm`과 `playback` 권한을 함께 제거하세요. `media` 권한은 BGM에 필요하지 않습니다. 재생 시작은 호스트의 사용자 버튼으로만 처리합니다. YouTube는 화면에 보이는 공식 플레이어를 사용하며 숨김·잘림·페이지 이동·최소화 시 일시정지합니다.

## 3. 빌드와 실제 앱 확인

```powershell
npm run build
```

`dist/<package-name>-<version>.kitvi-plugin.zip`과 `dist/SHA256SUMS.txt`가 만들어집니다. 같은 소스는 같은 ZIP과 SHA256을 생성합니다. 외부 패키지 설치는 필요하지 않습니다.

이 빌더는 매니페스트, 선언된 테마 JSON, `assets/`, README 두 개와 LICENSE만 포함합니다. `.git`, `.env*`, `node_modules`, `dist`, `.cache`를 제외하고 링크·경로 탈출·대소문자 충돌을 거절합니다. 일반 파일 4 MiB, 글꼴 2 MiB, 리소스/ZIP 16 MiB, 최대 256개 항목을 검사합니다. 자산 참조와 확장자별 기본 시그니처도 확인하지만 파일의 전체 디코딩·코덱 지원·실제 UI 동작은 검사하지 않습니다. 선택적 `entry`가 있다면 패키지 안에 실제로 존재해야 합니다. 이 시작 프로젝트는 HTML 설정 UI를 패키징하지 않으므로 해당 기능을 추가할 때는 Kitvi SDK 전체 가이드와 공식 패키저를 따르세요.

Kitvi 0.7.0 이상에서 ZIP을 가져와 두 동의를 거친 뒤 미리보기·적용·취소·기본 테마 복원을 확인합니다. 밝게/어둡게, 좁은 창, 카드 순서, 글꼴 실패, 재생·일시정지, 페이지 이동·최소화, 플러그인 끄기·앱 재시작을 확인하세요. 이 저장소의 로컬 빌드 성공만으로 호스트 검증이나 모든 재생 환경이 보장되지는 않습니다.

## 4. GitHub 릴리스로 공유

자신의 공개 GitHub 저장소에 소스를 올리고 매니페스트 버전과 같은 `v1.0.0` 또는 `1.0.0` 태그의 **안정 릴리스**를 만듭니다. 릴리스에 정확히 하나의 `*.kitvi-plugin.zip`과 `SHA256SUMS.txt`를 첨부합니다. 체크섬에는 실제 ZIP 파일명과 두 칸을 사용합니다.

```text
<64자리 SHA256>  <package-name>-1.0.0.kitvi-plugin.zip
```

사용자에게 Kitvi의 GitHub 저장소 입력란에 넣을 `소유자/저장소`를 알려 주세요. 다음 배포 때 두 버전을 올리고 다시 빌드해 새 안정 릴리스를 게시하면 앱의 GitHub 플러그인 업데이트 경로를 사용할 수 있습니다. 제작자·연락처·권한 변경은 다시 동의가 필요하며 같은 ID의 로컬 ZIP에서 GitHub 출처로 바꿀 때는 기존 설치를 제거해야 할 수 있습니다. README의 저장소 링크·설치 파일명·권한 설명도 함께 갱신하세요.

## English

Fork or copy this standalone project. Use Node.js 24+ and `npm run build`; no Kitvi checkout or npm dependencies are required. The [Kitvi SDK 2 guide](https://github.com/popop098/Kitvi/blob/main/docs/theme-sdk.md) defines the exact schema, types and optional settings UI API.

1. Give `kitvi-plugin.json` and `theme.json` the same unique lowercase dotted ID, such as `myname.theme.study-room`. Keep that ID after publishing. Update the name, description and self-declared author. Keep manifest and `package.json` versions equal, set the package name to your lowercase repository name, and require Kitvi 0.7.0+. Only add a real public email if desired; it is not verified.
2. Customize both complete light/dark semantic palettes, typography (14–20 px), radius (0–20), spacing (0.8–1.3), background opacity/fit and 1–3 columns. Use the field table above. `summary` and `performance` cannot be hidden. Put supported image/font/audio assets under `assets/`, using exact-case portable paths and appropriate license notices. Raw host CSS/scripts and external asset URLs are unsupported.
3. Keep `theme` and `playback` permissions when using BGM. Remove `bgm` and `playback` together to omit audio. Playback starts through the user's host controls. YouTube must use a visible official player and pauses when hidden/clipped, off-page or minimized. `media` is not needed for BGM.
4. Build and test in Kitvi 0.7.0+: install, accept global and individual consent, preview/apply/cancel/restore, check light/dark and narrow layouts, play/pause, navigate, minimize, disable and restart. The local builder is a preflight check, not Kitvi's complete validator or a codec/UI test. It includes only the manifest, declared theme, assets, READMEs and license. It rejects links, unsafe paths, case collisions, invalid references/signatures and sizes over 4 MiB per file, 2 MiB per font, 16 MiB total/ZIP, or 256 entries. Optional `entry` must exist; this starter does not package HTML settings UIs. Use Kitvi's full guide and official packager when adding one.
5. Publish source in your own public GitHub repository. Create a stable release tagged `v<manifest-version>` or `<manifest-version>` and attach exactly one generated `*.kitvi-plugin.zip` plus `SHA256SUMS.txt`. The checksum line is `<64-character SHA256><two spaces><exact ZIP basename>`. Share `owner/repository` for installation. Bump both versions and publish a new stable release for updates. Changed author/contact/permissions require renewed consent. Switching an existing local ZIP to GitHub may require uninstalling it first.

Update repository links, filenames and permission descriptions in both READMEs when sharing your own theme. The generated original assets can be recreated with `npm run assets`; that command overwrites customized asset copies. The MIT license covers this project's code and generated assets, not externally referenced YouTube videos.
