# 🤖 Chat Agent - Meteor Madness AI

## Descripción

Este componente implementa un chat inteligente especializado en asteroides, meteoritos y simulaciones de impacto usando la API de Mistral AI con un agente entrenado específicamente para este dominio.

## 🔧 Configuración

### 1. Variables de Entorno

Agrega tu API Key de Mistral AI en el archivo `.env`:

```bash
VITE_MISTRAL_API_KEY=tu_api_key_de_mistral
```

### 2. Obtener API Key de Mistral

1. Visita [console.mistral.ai](https://console.mistral.ai/)
2. Crea una cuenta o inicia sesión
3. Ve a la sección de API Keys
4. Genera una nueva API Key
5. Copia y pega en tu archivo `.env`

## 📋 Detalles Técnicos

### Agente Entrenado

- **Agent ID**: `ag:63df4435:20251004:untitled-agent:5a96c43c`
- **Modelo Base**: Mistral AI
- **Especialización**: Asteroides, meteoritos, impactos y astronomía
- **Endpoint**: `https://api.mistral.ai/v1/agents/completions`

### Características

✅ **Conversación contextual** - Mantiene historial de mensajes
✅ **Formato Markdown** - Respuestas formateadas con estilos
✅ **Manejo de errores** - Captura y muestra errores de la API
✅ **Indicador de carga** - Feedback visual mientras espera respuesta
✅ **Diseño responsive** - Funciona en móviles y desktop
✅ **Botón flotante** - Acceso rápido desde cualquier página

## 🎨 Personalización

### Cambiar el Agent ID

Si deseas usar un agente diferente, modifica la constante en `ChatAgent.jsx`:

```javascript
const AGENT_ID = 'tu_nuevo_agent_id'
```

### Modificar el Endpoint

Para usar modelos estándar sin agentes entrenados:

```javascript
const url = 'https://api.mistral.ai/v1/chat/completions'
const body = {
  model: 'mistral-medium', // o 'mistral-small', 'mistral-large'
  messages: [...messages, userMessage],
}
```

## 📦 Estructura del Componente

```
ChatAgent.jsx
├── FormatMarkdown()        # Función de formato de texto
├── ChatAgent Component
│   ├── State Management
│   │   ├── isOpen          # Control de visibilidad
│   │   ├── prompt          # Input del usuario
│   │   ├── messages        # Historial de conversación
│   │   ├── isLoading       # Estado de carga
│   │   └── error           # Manejo de errores
│   ├── handleSubmit()      # Envío de mensajes
│   ├── Botón Flotante      # UI de acceso rápido
│   └── Ventana de Chat     # UI principal del chat
```

## 🚀 Uso

El componente se usa automáticamente en `Body.jsx`:

```jsx
import ChatAgent from './ChatAgent.jsx'

function Body() {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
  
  return (
    <>
      {/* Tu contenido */}
      <ChatAgent apiKey={apiKey} />
    </>
  )
}
```

## 📚 Documentación de Mistral AI

- [Documentación oficial](https://docs.mistral.ai/)
- [API Reference](https://docs.mistral.ai/api/)
- [Agents Guide](https://docs.mistral.ai/capabilities/agents/)
- [Chat Completions](https://docs.mistral.ai/capabilities/completion/)

## 🛠️ Solución de Problemas

### Error: "API error: 401"
- Verifica que tu API Key sea correcta
- Asegúrate de que la variable de entorno esté configurada correctamente
- Reinicia el servidor de desarrollo después de modificar `.env`

### Error: "API error: 429"
- Has excedido el límite de requests
- Espera unos minutos antes de intentar de nuevo
- Considera actualizar tu plan de Mistral AI

### El chat no responde
- Verifica la conexión a internet
- Revisa la consola del navegador para errores
- Confirma que el endpoint de la API esté disponible

## 📝 Ejemplo de Integración

```jsx
import { useState } from 'react'
import ChatAgent from './components/ChatAgent'

function App() {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY

  return (
    <div className="app">
      <h1>Mi Aplicación</h1>
      
      {/* El chat aparece como botón flotante */}
      <ChatAgent apiKey={apiKey} />
    </div>
  )
}

export default App
```

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Nunca expongas tu API Key en el código del cliente en producción.

Para producción, considera:
1. Usar un servidor backend como proxy
2. Implementar rate limiting
3. Validar requests del lado del servidor
4. Usar variables de entorno secretas

## 📄 Licencia

Este componente es parte del proyecto Meteor Madness.
