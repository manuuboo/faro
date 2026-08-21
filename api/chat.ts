import { GoogleGenAI } from "@google/genai";
import { supabaseServer } from "../src/lib/supabaseServer";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada");
}

const ai = new GoogleGenAI({
    apiKey,
});

export default async function handler(req: any, res: any) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const { message, businessId } = req.body;

        console.log("=================================");
        console.log("FARO AI - NUEVA CONSULTA");
        console.log("Mensaje:", message);
        console.log("Business ID:", businessId);
        console.log("=================================");

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
                error: "No se pudo obtener la información del negocio",
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

        if (productsError) {
            console.error(
                "Error obteniendo productos:",
                productsError
            );
        }

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

        if (customersError) {
            console.error(
                "Error obteniendo clientes:",
                customersError
            );
        }

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

        if (salesError) {
            console.error(
                "Error obteniendo ventas:",
                salesError
            );
        }

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

        if (expensesError) {
            console.error(
                "Error obteniendo gastos:",
                expensesError
            );
        }

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

        if (activitiesError) {
            console.error(
                "Error obteniendo actividades:",
                activitiesError
            );
        }

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

        // --------------------------------------------------
        // 8. CONTEXTO DEL NEGOCIO
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

        const prompt = `
Sos Faro AI, el asistente administrativo inteligente del negocio.

El usuario está realizando una consulta sobre SU negocio.

Tenés acceso a datos reales del negocio proporcionados debajo.

Tu trabajo es responder utilizando esos datos.

REGLAS:

1. Usá exclusivamente los datos proporcionados en CONTEXTO DEL NEGOCIO.

2. Nunca inventes productos, clientes, ventas, gastos,
   cantidades, precios o números.

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

8. Si el usuario pregunta por stock,
   utilizá la información de PRODUCTOS y PRODUCTOS CON STOCK BAJO.

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

18. Si el usuario pregunta algo que no está disponible,
   decilo claramente.

19. No afirmes haber realizado acciones que no realizaste.

20. En esta versión solamente podés consultar información.

21. Si el usuario pide registrar, modificar o eliminar algo,
   explicá que todavía no podés ejecutar esa acción.

22. No inventes información para completar una respuesta.

23. Si hay varias cantidades relacionadas con una consulta,
   aclarale al usuario qué representa cada una.

24. Cuando sea útil, utilizá listas breves para presentar
   productos, clientes, ventas o gastos.

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

        const reply =
            response.text ||
            "No pude generar una respuesta.";

        console.log(
            "Respuesta de Faro:",
            reply
        );

        // --------------------------------------------------
        // 11. RESPUESTA
        // --------------------------------------------------

        return res.status(200).json({
            reply,
        });

    } catch (error) {
        console.error(
            "================================="
        );

        console.error(
            "FARO AI ERROR REAL:"
        );

        console.error(
            "Error:",
            error
        );

        console.error(
            "Mensaje:",
            error instanceof Error
                ? error.message
                : "Sin mensaje"
        );

        console.error(
            "Stack:",
            error instanceof Error
                ? error.stack
                : "Sin stack"
        );

        console.error(
            "================================="
        );

        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : "Error desconocido en Faro AI",
        });
    }
}