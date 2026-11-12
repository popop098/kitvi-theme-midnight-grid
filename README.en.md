# Midnight Grid · Kitvi theme

[한국어](README.md) · [Create and share a theme](PLUGIN_GUIDE.md#english) · [Releases](https://github.com/popop098/kitvi-theme-midnight-grid/releases)

A standalone Kitvi theme plugin with blue-gray surfaces, a dotted PNG pattern and a three-column dashboard. It includes light/dark palettes and a visible official YouTube player example.

**Requires Kitvi 0.7.0 or later.** Check [Kitvi Releases](https://github.com/popop098/Kitvi/releases) for available app versions. If a compatible installer is not published yet, see [Kitvi's source build instructions](https://github.com/popop098/Kitvi#readme). This repository does not contain the app installer.

## Install

1. In Kitvi, open **Plugins → Add plugin → GitHub repository**. Enter `popop098/kitvi-theme-midnight-grid`, select **Fetch**, review the latest stable release and install it.
2. Turn on **Use plugins** and accept the first-use feature warning.
3. Review Midnight Grid's self-declared author, source and `theme` / `playback` permissions, then consent and activate it. Global plugin consent and individual plugin consent are separate.
4. In **Settings → App theme**, preview and apply **Midnight Grid**. You can cancel or restore the default theme.

For a local installation, download `kitvi-theme-midnight-grid-1.0.0.kitvi-plugin.zip` from the [latest release](https://github.com/popop098/kitvi-theme-midnight-grid/releases/latest), choose **Select ZIP file**, and complete the same consent steps. If a local ZIP with this ID is already installed, you may need to uninstall it before switching to the GitHub source. Kitvi's current interface labels may appear in Korean.

## YouTube example and permissions

- `theme` changes colors, background, typography and card layout.
- `playback` enables the BGM card's official YouTube player. It references the official IFrame API example video `M7lc1UVf-VE`.

Installation, activation, theme application and app restart never start playback. Use the BGM card's Play control. YouTube requires a visible player and pauses when hidden, clipped, off-page or minimized. There is no hidden player or audio extraction. Availability depends on the network and the video's embedding permissions. Playing the given ID needs no API key or login; search and account integration are not provided.

The manifest author `popop098` is self-declared. The author and GitHub source display are not verification badges or safety guarantees. No author email is registered.

## Build

Use **Node.js 24+**. No npm dependencies or Kitvi source checkout are needed.

```powershell
git clone https://github.com/popop098/kitvi-theme-midnight-grid.git
cd kitvi-theme-midnight-grid
npm run build
```

Outputs:

```text
dist/kitvi-theme-midnight-grid-1.0.0.kitvi-plugin.zip
dist/SHA256SUMS.txt
```

The built-in Node ZIP builder checks local manifest/theme data, references, asset signatures, paths and size limits. It does not bundle Kitvi's complete installer validator; verify installation and behavior in the actual app. Only the manifest, theme, assets, Korean/English READMEs and license enter the ZIP. Scripts, Git data, `.env*`, `node_modules/` and `dist/` are excluded.

Run `npm run assets` to regenerate the original PNG. It overwrites customized copies with the example asset. See the [authoring guide](PLUGIN_GUIDE.md#english) to customize and share, and [Kitvi's SDK 2 guide](https://github.com/popop098/Kitvi/blob/main/docs/theme-sdk.md) for the exact SDK/API contract.

## License

The source and generated PNG use the [MIT license](LICENSE). This project began with Kitvi's example and retains its copyright notice. The external YouTube video is loaded by the official player and is not bundled. The MIT license does not grant rights to that video.
