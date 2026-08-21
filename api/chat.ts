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

interface GeminiAttachment {
    mimeType: string;
    data: string;
    name?: string;
}

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
            attachments,
        } = req.body;

        const safeAttachments: GeminiAttachment[] =
            Array.isArray(attachments)
                ? attachments.filter(
                    (attachment: any) =>
                        attachment &&
                        typeof attachment.mimeType === "string" &&
                        typeof attachment.data === "string"
                )
                : [];

        console.log("Mensaje:", message);
        console.log("Business ID:", businessId);
        console.log("AI Settings:", aiSettings);

        console.log(
            "Archivos recibidos:",
            safeAttachments.length
        );

        if (safeAttachments.length > 0) {
            console.log(
                "Tipos de archivos:",
                safeAttachments.map(
                    (attachment) => attachment.mimeType
                )
            );
        }

        // --------------------------------------------------
        // VALIDACIONES
        // --------------------------------------------------

        if (
            (!message || typeof message !== "string") &&
            safeAttachments.length === 0
        ) {
            return res.status(400).json({
                error: "Message or attachment is required",
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

        console.log(
            "Negocio encontrado:",
            !!business
        );

        console.log(
            "Error negocio:",
            businessError
        );

        if (businessError) {
            console.error(
                "Error obteniendo negocio:",
                businessError
            );

            return res.status(500).json({
                error:
                    "No se pudo obtener la información del negocio",
                details:
                    businessError.message,
            });
        }

        if (!business) {
            return res.status(404).json({
                error:
                    "No se encontró el negocio",
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
        // 7. FACTURAS
        // --------------------------------------------------

        const {
            data: invoices,
            error: invoicesError,
        } = await supabaseServer
            .from("invoices")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", {
                ascending: false,
            })
            .limit(100);

        console.log(
            "Facturas encontradas:",
            invoices?.length ?? 0
        );

        console.log(
            "Error facturas:",
            invoicesError
        );

        // --------------------------------------------------
        // DATOS SEGUROS
        // --------------------------------------------------

        const safeProducts = products ?? [];
        const safeCustomers = customers ?? [];
        const safeSales = sales ?? [];
        const safeExpenses = expenses ?? [];
        const safeActivities = activities ?? [];
        const safeInvoices = invoices ?? [];

        // --------------------------------------------------
        // 8. CÁLCULOS
        // --------------------------------------------------

        const totalSales = safeSales.reduce(
            (
                sum: number,
                sale: any
            ) => {
                return sum + Number(sale.total || 0);
            },
            0
        );

        const totalExpenses = safeExpenses.reduce(
            (
                sum: number,
                expense: any
            ) => {
                return sum + Number(expense.amount || 0);
            },
            0
        );

        const lowStockProducts =
            safeProducts.filter(
                (product: any) => {
                    return (
                        Number(product.stock || 0) <=
                        Number(product.minimum_stock || 0)
                    );
                }
            );

        // --------------------------------------------------
        // 9. CONTEXTO DEL NEGOCIO
        // --------------------------------------------------

        const businessContext = `

DATOS REALES DEL NEGOCIO

NEGOCIO:

${JSON.stringify(
            business,
            null,
            2
        )}

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

Cantidad de facturas consultadas:
${safeInvoices.length}

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


FACTURAS RECIENTES:

${JSON.stringify(
            safeInvoices,
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
        // 10. PROMPT DE FARO
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

8. Si el usuario pregunta por facturas,
   utilizá las FACTURAS RECIENTES y los datos disponibles.

9. No digas que no tenés acceso al negocio si los datos aparecen
   en el contexto.

10. No menciones Supabase.

11. No menciones APIs.

12. No menciones bases de datos.

13. No menciones tablas.

14. No expliques detalles técnicos.

15. Respondé siempre en español.

16. Sé directo y natural.

17. Si la pregunta puede responderse con un número,
   respondé primero con ese número.

18. Si la pregunta del usuario se refiere a una imagen,
   analizá la imagen que recibió Faro.

19. Si la pregunta del usuario se refiere a un audio,
   escuchá y analizá el contenido del audio recibido.

20. Si una imagen o audio contiene información administrativa
   relevante para el negocio, utilizala en la respuesta.

21. Nunca inventes información que no esté presente
   en el texto, imagen o audio.

`;

        // --------------------------------------------------
        // MODO CONSULTA
        // --------------------------------------------------

        if (autonomy !== "execute_actions") {
            prompt += `

MODO ACTUAL: SOLO CONSULTAR

En este modo solamente podés consultar información.

No ejecutes acciones.

Si el usuario pide registrar, modificar,
eliminar o generar algo,

explicá que actualmente Faro está configurado
para solamente consultar información.

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



6. CREAR FACTURA

type:
"create_invoice"

Campos:

- invoiceType
- clientId
- clientName
- clientCuit
- clientEmail
- clientPhone
- items
- notes

El campo "items" debe ser un array:

[
    {
        "description": "nombre del producto o servicio",
        "quantity": 2,
        "unitPrice": 15000
    }
]

El cliente puede identificarse por nombre.

Si el cliente existe en la LISTA COMPLETA DE CLIENTES,
utilizá su ID real.

No inventes clientId.

Si el usuario proporciona una persona nueva,
podés generar la factura sin clientId usando
los datos proporcionados.

El tipo de factura puede ser:

"A"
"B"
"C"

Si el usuario no especifica tipo,
utilizá "C".

Para Factura A:

tax = subtotal * 0.21

Para Factura B:

tax = 0

Para Factura C:

tax = 0

El subtotal se calcula:

quantity * unitPrice

El total se calcula:

subtotal + tax

No inventes precios.

Si el usuario menciona un producto existente
y el precio aparece en la LISTA COMPLETA DE PRODUCTOS,
podés utilizar ese precio.

Si no existe un precio disponible,
pedí al usuario el precio.

La factura debe quedar en estado:

"draft"



7. ELIMINAR PRODUCTO

type:
"delete_product"

Campos:

- productId



8. ELIMINAR CLIENTE

type:
"delete_customer"

Campos:

- customerId



IMPORTANTE:

Si falta información indispensable para ejecutar
una acción, NO inventes el dato.

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

EJEMPLO PARA FACTURA:

{
    "action": {
        "type": "create_invoice",
        "invoiceType": "C",
        "clientId": "ID_REAL",
        "clientName": "Juan Pérez",
        "clientCuit": null,
        "clientEmail": "juan@email.com",
        "clientPhone": "1122334455",
        "items": [
            {
                "description": "Remera",
                "quantity": 2,
                "unitPrice": 15000
            }
        ],
        "notes": ""
    },
    "reply": "Voy a generar la factura C para Juan Pérez."
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

${message || "(El usuario envió un archivo sin texto.)"}


========================================
ARCHIVOS ADJUNTOS
========================================

El usuario puede haber enviado uno o varios archivos.

Si hay una imagen:

- Analizá visualmente su contenido.
- Extraé información útil para responder.
- Si contiene productos, precios, cantidades,
  comprobantes o información administrativa,
  utilizá esa información.
- No inventes información que no sea visible.

Si hay un audio:

- Escuchá el contenido.
- Entendé lo que dice el usuario.
- Identificá su intención.
- Utilizá la información del audio para responder
  o ejecutar la acción solicitada.

Si hay un archivo compatible:

- Analizá su contenido cuando sea posible.
- Utilizá únicamente información realmente presente
  en el archivo.

`;

        // --------------------------------------------------
        // 11. GEMINI
        // --------------------------------------------------

        console.log(
            "Enviando contexto a Gemini..."
        );

        const contentParts: any[] = [
            {
                text: prompt,
            },
        ];

        // --------------------------------------------------
        // AGREGAR ARCHIVOS A GEMINI
        // --------------------------------------------------

        for (const attachment of safeAttachments) {
            try {
                let cleanData = attachment.data;

                // Permite recibir tanto Base64 puro
                // como data URLs:
                // data:image/jpeg;base64,XXXX

                if (
                    cleanData.startsWith("data:")
                ) {
                    const commaIndex =
                        cleanData.indexOf(",");

                    if (commaIndex !== -1) {
                        cleanData =
                            cleanData.substring(
                                commaIndex + 1
                            );
                    }
                }

                contentParts.push({
                    inlineData: {
                        mimeType:
                            attachment.mimeType,
                        data: cleanData,
                    },
                });

                console.log(
                    "Archivo enviado a Gemini:",
                    attachment.name || "archivo",
                    attachment.mimeType
                );
            } catch (attachmentError) {
                console.error(
                    "Error preparando archivo:",
                    attachmentError
                );
            }
        }

        const response =
            await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: [
                    {
                        role: "user",
                        parts: contentParts,
                    },
                ],
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
        // 12. PARSEAR ACCIÓN
        // --------------------------------------------------

        let parsed: any;

        try {
            parsed =
                JSON.parse(rawReply);
        } catch {
            console.warn(
                "Gemini no devolvió JSON válido."
            );

            return res.status(200).json({
                reply: rawReply,
            });
        }

        const action =
            parsed?.action;

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
        // 13. CREAR VENTA
        // --------------------------------------------------

        if (action.type === "create_sale") {
            const productId =
                action.productId;

            const quantity =
                Number(action.quantity);

            if (
                !productId ||
                !quantity ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    error:
                        "Faltan datos válidos para registrar la venta.",
                });
            }

            const product =
                safeProducts.find(
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
                    business_id:
                        businessId,
                    product_id:
                        productId,
                    quantity,
                    unit_price:
                        unitPrice,
                    total,
                    sold_at:
                        now,
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

            const newStock =
                currentStock - quantity;

            const {
                error: stockError,
            } = await supabaseServer
                .from("products")
                .update({
                    stock:
                        newStock,
                })
                .eq("id", productId)
                .eq(
                    "business_id",
                    businessId
                );

            if (stockError) {
                console.error(
                    "Error actualizando stock:",
                    stockError
                );
            }

            await supabaseServer
                .from("activities")
                .insert({
                    business_id:
                        businessId,
                    type:
                        "sale",
                    title:
                        "Venta registrada",
                    description:
                        product.name,
                    amount:
                        total,
                });

            await supabaseServer
                .from("notifications")
                .insert({
                    business_id:
                        businessId,
                    type:
                        "sale",
                    title:
                        "Venta registrada",
                    description:
                        `${product.name} — ${quantity} unidad${quantity !== 1 ? "es" : ""}`,
                    read:
                        false,
                });

            console.log(
                "Venta creada:",
                createdSale?.id
            );

            return res.status(200).json({
                reply,
                action: {
                    type:
                        "create_sale",
                    executed:
                        true,
                    saleId:
                        createdSale?.id,
                    productId,
                    quantity,
                    total,
                },
            });
        }

        // --------------------------------------------------
        // 14. CREAR PRODUCTO
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
                    business_id:
                        businessId,
                    name:
                        action.name,
                    category:
                        action.category ||
                        "General",
                    stock:
                        Number(
                            action.stock || 0
                        ),
                    minimum_stock:
                        Number(
                            action.minimum_stock || 0
                        ),
                    price:
                        Number(
                            action.price || 0
                        ),
                    cost:
                        Number(
                            action.cost || 0
                        ),
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
                    business_id:
                        businessId,
                    type:
                        "inventory",
                    title:
                        "Producto agregado",
                    description:
                        createdProduct.name,
                });

            return res.status(200).json({
                reply,
                action: {
                    type:
                        "create_product",
                    executed:
                        true,
                    productId:
                        createdProduct.id,
                },
            });
        }

        // --------------------------------------------------
        // 15. CREAR CLIENTE
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
                    business_id:
                        businessId,
                    name:
                        action.name,
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
                    business_id:
                        businessId,
                    type:
                        "client",
                    title:
                        "Nuevo cliente",
                    description:
                        createdCustomer.name,
                });

            return res.status(200).json({
                reply,
                action: {
                    type:
                        "create_customer",
                    executed:
                        true,
                    customerId:
                        createdCustomer.id,
                },
            });
        }

        // --------------------------------------------------
        // 16. CREAR GASTO
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
                    business_id:
                        businessId,
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
                    business_id:
                        businessId,
                    type:
                        "expense",
                    title:
                        "Nuevo gasto",
                    description:
                        action.description,
                    amount:
                        -amount,
                });

            return res.status(200).json({
                reply,
                action: {
                    type:
                        "create_expense",
                    executed:
                        true,
                    expenseId:
                        createdExpense.id,
                },
            });
        }

        // --------------------------------------------------
        // 17. AJUSTAR STOCK
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

            const product =
                safeProducts.find(
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
                    stock:
                        newStock,
                })
                .eq("id", productId)
                .eq(
                    "business_id",
                    businessId
                )
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
                    business_id:
                        businessId,
                    type:
                        "inventory",
                    title:
                        "Stock actualizado",
                    description:
                        updatedProduct.name,
                });

            return res.status(200).json({
                reply,
                action: {
                    type:
                        "adjust_stock",
                    executed:
                        true,
                    productId,
                    newStock,
                },
            });
        }

        // --------------------------------------------------
        // 18. CREAR FACTURA
        // --------------------------------------------------

        if (action.type === "create_invoice") {
            const invoiceType =
                action.invoiceType || "C";

            const clientName =
                action.clientName?.trim();

            const items =
                Array.isArray(action.items)
                    ? action.items
                    : [];

            if (!clientName) {
                return res.status(400).json({
                    error:
                        "Falta el nombre del cliente para generar la factura.",
                });
            }

            if (items.length === 0) {
                return res.status(400).json({
                    error:
                        "La factura debe tener al menos un producto o servicio.",
                });
            }

            let client: any = null;

            if (action.clientId) {
                client =
                    safeCustomers.find(
                        (customer: any) =>
                            customer.id ===
                            action.clientId
                    ) || null;
            } else {
                client =
                    safeCustomers.find(
                        (customer: any) =>
                            customer.name
                                ?.toLowerCase()
                                .trim() ===
                            clientName
                                .toLowerCase()
                                .trim()
                    ) || null;
            }

            let normalizedItems: any[];

            try {
                normalizedItems =
                    items.map(
                        (item: any) => {
                            const quantity =
                                Number(
                                    item.quantity
                                );

                            const unitPrice =
                                Number(
                                    item.unitPrice
                                );

                            if (
                                !item.description ||
                                !Number.isFinite(
                                    quantity
                                ) ||
                                quantity <= 0 ||
                                !Number.isFinite(
                                    unitPrice
                                ) ||
                                unitPrice < 0
                            ) {
                                throw new Error(
                                    "Uno de los productos de la factura tiene datos inválidos."
                                );
                            }

                            return {
                                description:
                                    String(
                                        item.description
                                    ),
                                quantity,
                                unitPrice,
                            };
                        }
                    );
            } catch (error) {
                return res.status(400).json({
                    error:
                        error instanceof Error
                            ? error.message
                            : "Datos inválidos en la factura.",
                });
            }

            const subtotal =
                normalizedItems.reduce(
                    (
                        sum: number,
                        item: any
                    ) => {
                        return (
                            sum +
                            item.quantity *
                            item.unitPrice
                        );
                    },
                    0
                );

            const tax =
                invoiceType === "A"
                    ? subtotal * 0.21
                    : 0;

            const total =
                subtotal + tax;

            const {
                data: existingInvoices,
                error: existingInvoicesError,
            } = await supabaseServer
                .from("invoices")
                .select("number")
                .eq(
                    "business_id",
                    businessId
                )
                .order("created_at", {
                    ascending: false,
                });

            if (existingInvoicesError) {
                console.error(
                    "Error obteniendo facturas:",
                    existingInvoicesError
                );

                return res.status(500).json({
                    error:
                        "No se pudo obtener el número de factura.",
                    details:
                        existingInvoicesError.message,
                });
            }

            let nextNumber = 1;

            if (
                existingInvoices &&
                existingInvoices.length > 0
            ) {
                const numbers =
                    existingInvoices
                        .map(
                            (invoice: any) => {
                                const match =
                                    String(
                                        invoice.number
                                    ).match(
                                        /(\d+)$/
                                    );

                                return match
                                    ? Number(
                                        match[1]
                                    )
                                    : 0;
                            }
                        )
                        .filter(
                            (
                                number: number
                            ) =>
                                Number.isFinite(
                                    number
                                )
                        );

                if (
                    numbers.length > 0
                ) {
                    nextNumber =
                        Math.max(
                            ...numbers
                        ) + 1;
                }
            }

            const number =
                `0001-${String(
                    nextNumber
                ).padStart(8, "0")}`;

            const issueDate =
                new Date().toISOString();

            const {
                data: createdInvoice,
                error: invoiceError,
            } = await supabaseServer
                .from("invoices")
                .insert({
                    business_id:
                        businessId,
                    type:
                        invoiceType,
                    number,
                    client_id:
                        client?.id ||
                        action.clientId ||
                        null,
                    client_name:
                        client?.name ||
                        clientName,
                    client_cuit:
                        action.clientCuit ||
                        null,
                    client_email:
                        action.clientEmail ||
                        client?.email ||
                        null,
                    client_phone:
                        action.clientPhone ||
                        client?.phone ||
                        null,
                    items:
                        normalizedItems,
                    subtotal,
                    tax,
                    total,
                    status:
                        "draft",
                    issue_date:
                        issueDate,
                    due_date:
                        null,
                    notes:
                        action.notes ||
                        null,
                })
                .select()
                .single();

            if (invoiceError) {
                console.error(
                    "Error creando factura:",
                    invoiceError
                );

                return res.status(500).json({
                    error:
                        "No se pudo generar la factura.",
                    details:
                        invoiceError.message,
                });
            }

            await supabaseServer
                .from("activities")
                .insert({
                    business_id:
                        businessId,
                    type:
                        "invoice",
                    title:
                        "Factura generada",
                    description:
                        `${number} — ${clientName}`,
                    amount:
                        total,
                });

            await supabaseServer
                .from("notifications")
                .insert({
                    business_id:
                        businessId,
                    type:
                        "invoice",
                    title:
                        "Factura generada",
                    description:
                        `${number} — ${clientName}`,
                    read:
                        false,
                });

            console.log(
                "Factura creada:",
                createdInvoice?.id
            );

            return res.status(200).json({
                reply,
                action: {
                    type:
                        "create_invoice",
                    executed:
                        true,
                    invoiceId:
                        createdInvoice?.id,
                    invoiceNumber:
                        number,
                    clientName,
                    subtotal,
                    tax,
                    total,
                },
            });
        }

        // --------------------------------------------------
        // 19. ELIMINAR PRODUCTO
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

            const product =
                safeProducts.find(
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
                .eq(
                    "id",
                    productId
                )
                .eq(
                    "business_id",
                    businessId
                );

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
                    type:
                        "delete_product",
                    executed:
                        true,
                    productId,
                },
            });
        }

        // --------------------------------------------------
        // 20. ELIMINAR CLIENTE
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
                .eq(
                    "id",
                    customerId
                )
                .eq(
                    "business_id",
                    businessId
                );

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
                    type:
                        "delete_customer",
                    executed:
                        true,
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