# 📋 Plantilla de Campos para Proveedores - Domify

## 🎯 Información para Google Sheets: https://docs.google.com/spreadsheets/d/1hmf0d1t5ZCdRoAAKcMSisCjx3XTTlwm_9jrweNl-LuQ/edit?usp=sharing

### 📊 Estructura de Columnas Recomendada

| Columna | Nombre del Campo | Tipo | Requerido | Ejemplo | Descripción |
|---------|------------------|------|-----------|---------|-------------|
| A | **Timestamp** | DateTime | ✅ | `2024-01-15T10:30:00Z` | Fecha y hora de la solicitud |
| B | **ID_Aplicacion** | Text | ✅ | `APP-2024-001` | Identificador único de la aplicación |
| C | **Nombre** | Text | ✅ | `Juan Carlos` | Nombre del solicitante |
| D | **Apellido** | Text | ✅ | `González López` | Apellido del solicitante |
| E | **Email** | Email | ✅ | `juan.gonzalez@email.com` | Correo electrónico |
| F | **Telefono** | Phone | ✅ | `+505 8888-1234` | Número de teléfono |
| G | **Departamento** | Text | ✅ | `Managua` | Departamento/ciudad principal |
| H | **Direccion** | Text | ✅ | `Colonia Centroamérica, Casa #45` | Dirección completa |
| I | **Tipo_Proveedor** | Dropdown | ✅ | `Individual` | Individual o Empresa |
| J | **Titulo_Servicio** | Text | ✅ | `Fontanero Profesional` | Título del servicio ofrecido |
| K | **Descripcion** | Text | ✅ | `Especialista en instalaciones de agua...` | Descripción detallada |
| L | **Precio_Hora** | Number | ✅ | `350` | Tarifa en córdobas por hora |
| M | **Experiencia_Anos** | Number | ✅ | `5` | Años de experiencia |
| N | **Disponibilidad** | Text | ✅ | `Lunes a Viernes 8AM-6PM` | Horarios disponibles |
| O | **Categorias** | Text | ✅ | `Fontaneros, Plomería` | Categorías de servicio |
| P | **Estado** | Dropdown | ✅ | `Pendiente` | Estado de la aplicación |
| Q | **Fecha_Creacion** | Date | ✅ | `2024-01-15` | Fecha de creación |
| R | **Estado_Revision** | Text | ✅ | `Pendiente de revisión` | Estado de revisión |
| S | **Nombre_Negocio** | Text | 🔶 | `Servicios González` | Nombre del negocio (opcional) |
| T | **Portfolio** | URL | 🔶 | `https://portfolio.com` | Enlace a portfolio |
| U | **Referencias** | Text | 🔶 | `María López - +505 7777-8888` | Referencias de clientes |
| V | **Certificaciones** | Text | 🔶 | `Certificado Técnico Fontanería` | Certificaciones profesionales |
| W | **Documentos_ID** | Text | 🔶 | `Cédula: 001-123456-0000X` | Documentos de identidad |
| X | **Licencias** | Text | 🔶 | `Licencia Municipal #12345` | Licencias profesionales |
| Y | **Seguros** | Text | 🔶 | `Seguro de Responsabilidad Civil` | Seguros contratados |
| Z | **Notas_Admin** | Text | 🔶 | `Cliente recomendado por...` | Notas del administrador |

### 🎨 Ejemplos Completos de Solicitudes

