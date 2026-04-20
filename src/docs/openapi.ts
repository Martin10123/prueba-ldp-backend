export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Scout Panel API",
    version: "1.0.0",
    description:
      "API para autenticacion, gestion de jugadores y comparacion de estadisticas de scouting.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Health", description: "Estado del servicio" },
    { name: "Auth", description: "Autenticacion y perfil de usuario" },
    { name: "Players", description: "Gestion de jugadores y estadisticas" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "VALIDATION_ERROR" },
          message: { type: "string", example: "Payload invalido" },
          issues: {
            type: "array",
            items: { type: "object", additionalProperties: true },
          },
        },
        required: ["success", "error", "message"],
      },
      Role: {
        type: "string",
        enum: ["USER", "ADMIN"],
      },
      Position: {
        type: "string",
        enum: ["GK", "CB", "RB", "LB", "CDM", "CM", "CAM", "RW", "LW", "ST"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "cm8w2f9x80000j8x9z6v8m8a1" },
          name: { type: "string", example: "Admin User" },
          email: { type: "string", format: "email", example: "admin@example.com" },
          role: { $ref: "#/components/schemas/Role" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "email", "role", "createdAt", "updatedAt"],
      },
      AuthResponseData: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
        required: ["user", "token"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/AuthResponseData" },
        },
        required: ["success", "data"],
      },
      RegisterBody: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, example: "Juan Perez" },
          email: { type: "string", format: "email", example: "juan@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
        },
        required: ["name", "email", "password"],
      },
      LoginBody: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", minLength: 1, example: "password123" },
        },
        required: ["email", "password"],
      },
      MeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/User" },
        },
        required: ["success", "data"],
      },
      Team: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          country: { type: "string" },
          logoUrl: { type: "string", format: "uri", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "name", "country", "createdAt", "updatedAt"],
      },
      Season: {
        type: "object",
        properties: {
          id: { type: "string" },
          year: { type: "integer", example: 2025 },
          name: { type: "string", example: "2024-2025" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "year", "name", "createdAt", "updatedAt"],
      },
      Player: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          birthDate: { type: "string", format: "date-time" },
          nationality: { type: "string" },
          position: { $ref: "#/components/schemas/Position" },
          photoUrl: { type: "string", format: "uri", nullable: true },
          currentTeamId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "name",
          "birthDate",
          "nationality",
          "position",
          "createdAt",
          "updatedAt",
        ],
      },
      PaginatedPlayersData: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Player" },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", minimum: 1, example: 1 },
              limit: { type: "integer", minimum: 1, example: 10 },
              total: { type: "integer", minimum: 0, example: 23 },
              totalPages: { type: "integer", minimum: 1, example: 3 },
              hasNext: { type: "boolean", example: true },
              hasPrev: { type: "boolean", example: false },
            },
            required: ["page", "limit", "total", "totalPages", "hasNext", "hasPrev"],
          },
        },
        required: ["items", "meta"],
      },
      PaginatedPlayersResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/PaginatedPlayersData" },
        },
        required: ["success", "data"],
      },
      PlayerResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Player" },
        },
        required: ["success", "data"],
      },
      CreatePlayerBody: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, example: "Lautaro Martinez" },
          birthDate: { type: "string", format: "date-time", example: "1997-08-22T00:00:00.000Z" },
          nationality: { type: "string", minLength: 2, example: "Argentina" },
          position: { $ref: "#/components/schemas/Position" },
          photoUrl: { type: "string", format: "uri", nullable: true },
          currentTeamId: { type: "string", nullable: true },
        },
        required: ["name", "birthDate", "nationality", "position"],
      },
      UpdatePlayerBody: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          birthDate: { type: "string", format: "date-time" },
          nationality: { type: "string", minLength: 2 },
          position: { $ref: "#/components/schemas/Position" },
          photoUrl: { type: "string", format: "uri", nullable: true },
          currentTeamId: { type: "string", nullable: true },
        },
        minProperties: 1,
      },
      PlayerStat: {
        type: "object",
        properties: {
          id: { type: "string" },
          playerId: { type: "string" },
          seasonId: { type: "string" },
          teamId: { type: "string" },
          matchesPlayed: { type: "integer", minimum: 0 },
          goals: { type: "integer", minimum: 0 },
          assists: { type: "integer", minimum: 0 },
          yellowCards: { type: "integer", minimum: 0 },
          redCards: { type: "integer", minimum: 0 },
          minutesPlayed: { type: "integer", minimum: 0 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          season: { $ref: "#/components/schemas/Season" },
          team: { $ref: "#/components/schemas/Team" },
        },
        required: [
          "id",
          "playerId",
          "seasonId",
          "teamId",
          "matchesPlayed",
          "goals",
          "assists",
          "yellowCards",
          "redCards",
          "minutesPlayed",
          "createdAt",
          "updatedAt",
          "season",
          "team",
        ],
      },
      PlayerStatsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/PlayerStat" },
          },
        },
        required: ["success", "data"],
      },
      PlayerWithStats: {
        allOf: [
          { $ref: "#/components/schemas/Player" },
          {
            type: "object",
            properties: {
              currentTeam: {
                oneOf: [
                  { $ref: "#/components/schemas/Team" },
                  { type: "null" },
                ],
              },
              stats: {
                type: "array",
                items: { $ref: "#/components/schemas/PlayerStat" },
              },
            },
            required: ["currentTeam", "stats"],
          },
        ],
      },
      ComparePlayersResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/PlayerWithStats" },
          },
        },
        required: ["success", "data"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verificar estado de la API",
        responses: {
          "200": {
            description: "Servicio activo",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        ok: { type: "boolean", example: true },
                      },
                      required: ["ok"],
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuario creado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Payload invalido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "409": {
            description: "Email ya registrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login exitoso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": {
            description: "Payload invalido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "Credenciales invalidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtener usuario autenticado",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Perfil de usuario",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/players": {
      get: {
        tags: ["Players"],
        summary: "Listar jugadores",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Texto de busqueda por nombre",
          },
          {
            name: "position",
            in: "query",
            schema: { $ref: "#/components/schemas/Position" },
          },
          {
            name: "nationality",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "minAge",
            in: "query",
            schema: { type: "integer", minimum: 0 },
          },
          {
            name: "maxAge",
            in: "query",
            schema: { type: "integer", minimum: 0 },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          "200": {
            description: "Listado paginado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedPlayersResponse" },
              },
            },
          },
          "400": {
            description: "Parametros invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Players"],
        summary: "Crear jugador",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePlayerBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Jugador creado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlayerResponse" },
              },
            },
          },
          "400": {
            description: "Payload invalido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/players/{id}": {
      get: {
        tags: ["Players"],
        summary: "Obtener jugador por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Jugador encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlayerResponse" },
              },
            },
          },
          "400": {
            description: "Parametros invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "Jugador no encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Players"],
        summary: "Actualizar jugador",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePlayerBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Jugador actualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlayerResponse" },
              },
            },
          },
          "400": {
            description: "Payload o parametros invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "Jugador no encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Players"],
        summary: "Eliminar jugador",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Jugador eliminado",
          },
          "400": {
            description: "Parametros invalidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "Jugador no encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/players/{id}/stats": {
      get: {
        tags: ["Players"],
        summary: "Obtener estadisticas de jugador",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "seasonId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Estadisticas por temporada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PlayerStatsResponse" },
              },
            },
          },
          "400": {
            description: "Query invalida",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/players/compare": {
      get: {
        tags: ["Players"],
        summary: "Comparar entre 2 y 3 jugadores",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "ids",
            in: "query",
            required: true,
            schema: { type: "string", example: "id1,id2,id3" },
            description: "Lista separada por comas de IDs de jugadores",
          },
        ],
        responses: {
          "200": {
            description: "Comparacion de jugadores con stats",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ComparePlayersResponse" },
              },
            },
          },
          "400": {
            description: "IDs invalidos o cantidad fuera de rango",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "401": {
            description: "No autorizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          "404": {
            description: "Alguno de los jugadores no existe",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
  },
} as const;
