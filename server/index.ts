import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config({
    path: '.env.local',
});

const app = express();

const PORT = 3001;

app.use(cors());
app.use(express.json());

/* =========================================================
   ENVIRONMENT
========================================================= */

const apiKey = process.env.GEMINI_API_KEY;

const supabaseUrl =
    process.env.VITE_SUPABASE_URL;

const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!apiKey) {
    console.error(
        '❌ GEMINI_API_KEY no está configurada.'
    );

    process.exit(1);
}

if (!supabaseUrl) {
    console.error(
        '❌ VITE_SUPABASE_URL no está configurada.'
    );

    process.exit(1);
}

if (!supabaseKey) {
    console.error(
        '❌ VITE_SUPABASE_PUBLISHABLE_KEY no está configurada.'
    );

    process.exit(1);
}

/* =========================================================
   CLIENTS
========================================================= */

const ai = new GoogleGenAI({
    apiKey,
});

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

/* =========================================================
   TYPES
========================================================= */

type FaroAutonomy =
    | 'answer_only'
    | 'suggest_actions'
    | 'execute_actions';

type FaroResponseStyle =
    | 'brief'
    | 'balanced'
    | 'detailed';

interface FaroAISettings {
    autonomy: FaroAutonomy;
    responseStyle: FaroResponseStyle;
}

interface FaroAction {
    type:
    | 'create_sale'
    | 'create_expense'
    | 'create_customer'
    | 'create_product'
    | 'update_product'
    | 'delete_product'
    | 'update_customer'
    | 'delete_customer';

    data: any;
}

/* =========================================================
   HELPERS
========================================================= */

function getResponseStyleInstruction(
    style: FaroResponseStyle
): string {
    switch (style) {
        case 'brief':
            return `
Respondé de forma muy breve.
Utilizá únicamente la información necesaria.
Evitá explicaciones innecesarias.
`;

        case 'detailed':
            return `
Respondé de forma detallada.
Podés incluir contexto, cálculos, explicaciones
y recomendaciones cuando sean útiles.
`;

        default:
            return `
Respondé de forma equilibrada.
Sé claro y directo, pero agregá contexto
cuando realmente ayude.
`;
    }
}

/* =========================================================
   BUSINESS DATA
========================================================= */

async function getBusinessContext(
    businessId: string
) {
    const {
        data: business,
        error: businessError,
    } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

    if (businessError) {
        throw new Error(
            `No se pudo obtener el negocio: ${businessError.message}`
        );
    }

    const {
        data: products,
        error: productsError,
    } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('name', {
            ascending: true,
        });

    if (productsError) {
        throw new Error(
            `No se pudieron obtener los productos: ${productsError.message}`
        );
    }

    const {
        data: customers,
        error: customersError,
    } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('name', {
            ascending: true,
        });

    if (customersError) {
        throw new Error(
            `No se pudieron obtener los clientes: ${customersError.message}`
        );
    }

    const {
        data: sales,
        error: salesError,
    } = await supabase
        .from('sales')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', {
            ascending: false,
        })
        .limit(100);

    if (salesError) {
        throw new Error(
            `No se pudieron obtener las ventas: ${salesError.message}`
        );
    }

    const {
        data: expenses,
        error: expensesError,
    } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', {
            ascending: false,
        })
        .limit(100);

    if (expensesError) {
        throw new Error(
            `No se pudieron obtener los gastos: ${expensesError.message}`
        );
    }

    const {
        data: activities,
        error: activitiesError,
    } = await supabase
        .from('activities')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', {
            ascending: false,
        })
        .limit(20);

    if (activitiesError) {
        throw new Error(
            `No se pudieron obtener las actividades: ${activitiesError.message}`
        );
    }

    const safeProducts = products || [];
    const safeCustomers = customers || [];
    const safeSales = sales || [];
    const safeExpenses = expenses || [];
    const safeActivities = activities || [];

    const totalSales =
        safeSales.reduce(
            (sum: number, sale: any) =>
                sum + Number(sale.total || 0),
            0
        );

    const totalExpenses =
        safeExpenses.reduce(
            (sum: number, expense: any) =>
                sum + Number(expense.amount || 0),
            0
        );

    const lowStockProducts =
        safeProducts.filter(
            (product: any) =>
                Number(product.stock || 0) <=
                Number(product.minimum_stock || 0)
        );

    return {
        business,
        products: safeProducts,
        customers: safeCustomers,
        sales: safeSales,
        expenses: safeExpenses,
        activities: safeActivities,
        totalSales,
        totalExpenses,
        lowStockProducts,
    };
}