#### 📝 **Ejemplo 1: Fontanero Individual**
```
A: 2024-01-15T10:30:00Z
B: APP-2024-001
C: Roberto
D: Martínez Silva
E: roberto.martinez@email.com
F: +505 8888-1234
G: Managua
H: Colonia Centroamérica, Casa #45, Managua
I: Individual
J: Fontanero Profesional
K: Especialista en instalaciones de agua potable, reparación de tuberías, instalación de grifos y sanitarios. Experiencia en proyectos residenciales y comerciales.
L: 350
M: 8
N: Lunes a Viernes 8:00 AM - 6:00 PM, Sábados 8:00 AM - 2:00 PM
O: Fontaneros, Plomería
P: Pendiente
Q: 2024-01-15
R: Pendiente de revisión
S: 
T: https://roberto-fontanero.portfolio.com
U: María López - +505 7777-8888, Carlos Ramírez - +505 6666-9999
V: Certificado Técnico en Fontanería - INATEC
W: Cédula: 001-123456-0000X
X: Licencia Municipal de Fontanería #2024-001
Y: Seguro de Responsabilidad Civil - Seguros América
Z: Cliente recomendado por proveedor existente
```

#### 📝 **Ejemplo 2: Empresa de Jardinería**
```
A: 2024-01-16T14:20:00Z
B: APP-2024-002
C: Ana
D: Rodríguez Vega
E: ana.rodriguez@jardinesverdes.com
F: +505 7777-5678
G: Granada
H: Calle Real, Edificio Central, Granada
I: Empresa
J: Jardinería y Paisajismo Profesional
K: Servicios completos de jardinería, diseño de paisajes, mantenimiento de áreas verdes, poda de árboles y plantas ornamentales.
L: 450
M: 12
N: Lunes a Domingo 7:00 AM - 5:00 PM
O: Jardinería, Paisajismo
P: En Revisión
Q: 2024-01-16
R: En proceso de verificación
S: Jardines Verdes S.A.
T: https://jardinesverdes.com/portfolio
U: Hotel Plaza Colón - +505 2552-1234, Residencial Los Pinos - +505 2552-5678
V: Certificado en Paisajismo - Universidad Nacional, Certificado en Botánica
W: RUC: J0310000123456
X: Licencia Municipal de Jardinería #2024-002, Permiso Ambiental #2024-003
Y: Seguro Integral de Jardinería - Seguros Nicaragua
Z: Empresa establecida, buenas referencias
```

#### 📝 **Ejemplo 3: Electricista Individual**
```
A: 2024-01-17T09:15:00Z
B: APP-2024-003
C: Luis
D: Herrera Mendoza
E: luis.herrera@email.com
F: +505 6666-9012
G: León
H: Barrio San Juan, Casa #23, León
I: Individual
J: Electricista Residencial y Comercial
K: Instalaciones eléctricas residenciales y comerciales, reparación de circuitos, instalación de paneles solares, mantenimiento preventivo.
L: 400
M: 6
N: Lunes a Sábado 7:00 AM - 7:00 PM
O: Electricistas, Energía Solar
P: Aprobado
Q: 2024-01-17
R: Aprobado - Entrevista programada
S: 
T: 
U: José Pérez - +505 5555-1234, Carmen Ruiz - +505 4444-5678
V: Técnico en Electricidad - INATEC, Certificado en Energía Solar
W: Cédula: 001-234567-0000Y
X: Licencia de Electricista #2024-003
Y: Seguro de Trabajo Eléctrico
Z: Excelente experiencia técnica, recomendado
```

### 🔧 Configuración de Validaciones en Google Sheets

#### **Validaciones de Datos Recomendadas:**

1. **Email (Columna E)**: Formato de email válido
2. **Teléfono (Columna F)**: Formato +505 XXXX-XXXX
3. **Precio por Hora (Columna L)**: Número mayor a 0
4. **Experiencia (Columna M)**: Número entre 0 y 50
5. **Tipo de Proveedor (Columna I)**: Lista: Individual, Empresa
6. **Estado (Columna P)**: Lista: Pendiente, En Revisión, Aprobado, Rechazado

#### **Formato Condicional Sugerido:**

- **Verde**: Aplicaciones aprobadas
- **Amarillo**: Aplicaciones en revisión
- **Rojo**: Aplicaciones rechazadas
- **Gris**: Aplicaciones pendientes

### 📋 Campos Obligatorios vs Opcionales

