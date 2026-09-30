import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      const beritaData = await client.execute("SELECT * FROM berita ORDER BY Timestamp DESC");
      res.status(200).json({ berita: beritaData.rows });
    } 
    else if (req.method === 'POST') {
      const body = req.body;
      const id = "BRT-" + Date.now();
      const timestamp = new Date().toISOString();

      await client.execute({
        sql: "INSERT INTO berita (ID, Timestamp, Judul, Kategori, Penulis, FotoCover, Konten) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [id, timestamp, body.judul || '', body.kategori || '', body.penulis || '', body.fotoCover || '', body.konten || '']
      });
      res.status(200).json({ success: true, message: "Berita berhasil dipublikasikan!" });
    } 
    else if (req.method === 'PUT') {
      const body = req.body;
      await client.execute({
        sql: "UPDATE berita SET Judul=?, Kategori=?, Penulis=?, FotoCover=?, Konten=? WHERE ID=?",
        args: [body.judul || '', body.kategori || '', body.penulis || '', body.fotoCover || '', body.konten || '', body.id]
      });
      res.status(200).json({ success: true, message: "Berita berhasil diperbarui!" });
    } 
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      await client.execute({ sql: "DELETE FROM berita WHERE ID=?", args: [id] });
      res.status(200).json({ success: true, message: "Berita berhasil dihapus!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
