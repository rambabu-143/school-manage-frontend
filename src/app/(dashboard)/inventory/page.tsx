"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AssetsTab } from "./assets-tab"
import { CategoriesTab } from "./categories-tab"
import { ProductsTab } from "./products-tab"
import { PurchaseOrdersTab } from "./purchase-orders-tab"
import { RequisitionsTab } from "./requisitions-tab"
import { VendorsTab } from "./vendors-tab"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Vendors, products, assets, purchase orders, and requisitions.
        </p>
      </div>

      <Tabs defaultValue="requisitions">
        <TabsList>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>
        <TabsContent value="requisitions">
          <RequisitionsTab />
        </TabsContent>
        <TabsContent value="assets">
          <AssetsTab />
        </TabsContent>
        <TabsContent value="purchase-orders">
          <PurchaseOrdersTab />
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
        <TabsContent value="vendors">
          <VendorsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
