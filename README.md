# Bienestar Mental y Estudiantil

PWA para que cada estudiante registre sueño, alimentación, hidratación, actividad física y estado emocional. El panel de administración solo muestra cifras agregadas.

## Requisitos

- Node.js
- La base MySQL de Clever Cloud configurada en `backend-bienestar-estudiantil/.env` (usa `backend-bienestar-estudiantil/.env.example` como plantilla)

## Arranque

En dos terminales, desde la raíz del proyecto:

```bash
npm run dev:api
npm run dev:web
```

La aplicación queda en http://localhost:5173 y la API en http://localhost:3000.

La primera vez, el backend crea las tablas del modelo entidad-relación y una cuenta administradora con el correo y la contraseña de `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

Los estudiantes se registran desde la pantalla de inicio. Las contraseñas se guardan con hash.
