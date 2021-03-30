import type { Subject } from 'rxjs';

export type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  [key: string]: any;
};

export type Qty = number;

export type CartItem = [Product, Qty];

export type Sale = {
  items: CartItem[];
  amount: number;
  createdAt: Date | string;
  [key: string]: any;
};

export interface IShoppingCart {
  readonly items: CartItem[];
  toPayment(): void;
  onQtyUpdated(item: CartItem): void;
  onItemRemoved(item: CartItem): void;
  fillCart(items: CartItem[]): void;
  cleanUp(): void;
}

export interface Recordable {
  dbname: string;
  remote?: string;
  refreshResources(): Promise<void>;
}

export interface ICatalogue extends Recordable {
  selectProduct(product: Product): void;
}

export interface ISaleHistory extends Recordable {
  addSale(sale: Sale): Promise<boolean>;
}

export interface IPayments {
  makePayment(sale: Sale): Promise<boolean>;
}

export interface IPrinter {
  setSale(sale?: Sale);
  printReceipt(): void;
}

export interface ICatalogueListener {
  onSelectProduct(event: CustomEvent<Product>): void;
}

export interface ICartListener {
  onQtyUpdated(event: CustomEvent<CartItem>): void;
  onItemRemoved(event: CustomEvent<CartItem>): void;
  onToPayment(event: CustomEvent<Sale>): void;
}

export interface IHost extends ICartListener, ICatalogueListener {
  hostname: string;
  // potential elements from Host
  readonly shoppingCart: (HTMLElement & IShoppingCart) | null;
  readonly catalogue: (HTMLElement & ICatalogue) | null;
  readonly payment: (HTMLElement & IPayments) | null;
  readonly printer: (HTMLElement & IPrinter) | null;
  readonly saleHistory: (HTMLElement & ISaleHistory) | null;
}
