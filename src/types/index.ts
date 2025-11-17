/**
 * Barrel file - Exportación centralizada de todos los tipos e interfaces
 * Organizado por módulos
 */

// ============================================
// Módulo: Activities
// ============================================
export {
  ActivityType,
  ActivityStatus
} from './activities';

export type {
  Activity,
  ActivityFilters,
  ActivityStats,
  CreateActivityDTO,
  UpdateActivityDTO
} from './activities';

// ============================================
// Módulo: Auth
// ============================================
export type {
  Tokens,
  UseAuthOptions
} from './auth';

// ============================================
// Módulo: Customers
// ============================================
export type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters
} from './customers';

// ============================================
// Módulo: Fields
// ============================================
export type {
  FieldProperties,
  FieldBoundary,
  Field
} from './fields';

// ============================================
// Módulo: Harvest
// ============================================
export type {
  WalnutCaliber,
  HarvestLotStatus,
  HarvestLot,
} from './harvest';

// ============================================
// Módulo: Inputs (Insumos)
// ============================================
export {
  InputUnit,
  InputUnitLabels
} from './inputs';

export type {
  Input,
  InputUsage
} from './inputs';

// ============================================
// Módulo: Plots
// ============================================
export type {
  PlotProperties,
  PlotFeature,
  Plot,
  PlotSummary
} from './plots';

// ============================================
// Módulo: Purchases
// ============================================
export {
  PurchaseOrderStatus
} from './purchases';

export type {
  PurchaseOrderDetail,
  PurchaseOrder,
  GoodReceipt,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreateGoodReceiptDto
} from './purchases';

// ============================================
// Módulo: Sales
// ============================================
export type {
  SalesOrderStatus,
  SalesOrderDetailStatus,
  SalesOrder,
  SalesOrderDetail,
  CreateSalesOrderDTO,
  UpdateSalesOrderDTO,
  UpdateSalesOrderStatusDTO,
  SalesOrdersFilters
} from './sales';

// ============================================
// Módulo: Shipping
// ===========================================
export type {
  Shipment,
  ShipmentItem,
  CreateShipmentDTO,
  ShipmentFilters
} from './shipments';

// ============================================
// Módulo: Suppliers
// ============================================
export type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFilters
} from './suppliers';

// ============================================
// Módulo: Theme
// ============================================
export type {
  Theme,
  ThemeProviderProps,
  ThemeProviderState
} from './theme';

// ============================================
// Módulo: User
// ============================================
export type {
  AuthUser,
  User,
  CreateUserDto,
  UpdateUserDto,
  AuthCredentials,
  AuthResponse
} from './user';

// ============================================
// Módulo: Varieties
// ============================================
export type {
  Variety,
  CreateVarietyDto,
  UpdateVarietyDto
} from './varieties';

// ============================================
// Módulo: Work Orders
// ============================================
export {
  WorkOrderStatus
} from './work-orders';

export type {
  WorkOrder,
  WorkOrdersFilters,
  CreateWorkOrderDTO,
  UpdateWorkOrderDTO,
  DateStatus,
  DateWarning
} from './work-orders';

// ============================================
// API y HTTP
// ============================================
export type {
  HttpMethod,
  RequestOptions
} from './api';

// ============================================
// Electron
// ============================================
export type {
  IpcApi,
  ElectronAPI
} from './electron';
