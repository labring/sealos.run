# App demo assets

- UI snapshot: Sealos Dev on 2026-10-20, four workspace pages and two conversation histories; examples `Nginx Web Server` and `eaglercraft-server-tvbxdlaa`.
- Layout and palette: sibling repository `sealox`, `packages/ui/src/styles/sealos-tokens.css`, `sealos-service/SealosServicePageChrome.tsx`, `sealos-service/sealos-new-task.css`.
- Monochrome UI icons: the same Lucide icons used in the App, exported locally with 1.5px strokes.
- Sealos mark: `sealox/packages/ui/src/assets/sealos/login-logo.svg`.
- Nginx service logo: `sealox/packages/ui/src/assets/sealos/logos/nginx.svg`.
- Creation-method marks: `sealox/packages/ui/src/assets/sealos/new-task/` (GitHub, template, database, Docker).
- Template logos: the public `https://template.bja.sealos.run/api/listTemplate` catalog. Original URLs follow `https://raw.githubusercontent.com/labring-actions/templates/kb-0.9/template/{name}/logo.{png,svg}` for `7daystodie`, `ace-step`, `affine`, `agora`, `airbyte`, `eaglercraft-server`.
- Raster logos are lossless WebP, rendered at up to 96px for the small UI sizes. No credentials or live account calls are bundled. The original RCON password in the conversation is masked.

- `pointer.svg`: Lucide `mouse-pointer-2` (https://lucide.dev/icons/mouse-pointer-2), adapted with white fill and a 1.6px dark stroke. Source: https://github.com/lucide-icons/lucide/blob/main/icons/mouse-pointer-2.svg. ISC license in `LUCIDE-LICENSE.txt`.
