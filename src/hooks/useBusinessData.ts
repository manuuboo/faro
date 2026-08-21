import { useState, useEffect, useMemo, useCallback } from 'react';

import {
  getBusinessData,
  saveBusinessData,
  getBusinessId,
} from '../services/storage';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustProductStock,
} from '../services/supabase/products';

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/supabase/customers';

import {
  getSales,
  createSale,
  deleteSale,
} from '../services/supabase/sales';

import {
  getExpenses,
  createExpense,
  deleteExpense,
} from '../services/supabase/expenses';

import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice as deleteInvoiceSupabase,
} from '../services/supabase/invoices';

import {
  getActivities,
  createActivity,
} from '../services/supabase/activities';

import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from '../services/supabase/notifications';

import type {
  BusinessData,
  Sale,
  Purchase,
  Client,
  Supplier,
  Expense,
  InventoryProduct,
  Invoice,
  AppNotification,
  NotificationType,
  Activity,
  ActivityType,
} from '../types/business';

const LOW_STOCK_THRESHOLD_MULTIPLIER = 1.0;

function generateInvoiceNumber(invoices: Invoice[]): string {
  const num = (invoices.length + 1).toString().padStart(4, '0');
  return `FAC-${num}`;
}

export function useBusinessData() {
  const [data, setData] = useState<BusinessData>(getBusinessData());

  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const businessId = getBusinessId();


  // ── Local storage backup ─────────────────────────────────────────────────

  useEffect(() => {
    saveBusinessData(data);
  }, [data]);

  // ── Load Inventory from Supabase ─────────────────────────────────────────

  useEffect(() => {
    const loadInventory = async () => {
      if (!businessId) {
        setInventoryLoading(false);
        return;
      }

      try {
        const products = await getProducts(businessId);

        const inventory: InventoryProduct[] = products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category || 'General',
          stock: product.stock,
          minStock: product.minimum_stock,
          unitPrice: product.price,
          costPrice: product.cost,
          unit: 'unidad',
          date: product.created_at,
        }));

        setData((prev) => ({
          ...prev,
          inventory,
        }));
      } catch (error) {
        console.error(
          'Error cargando inventario desde Supabase:',
          error
        );
      } finally {
        setInventoryLoading(false);
      }
    };

    loadInventory();
  }, [businessId]);

  // ── Load Clients from Supabase ───────────────────────────────────────────

  useEffect(() => {
    const loadClients = async () => {
      if (!businessId) {
        setClientsLoading(false);
        return;
      }

      try {
        const customers = await getCustomers(businessId);

        const clients: Client[] = customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email || undefined,
          phone: customer.phone || undefined,
          contact:
            customer.phone ||
            customer.email ||
            undefined,
          notes: customer.notes || undefined,
          date: customer.created_at,
        }));

        setData((prev) => ({
          ...prev,
          clients,
        }));
      } catch (error) {
        console.error(
          'Error cargando clientes desde Supabase:',
          error
        );
      } finally {
        setClientsLoading(false);
      }
    };

    loadClients();
  }, [businessId]);

  // ── Load Sales from Supabase ─────────────────────────────────────────────

  useEffect(() => {
    const loadSales = async () => {
      if (!businessId) {
        setSalesLoading(false);
        return;
      }

      try {
        const sales = await getSales(businessId);

        const mappedSales: Sale[] = sales.map((sale) => ({
          id: sale.id,
          amount: Number(sale.total),
          description: 'Venta registrada',
          date: sale.sold_at || sale.created_at,
        }));

        setData((prev) => ({
          ...prev,
          sales: mappedSales,
        }));
      } catch (error) {
        console.error(
          'Error cargando ventas desde Supabase:',
          error
        );
      } finally {
        setSalesLoading(false);
      }
    };

    loadSales();
  }, [businessId]);

  // ── Load Purchases / Expenses from Supabase ──────────────────────────────

  useEffect(() => {
    const loadPurchases = async () => {
      if (!businessId) {
        setPurchasesLoading(false);
        return;
      }

      try {
        const expenses = await getExpenses(businessId);

        const purchases: Purchase[] = expenses
          .filter(
            (expense) =>
              expense.category === 'Compra'
          )
          .map((expense) => ({
            id: expense.id,
            amount: Number(expense.amount),
            description: expense.description,
            date:
              expense.expense_date ||
              expense.created_at,
          }));

        setData((prev) => ({
          ...prev,
          purchases,
        }));
      } catch (error) {
        console.error(
          'Error cargando compras desde Supabase:',
          error
        );
      } finally {
        setPurchasesLoading(false);
      }
    };

    loadPurchases();
  }, [businessId]);

  // ── Load Invoices from Supabase ──────────────────────────────────────────

  useEffect(() => {
    const loadInvoices = async () => {
      if (!businessId) {
        setInvoicesLoading(false);
        return;
      }

      try {
        const invoices = await getInvoices(businessId);

        const mappedInvoices: Invoice[] = invoices.map(
          (invoice) => ({
            id: invoice.id,
            type: invoice.type || undefined,
            number: invoice.number,
            clientId:
              invoice.client_id || undefined,
            clientName: invoice.client_name,
            clientCuit:
              invoice.client_cuit || undefined,
            clientEmail:
              invoice.client_email || undefined,
            clientPhone:
              invoice.client_phone || undefined,
            items: invoice.items || [],
            subtotal: Number(invoice.subtotal),
            tax: Number(invoice.tax),
            total: Number(invoice.total),
            status: invoice.status,
            issueDate: invoice.issue_date,
            dueDate:
              invoice.due_date || undefined,
            notes: invoice.notes || undefined,
          })
        );

        setData((prev) => ({
          ...prev,
          invoices: mappedInvoices,
        }));
      } catch (error) {
        console.error(
          'Error cargando facturas desde Supabase:',
          error
        );
      } finally {
        setInvoicesLoading(false);
      }
    };

    loadInvoices();
  }, [businessId]);

  // ── Load Activities from Supabase ────────────────────────────────────────

  useEffect(() => {
    const loadActivities = async () => {
      if (!businessId) {
        setActivitiesLoading(false);
        return;
      }

      try {
        const activities = await getActivities(businessId);

        const mappedActivities: Activity[] =
          activities.map((activity) => ({
            id: activity.id,
            type: activity.type as ActivityType,
            title: activity.title,
            description:
              activity.description || undefined,
            amount:
              activity.amount !== null &&
                activity.amount !== undefined
                ? Number(activity.amount)
                : undefined,
            date: activity.created_at,
          }));

        setData((prev) => ({
          ...prev,
          activities: mappedActivities,
        }));
      } catch (error) {
        console.error(
          'Error cargando actividades desde Supabase:',
          error
        );
      } finally {
        setActivitiesLoading(false);
      }
    };

    loadActivities();
  }, [businessId]);

  // ── Load Notifications from Supabase ─────────────────────────────────────

  useEffect(() => {
    const loadNotifications = async () => {
      if (!businessId) {
        setNotificationsLoading(false);
        return;
      }

      try {
        const notifications =
          await getNotifications(businessId);

        const mappedNotifications: AppNotification[] =
          notifications.map((notification) => ({
            id: notification.id,
            type:
              notification.type as NotificationType,
            title: notification.title,
            description: notification.description,
            read: notification.read,
            date: notification.created_at,
          }));

        setData((prev) => ({
          ...prev,
          notifications: mappedNotifications,
        }));
      } catch (error) {
        console.error(
          'Error cargando notificaciones desde Supabase:',
          error
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, [businessId]);

  // ── Notifications ────────────────────────────────────────────────────────

  const addNotification = useCallback(
    async (
      type: NotificationType,
      title: string,
      description: string
    ) => {
      if (!businessId) {
        console.error(
          'No se encontró business_id para crear notificación.'
        );
        return;
      }

      try {
        const created =
          await createNotification({
            business_id: businessId,
            type,
            title,
            description,
          });

        const notification: AppNotification = {
          id: created.id,
          type: created.type as NotificationType,
          title: created.title,
          description: created.description,
          read: created.read,
          date: created.created_at,
        };

        setData((prev) => ({
          ...prev,
          notifications: [
            notification,
            ...prev.notifications,
          ],
        }));

        return notification.id;
      } catch (error) {
        console.error(
          'Error creando notificación:',
          error
        );
      }
    },
    [businessId]
  );

  const markAllNotificationsRead =
    useCallback(async () => {
      if (!businessId) {
        console.error(
          'No se encontró business_id.'
        );
        return;
      }

      try {
        await markAllNotificationsAsRead(
          businessId
        );

        setData((prev) => ({
          ...prev,
          notifications:
            prev.notifications.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            ),
        }));
      } catch (error) {
        console.error(
          'Error marcando todas las notificaciones como leídas:',
          error
        );
      }
    }, [businessId]);

  const markNotificationRead =
    useCallback(async (id: string) => {
      try {
        await markNotificationAsRead(id);

        setData((prev) => ({
          ...prev,
          notifications:
            prev.notifications.map(
              (notification) =>
                notification.id === id
                  ? {
                    ...notification,
                    read: true,
                  }
                  : notification
            ),
        }));
      } catch (error) {
        console.error(
          'Error marcando notificación como leída:',
          error
        );
      }
    }, []);

  const clearNotifications =
    useCallback(async () => {
      if (!businessId) {
        console.error(
          'No se encontró business_id.'
        );
        return;
      }

      try {
        await deleteAllNotifications(
          businessId
        );

        setData((prev) => ({
          ...prev,
          notifications: [],
        }));
      } catch (error) {
        console.error(
          'Error eliminando notificaciones:',
          error
        );
      }
    }, [businessId]);

  // ── Activities ───────────────────────────────────────────────────────────

  const addActivity = useCallback(
    async (
      type: ActivityType,
      title: string,
      amount?: number,
      description?: string
    ) => {
      if (!businessId) {
        console.error(
          'No se encontró business_id para crear actividad.'
        );
        return;
      }

      try {
        const created = await createActivity({
          business_id: businessId,
          type,
          title,
          description: description || null,
          amount:
            amount !== undefined
              ? amount
              : null,
        });

        const newActivity: Activity = {
          id: created.id,
          type: created.type as ActivityType,
          title: created.title,
          description:
            created.description || undefined,
          amount:
            created.amount !== null &&
              created.amount !== undefined
              ? Number(created.amount)
              : undefined,
          date: created.created_at,
        };

        setData((prev) => ({
          ...prev,
          activities: [
            newActivity,
            ...prev.activities,
          ],
        }));

        return newActivity.id;
      } catch (error) {
        console.error(
          'Error creando actividad:',
          error
        );
      }
    },
    [businessId]
  );

  // ── Sales ─────────────────────────────────────────────────────────────────

  const addSale = useCallback(
    async (
      productId: string,
      quantity: number
    ) => {
      if (!businessId) {
        console.error(
          'No se encontró business_id.'
        );
        return;
      }

      try {
        const product = data.inventory.find(
          (item) => item.id === productId
        );

        if (!product) {
          console.error(
            'No se encontró el producto seleccionado:',
            productId
          );
          return;
        }

        if (quantity <= 0) {
          console.error(
            'La cantidad debe ser mayor a 0.'
          );
          return;
        }

        if (quantity > product.stock) {
          console.error(
            'No hay suficiente stock disponible.'
          );
          return;
        }

        const unitPrice = Number(
          product.unitPrice
        );

        const total =
          unitPrice * quantity;

        const now =
          new Date().toISOString();

        const created = await createSale({
          business_id: businessId,
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          total,
          sold_at: now,
        });

        const sale: Sale = {
          id: created.id,
          amount: Number(created.total),
          description: product.name,
          date:
            created.sold_at ||
            created.created_at,
        };

        setData((prev) => ({
          ...prev,
          sales: [
            sale,
            ...prev.sales,
          ],
        }));

        const updated =
          await adjustProductStock(
            productId,
            -quantity,
            product.stock
          );

        setData((prev) => ({
          ...prev,
          inventory:
            prev.inventory.map(
              (item) =>
                item.id === productId
                  ? {
                    ...item,
                    stock: updated.stock,
                  }
                  : item
            ),
        }));

        await addActivity(
          'sale',
          'Venta registrada',
          total,
          product.name
        );

        await addNotification(
          'sale',
          'Venta registrada',
          `${product.name} — ${quantity} unidad${quantity !== 1 ? 'es' : ''
          }`
        );

        return sale.id;
      } catch (error) {
        console.error(
          'Error creando venta:',
          error
        );
      }
    },
    [
      businessId,
      data.inventory,
      addActivity,
      addNotification,
    ]
  );

  const deleteSaleHandler =
    useCallback(async (id: string) => {
      try {
        await deleteSale(id);

        setData((prev) => ({
          ...prev,
          sales: prev.sales.filter(
            (sale) => sale.id !== id
          ),
        }));
      } catch (error) {
        console.error(
          'Error eliminando venta:',
          error
        );
      }
    }, []);

  // ── Purchases ─────────────────────────────────────────────────────────────

  const addPurchase = useCallback(
    async (
      amount: number,
      description: string,
      supplierName?: string,
      productId?: string,
      quantity?: number,
      unitPrice?: number,
      date?: string
    ) => {
      if (!businessId) {
        console.error(
          'No se encontró business_id.'
        );
        return;
      }

      try {
        const created =
          await createExpense({
            business_id: businessId,
            description,
            amount,
            category: 'Compra',
            expense_date: date
              ? new Date(
                `${date}T12:00:00`
              ).toISOString()
              : new Date().toISOString(),
            product_id:
              productId || null,
            quantity:
              quantity || null,
            unit_price:
              unitPrice || null,
          });

        const purchase: Purchase = {
          id: created.id,
          amount: Number(
            created.amount
          ),
          description:
            created.description,
          date:
            created.expense_date ||
            created.created_at,
        };

        setData((prev) => ({
          ...prev,
          purchases: [
            purchase,
            ...prev.purchases,
          ],
        }));

        if (
          productId &&
          quantity &&
          quantity > 0
        ) {
          const currentProduct =
            data.inventory.find(
              (product) =>
                product.id === productId
            );

          if (currentProduct) {
            const updated =
              await adjustProductStock(
                productId,
                quantity,
                currentProduct.stock
              );

            setData((prev) => ({
              ...prev,
              inventory:
                prev.inventory.map(
                  (product) =>
                    product.id ===
                      productId
                      ? {
                        ...product,
                        stock:
                          updated.stock,
                      }
                      : product
                ),
            }));
          }
        }

        await addActivity(
          'purchase',
          'Compra registrada',
          -Number(created.amount),
          description
        );

        await addNotification(
          'purchase',
          'Compra registrada',
          `${description}${supplierName
            ? ` — ${supplierName}`
            : ''
          }`
        );

        return purchase.id;
      } catch (error) {
        console.error(
          'Error creando compra:',
          error
        );
      }
    },
    [
      businessId,
      data.inventory,
      addActivity,
      addNotification,
    ]
  );

  const deletePurchase =
    useCallback(async (id: string) => {
      try {
        await deleteExpense(id);

        setData((prev) => ({
          ...prev,
          purchases:
            prev.purchases.filter(
              (purchase) =>
                purchase.id !== id
            ),
        }));
      } catch (error) {
        console.error(
          'Error eliminando compra:',
          error
        );
      }
    }, []);

  // ── Clients ───────────────────────────────────────────────────────────────

  const addClient = useCallback(
    async (
      name: string,
      email?: string,
      phone?: string,
      notes?: string
    ) => {
      if (!businessId) {
        console.error(
          'No se encontró business_id.'
        );
        return;
      }

      try {
        const created =
          await createCustomer({
            business_id: businessId,
            name,
            email: email || null,
            phone: phone || null,
            notes: notes || null,
          });

        const client: Client = {
          id: created.id,
          name: created.name,
          email:
            created.email ||
            undefined,
          phone:
            created.phone ||
            undefined,
          contact:
            created.phone ||
            created.email ||
            undefined,
          notes:
            created.notes ||
            undefined,
          date: created.created_at,
        };

        setData((prev) => ({
          ...prev,
          clients: [
            client,
            ...prev.clients,
          ],
        }));

        await addActivity(
          'client',
          'Nuevo cliente',
          undefined,
          name
        );

        await addNotification(
          'client',
          'Nuevo cliente agregado',
          name
        );

        return client.id;
      } catch (error) {
        console.error(
          'Error creando cliente:',
          error
        );
      }
    },
    [
      businessId,
      addActivity,
      addNotification,
    ]
  );

  const updateClient =
    useCallback(
      async (
        id: string,
        updates: Partial<Client>
      ) => {
        try {
          const supabaseUpdates:
            Record<string, unknown> = {};

          if (
            updates.name !== undefined
          ) {
            supabaseUpdates.name =
              updates.name;
          }

          if (
            updates.email !== undefined
          ) {
            supabaseUpdates.email =
              updates.email || null;
          }

          if (
            updates.phone !== undefined
          ) {
            supabaseUpdates.phone =
              updates.phone || null;
          }

          if (
            updates.notes !== undefined
          ) {
            supabaseUpdates.notes =
              updates.notes || null;
          }

          const updated =
            await updateCustomer(
              id,
              supabaseUpdates
            );

          setData((prev) => ({
            ...prev,
            clients:
              prev.clients.map(
                (client) =>
                  client.id === id
                    ? {
                      ...client,
                      id: updated.id,
                      name:
                        updated.name,
                      email:
                        updated.email ||
                        undefined,
                      phone:
                        updated.phone ||
                        undefined,
                      contact:
                        updated.phone ||
                        updated.email ||
                        undefined,
                      notes:
                        updated.notes ||
                        undefined,
                      date:
                        updated.created_at,
                    }
                    : client
              ),
          }));
        } catch (error) {
          console.error(
            'Error actualizando cliente:',
            error
          );
        }
      },
      []
    );

  const deleteClient =
    useCallback(async (id: string) => {
      try {
        await deleteCustomer(id);

        setData((prev) => ({
          ...prev,
          clients:
            prev.clients.filter(
              (client) =>
                client.id !== id
            ),
        }));
      } catch (error) {
        console.error(
          'Error eliminando cliente:',
          error
        );
      }
    }, []);

  // ── Suppliers ─────────────────────────────────────────────────────────────

  const addSupplier = useCallback(
    async (
      name: string,
      contactPerson?: string,
      email?: string,
      phone?: string,
      notes?: string
    ) => {
      const supplier: Supplier = {
        id: crypto.randomUUID(),
        name,
        contactPerson,
        email,
        phone,
        notes,
        date: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        suppliers: [
          supplier,
          ...prev.suppliers,
        ],
      }));

      await addActivity(
        'supplier',
        'Nuevo proveedor',
        undefined,
        name
      );

      return supplier.id;
    },
    [addActivity]
  );

  const updateSupplier =
    useCallback(
      (
        id: string,
        updates: Partial<Supplier>
      ) => {
        setData((prev) => ({
          ...prev,
          suppliers:
            prev.suppliers.map(
              (supplier) =>
                supplier.id === id
                  ? {
                    ...supplier,
                    ...updates,
                  }
                  : supplier
            ),
        }));
      },
      []
    );

  const deleteSupplier =
    useCallback((id: string) => {
      setData((prev) => ({
        ...prev,
        suppliers:
          prev.suppliers.filter(
            (supplier) =>
              supplier.id !== id
          ),
      }));
    }, []);

  // ── Expenses ──────────────────────────────────────────────────────────────

  const addExpense = useCallback(
    async (
      amount: number,
      description: string,
      category?: string
    ) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        amount,
        description,
        category,
        date: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        expenses: [
          expense,
          ...prev.expenses,
        ],
      }));

      await addActivity(
        'expense',
        'Nuevo gasto',
        -amount,
        description
      );

      return expense.id;
    },
    [addActivity]
  );

  const deleteExpenseLocal =
    useCallback((id: string) => {
      setData((prev) => ({
        ...prev,
        expenses:
          prev.expenses.filter(
            (expense) =>
              expense.id !== id
          ),
      }));
    }, []);

  // ── Inventory ─────────────────────────────────────────────────────────────

  const addInventoryProduct =
    useCallback(
      async (
        product: Omit<
          InventoryProduct,
          'id' | 'date'
        >
      ) => {
        if (!businessId) {
          console.error(
            'No se encontró business_id.'
          );
          return;
        }

        try {
          const created =
            await createProduct({
              business_id: businessId,
              name: product.name,
              category:
                product.category ||
                'General',
              stock: product.stock,
              minimum_stock:
                product.minStock,
              price:
                product.unitPrice,
              cost:
                product.costPrice,
            });

          const item: InventoryProduct = {
            id: created.id,
            name: created.name,
            category:
              created.category ||
              'General',
            stock: created.stock,
            minStock:
              created.minimum_stock,
            unitPrice:
              created.price,
            costPrice:
              created.cost,
            unit: product.unit,
            date: created.created_at,
          };

          setData((prev) => ({
            ...prev,
            inventory: [
              item,
              ...prev.inventory,
            ],
          }));

          await addActivity(
            'inventory',
            'Producto agregado',
            undefined,
            product.name
          );

          if (
            item.stock <=
            item.minStock
          ) {
            await addNotification(
              'stock',
              'Stock bajo',
              `${product.name} tiene stock por debajo del mínimo (${item.stock} ${item.unit})`
            );
          }

          return item.id;
        } catch (error) {
          console.error(
            'Error creando producto:',
            error
          );
        }
      },
      [
        businessId,
        addActivity,
        addNotification,
      ]
    );

  const updateInventoryProduct =
    useCallback(
      async (
        id: string,
        updates: Partial<InventoryProduct>
      ) => {
        try {
          const supabaseUpdates:
            Record<string, unknown> = {};

          if (
            updates.name !== undefined
          ) {
            supabaseUpdates.name =
              updates.name;
          }

          if (
            updates.category !==
            undefined
          ) {
            supabaseUpdates.category =
              updates.category;
          }

          if (
            updates.stock !== undefined
          ) {
            supabaseUpdates.stock =
              updates.stock;
          }

          if (
            updates.minStock !==
            undefined
          ) {
            supabaseUpdates.minimum_stock =
              updates.minStock;
          }

          if (
            updates.unitPrice !==
            undefined
          ) {
            supabaseUpdates.price =
              updates.unitPrice;
          }

          if (
            updates.costPrice !==
            undefined
          ) {
            supabaseUpdates.cost =
              updates.costPrice;
          }

          const updated =
            await updateProduct(
              id,
              supabaseUpdates
            );

          setData((prev) => ({
            ...prev,
            inventory:
              prev.inventory.map(
                (product) =>
                  product.id === id
                    ? {
                      ...product,
                      ...updates,
                      id: updated.id,
                      name:
                        updated.name,
                      category:
                        updated.category ||
                        'General',
                      stock:
                        updated.stock,
                      minStock:
                        updated.minimum_stock,
                      unitPrice:
                        updated.price,
                      costPrice:
                        updated.cost,
                    }
                    : product
              ),
          }));

          if (
            updated.stock <=
            updated.minimum_stock
          ) {
            await addNotification(
              'stock',
              'Stock bajo',
              `${updated.name} tiene stock bajo (${updated.stock})`
            );
          }
        } catch (error) {
          console.error(
            'Error actualizando producto:',
            error
          );
        }
      },
      [addNotification]
    );

  const deleteInventoryProduct =
    useCallback(
      async (id: string) => {
        try {
          await deleteProduct(id);

          setData((prev) => ({
            ...prev,
            inventory:
              prev.inventory.filter(
                (product) =>
                  product.id !== id
              ),
          }));
        } catch (error) {
          console.error(
            'Error eliminando producto:',
            error
          );
        }
      },
      []
    );

  const adjustStock = useCallback(
    async (
      id: string,
      delta: number
    ) => {
      const currentProduct =
        data.inventory.find(
          (product) =>
            product.id === id
        );

      if (!currentProduct) {
        console.error(
          'Producto no encontrado:',
          id
        );
        return;
      }

      try {
        const updated =
          await adjustProductStock(
            id,
            delta,
            currentProduct.stock
          );

        setData((prev) => ({
          ...prev,
          inventory:
            prev.inventory.map(
              (product) =>
                product.id === id
                  ? {
                    ...product,
                    stock:
                      updated.stock,
                  }
                  : product
            ),
        }));

        if (
          updated.stock <=
          currentProduct.minStock
        ) {
          await addNotification(
            'stock',
            'Stock bajo',
            `${currentProduct.name} tiene stock bajo (${updated.stock} ${currentProduct.unit})`
          );
        }
      } catch (error) {
        console.error(
          'Error ajustando stock:',
          error
        );
      }
    },
    [
      data.inventory,
      addNotification,
    ]
  );

  // ── Invoices ──────────────────────────────────────────────────────────────

  const addInvoice = useCallback(
    async (
      invoice: Omit<
        Invoice,
        'id' | 'number' | 'issueDate'
      >
    ) => {
      if (!businessId) {
        console.error(
          'No se encontró business_id.'
        );
        return;
      }

      try {
        const number =
          generateInvoiceNumber(
            data.invoices
          );

        const issueDate =
          new Date().toISOString();

        const created =
          await createInvoice({
            business_id: businessId,
            type:
              invoice.type || null,
            number,
            client_id:
              invoice.clientId || null,
            client_name:
              invoice.clientName,
            client_cuit:
              invoice.clientCuit ||
              null,
            client_email:
              invoice.clientEmail ||
              null,
            client_phone:
              invoice.clientPhone ||
              null,
            items: invoice.items,
            subtotal:
              invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            status: invoice.status,
            issue_date: issueDate,
            due_date:
              invoice.dueDate ||
              null,
            notes:
              invoice.notes || null,
          });

        const newInvoice: Invoice = {
          id: created.id,
          type:
            created.type ||
            undefined,
          number: created.number,
          clientId:
            created.client_id ||
            undefined,
          clientName:
            created.client_name,
          clientCuit:
            created.client_cuit ||
            undefined,
          clientEmail:
            created.client_email ||
            undefined,
          clientPhone:
            created.client_phone ||
            undefined,
          items:
            created.items || [],
          subtotal:
            Number(created.subtotal),
          tax: Number(created.tax),
          total:
            Number(created.total),
          status: created.status,
          issueDate:
            created.issue_date,
          dueDate:
            created.due_date ||
            undefined,
          notes:
            created.notes ||
            undefined,
        };

        setData((prev) => ({
          ...prev,
          invoices: [
            newInvoice,
            ...prev.invoices,
          ],
        }));

        await addActivity(
          'invoice',
          'Factura generada',
          invoice.total,
          invoice.clientName
        );

        await addNotification(
          'invoice',
          'Factura generada',
          `${newInvoice.number} — ${invoice.clientName}`
        );

        return newInvoice.id;
      } catch (error) {
        console.error(
          'Error creando factura:',
          error
        );
      }
    },
    [
      businessId,
      data.invoices,
      addActivity,
      addNotification,
    ]
  );

  const updateInvoiceStatus =
    useCallback(
      async (
        id: string,
        status: Invoice['status']
      ) => {
        try {
          const updated =
            await updateInvoice(id, {
              status,
            });

          setData((prev) => ({
            ...prev,
            invoices:
              prev.invoices.map(
                (invoice) =>
                  invoice.id === id
                    ? {
                      ...invoice,
                      status:
                        updated.status,
                    }
                    : invoice
              ),
          }));
        } catch (error) {
          console.error(
            'Error actualizando estado de factura:',
            error
          );
        }
      },
      []
    );

  const deleteInvoice =
    useCallback(async (id: string) => {
      try {
        await deleteInvoiceSupabase(id);

        setData((prev) => ({
          ...prev,
          invoices:
            prev.invoices.filter(
              (invoice) =>
                invoice.id !== id
            ),
        }));
      } catch (error) {
        console.error(
          'Error eliminando factura:',
          error
        );
      }
    }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalSales =
      data.sales.reduce(
        (sum, sale) =>
          sum + sale.amount,
        0
      );

    const totalPurchases =
      data.purchases.reduce(
        (sum, purchase) =>
          sum + purchase.amount,
        0
      );

    const totalExpenses =
      data.expenses.reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    const netResult =
      totalSales -
      totalPurchases -
      totalExpenses;

    const lowStockProducts =
      data.inventory.filter(
        (product) =>
          product.stock <=
          product.minStock *
          LOW_STOCK_THRESHOLD_MULTIPLIER
      );

    const unreadNotifications =
      data.notifications.filter(
        (notification) =>
          !notification.read
      ).length;

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netResult,
      lowStockProducts,
      unreadNotifications,
      clientCount:
        data.clients.length,
      supplierCount:
        data.suppliers.length,
      inventoryCount:
        data.inventory.length,
      invoiceCount:
        data.invoices.length,
    };
  }, [data]);

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    data,
    stats,

    inventoryLoading,
    clientsLoading,
    salesLoading,
    purchasesLoading,
    activitiesLoading,
    notificationsLoading,
    invoicesLoading,

    // Notifications
    addNotification,
    markAllNotificationsRead,
    markNotificationRead,
    clearNotifications,

    // Activities
    addActivity,

    // Sales
    addSale,
    deleteSale: deleteSaleHandler,

    // Purchases
    addPurchase,
    deletePurchase,

    // Clients
    addClient,
    updateClient,
    deleteClient,

    // Suppliers
    addSupplier,
    updateSupplier,
    deleteSupplier,

    // Expenses
    addExpense,
    deleteExpense: deleteExpenseLocal,

    // Inventory
    addInventoryProduct,
    updateInventoryProduct,
    deleteInventoryProduct,
    adjustStock,

    // Invoices
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
}