/* =========================================================
   ACTION DETECTION
========================================================= */

async function detectAction(
    message: string,
    context: any
): Promise<FaroAction | null> {
    const actionPrompt = `
Sos el sistema de acciones administrativas de Faro.

Analizá el mensaje del usuario.

DATOS DEL NEGOCIO:

${JSON.stringify(context, null, 2)}

MENSAJE:

${message}

Tu trabajo es determinar si el usuario está solicitando
una acción administrativa concreta.

Acciones disponibles:

create_sale
create_expense
create_customer
create_product
update_product
delete_product
update_customer
delete_customer

REGLAS:

- No inventes IDs.
- Si necesitás identificar un producto o cliente,
  utilizá los datos existentes.
- Si no podés identificar claramente el elemento,
  NO generes una acción.
- Si faltan datos fundamentales para ejecutar la acción,
  NO generes una acción.
- Una consulta como "cuántos productos tengo"
  NO es una acción.
- Una pregunta sobre ventas NO es una acción.
- "Vendí 3 productos X a $1000 cada uno"
  SÍ es una acción.
- "Agregá un gasto de $5000 por publicidad"
  SÍ es una acción.
- "Agregá un cliente llamado Juan"
  SÍ es una acción.
- "Creá un producto llamado Coca Cola,
  stock 20, precio 1500 y costo 800"
  SÍ es una acción.

Respondé EXCLUSIVAMENTE JSON válido.

Si no hay acción:

{
  "action": null
}

Si existe:

{
  "action": {
    "type": "TIPO",
    "data": {}
  }
}
`;

    const response =
        await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: actionPrompt,
        });

    const text =
        response.text?.trim() || '';

    try {
        const parsed = JSON.parse(
            text
                .replace(/^```json/i, '')
                .replace(/^```/i, '')
                .replace(/```$/i, '')
                .trim()
        );

        return parsed.action || null;
    } catch {
        console.error(
            '❌ Faro no pudo interpretar la acción:',
            text
        );

        return null;
    }
}

/* =========================================================
   CREATE ACTIVITY
========================================================= */

async function createActivity(
    businessId: string,
    title: string,
    description: string
) {
    const { error } = await supabase
        .from('activities')
        .insert({
            business_id: businessId,
            type: 'faro_ai',
            title,
            description,
        });

    if (error) {
        console.error(
            'Error creando actividad:',
            error
        );
    }
}

/* =========================================================
   EXECUTE ACTION
========================================================= */

async function executeAction(
    action: FaroAction,
    businessId: string
): Promise<string> {
    switch (action.type) {
        /* =====================================================
           SALE
        ===================================================== */

        case 'create_sale': {
            const {
                product_id,
                quantity,
                unit_price,
                client_name,
            } = action.data;

            if (
                !product_id ||
                !quantity ||
                unit_price === undefined
            ) {
                throw new Error(
                    'Faltan datos para registrar la venta.'
                );
            }

            const numericQuantity =
                Number(quantity);

            const numericPrice =
                Number(unit_price);

            if (
                numericQuantity <= 0 ||
                numericPrice < 0
            ) {
                throw new Error(
                    'La cantidad o el precio de la venta no son válidos.'
                );
            }

            const {
                data: product,
                error: productError,
            } = await supabase
                .from('products')
                .select('*')
                .eq('id', product_id)
                .eq('business_id', businessId)
                .single();

            if (productError || !product) {
                throw new Error(
                    'No encontré el producto indicado.'
                );
            }

            if (
                Number(product.stock) <
                numericQuantity
            ) {
                throw new Error(
                    `No hay stock suficiente de ${product.name}. Stock disponible: ${product.stock}.`
                );
            }

            const total =
                numericQuantity * numericPrice;

            const { error: saleError } =
                await supabase
                    .from('sales')
                    .insert({
                        business_id: businessId,
                        product_id,
                        quantity: numericQuantity,
                        unit_price: numericPrice,
                        total,
                        sold_at: new Date().toISOString(),
                    });

            if (saleError) {
                throw new Error(
                    `No se pudo registrar la venta: ${saleError.message}`
                );
            }

            const newStock =
                Number(product.stock) -
                numericQuantity;

            const { error: stockError } =
                await supabase
                    .from('products')
                    .update({
                        stock: newStock,
                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq('id', product_id)
                    .eq('business_id', businessId);

            if (stockError) {
                throw new Error(
                    `La venta se registró pero no se pudo actualizar el stock: ${stockError.message}`
                );
            }

            await createActivity(
                businessId,
                'Venta registrada por Faro',
                `Venta de ${numericQuantity} x ${product.name} por $${total}.`
            );

            return `Listo. Registré la venta de ${numericQuantity} ${product.name} por un total de $${total}. El stock quedó en ${newStock}.`;
        }

        /* =====================================================
           EXPENSE
        ===================================================== */

        case 'create_expense': {
            const {
                description,
                amount,
                category,
                expense_date,
            } = action.data;

            if (
                !description ||
                amount === undefined
            ) {
                throw new Error(
                    'Faltan datos para registrar el gasto.'
                );
            }

            const numericAmount =
                Number(amount);

            if (numericAmount <= 0) {
                throw new Error(
                    'El importe del gasto debe ser mayor a cero.'
                );
            }

            const { error } =
                await supabase
                    .from('expenses')
                    .insert({
                        business_id: businessId,
                        description,
                        amount: numericAmount,
                        category:
                            category || 'Otros',
                        expense_date:
                            expense_date ||
                            new Date()
                                .toISOString()
                                .split('T')[0],
                    });

            if (error) {
                throw new Error(
                    `No se pudo registrar el gasto: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Gasto registrado por Faro',
                `${description}: $${numericAmount}.`
            );

            return `Listo. Registré el gasto "${description}" por $${numericAmount}.`;
        }

        /* =====================================================
           CUSTOMER
        ===================================================== */

        case 'create_customer': {
            const {
                name,
                phone,
                email,
                notes,
            } = action.data;

            if (!name) {
                throw new Error(
                    'Necesito el nombre del cliente.'
                );
            }

            const { data: existing } =
                await supabase
                    .from('customers')
                    .select('id')
                    .eq('business_id', businessId)
                    .ilike('name', name)
                    .maybeSingle();

            if (existing) {
                throw new Error(
                    `Ya existe un cliente llamado ${name}.`
                );
            }

            const { error } =
                await supabase
                    .from('customers')
                    .insert({
                        business_id: businessId,
                        name,
                        phone:
                            phone || null,
                        email:
                            email || null,
                        notes:
                            notes || null,
                    });

            if (error) {
                throw new Error(
                    `No se pudo crear el cliente: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Cliente creado por Faro',
                `Se agregó el cliente ${name}.`
            );

            return `Listo. Agregué a ${name} como nuevo cliente.`;
        }

        /* =====================================================
           PRODUCT
        ===================================================== */

        case 'create_product': {
            const {
                name,
                category,
                stock,
                minimum_stock,
                price,
                cost,
            } = action.data;

            if (!name) {
                throw new Error(
                    'Necesito el nombre del producto.'
                );
            }

            if (
                stock === undefined ||
                price === undefined
            ) {
                throw new Error(
                    'Para crear el producto necesito al menos stock y precio.'
                );
            }

            const numericStock =
                Number(stock);

            const numericMinimumStock =
                Number(minimum_stock || 0);

            const numericPrice =
                Number(price);

            const numericCost =
                Number(cost || 0);

            if (
                numericStock < 0 ||
                numericMinimumStock < 0 ||
                numericPrice < 0 ||
                numericCost < 0
            ) {
                throw new Error(
                    'Los valores numéricos del producto no son válidos.'
                );
            }

            const { data: existing } =
                await supabase
                    .from('products')
                    .select('id')
                    .eq('business_id', businessId)
                    .ilike('name', name)
                    .maybeSingle();

            if (existing) {
                throw new Error(
                    `Ya existe un producto llamado ${name}.`
                );
            }

            const { error } =
                await supabase
                    .from('products')
                    .insert({
                        business_id: businessId,
                        name,
                        category:
                            category || null,
                        stock: numericStock,
                        minimum_stock:
                            numericMinimumStock,
                        price: numericPrice,
                        cost: numericCost,
                    });

            if (error) {
                throw new Error(
                    `No se pudo crear el producto: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Producto creado por Faro',
                `Se agregó el producto ${name}.`
            );

            return `Listo. Creé el producto ${name} con stock ${numericStock} y precio $${numericPrice}.`;
        }

        /* =====================================================
           UPDATE PRODUCT
        ===================================================== */

        case 'update_product': {
            const {
                product_id,
                name,
                category,
                stock,
                minimum_stock,
                price,
                cost,
            } = action.data;

            if (!product_id) {
                throw new Error(
                    'No pude identificar el producto a modificar.'
                );
            }

            const updateData: any = {};

            if (name !== undefined)
                updateData.name = name;

            if (category !== undefined)
                updateData.category = category;

            if (stock !== undefined)
                updateData.stock = Number(stock);

            if (minimum_stock !== undefined)
                updateData.minimum_stock =
                    Number(minimum_stock);

            if (price !== undefined)
                updateData.price = Number(price);

            if (cost !== undefined)
                updateData.cost = Number(cost);

            updateData.updated_at =
                new Date().toISOString();

            const { error } =
                await supabase
                    .from('products')
                    .update(updateData)
                    .eq('id', product_id)
                    .eq('business_id', businessId);

            if (error) {
                throw new Error(
                    `No se pudo actualizar el producto: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Producto actualizado por Faro',
                `Faro modificó un producto del inventario.`
            );

            return 'Listo. Actualicé el producto correctamente.';
        }

        /* =====================================================
           DELETE PRODUCT
        ===================================================== */

        case 'delete_product': {
            const {
                product_id,
            } = action.data;

            if (!product_id) {
                throw new Error(
                    'No pude identificar el producto.'
                );
            }

            const { data: product } =
                await supabase
                    .from('products')
                    .select('name')
                    .eq('id', product_id)
                    .eq('business_id', businessId)
                    .single();

            if (!product) {
                throw new Error(
                    'No encontré el producto.'
                );
            }

            const { error } =
                await supabase
                    .from('products')
                    .delete()
                    .eq('id', product_id)
                    .eq('business_id', businessId);

            if (error) {
                throw new Error(
                    `No se pudo eliminar el producto: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Producto eliminado por Faro',
                `Se eliminó ${product.name}.`
            );

            return `Listo. Eliminé el producto ${product.name}.`;
        }

        /* =====================================================
           UPDATE CUSTOMER
        ===================================================== */

        case 'update_customer': {
            const {
                customer_id,
                name,
                phone,
                email,
                notes,
            } = action.data;

            if (!customer_id) {
                throw new Error(
                    'No pude identificar el cliente.'
                );
            }

            const updateData: any = {};

            if (name !== undefined)
                updateData.name = name;

            if (phone !== undefined)
                updateData.phone = phone;

            if (email !== undefined)
                updateData.email = email;

            if (notes !== undefined)
                updateData.notes = notes;

            updateData.updated_at =
                new Date().toISOString();

            const { error } =
                await supabase
                    .from('customers')
                    .update(updateData)
                    .eq('id', customer_id)
                    .eq('business_id', businessId);

            if (error) {
                throw new Error(
                    `No se pudo actualizar el cliente: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Cliente actualizado por Faro',
                'Faro modificó los datos de un cliente.'
            );

            return 'Listo. Actualicé los datos del cliente.';
        }

        /* =====================================================
           DELETE CUSTOMER
        ===================================================== */

        case 'delete_customer': {
            const {
                customer_id,
            } = action.data;

            if (!customer_id) {
                throw new Error(
                    'No pude identificar el cliente.'
                );
            }

            const {
                data: customer,
            } = await supabase
                .from('customers')
                .select('name')
                .eq('id', customer_id)
                .eq('business_id', businessId)
                .single();

            if (!customer) {
                throw new Error(
                    'No encontré el cliente.'
                );
            }

            const { error } =
                await supabase
                    .from('customers')
                    .delete()
                    .eq('id', customer_id)
                    .eq('business_id', businessId);

            if (error) {
                throw new Error(
                    `No se pudo eliminar el cliente: ${error.message}`
                );
            }

            await createActivity(
                businessId,
                'Cliente eliminado por Faro',
                `Se eliminó el cliente ${customer.name}.`
            );

            return `Listo. Eliminé al cliente ${customer.name}.`;
        }

        default:
            throw new Error(
                'Acción no soportada.'
            );
    }
}

/* =========================================================
   CHAT
========================================================= */

app.post(
    '/api/chat',
    async (req, res) => {
        try {
            const {
                message,
                businessId,
                aiSettings,
            } = req.body;

            if (
                !message ||
                typeof message !== 'string'
            ) {
                return res.status(400).json({
                    error:
                        'El mensaje es obligatorio.',
                });
            }

            if (
                !businessId ||
                typeof businessId !== 'string'
            ) {
                return res.status(400).json({
                    error:
                        'El Business ID es obligatorio.',
                });
            }

            const settings: FaroAISettings = {
                autonomy:
                    aiSettings?.autonomy ||
                    'answer_only',

                responseStyle:
                    aiSettings?.responseStyle ||
                    'balanced',
            };

            /* =====================================================
               GET DATA
            ===================================================== */

            const context =
                await getBusinessContext(
                    businessId
                );

            /* =====================================================
               DETECT ACTION
            ===================================================== */

            const action =
                await detectAction(
                    message,
                    context
                );

            /* =====================================================
               SUGGEST ACTION
            ===================================================== */

            if (
                action &&
                settings.autonomy ===
                'suggest_actions'
            ) {
                return res.status(200).json({
                    reply:
                        `Detecté que querés realizar una acción administrativa: ${action.type}. Si querés ejecutarla, cambiá el nivel de autonomía de Faro a "Ejecutar acciones aprobadas".`,
                });
            }

            /* =====================================================
               EXECUTE ACTION
            ===================================================== */

            if (
                action &&
                settings.autonomy ===
                'execute_actions'
            ) {
                try {
                    const result =
                        await executeAction(
                            action,
                            businessId
                        );

                    return res.status(200).json({
                        reply: result,
                    });
                } catch (actionError) {
                    console.error(
                        '❌ Error ejecutando acción:',
                        actionError
                    );

                    return res.status(200).json({
                        reply:
                            actionError instanceof Error
                                ? `No pude ejecutar la acción: ${actionError.message}`
                                : 'No pude ejecutar la acción solicitada.',
                    });
                }
            }

            /* =====================================================
               NORMAL QUESTION / ANSWER ONLY
            ===================================================== */

            const businessContext = `
DATOS REALES DEL NEGOCIO

NEGOCIO
${JSON.stringify(
                context.business,
                null,
                2
            )}

RESUMEN

- Cantidad de productos: ${context.products.length}
- Cantidad de clientes: ${context.customers.length}
- Cantidad de ventas consultadas: ${context.sales.length}
- Total de ventas consultadas: $${context.totalSales}
- Cantidad de gastos consultados: ${context.expenses.length}
- Total de gastos consultados: $${context.totalExpenses}
- Productos con stock bajo: ${context.lowStockProducts.length}

PRODUCTOS

${JSON.stringify(
                context.products,
                null,
                2
            )}

CLIENTES

${JSON.stringify(
                context.customers,
                null,
                2
            )}

VENTAS RECIENTES

${JSON.stringify(
                context.sales,
                null,
                2
            )}

GASTOS RECIENTES

${JSON.stringify(
                context.expenses,
                null,
                2
            )}

ACTIVIDAD RECIENTE

${JSON.stringify(
                context.activities,
                null,
                2
            )}

PRODUCTOS CON STOCK BAJO

${JSON.stringify(
                context.lowStockProducts,
                null,
                2
            )}
`;

            const prompt = `
Sos Faro AI, el asistente administrativo inteligente de este negocio.

Tu función es ayudar al dueño o responsable utilizando los datos reales proporcionados.

REGLAS:

1. Nunca inventes información.
2. Nunca inventes ventas, productos, clientes, gastos ni números.
3. Utilizá exclusivamente los datos proporcionados.
4. Si un dato no está disponible, decilo claramente.
5. Diferenciá datos reales de recomendaciones.
6. Respondé siempre en español.
7. Sé claro y útil.
8. No menciones Supabase, APIs, tablas ni detalles técnicos.
9. Hablá como un asistente administrativo.
10. Si el usuario pregunta algo sobre el negocio, utilizá los datos reales.
11. En este momento esta parte de la respuesta se utiliza para consultas informativas.
12. No afirmes haber realizado una acción si no fue ejecutada por el sistema.

${getResponseStyleInstruction(
                settings.responseStyle
            )}

CONTEXTO:

${businessContext}

MENSAJE:

${message}
`;

            const response =
                await ai.models.generateContent({
                    model:
                        'gemini-3.5-flash-lite',
                    contents: prompt,
                });

            return res.status(200).json({
                reply:
                    response.text ||
                    'No pude generar una respuesta.',
            });
        } catch (error) {
            console.error(
                '❌ Faro AI error:',
                error
            );

            return res.status(500).json({
                error:
                    error instanceof Error
                        ? error.message
                        : 'No se pudo procesar la solicitud.',
            });
        }
    }
);

/* =========================================================
   SERVER
========================================================= */

app.listen(PORT, () => {
    console.log(
        `🚨 Faro AI Server funcionando en http://localhost:${PORT}`
    );
});