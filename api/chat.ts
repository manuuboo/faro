import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error(
        "SUPABASE: VITE_SUPABASE_URL no está configurada"
    );
}

if (!supabaseKey) {
    throw new Error(
        "SUPABASE: SUPABASE_SERVICE_ROLE_KEY no está configurada"
    );
}

const supabaseServer = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req: any, res: any) {
    console.log("=================================");
    console.log("FARO AI - NUEVA CONSULTA");
    console.log("=================================");

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const {
            message,
            businessId,
            aiSettings,
        } = req.body;

        console.log("Mensaje:", message);
        console.log("Business ID:", businessId);
        console.log("AI Settings:", aiSettings);

        // --------------------------------------------------
        // VALIDACIONES
        // --------------------------------------------------

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required",
            });
        }

        if (!businessId || typeof businessId !== "string") {
            return res.status(400).json({
                error: "Business ID is required",
            });
        }

        const autonomy =
            aiSettings?.autonomy || "answer_only";

        console.log(
            "Modo de autonomía:",
            autonomy
        );

        // --------------------------------------------------
        // 1. NEGOCIO
        // --------------------------------------------------

        const {
            data: business,
            error: businessError,
        } = await supabaseServer
            .from("businesses")
            .select("*")
            .eq("id", businessId)
            .single();

        console.log("Negocio encontrado:", !!business);
        console.log("Error negocio:", businessError);

        if (businessError) {
            console.error(
                "Error obteniendo negocio:",
                businessError
            );

            return res.status(500).json({
                error:
                    "No se pudo obtener la información del negocio",
                details: businessError.message,
            });
        }

        if (!business) {
            return res.status(404).json({
                error: "No se encontró el negocio",
            });
        }

        // --------------------------------------------------
        // 2. PRODUCTOS
        // --------------------------------------------------

        const {
            data: products,
            error: productsError,
        } = await supabaseServer
            .from("products")
            .select("*")
            .eq("business_id", businessId)
            .order("name", {
                ascending: true,
            });

        console.log(
            "Productos encontrados:",
            products?.length ?? 0
        );

        console.log(
            "Error productos:",
            productsError
        );

        // --------------------------------------------------
        // 3. CLIENTES
        // --------------------------------------------------

        const {
            data: customers,
            error: customersError,
        } = await supabaseServer
            .from("customers")
            .select("*")
            .eq("business_id", businessId)
            .order("name", {
                ascending: true,
            });

        console.log(
            "Clientes encontrados:",
            customers?.length ?? 0
        );

        console.log(
            "Error clientes:",
            customersError
        );

        // --------------------------------------------------
        // 4. VENTAS
        // --------------------------------------------------

        const {
            data: sales,
            error: salesError,
        } = await supabaseServer
            .from("sales")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", {
                ascending: false,
            })
            .limit(100);

        console.log(
            "Ventas encontradas:",
            sales?.length ?? 0
        );

        console.log(
            "Error ventas:",
            salesError
        );

        // --------------------------------------------------
        // 5. GASTOS
        // --------------------------------------------------

        const {
            data: expenses,
            error: expensesError,
        } = await supabaseServer
            .from("expenses")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", {
                ascending: false,
            })
            .limit(100);

        console.log(
            "Gastos encontrados:",
            expenses?.length ?? 0
        );

        console.log(
            "Error gastos:",
            expensesError
        );

        // --------------------------------------------------
        // 6. ACTIVIDADES
        // --------------------------------------------------

        const {
            data: activities,
            error: activitiesError,
        } = await supabaseServer
            .from("activities")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", {
                ascending: false,
            })
            .limit(20);

        console.log(
            "Actividades encontradas:",
            activities?.length ?? 0
        );

        console.log(
            "Error actividades:",
            activitiesError
        );

        // --------------------------------------------------
        // DATOS SEGUROS
        // --------------------------------------------------

        const safeProducts = products ?? [];
        const safeCustomers = customers ?? [];
        const safeSales = sales ?? [];
        const safeExpenses = expenses ?? [];
        const safeActivities = activities ?? [];

        // --------------------------------------------------
        // 7. CÁLCULOS
        // --------------------------------------------------

        const totalSales = safeSales.reduce(
            (sum: number, sale: any) => {
                return sum + Number(sale.total || 0);
            },
            0
        );

        const totalExpenses = safeExpenses.reduce(
            (sum: number, expense: any) => {
                return sum + Number(expense.amount || 0);
            },
            0
        );

        const lowStockProducts = safeProducts.filter(
            (product: any) => {
                return (
                    Number(product.stock || 0) <=
                    Number(product.minimum_stock || 0)
                );
            }
        );

        // --------------------------------------------------
        // 8. CONTEXTO DEL NEGOCIO
        // --------------------------------------------------

        const businessContext = `
DATOS REALES DEL NEGOCIO

NEGOCIO:
${JSON.stringify(business, null, 2)}

RESUMEN DEL NEGOCIO:

Cantidad exacta de productos:
${safeProducts.length}

Cantidad exacta de clientes:
${safeCustomers.length}

Cantidad de ventas consultadas:
${safeSales.length}

Total de ventas consultadas:
$${totalSales}

Cantidad de gastos consultados:
${safeExpenses.length}

Total de gastos consultados:
$${totalExpenses}

Cantidad de productos con stock bajo:
${lowStockProducts.length}


LISTA COMPLETA DE PRODUCTOS:

${JSON.stringify(
            safeProducts,
            null,
            2
        )}


LISTA COMPLETA DE CLIENTES:

${JSON.stringify(
            safeCustomers,
            null,
            2
        )}


VENTAS RECIENTES:

${JSON.stringify(
            safeSales,
            null,
            2
        )}


GASTOS RECIENTES:

${JSON.stringify(
            safeExpenses,
            null,
            2
        )}


ACTIVIDADES RECIENTES:

${JSON.stringify(
            safeActivities,
            null,
            2
        )}


PRODUCTOS CON STOCK BAJO:

${JSON.stringify(
            lowStockProducts,
            null,
            2
        )}
`;

        // --------------------------------------------------
        // 9. PROMPT DE FARO
        // --------------------------------------------------

        let prompt = `
Sos Faro AI, el asistente administrativo inteligente del negocio.

El usuario está realizando una consulta sobre SU negocio.

Tenés acceso a datos reales del negocio proporcionados debajo.

Tu trabajo es responder utilizando esos datos.

REGLAS GENERALES:

1. Usá exclusivamente los datos proporcionados en CONTEXTO DEL NEGOCIO.

2. Nunca inventes productos, clientes, ventas, gastos,
   cantidades, precios, IDs o números.

3. Si el usuario pregunta "cuántos productos tengo",
   utilizá exactamente la cantidad indicada en:
   "Cantidad exacta de productos".

4. Si el usuario pregunta por productos,
   utilizá la lista de PRODUCTOS.

5. Si el usuario pregunta por clientes,
   utilizá la lista de CLIENTES.

6. Si el usuario pregunta por ventas,
   utilizá las VENTAS RECIENTES y los totales disponibles.

7. Si el usuario pregunta por gastos,
   utilizá los GASTOS RECIENTES y los totales disponibles.

8. No digas que no tenés acceso al negocio si los datos aparecen
   en el contexto.

9. No menciones Supabase.

10. No menciones APIs.

11. No menciones bases de datos.

12. No menciones tablas.

13. No expliques detalles técnicos.

14. Respondé siempre en español.

15. Sé directo y natural.

16. Si la pregunta puede responderse con un número,
   respondé primero con ese número.

17. Si el usuario pregunta algo que no está disponible,
   decilo claramente.

`;

        // --------------------------------------------------
        // MODO CONSULTA
        // --------------------------------------------------

        if (autonomy !== "execute_actions") {
            prompt += `
MODO ACTUAL: SOLO CONSULTAR

En este modo solamente podés consultar información.

No ejecutes acciones.

Si el usuario pide registrar, modificar o eliminar algo,
explicá que actualmente Faro está configurado para
solamente consultar información.

No afirmes haber realizado ninguna acción.
`;
        }

        // --------------------------------------------------
        // MODO EJECUTAR ACCIONES
        // --------------------------------------------------

        if (autonomy === "execute_actions") {
            prompt += `
MODO ACTUAL: EJECUTAR ACCIONES

El usuario permitió que Faro ejecute acciones administrativas.

Si el usuario solamente hace una pregunta,
respondé normalmente.

Si el usuario solicita una acción,
tenés que identificarla.

ACCIONES DISPONIBLES:

1. CREAR VENTA

type:
"create_sale"

Campos:
- productId
- quantity

Usá exclusivamente un ID de producto que aparezca
en la LISTA COMPLETA DE PRODUCTOS.

No inventes productId.

2. CREAR PRODUCTO

type:
"create_product"

Campos:
- name
- category
- stock
- minimum_stock
- price
- cost

3. CREAR CLIENTE

type:
"create_customer"

Campos:
- name
- email
- phone
- notes

4. CREAR GASTO

type:
"create_expense"

Campos:
- description
- amount
- category

5. AJUSTAR STOCK

type:
"adjust_stock"

Campos:
- productId
- delta

Usá exclusivamente un ID de producto existente.

Si el usuario dice:
"sumale 5 unidades"
delta = 5.

Si dice:
"restale 2"
delta = -2.

6. ELIMINAR PRODUCTO

type:
"delete_product"

Campos:
- productId

7. ELIMINAR CLIENTE

type:
"delete_customer"

Campos:
- customerId

IMPORTANTE:

Si falta información indispensable para ejecutar una acción,
NO inventes el dato.

En ese caso pedí al usuario el dato faltante.

Cuando haya una acción que pueda ejecutarse,
respondé ÚNICAMENTE con JSON válido.

FORMATO:

{
  "action": {
    "type": "create_sale",
    "productId": "ID_REAL",
    "quantity": 2
  },
  "reply": "Voy a registrar la venta de 2 unidades."
}

Si NO hay acción:

{
  "action": null,
  "reply": "respuesta normal"
}

No uses markdown.
No uses bloques de código.
No agregues texto fuera del JSON.
`;
        }

        prompt += `

========================================
CONTEXTO DEL NEGOCIO
========================================

${businessContext}


========================================
MENSAJE DEL USUARIO
========================================

${message}
`;

        // --------------------------------------------------
        // 10. GEMINI
        // --------------------------------------------------

        console.log(
            "Enviando contexto a Gemini..."
        );

        const response =
            await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: prompt,
            });

        const rawReply =
            response.text ||
            "No pude generar una respuesta.";

        console.log(
            "Respuesta de Faro:",
            rawReply
        );

        // --------------------------------------------------
        // MODO CONSULTA
        // --------------------------------------------------

        if (autonomy !== "execute_actions") {
            return res.status(200).json({
                reply: rawReply,
            });
        }

        // --------------------------------------------------
        // 11. PARSEAR ACCIÓN
        // --------------------------------------------------

        let parsed: any;

        try {
            parsed = JSON.parse(rawReply);
        } catch {
            console.warn(
                "Gemini no devolvió JSON válido."
            );

            return res.status(200).json({
                reply: rawReply,
            });
        }

        const action = parsed?.action;
        const reply =
            parsed?.reply ||
            "Acción procesada.";

        if (!action || !action.type) {
            return res.status(200).json({
                reply,
            });
        }

        console.log(
            "Acción detectada:",
            action
        );

        // --------------------------------------------------
        // 12. CREAR VENTA
        // --------------------------------------------------

        if (action.type === "create_sale") {
            const productId = action.productId;
            const quantity = Number(action.quantity);

            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({
                    error:
                        "Faltan datos válidos para registrar la venta.",
                });
            }

            const product = safeProducts.find(
                (item: any) =>
                    item.id === productId
            );

            if (!product) {
                return res.status(400).json({
                    error:
                        "El producto indicado no existe en este negocio.",
                });
            }

            const currentStock =
                Number(product.stock || 0);

            if (quantity > currentStock) {
                return res.status(400).json({
                    error:
                        `No hay suficiente stock de ${product.name}. Stock disponible: ${currentStock}.`,
                });
            }

            const unitPrice =
                Number(product.price || 0);

            const total =
                unitPrice * quantity;

            const now =
                new Date().toISOString();

            const {
                data: createdSale,
                error: saleError,
            } = await supabaseServer
                .from("sales")
                .insert({
                    business_id: businessId,
                    product_id: productId,
                    quantity,
                    unit_price: unitPrice,
                    total,
                    sold_at: now,
                })
                .select()
                .single();

            if (saleError) {
                console.error(
                    "Error creando venta:",
                    saleError
                );

                return res.status(500).json({
                    error:
                        "No se pudo registrar la venta.",
                    details:
                        saleError.message,
                });
            }

            // Actualizar stock
            const newStock =
                currentStock - quantity;

            const {
                error: stockError,
            } = await supabaseServer
                .from("products")
                .update({
                    stock: newStock,
                })
                .eq("id", productId)
                .eq("business_id", businessId);

            if (stockError) {
                console.error(
                    "Error actualizando stock:",
                    stockError
                );
            }

            // Actividad
            await supabaseServer
                .from("activities")
                .insert({
                    business_id: businessId,
                    type: "sale",
                    title: "Venta registrada",
                    description: product.name,
                    amount: total,
                });

            // Notificación
            await supabaseServer
                .from("notifications")
                .insert({
                    business_id: businessId,
                    type: "sale",
                    title: "Venta registrada",
                    description:
                        `${product.name} — ${quantity} unidad${quantity !== 1 ? "es" : ""}`,
                    read: false,
                });

            console.log(
                "Venta creada:",
                createdSale?.id
            );

            return res.status(200).json({
                reply,
                action: {
                    type: "create_sale",
                    executed: true,
                    saleId:
                        createdSale?.id,
                    productId,
                    quantity,
                    total,
                },
            });
        }

        // --------------------------------------------------
        // 13. CREAR PRODUCTO
        // --------------------------------------------------

        if (action.type === "create_product") {
            if (!action.name) {
                return res.status(400).json({
                    error:
                        "Falta el nombre del producto.",
                });
            }

            const {
                data: createdProduct,
                error: productError,
            } = await supabaseServer
                .from("products")
                .insert({
                    business_id: businessId,
                    name: action.name,
                    category:
                        action.category ||
                        "General",
                    stock:
                        Number(action.stock || 0),
                    minimum_stock:
                        Number(
                            action.minimum_stock || 0
                        ),
                    price:
                        Number(action.price || 0),
                    cost:
                        Number(action.cost || 0),
                })
                .select()
                .single();

            if (productError) {
                console.error(
                    "Error creando producto:",
                    productError
                );

                return res.status(500).json({
                    error:
                        "No se pudo crear el producto.",
                    details:
                        productError.message,
                });
            }

            await supabaseServer
                .from("activities")
                .insert({
                    business_id: businessId,
                    type: "inventory",
                    title: "Producto agregado",
                    description:
                        createdProduct.name,
                });

            return res.status(200).json({
                reply,
                action: {
                    type: "create_product",
                    executed: true,
                    productId:
                        createdProduct.id,
                },
            });
        }

        // --------------------------------------------------
        // 14. CREAR CLIENTE
        // --------------------------------------------------

        if (action.type === "create_customer") {
            if (!action.name) {
                return res.status(400).json({
                    error:
                        "Falta el nombre del cliente.",
                });
            }

            const {
                data: createdCustomer,
                error: customerError,
            } = await supabaseServer
                .from("customers")
                .insert({
                    business_id: businessId,
                    name: action.name,
                    email:
                        action.email || null,
                    phone:
                        action.phone || null,
                    notes:
                        action.notes || null,
                })
                .select()
                .single();

            if (customerError) {
                console.error(
                    "Error creando cliente:",
                    customerError
                );

                return res.status(500).json({
                    error:
                        "No se pudo crear el cliente.",
                    details:
                        customerError.message,
                });
            }

            await supabaseServer
                .from("activities")
                .insert({
                    business_id: businessId,
                    type: "client",
                    title: "Nuevo cliente",
                    description:
                        createdCustomer.name,
                });

            return res.status(200).json({
                reply,
                action: {
                    type: "create_customer",
                    executed: true,
                    customerId:
                        createdCustomer.id,
                },
            });
        }

        // --------------------------------------------------
        // 15. CREAR GASTO
        // --------------------------------------------------

        if (action.type === "create_expense") {
            const amount =
                Number(action.amount);

            if (
                !action.description ||
                !amount ||
                amount <= 0
            ) {
                return res.status(400).json({
                    error:
                        "Faltan datos válidos para registrar el gasto.",
                });
            }

            const {
                data: createdExpense,
                error: expenseError,
            } = await supabaseServer
                .from("expenses")
                .insert({
                    business_id: businessId,
                    description:
                        action.description,
                    amount,
                    category:
                        action.category ||
                        "General",
                    expense_date:
                        new Date().toISOString(),
                })
                .select()
                .single();

            if (expenseError) {
                console.error(
                    "Error creando gasto:",
                    expenseError
                );

                return res.status(500).json({
                    error:
                        "No se pudo registrar el gasto.",
                    details:
                        expenseError.message,
                });
            }

            await supabaseServer
                .from("activities")
                .insert({
                    business_id: businessId,
                    type: "expense",
                    title: "Nuevo gasto",
                    description:
                        action.description,
                    amount: -amount,
                });

            return res.status(200).json({
                reply,
                action: {
                    type: "create_expense",
                    executed: true,
                    expenseId:
                        createdExpense.id,
                },
            });
        }

        // --------------------------------------------------
        // 16. AJUSTAR STOCK
        // --------------------------------------------------

        if (action.type === "adjust_stock") {
            const productId =
                action.productId;

            const delta =
                Number(action.delta);

            if (
                !productId ||
                !Number.isFinite(delta) ||
                delta === 0
            ) {
                return res.status(400).json({
                    error:
                        "Faltan datos válidos para ajustar el stock.",
                });
            }

            const product = safeProducts.find(
                (item: any) =>
                    item.id === productId
            );

            if (!product) {
                return res.status(400).json({
                    error:
                        "El producto indicado no existe.",
                });
            }

            const currentStock =
                Number(product.stock || 0);

            const newStock =
                currentStock + delta;

            if (newStock < 0) {
                return res.status(400).json({
                    error:
                        "El stock no puede quedar por debajo de 0.",
                });
            }

            const {
                data: updatedProduct,
                error: updateError,
            } = await supabaseServer
                .from("products")
                .update({
                    stock: newStock,
                })
                .eq("id", productId)
                .eq("business_id", businessId)
                .select()
                .single();

            if (updateError) {
                console.error(
                    "Error ajustando stock:",
                    updateError
                );

                return res.status(500).json({
                    error:
                        "No se pudo actualizar el stock.",
                    details:
                        updateError.message,
                });
            }

            await supabaseServer
                .from("activities")
                .insert({
                    business_id: businessId,
                    type: "inventory",
                    title: "Stock actualizado",
                    description:
                        updatedProduct.name,
                });

            return res.status(200).json({
                reply,
                action: {
                    type: "adjust_stock",
                    executed: true,
                    productId,
                    newStock,
                },
            });
        }

        // --------------------------------------------------
        // 17. ELIMINAR PRODUCTO
        // --------------------------------------------------

        if (action.type === "delete_product") {
            const productId =
                action.productId;

            if (!productId) {
                return res.status(400).json({
                    error:
                        "Falta el producto a eliminar.",
                });
            }

            const product = safeProducts.find(
                (item: any) =>
                    item.id === productId
            );

            if (!product) {
                return res.status(400).json({
                    error:
                        "El producto indicado no existe.",
                });
            }

            const {
                error: deleteError,
            } = await supabaseServer
                .from("products")
                .delete()
                .eq("id", productId)
                .eq("business_id", businessId);

            if (deleteError) {
                console.error(
                    "Error eliminando producto:",
                    deleteError
                );

                return res.status(500).json({
                    error:
                        "No se pudo eliminar el producto.",
                    details:
                        deleteError.message,
                });
            }

            return res.status(200).json({
                reply,
                action: {
                    type: "delete_product",
                    executed: true,
                    productId,
                },
            });
        }

        // --------------------------------------------------
        // 18. ELIMINAR CLIENTE
        // --------------------------------------------------

        if (action.type === "delete_customer") {
            const customerId =
                action.customerId;

            if (!customerId) {
                return res.status(400).json({
                    error:
                        "Falta el cliente a eliminar.",
                });
            }

            const customer =
                safeCustomers.find(
                    (item: any) =>
                        item.id ===
                        customerId
                );

            if (!customer) {
                return res.status(400).json({
                    error:
                        "El cliente indicado no existe.",
                });
            }

            const {
                error: deleteError,
            } = await supabaseServer
                .from("customers")
                .delete()
                .eq("id", customerId)
                .eq("business_id", businessId);

            if (deleteError) {
                console.error(
                    "Error eliminando cliente:",
                    deleteError
                );

                return res.status(500).json({
                    error:
                        "No se pudo eliminar el cliente.",
                    details:
                        deleteError.message,
                });
            }

            return res.status(200).json({
                reply,
                action: {
                    type: "delete_customer",
                    executed: true,
                    customerId,
                },
            });
        }

        // --------------------------------------------------
        // ACCIÓN NO SOPORTADA
        // --------------------------------------------------

        console.warn(
            "Acción no soportada:",
            action.type
        );

        return res.status(200).json({
            reply,
        });

    } catch (error) {
        console.error(
            "================================="
        );

        console.error(
            "FARO AI ERROR:"
        );

        console.error(error);

        console.error(
            "================================="
        );

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to communicate with Faro AI",
        });
    }
}