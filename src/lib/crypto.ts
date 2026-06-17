import crypto from 'crypto';

export const generarFirmaTiquete = (tiquete: any) => {
  const secretKey = process.env.QR_SECRET_KEY;
  if (!secretKey) {
    console.error("Falta la variable de entorno QR_SECRET_KEY");
    return "INVALID_KEY";
  }

  const datos = [
    tiquete.numero,
    tiquete.placa,
    tiquete.pesoNeto || 0,
    new Date(tiquete.fechaEntrada).toISOString(),
    tiquete.proveedorNombre || ""
  ].join('|');
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(datos)
    .digest('hex');
};
