import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  if (req.method === 'POST') {
    const { wa, ig } = req.body;
    try {
        // Cek dan simpan untuk WA
        let resWA = await client.execute({ sql: "UPDATE config SET Value=? WHERE Key='ContactWA'", args: [wa] });
        if (resWA.rowsAffected === 0) {
            await client.execute({ sql: "INSERT INTO config (Key, Value) VALUES ('ContactWA', ?)", args: [wa] });
        }
        
        // Cek dan simpan untuk IG
        let resIG = await client.execute({ sql: "UPDATE config SET Value=? WHERE Key='ContactIG'", args: [ig] });
        if (resIG.rowsAffected === 0) {
            await client.execute({ sql: "INSERT INTO config (Key, Value) VALUES ('ContactIG', ?)", args: [ig] });
        }
        
        res.status(200).json({ success: true, message: "Pengaturan kontak berhasil disimpan!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
