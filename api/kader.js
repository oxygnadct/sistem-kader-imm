import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  // Koneksi ke Turso menggunakan Environment Variables di Vercel
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      // Menggantikan fungsi getAllData()
      const kaderData = await client.execute("SELECT * FROM kader ORDER BY Timestamp DESC");
      const configData = await client.execute("SELECT * FROM config WHERE Key = 'AdminPassword'");
      
      res.status(200).json({
        kader: kaderData.rows,
        config: { AdminPassword: configData.rows[0]?.Value || 'immjakseljaya' }
      });
    } 
    else if (req.method === 'POST') {
      // Menggantikan fungsi saveKader()
      const { nama, wa, email, alamat, komisariat, status, nia, pelatihan, penugasan, pekerjaan, jabatan } = req.body;
      const id = "KDR-" + new Date().toISOString().replace(/\D/g,'').slice(0,14) + "-" + Math.floor(Math.random() * 1000);
      const timestamp = new Date().toISOString();

      await client.execute({
        sql: "INSERT INTO kader VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [id, timestamp, nama, wa, email, alamat, komisariat, status, nia, pelatihan, penugasan, pekerjaan, jabatan]
      });
      res.status(200).json({ success: true, message: "Data kader berhasil ditambahkan!" });
    } 
    else if (req.method === 'PUT') {
      // Menggantikan fungsi updateKader()
      const { id, nama, wa, email, alamat, komisariat, status, nia, pelatihan, penugasan, pekerjaan, jabatan } = req.body;
      await client.execute({
        sql: "UPDATE kader SET Nama=?, WA=?, Email=?, Alamat=?, Komisariat=?, Status=?, NIA=?, Pelatihan=?, Penugasan=?, Pekerjaan=?, Jabatan=? WHERE ID=?",
        args: [nama, wa, email, alamat, komisariat, status, nia, pelatihan, penugasan, pekerjaan, jabatan, id]
      });
      res.status(200).json({ success: true, message: "Data kader berhasil diupdate!" });
    } 
    else if (req.method === 'DELETE') {
      // Menggantikan fungsi deleteKader()
      const { id } = req.query;
      await client.execute({ sql: "DELETE FROM kader WHERE ID=?", args: [id] });
      res.status(200).json({ success: true, message: "Data kader berhasil dihapus!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}