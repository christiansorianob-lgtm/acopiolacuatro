import Dexie, { type EntityTable } from 'dexie';

export interface LocalVehiculo {
  id: number;
  placa: string;
  tipo: string;
  tara: number | null;
  activo: boolean;
}

export interface LocalConductor {
  id: number;
  cedula: string;
  nombre: string;
  activo: boolean;
}

export interface LocalProveedor {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface LocalCliente {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface LocalOrigen {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface LocalDestino {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface LocalProducto {
  id: number;
  nombre: string;
  activo: boolean;
}

// Para los tiquetes necesitamos un estado syncStatus para saber si están pendientes de sincronizar
export interface LocalTiquete {
  localId?: number; // Auto-increment para IndexedDB
  id?: number; // ID de Postgres (cuando ya se sincronizó y viene de vuelta)
  
  numero: number;
  tipo: string;
  estado: string; // 'ABIERTO' | 'CERRADO' | 'ANULADO'
  
  placa: string;
  vehiculoId: number;
  
  conductorNombre: string;
  conductorId: number;
  
  proveedorNombre: string | null;
  proveedorId: number | null;
  
  clienteNombre: string | null;
  clienteId: number | null;
  
  origenNombre: string | null;
  origenId: number | null;
  
  destinoNombre: string | null;
  destinoId: number | null;
  
  productoNombre: string | null;
  productoId: number | null;
  
  pesoEntrada: number;
  fechaEntrada: Date | string;
  
  pesoSalida: number | null;
  fechaSalida: Date | string | null;
  pesoNeto: number | null;
  
  remision: string | null;
  precintos: string | null;
  observaciones: string | null;
  
  usuarioEntradaId: number;
  usuarioSalidaId: number | null;
  
  syncStatus: 'synced' | 'pending_insert' | 'pending_update';
}

export interface LocalSyncInfo {
  id: string; // e.g. 'last_sync'
  timestamp: number;
}

const db = new Dexie('AcopioLaCuatroDB') as Dexie & {
  vehiculos: EntityTable<LocalVehiculo, 'id'>;
  conductores: EntityTable<LocalConductor, 'id'>;
  proveedores: EntityTable<LocalProveedor, 'id'>;
  clientes: EntityTable<LocalCliente, 'id'>;
  origenes: EntityTable<LocalOrigen, 'id'>;
  destinos: EntityTable<LocalDestino, 'id'>;
  productos: EntityTable<LocalProducto, 'id'>;
  tiquetes: EntityTable<LocalTiquete, 'localId'>;
  syncInfo: EntityTable<LocalSyncInfo, 'id'>;
};

// Declaración del esquema para IndexedDB
// Solo definimos las propiedades que queremos indexar
db.version(1).stores({
  vehiculos: 'id, placa, activo',
  conductores: 'id, cedula, nombre, activo',
  proveedores: 'id, nombre, activo',
  clientes: 'id, nombre, activo',
  origenes: 'id, nombre, activo',
  destinos: 'id, nombre, activo',
  productos: 'id, nombre, activo',
  tiquetes: '++localId, id, numero, placa, estado, tipo, fechaEntrada, syncStatus',
  syncInfo: 'id'
});

export { db };
