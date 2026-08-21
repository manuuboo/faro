import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// ==================================================
// CONFIGURACIÓN
// ==================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error(
        "VITE_SUPABASE_URL no está configurada"
    );
}

if (!supabaseServiceRoleKey) {
    throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY no está configurada"
    );
}

const supabaseServer = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// ==================================================
// HANDLER
// ==================================================

export default async function handler(
    req: any,
    res: any
) {
    console.log(
        "========== FARO API START =========="
    );

    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: "Method not allowed",
        });
    }

    try {
        // ==================================================
        // 1. REQUEST
        // ==================================================

        console.log("STEP 1 - Request recibido");

        const { message, businessId } = req.body;

        console.log("STEP 2 - Body recibido");
        console.log("message:", message);
        console.log("businessId:", businessId);

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                ok: false,
                error: "Message is required",
            });
        }

        if (
            !businessId ||
            typeof businessId !== "string"
        ) {
            return res.status(400).json({
                ok: false,
                error: "Business ID is required",
            });
        }

        // ==================================================
        // 2. BUSINESS
        // ==================================================

        console.log(
            "STEP 3 - Consultando business en Supabase"
        );

        const {
            data: business,
            error: businessError,
        } = await supabaseServer
            .from("businesses")
            .select("*")
            .eq("id", businessId)
            .single();

        console.log(
            "STEP 4 - Business query terminada"
        );

        if (businessError) {
            console.error(
                "SUPABASE BUSINESS ERROR:",
                businessError
            );

            return res.status(500).json({
                ok: false,
                error: "Supabase error obteniendo negocio",
                details: businessError.message,
                code: businessError.code,
            });
        }

        if (!business) {
            return res.status(404).json({
                ok: false,
                error: "Business not found",
            });
        }

        console.log(
            "STEP 5 - Business encontrado:",
            business.id
        );

        // ==================================================
        // 3. PRODUCTS
        // ==================================================

        console.log(
            "STEP 6 - Consultando productos"
        );

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

        if (productsError) {
            console.error(
                "PRODUCTS ERROR:",
                productsError
            );
        }

        const safeProducts = products ?? [];

        console.log(
            "Productos encontrados:",
            safeProducts.length
        );

        // ==================================================
        // 4. CUSTOMERS
        // ==================================================

        console.log(
            "STEP 7 - Consultando clientes"
        );

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

        if (customersError) {
            console.error(
                "CUSTOMERS ERROR:",
                customersError
            );
        }

        const safeCustomers = customers ?? [];

        console.log(
            "Clientes encontrados:",
            safeCustomers.length
        );

        // ==================================================
        // 5. SALES
        // ==================================================

        console.log(
            "STEP 8 - Consultando ventas"
        );

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

        if (salesError) {
            console.error(
                "SALES ERROR:",
                salesError
            );
        }

        const safeSales = sales ?? [];

        console.log(
            "Ventas encontradas:",
            safeSales.length
        );

        // ==================================================
        // 6. EXPENSES
        // ==================================================

        console.log(
            "STEP 9 - Consultando gastos"
        );

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

        if (expensesError) {
            console.error(
                "EXPENSES ERROR:",
                expensesError
            );
        }

        const safeExpenses = expenses ?? [];

        console.log(
            "Gastos encontrados:",
            safeExpenses.length
        );

        // ==================================================
        // 7. ACTIVITIES
        // ==================================================

        console.log(
            "STEP 10 - Consultando actividades"
        );

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

        if (activitiesError) {
            console.error(
                "ACTIVITIES ERROR:",
                activitiesError
            );
        }

        const safeActivities = activities ?? [];

        console.log(
            "Actividades encontradas:",
            safeActivities.length
        );

        // ==================================================
        // 8. CÁLCULOS
        // ==================================================

        console.log(
            "STEP 11 - Calculando resumen"
        );

        const totalSales = safeSales.reduce(
            (
                sum: number,
                sale: any
            ) => {
                return (
                    sum +
                    Number(sale.total || 0)
                );
            },
            0
        );

        const totalExpenses =
            safeExpenses.reduce(
                (
                    sum: number,
                    expense: any
                ) => {
                    return (
                        sum +
                        Number(expense.amount || 0)
                    );
                },
                0
            );

        const lowStockProducts =
            safeProducts.filter(
                (product: any) => {
                    return (
                        Number(product.stock || 0) <=
                        Number(
                            product.minimum_stock || 0
                        )
                    );
                }
            );

        console.log(
            "Total ventas:",
            totalSales
        );

        console.log(
            "Total gastos:",
            totalExpenses
        );

        console.log(
            "Productos con stock bajo:",
            lowStockProducts.length
        );

        // ==================================================
        // 9. CONTEXTO DEL NEGOCIO
        // ==================================================

        const businessContext = `
DATOS REALES DEL NEGOCIO

NEGOCIO:
${JSON.stringify(
            business,
            null,
            2
        )}

========================================
RESUMEN
========================================

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

========================================
PRODUCTOS
========================================

${JSON.stringify(
            safeProducts,
            null,
            2
        )}

========================================
CLIENTES
========================================

${JSON.stringify(
            safeCustomers,
            null,
            2
        )}

========================================
VENTAS RECIENTES
========================================

${JSON.stringify(
            safeSales,
            null,
            2
        )}

========================================
GASTOS RECIENTES
========================================

${JSON.stringify(
            safeExpenses,
            null,
            2
        )}

========================================
ACTIVIDADES RECIENTES
========================================

${JSON.stringify(
            safeActivities,
            null,
            2
        )}

========================================
PRODUCTOS CON STOCK BAJO
========================================

${JSON.stringify(
            lowStockProducts,
            null,
            2
        )}
`;

        // ==================================================
        // 10. PROMPT
        // ==================================================

        const prompt = `
Sos Faro AI, el asistente administrativo
inteligente del negocio.

El usuario está realizando una consulta
sobre SU negocio.

Tenés acceso a datos reales del negocio
proporcionados en el contexto.

Tu trabajo es responder utilizando
exclusivamente esos datos.

REGLAS:

1. Usá exclusivamente los datos proporcionados
   en el CONTEXTO DEL NEGOCIO.

2. Nunca inventes productos, clientes,
   ventas, gastos, cantidades, precios
   o números.

3. Si el usuario pregunta:
   "¿Cuántos productos tengo?"
   utilizá exactamente:
   "Cantidad exacta de productos".

4. Si pregunta por productos,
   utilizá la lista de PRODUCTOS.

5. Si pregunta por clientes,
   utilizá la lista de CLIENTES.

6. Si pregunta por ventas,
   utilizá las VENTAS RECIENTES
   y los totales disponibles.

7. Si pregunta por gastos,
   utilizá los GASTOS RECIENTES
   y los totales disponibles.

8. Si pregunta por stock,
   utilizá los datos de PRODUCTOS
   y PRODUCTOS CON STOCK BAJO.

9. No digas que no tenés acceso
   al negocio si los datos aparecen
   en el contexto.

10. No menciones Supabase.

11. No menciones APIs.

12. No menciones bases de datos.

13. No menciones tablas.

14. No expliques detalles técnicos.

15. Respondé siempre en español.

16. Sé directo, claro y natural.

17. Si la pregunta puede responderse
    con un número, respondé primero
    con ese número.

18. Si el usuario pregunta algo
    que no está disponible,
    decilo claramente.

19. No inventes información
    para completar una respuesta.

20. No afirmes haber realizado acciones.

21. En esta versión solamente podés
    consultar información.

22. Si el usuario pide registrar,
    modificar o eliminar algo,
    explicá que todavía no podés
    ejecutar esa acción.

========================================
CONTEXTO DEL NEGOCIO
========================================

${businessContext}

========================================
MENSAJE DEL USUARIO
========================================

${message}
`;

        // ==================================================
        // 11. GEMINI
        // ==================================================

        console.log(
            "STEP 12 - Verificando GEMINI_API_KEY"
        );

        const apiKey =
            process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error(
                "GEMINI_API_KEY NO EXISTE"
            );

            return res.status(500).json({
                ok: false,
                error: "GEMINI_API_KEY is missing",
            });
        }

        console.log(
            "STEP 13 - GEMINI_API_KEY existe"
        );

        const ai = new GoogleGenAI({
            apiKey,
        });

        console.log(
            "STEP 14 - Cliente Gemini creado"
        );

        console.log(
            "STEP 15 - Enviando contexto a Gemini"
        );

        const response =
            await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: prompt,
            });

        console.log(
            "STEP 16 - Gemini respondió"
        );

        const reply =
            response.text ||
            "No pude generar una respuesta.";

        console.log(
            "RESPUESTA FARO:",
            reply
        );

        console.log(
            "========== FARO API END =========="
        );

        return res.status(200).json({
            ok: true,
            reply,
        });

    } catch (error) {
        console.error(
            "========== FARO API ERROR =========="
        );

        console.error(
            "ERROR COMPLETO:",
            error
        );

        if (error instanceof Error) {
            console.error(
                "ERROR MESSAGE:",
                error.message
            );

            console.error(
                "ERROR STACK:",
                error.stack
            );
        }

        console.error(
            "===================================="
        );

        return res.status(500).json({
            ok: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown server error",
        });
    }
}