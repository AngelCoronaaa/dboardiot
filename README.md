# AirCare IoT — Dashboard React + backend NestJS

```
Navegador (React) ──Socket.IO + DASHBOARD_TOKEN──► aircare-backend (NestJS) ──MQTT + usuario/contraseña──► Mosquitto
```

El backend es el único proceso que conoce las credenciales del broker. El
frontend solo conoce la URL del backend y el `DASHBOARD_TOKEN`.

| Carpeta | Qué es |
|---|---|
| [aircare-backend/](aircare-backend/) | NestJS: se suscribe a `aircare/equipo5/{datos,estado,alerta}` y los reemite por Socket.IO; recibe `cmd:modo`, `cmd:alarma` y `cmd:ventilador` y los publica en MQTT con `retain: true`. |
| [aircare-frontend/](aircare-frontend/) | React + Vite + TypeScript: el dashboard de una sola pantalla. |

## Desarrollo local

```bash
# Backend
cd aircare-backend
cp .env.example .env        # llenar MQTT_PASS y DASHBOARD_TOKEN; fuera de Docker usar
                            # MQTT_URL=wss://mqtt.stardest.com/mqtt
npm install
npm run start:dev           # http://localhost:3001  (GET /health)

# Frontend
cd aircare-frontend
cp .env.example .env        # VITE_DASHBOARD_TOKEN = el mismo DASHBOARD_TOKEN
npm install
npm run dev                 # http://localhost:5173
```

## Contrato Socket.IO

Autenticación: `io(url, { auth: { token } })` (también se acepta `?token=`).
Si el token no coincide, la conexión se rechaza con el error `unauthorized`.

**Servidor → navegador**

| Evento | Payload |
|---|---|
| `datos` | el JSON tal cual llega por MQTT |
| `estado` | `"online"` \| `"offline"` |
| `alerta` | el JSON tal cual llega por MQTT |
| `comando` | `{ tipo: "modo" \| "alarma" \| "ventilador", valor }`: el valor retenido actual de `cmd/*`, para que los switches reflejen el estado real (también si se cambió desde Node-RED) |
| `broker` | `true` \| `false`: si el backend está conectado a Mosquitto |

Al conectarse, cada cliente recibe de inmediato el último valor conocido de cada tópico.

**Navegador → servidor** (el ack devuelve `{ ok, error? }`)

| Evento | Payload |
|---|---|
| `cmd:modo` | `"manual"` \| `"auto"` |
| `cmd:alarma` | `"ON"` \| `"OFF"` |
| `cmd:ventilador` | `"ON"` \| `"OFF"` |

Si el backend no está conectado al broker, el comando se rechaza (no se encola),
para que un actuador no se active minutos después sin que nadie lo espere.

## Deploy del backend (docker-compose junto a mosquitto y nodered)

Copiar `aircare-backend/` junto al `docker-compose.yml` del servidor y agregar:

```yaml
  aircare-backend:
    build:
      context: ./aircare-backend
      dockerfile: Dockerfile
    container_name: aircare-backend
    environment:
      - MQTT_URL=mqtt://mosquitto:1883
      - MQTT_USER=aircare
      - MQTT_PASS=${AIRCARE_MQTT_PASS}
      - DASHBOARD_TOKEN=${AIRCARE_DASHBOARD_TOKEN}
      - CORS_ORIGIN=https://aircare.stardest.com
      - PORT=3001
    networks:
      - internal_network
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.aircare-api-router.rule=Host(`api.aircare.stardest.com`)"
      - "traefik.http.routers.aircare-api-router.entrypoints=web"
      - "traefik.http.routers.aircare-api-router.priority=10"
      - "traefik.http.services.aircare-api-service.loadbalancer.server.port=3001"
```

Alternativa: publicar `api.aircare.stardest.com` en el Cloudflare Tunnel apuntando a
`http://aircare-backend:3001`, igual que `iotdash.stardest.com`.

## Deploy del frontend (StarDest)

Proyecto Vite estándar. Necesita como variables de **build**:
`VITE_BACKEND_URL=https://api.aircare.stardest.com` y `VITE_DASHBOARD_TOKEN`.
