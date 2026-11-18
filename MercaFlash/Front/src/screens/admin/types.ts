// Propiedades que reciben todas las secciones del panel del administrador
export type SeccionProps = {
  token: string;
  alFallar: (error: unknown) => void;  // muestra el error (o cierra la sesión si venció)
};
