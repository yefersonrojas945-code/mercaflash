const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

// Error de la API: conserva el código HTTP para poder reaccionar (por ejemplo 401 = sesión vencida)
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const esSesionVencida = (e: unknown) => e instanceof ApiError && e.status === 401;

export async function api<T>(
  route: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${route}`, {
      method: options.method || "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Revisa EXPO_PUBLIC_API_URL y que el backend esté encendido.");
  }

  let data: any = null;
  try { data = await response.json(); } catch { /* respuesta vacía */ }
  if (!response.ok) throw new ApiError(data?.error || `Error HTTP ${response.status}`, response.status);
  return data as T;
}
