# Midnight Grid · Kitvi 테마

[English](README.en.md) · [제작·공유 가이드](https://github.com/popop098/kitvi-theme-midnight-grid/blob/main/PLUGIN_GUIDE.md) · [릴리스](https://github.com/popop098/kitvi-theme-midnight-grid/releases)

푸른 회색 표면과 작은 점 무늬, 세 열 배치의 **독립 Kitvi 테마 플러그인**입니다. 밝은/어두운 팔레트와 화면에 표시되는 YouTube 공식 플레이어 예제를 제공합니다.

**Kitvi 0.7.0 이상이 필요합니다.** 사용 가능한 앱 버전은 [Kitvi 릴리스](https://github.com/popop098/Kitvi/releases)에서 확인하세요. 해당 버전의 설치 파일이 아직 없다면 [Kitvi 소스 빌드 안내](https://github.com/popop098/Kitvi#readme)를 참고하세요. 이 저장소에는 앱 설치 파일이 포함되지 않습니다.

## 설치

1. Kitvi의 **플러그인 → 플러그인 추가 → GitHub 저장소**에 `popop098/kitvi-theme-midnight-grid`를 입력하고 **가져오기**를 누릅니다. 최신 안정 릴리스의 테마 정보를 확인하고 **확인하고 설치**를 선택합니다.
2. **플러그인 사용**을 켭니다. 처음 사용할 때 표시되는 기능 사용 위험 안내에 동의합니다.
3. 설치된 Midnight Grid의 제작자·출처·`theme` / `playback` 권한을 확인하고 **동의하고 활성화**합니다. 기능 전체 동의와 이 플러그인의 개별 동의는 별도입니다.
4. **설정 → 앱 테마 → Midnight Grid**에서 미리보기 후 적용합니다. 취소하거나 기본 테마로 복원할 수도 있습니다.

ZIP으로 설치하려면 [최신 릴리스](https://github.com/popop098/kitvi-theme-midnight-grid/releases/latest)의 `kitvi-theme-midnight-grid-1.0.0.kitvi-plugin.zip`을 받아 **ZIP 파일 선택**으로 가져오고 같은 동의 절차를 진행하세요. 같은 ID의 로컬 ZIP이 이미 설치되어 있으면 GitHub 출처로 바꾸기 전에 기존 플러그인을 제거해야 할 수 있습니다.

## YouTube 예제와 권한

- `theme`: 앱의 색상·배경·글꼴·카드 배치를 바꿉니다.
- `playback`: BGM 카드에서 YouTube 공식 플레이어를 사용합니다. 영상 ID는 공식 IFrame API 예제의 `M7lc1UVf-VE`입니다.

설치·활성화·테마 적용·앱 재시작으로 영상이 자동 재생되지 않습니다. BGM 카드에서 직접 재생하세요. YouTube 플레이어는 화면에 보여야 하며 가려지거나 잘리거나 다른 페이지로 이동하거나 창을 최소화하면 일시정지합니다. 숨긴 플레이어나 오디오 추출을 사용하지 않습니다. 네트워크와 해당 영상의 외부 재생 허용 여부에 따라 재생이 실패할 수 있습니다. API 키·로그인 없이 주어진 영상 ID를 재생하며 검색·계정 연동은 제공하지 않습니다.

제작자 `popop098`는 매니페스트에 직접 기재한 정보입니다. 제작자 이름과 GitHub 출처 표시는 검증 배지나 안전성 보증을 뜻하지 않습니다. 연락처 이메일은 등록하지 않았습니다.

## 빌드

Node.js **24 이상**만 필요하며 npm 의존성이나 Kitvi 소스 체크아웃은 필요하지 않습니다.

```powershell
git clone https://github.com/popop098/kitvi-theme-midnight-grid.git
cd kitvi-theme-midnight-grid
npm run build
```

생성 파일:

```text
dist/kitvi-theme-midnight-grid-1.0.0.kitvi-plugin.zip
dist/SHA256SUMS.txt
```

내장 Node ZIP 빌더는 매니페스트·테마 JSON·자산 참조와 파일 시그니처·경로·크기 제한을 사전 검사합니다. Kitvi의 전체 설치 검증기를 포함하지 않으므로 실제 앱에서 설치와 동작을 확인하세요. ZIP에는 매니페스트, 테마, `assets/`, 한국어/영어 README와 라이선스만 들어갑니다. 소스의 스크립트·Git 데이터·`.env*`·`node_modules/`·`dist/`는 포함되지 않습니다.

원본 PNG는 `npm run assets`로 재생성할 수 있습니다. 커스텀 자산으로 교체한 뒤 실행하면 원본 예제 자산으로 덮어쓰므로 주의하세요. 직접 수정하고 공유하는 방법은 [PLUGIN_GUIDE.md](https://github.com/popop098/kitvi-theme-midnight-grid/blob/main/PLUGIN_GUIDE.md), 정확한 SDK/API 계약은 [Kitvi SDK 2 가이드](https://github.com/popop098/Kitvi/blob/main/docs/theme-sdk.md)를 참고하세요.

## 라이선스

소스와 직접 생성한 PNG는 [MIT](LICENSE)입니다. Kitvi 예제에서 시작했으며 원저작권 고지를 유지합니다. YouTube 영상은 패키지에 포함되지 않고 공식 플레이어가 외부에서 불러옵니다. MIT 라이선스는 해당 영상의 권리를 부여하지 않습니다.