#### ✅ **CAMPOS OBLIGATORIOS (Requeridos)**
- Timestamp
- ID_Aplicacion
- Nombre
- Apellido
- Email
- Telefono
- Departamento
- Direccion
- Tipo_Proveedor
- Titulo_Servicio
- Descripcion
- Precio_Hora
- Experiencia_Anos
- Disponibilidad
- Categorias
- Estado
- Fecha_Creacion
- Estado_Revision

#### 🔶 **CAMPOS OPCIONALES (No Requeridos)**
- Nombre_Negocio
- Portfolio
- Referencias
- Certificaciones
- Documentos_ID
- Licencias
- Seguros
- Notas_Admin

### 🎯 Estados de Aplicación

| Estado | Descripción | Color |
|--------|-------------|-------|
| **Pendiente** | Solicitud recién enviada | Gris |
| **En Revisión** | En proceso de verificación | Amarillo |
| **Aprobado** | Aprobado para entrevista | Verde |
| **Rechazado** | No cumple requisitos | Rojo |
| **Entrevistado** | Entrevista completada | Azul |
| **Capacitado** | Capacitación completada | Verde Oscuro |
| **Activo** | Proveedor activo en plataforma | Verde Brillante |

### 📊 Métricas Importantes

#### **Para Seguimiento:**
- Tiempo promedio de revisión
- Tasa de aprobación
- Categorías más solicitadas
- Departamentos con más aplicaciones
- Precio promedio por hora

#### **Para Análisis:**
- Experiencia promedio de los solicitantes
- Distribución por tipo de proveedor
- Calidad de las referencias
- Completitud de la información

### 🔄 Flujo de Trabajo Sugerido

1. **Recepción**: Solicitud llega automáticamente
2. **Revisión Inicial**: Verificar campos obligatorios
3. **Verificación**: Contactar referencias y verificar documentos
4. **Entrevista**: Programar entrevista si cumple requisitos
5. **Decisión**: Aprobar o rechazar
6. **Capacitación**: Si es aprobado
7. **Activación**: Activar en plataforma

## 🚀 **Importación Masiva de Proveedores**

### 📊 **Funcionalidad de Importación Masiva**

Domify ahora soporta **importación masiva** de proveedores desde Google Sheets. Esta funcionalidad permite:

- ✅ **Importar múltiples proveedores** de una sola vez
- ✅ **Vista previa** antes de importar
- ✅ **Validación automática** de datos
- ✅ **Detección de duplicados** (usuarios existentes)
- ✅ **Generación automática** de contraseñas temporales
- ✅ **Notificaciones por email** con resumen completo
- ✅ **Modo prueba** para simular la importación

### 🎯 **Cómo Usar la Importación Masiva**

#### **1. Acceder al Panel de Administración**
- Ve a: `http://localhost:5173/admin/bulk-import`
- O desde el sidebar: **Importación Masiva**

#### **2. Descargar Template**
- **📄 Template CSV**: Para usar en Google Sheets
- **📊 Template Excel**: Para usar en Excel/Google Sheets
- Ambos templates incluyen ejemplos reales de proveedores

#### **3. Configurar la Importación**
- **ID del Google Sheets**: El ID de tu spreadsheet
- **Rango**: Columnas a procesar (ej: A:Z)
- **Saltar primera fila**: Si tienes encabezados
- **Modo prueba**: Para simular sin crear usuarios

#### **4. Proceso de Importación**
1. **Vista Previa**: Revisa qué proveedores se crearían
2. **Validación**: El sistema verifica datos obligatorios
3. **Importación**: Crea usuarios y perfiles automáticamente
4. **Notificación**: Recibe email con resumen completo

### 📄 **Templates Descargables**

#### **Descargar Templates desde el Panel de Administración**

En la página de importación masiva (`/admin/bulk-import`) encontrarás dos botones para descargar templates:

- **📄 Template CSV**: `template_proveedores_domify.csv`
- **📊 Template Excel**: `template_proveedores_domify.xlsx`

