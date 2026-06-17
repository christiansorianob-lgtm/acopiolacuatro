-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tara" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductores" (
    "id" SERIAL NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conductores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origenes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "origenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiquetes" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "vehiculoId" INTEGER NOT NULL,
    "conductorNombre" TEXT NOT NULL,
    "conductorId" INTEGER NOT NULL,
    "proveedorNombre" TEXT,
    "proveedorId" INTEGER,
    "clienteNombre" TEXT,
    "clienteId" INTEGER,
    "origenNombre" TEXT,
    "origenId" INTEGER,
    "destinoNombre" TEXT,
    "destinoId" INTEGER,
    "productoNombre" TEXT,
    "productoId" INTEGER,
    "pesoEntrada" INTEGER NOT NULL,
    "fechaEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pesoSalida" INTEGER,
    "fechaSalida" TIMESTAMP(3),
    "pesoNeto" INTEGER,
    "remision" TEXT,
    "precintos" TEXT,
    "observaciones" TEXT,
    "usuarioEntradaId" INTEGER NOT NULL,
    "usuarioSalidaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitacora_auditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" INTEGER NOT NULL,
    "detalle" JSONB NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "registros" INTEGER NOT NULL,
    "tamano" INTEGER,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cedula_key" ON "usuarios"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placa_key" ON "vehiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "conductores_cedula_key" ON "conductores"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "tiquetes_numero_key" ON "tiquetes"("numero");

-- CreateIndex
CREATE INDEX "tiquetes_numero_idx" ON "tiquetes"("numero");

-- CreateIndex
CREATE INDEX "tiquetes_placa_idx" ON "tiquetes"("placa");

-- CreateIndex
CREATE INDEX "tiquetes_estado_idx" ON "tiquetes"("estado");

-- CreateIndex
CREATE INDEX "tiquetes_fechaEntrada_idx" ON "tiquetes"("fechaEntrada");

-- CreateIndex
CREATE INDEX "tiquetes_proveedorId_idx" ON "tiquetes"("proveedorId");

-- CreateIndex
CREATE INDEX "tiquetes_clienteId_idx" ON "tiquetes"("clienteId");

-- CreateIndex
CREATE INDEX "tiquetes_tipo_idx" ON "tiquetes"("tipo");

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "conductores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "origenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "destinos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_usuarioEntradaId_fkey" FOREIGN KEY ("usuarioEntradaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiquetes" ADD CONSTRAINT "tiquetes_usuarioSalidaId_fkey" FOREIGN KEY ("usuarioSalidaId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
