export default async function handler(req: any, res: any) {
    console.log("FARO API FUNCIONANDO");

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    return res.status(200).json({
        reply: "Faro API funcionando correctamente",
    });
}