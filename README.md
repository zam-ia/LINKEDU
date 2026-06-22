# Doce

Sistema operativo educativo con aplicación web, app móvil y Supabase.

## Ejecutar desde la raíz

```powershell
npm run setup
npm run dev
```

La web estará disponible en `http://localhost:3000`.

## Comandos

```powershell
npm run build          # build web de producción
npm run lint           # lint web
npm run check          # lint + build
npm run mobile         # Expo
npm run mobile:web     # Expo Web
```

## Entorno

1. Copiar `.env.example` a `.env`.
2. Copiar `web/.env.example` a `web/.env.local`.
3. Copiar `mobile/.env.example` a `mobile/.env`.
4. Mantener `SUPABASE_SERVICE_ROLE_KEY` únicamente en servidor.

## Super Admin

El usuario se aprovisiona sin guardar su contraseña en archivos:

```powershell
$env:SUPERADMIN_EMAIL="correo@dominio.com"
$env:SUPERADMIN_PASSWORD="contraseña-temporal"
npm run provision:superadmin
Remove-Item Env:SUPERADMIN_PASSWORD
```
