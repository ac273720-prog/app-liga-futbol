# Plan de recuperación — Linares Score Futbol Amateur

Este archivo NO contiene contraseñas, tokens ni claves privadas.

## 1. Copia estable del código

Existe una rama de recuperación creada desde una versión estable de producción:

- `recovery-snapshot-2026-08-16`
- Commit base: `6716cd541955e61f77da033ff31f2f95b61cf235`

Si `main` se rompe por un cambio accidental, se puede restaurar desde esa rama.

## 2. Servicios que forman la aplicación

La aplicación depende de tres servicios principales:

- GitHub: código fuente.
- Vercel: despliegue web.
- Supabase: base de datos, autenticación y almacenamiento.

La caída o pérdida de acceso a uno de estos servicios no implica automáticamente perder los otros dos.

## 3. En caso de cuenta comprometida

Orden recomendado:

1. Recuperar y proteger primero el correo principal.
2. Cambiar la contraseña del correo.
3. Activar o recuperar 2FA del correo.
4. Recuperar GitHub y revocar sesiones, tokens y claves sospechosas.
5. Recuperar Vercel y revisar miembros, proyectos, dominios y variables de entorno.
6. Recuperar Supabase y revisar miembros, claves API, Auth, Edge Functions y cambios recientes.
7. Rotar cualquier token o clave que pudiera haber quedado expuesta.
8. Comparar el código de `main` con la rama `recovery-snapshot-2026-08-16` antes de volver a desplegar.
9. Revisar los últimos despliegues de Vercel y restaurar uno conocido como estable si fuera necesario.
10. Revisar tablas y políticas RLS de Supabase antes de reabrir accesos administrativos.

## 4. Protección preventiva que debe mantenerse

- 2FA en correo, GitHub, Vercel y Supabase.
- Contraseñas únicas para cada servicio.
- Guardar códigos de recuperación fuera del computador principal.
- No enviar tokens, claves API, contraseñas ni códigos 2FA por chat, capturas o WhatsApp.
- Revisar sesiones abiertas y dispositivos autorizados periódicamente.
- Mantener al menos una copia local del repositorio en un PC o disco externo.
- Descargar copias de respaldo de la base de datos de Supabase con regularidad.

## 5. Restauración rápida del frontend

Si Vercel se pierde pero GitHub sigue accesible:

1. Crear un proyecto nuevo en Vercel.
2. Importar `ac273720-prog/app-liga-futbol`.
3. Configurar las variables de entorno necesarias.
4. Conectar el dominio.
5. Desplegar desde `main` o desde la rama de recuperación.

## 6. Restauración del código

Si `main` queda dañado pero GitHub sigue accesible, usar como referencia:

`recovery-snapshot-2026-08-16`

Nunca borrar esa rama sin crear antes una rama de recuperación más reciente.

## 7. Supabase

No guardar una exportación de la base de datos dentro de este repositorio porque el repositorio puede ser público y la base contiene información que no debe publicarse.

Las copias de Supabase deben conservarse fuera del repositorio y en un lugar privado.

## 8. Regla principal

Antes de un cambio grande en producción, crear una nueva rama de recuperación desde la versión estable actual y conservar al menos una copia anterior.