#### **Contenido de los Templates**

Los templates incluyen:
- ✅ **Encabezados** con todos los campos necesarios
- ✅ **5 ejemplos reales** de proveedores diferentes
- ✅ **Datos completos** para cada campo
- ✅ **Formato correcto** para importación masiva

#### **Ejemplos Incluidos en el Template**

1. **Fontanero Individual** - Roberto Martínez Silva
2. **Empresa de Jardinería** - Jardines Verdes S.A.
3. **Electricista Individual** - Luis Herrera Mendoza
4. **Limpieza Profesional** - Carmen López Mendoza
5. **Construcción y Remodelación** - Construcciones Ramírez S.A.

### 📋 **Campos Procesados en Importación Masiva**

| Columna | Campo | Requerido | Ejemplo |
|---------|-------|-----------|---------|
| A | Timestamp | ✅ | `2024-01-15T10:30:00Z` |
| B | ID_Aplicacion | ✅ | `APP-2024-001` |
| C | Nombre | ✅ | `Juan Carlos` |
| D | Apellido | ✅ | `González López` |
| E | Email | ✅ | `juan@email.com` |
| F | Telefono | ✅ | `+505 8888-1234` |
| G | Departamento | ✅ | `Managua` |
| H | Direccion | ✅ | `Colonia Centroamérica` |
| I | Tipo_Proveedor | ✅ | `Individual` |
| J | Titulo_Servicio | ✅ | `Fontanero Profesional` |
| K | Descripcion | ✅ | `Especialista en...` |
| L | Precio_Hora | ✅ | `350` |
| M | Experiencia_Anos | ✅ | `5` |
| N | Disponibilidad | ✅ | `Lunes a Viernes` |
| O | Categorias | ✅ | `Fontaneros, Plomería` |
| S | Nombre_Negocio | 🔶 | `Servicios González` |
| T | Portfolio | 🔶 | `https://portfolio.com` |
| U | Referencias | 🔶 | `María López - +505...` |

### 🔧 **API Endpoint para Importación Masiva**

```http
POST /api/admin/bulk-import-providers
Content-Type: application/json

{
  "spreadsheetId": "1hmf0d1t5ZCdRoAAKcMSisCjx3XTTlwm_9jrweNl-LuQ",
  "range": "A:Z",
  "skipFirstRow": true,
  "dryRun": false
}
```

#### **Respuesta de Éxito:**
```json
{
  "success": true,
  "data": {
    "success": 15,
    "failed": 2,
    "errors": [
      {
        "row": 5,
        "email": "invalid@email",
        "error": "Faltan campos obligatorios"
      }
    ],
    "details": [
      {
        "email": "juan@email.com",
        "status": "created",
        "message": "Proveedor creado exitosamente"
      }
    ]
  },
  "message": "Importación masiva completada: 15 exitosos, 2 fallidos"
}
```

### 📧 **Notificación por Email**

Después de cada importación masiva, recibirás un email con:

- 📊 **Resumen completo** de la importación
- 📈 **Estadísticas** (total, exitosos, fallidos, tasa de éxito)
- 📋 **Tabla detallada** con el estado de cada proveedor
- ⚠️ **Errores específicos** si los hay
- 🔗 **Enlace directo** al panel de administración

### 🛡️ **Características de Seguridad**

- **Validación de datos**: Verifica campos obligatorios
- **Detección de duplicados**: No crea usuarios existentes
- **Contraseñas temporales**: Generadas automáticamente
- **Logs completos**: Registra todas las acciones
- **Modo prueba**: Permite simular sin crear usuarios
- **Confirmación**: Requiere confirmación antes de importar

### 📞 Contacto para Dudas

Para cualquier pregunta sobre esta plantilla o el proceso de proveedores:
- **Email**: admin@domify.app
- **Teléfono**: +505 XXXX-XXXX
- **Horario**: Lunes a Viernes 8:00 AM - 6:00 PM 