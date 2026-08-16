# App Liga de Fútbol — Afacon Liga Colbun

## Estado del proyecto
Aplicación web operativa y desplegada para gestionar una asociación de fútbol amateur, con arquitectura preparada para evolucionar a una plataforma multi-asociación.

## Producción
- Frontend desplegado en Vercel.
- Base de datos, autenticación, almacenamiento y Edge Functions en Supabase.
- Código fuente e historial en GitHub.

## Proyecto Supabase correcto
- Nombre: `liga-futbol-plataforma`
- Project ref: `fkngbbwpjfmirmshbqrs`

> Importante: existe otro proyecto Supabase distinto llamado `ac273720-prog's Project`; no corresponde a esta app.

## URL pública
- `https://app-liga-futbol.vercel.app`

## Arquitectura actual
La app usa una sola interfaz web en `index.html` y Supabase como backend.

### Roles
- `platform_admin`: propietario de la plataforma. Acceso total y control de suspensión del servicio.
- `association_admin`: máximo 2 por asociación. Puede programar fechas, gestionar partidos y administrar usuarios de la asociación.
- `team_admin`: máximo 2 por club. Solo puede gestionar partidos de su club: resultados, informe arbitral, nombres de árbitros y turno/dirigente.
- Visitantes públicos: solo lectura, sin login.

## Funciones principales ya implementadas
- Vista pública con tablas de posiciones.
- Vista pública de fechas y resultados.
- Filtros por liga y serie/categoría.
- Programación de fecha entre clubes.
- Creación automática de partidos por serie dentro de una fecha.
- Gestión de resultados.
- Editar y borrar resultados.
- Eliminar fecha completa para propietario/admin asociación.
- Informe arbitral y turno.
- Carga de foto/PDF de informe.
- Gestión de administradores.
- Borrar administradores.
- Máximo 2 administradores por club y 2 por asociación.
- Invitaciones por correo.
- Creación de contraseña al aceptar invitación.
- Vista pública sin login y acceso administrativo con correo/contraseña.
- Control del propietario para suspender/reactivar servicio.
- Diseño visual futbolístico en tonos verde/gris, evitando fondo blanco puro.

## Flujo de invitaciones
Edge Function: `invite-app-user`

La función usa como URL de retorno:
`https://app-liga-futbol.vercel.app`

Configuración esperada en Supabase Authentication > URL Configuration:
- Site URL: `https://app-liga-futbol.vercel.app`
- Redirect URLs: `https://app-liga-futbol.vercel.app/**`

Último problema detectado: límite temporal de envío de correos (`429 email rate limit exceeded`) por múltiples pruebas seguidas. La función fue actualizada para mostrar un mensaje claro en español.

## Edge Functions importantes
- `invite-app-user`: invita administradores y crea/actualiza su registro en `app_users`.
- `remove-app-user`: elimina acceso administrativo y usuario asociado cuando corresponde.

## Modelo de negocio previsto
La idea es convertir la app en una plataforma SaaS multi-asociación. Afacon Liga Colbun sería una asociación y se pueden agregar otras asociaciones separando datos, administradores y estado de servicio por asociación. El propietario debe conservar control superior y capacidad de suspender solo una asociación por falta de pago, sin afectar a las demás.

## Próximos pasos recomendados
1. Probar una nueva invitación después de que se libere el rate limit de correo.
2. Confirmar flujo completo: invitación → aceptar → crear contraseña → login administrador.
3. Revisar permisos reales de admin de club y admin de asociación.
4. Agregar las próximas 3 asociaciones como tenants separados.
5. Crear un panel propietario multi-asociación con estado activo/suspendido por asociación.
6. Hacer una revisión final móvil/escritorio y correcciones menores.

## Notas de seguridad y operación
- No guardar claves secretas de Supabase en este README ni en el frontend.
- El frontend solo debe usar la publishable key.
- Las operaciones privilegiadas deben ejecutarse mediante Edge Functions con validación de rol.
- La app sigue funcionando aunque el computador local esté apagado, porque GitHub, Vercel y Supabase alojan el proyecto.
