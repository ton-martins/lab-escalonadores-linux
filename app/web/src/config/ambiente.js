/** Endereço-base do servidor da API. */
const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ?? "http://localhost:3000";

/** Endereço-base dos endpoints REST. */
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** Endereço do servidor Socket.IO. */
export const SOCKET_URL = API_ORIGIN;