import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      const kaderData = await client.execute("SELECT * FROM kader ORDER BY Timestamp DESC");
      const configData = await client.execute("SELECT * FROM config WHERE Key = 'AdminPassword'");
      
      res.status(200).json({
        kader: kaderData.rows,
        config: { AdminPassword: configData.rows[0]?.Value || 'immjakseljaya' }
      });
    } 
    else if (req.method === 'POST') {
      const dataArray = Array.isArray(req.body) ? req.body : [req.body];
      const timestamp = new Date().toISOString();

      const queries = dataArray.map((body, index) => {
        const id = "KDR-" + Date.now() + "-" + Math.floor(Math.random() * 1000) + "-" + index;
        return {
          sql: "INSERT INTO kader (ID, Timestamp, Nama, WA, Email, Alamat, Komisariat, Status, NIA, Pelatihan, Penugasan, Pekerjaan, Jabatan, Foto, PerkaderanKhusus, StatusInstruktur, KaderTahun, Bidang, JabatanBidang, Fakultas, ProgramStudi, Universitas, RiwayatPendidikan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [
            id, timestamp, body.nama || '', body.wa || '', body.email || '', body.alamat || '', 
            body.komisariat || '', body.status || '', body.nia || '', body.pelatihan || '', 
            body.penugasan || '', body.pekerjaan || '', body.jabatan || '', body.foto || '', 
            body.perkaderanKhusus || '', body.statusInstruktur || '', body.kaderTahun || '',
            body.bidang || '', body.jabatanBidang || '', body.fakultas || '', body.programStudi || '', body.universitas || '', body.riwayatPendidikan || ''
          ]
        };
      });

      await client.batch(queries, "write");
      res.status(200).json({ success: true, message: `${dataArray.length} data kader berhasil ditambahkan!` });
    } 
    else if (req.method === 'PUT') {
      const body = req.body;
      await client.execute({
        sql: "UPDATE kader SET Nama=?, WA=?, Email=?, Alamat=?, Komisariat=?, Status=?, NIA=?, Pelatihan=?, Penugasan=?, Pekerjaan=?, Jabatan=?, Foto=?, PerkaderanKhusus=?, StatusInstruktur=?, KaderTahun=?, Bidang=?, JabatanBidang=?, Fakultas=?, ProgramStudi=?, Universitas=?, RiwayatPendidikan=? WHERE ID=?",
        args: [
          body.nama || '', body.wa || '', body.email || '', body.alamat || '', 
          body.komisariat || '', body.status || '', body.nia || '', body.pelatihan || '', 
          body.penugasan || '', body.pekerjaan || '', body.jabatan || '', body.foto || '', 
          body.perkaderanKhusus || '', body.statusInstruktur || '', body.kaderTahun || '', 
          body.bidang || '', body.jabatanBidang || '', body.fakultas || '', body.programStudi || '', body.universitas || '', body.riwayatPendidikan || '',
          body.id
        ]
      });
      res.status(200).json({ success: true, message: "Data berhasil diupdate!" });
    } 
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      await client.execute({ sql: "DELETE FROM kader WHERE ID=?", args: [id] });
      res.status(200).json({ success: true, message: "Data berhasil dihapus!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
