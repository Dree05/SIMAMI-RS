import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, QrCode } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ToastContainer from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { asets, LOKASI, KATEGORI_ASET, STATUS_ASET, KONDISI_ASET } from '../data/dummy';
import { FormInput, FormSelect, FormTextarea } from '../components/common/FormInput';

const emptyForm = {
  nama: '', kode: '', kategori: '', merk: '', model: '', nomorSeri: '',
  nomorInventaris: '', lokasi: '', status: STATUS_ASET.TERSEDIA,
  kondisi: KONDISI_ASET.BAIK, tanggalPengadaan: '', nilaiPengadaan: '',
  penanggungJawab: '', unitPenanggung: '', catatan: '',
};

export default function AsetPage() {
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();
  const [data, setData] = useState(asets);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter(a => {
    const matchSearch = !search || a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.kode.toLowerCase().includes(search.toLowerCase()) ||
      a.nomorInventaris.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchKategori = !filterKategori || a.kategori === filterKategori;
    const matchLokasi = !filterLokasi || a.lokasi === filterLokasi;
    return matchSearch && matchStatus && matchKategori && matchLokasi;
  });

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (a) => { setSelected(a); setForm({ ...a, nilaiPengadaan: String(a.nilaiPengadaan) }); setModal('edit'); };
  const openDelete = (a) => { setSelected(a); setModal('delete'); };

  const handleSave = () => {
    if (modal === 'add') {
      const newId = `AST-${String(data.length + 1).padStart(3, '0')}`;
      setData(prev => [...prev, { ...form, id: newId, nilaiPengadaan: Number(form.nilaiPengadaan), terakhirDiperbarui: new Date().toISOString().split('T')[0] }]);
      toast.success('Aset berhasil ditambahkan', `${form.nama} telah disimpan ke daftar aset.`);
    } else {
      setData(prev => prev.map(a => a.id === selected.id ? { ...selected, ...form, nilaiPengadaan: Number(form.nilaiPengadaan) } : a));
      toast.success('Aset berhasil diperbarui', `Data ${form.nama} telah diperbarui.`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    const namaAset = selected?.nama;
    setData(prev => prev.filter(a => a.id !== selected.id));
    setModal(null);
    toast.success('Aset berhasil dihapus', `${namaAset} telah dihapus dari daftar aset.`);
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <AppLayout title="Data Aset Medis" subtitle={`${filtered.length} dari ${data.length} aset ditampilkan`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input className="text-sm text-slate-700 placeholder-slate-400 outline-none flex-1 bg-transparent"
            placeholder="Cari nama aset, kode, nomor inventaris..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input-field text-sm py-2 w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            {Object.values(STATUS_ASET).map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input-field text-sm py-2 w-auto" value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
            <option value="">Semua Kategori</option>
            {KATEGORI_ASET.map(k => <option key={k}>{k}</option>)}
          </select>
          <select className="input-field text-sm py-2 w-auto" value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)}>
            <option value="">Semua Lokasi</option>
            {LOKASI.map(l => <option key={l}>{l}</option>)}
          </select>
          <button onClick={openAdd} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Tambah Aset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Kode / Aset', 'Kategori', 'Lokasi', 'Status', 'Kondisi', 'Penanggung Jawab', ''].map(h => (
                  <th key={h} className="table-header px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                  Tidak ada aset yang ditemukan untuk filter ini.
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-slate-800">{a.nama}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{a.kode} · {a.nomorInventaris}</p>
                  </td>
                  <td className="table-cell text-slate-500">{a.kategori}</td>
                  <td className="table-cell">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{a.lokasi}</span>
                  </td>
                  <td className="table-cell"><StatusBadge status={a.status} /></td>
                  <td className="table-cell"><StatusBadge status={a.kondisi} showDot={false} /></td>
                  <td className="table-cell">
                    <p className="text-slate-700">{a.penanggungJawab}</p>
                    <p className="text-xs text-slate-400">{a.unitPenanggung}</p>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/aset/${a.id}`)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors" title="Detail">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => navigate(`/qr-code?id=${a.id}`)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-primary-600 transition-colors" title="QR Code">
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700 transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openDelete(a)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-500 hover:text-red-600 transition-colors" title="Hapus">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Tambah Aset Medis' : 'Edit Aset Medis'}
        size="xl"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button className="btn-primary" onClick={handleSave}>Simpan</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Nama Aset" name="nama" value={form.nama} onChange={handleChange} placeholder="cth. Defibrilator AED" required />
          <FormInput label="Kode Aset" name="kode" value={form.kode} onChange={handleChange} placeholder="cth. PM-DF-003" required />
          <FormInput label="Nomor Inventaris" name="nomorInventaris" value={form.nomorInventaris} onChange={handleChange} placeholder="INV/RS-PM/2022/..." />
          <FormInput label="Nomor Seri" name="nomorSeri" value={form.nomorSeri} onChange={handleChange} placeholder="cth. PH2022-9981" />
          <FormSelect label="Kategori" name="kategori" value={form.kategori} onChange={handleChange} required>
            <option value="">Pilih kategori...</option>
            {KATEGORI_ASET.map(k => <option key={k}>{k}</option>)}
          </FormSelect>
          <FormInput label="Merk" name="merk" value={form.merk} onChange={handleChange} placeholder="cth. Philips" />
          <FormInput label="Model" name="model" value={form.model} onChange={handleChange} placeholder="cth. HeartStart FRx" />
          <FormInput label="Nilai Pengadaan (Rp)" name="nilaiPengadaan" type="number" value={form.nilaiPengadaan} onChange={handleChange} placeholder="28000000" />
          <FormSelect label="Lokasi" name="lokasi" value={form.lokasi} onChange={handleChange} required>
            <option value="">Pilih lokasi...</option>
            {LOKASI.map(l => <option key={l}>{l}</option>)}
          </FormSelect>
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange}>
            {Object.values(STATUS_ASET).map(s => <option key={s}>{s}</option>)}
          </FormSelect>
          <FormSelect label="Kondisi" name="kondisi" value={form.kondisi} onChange={handleChange}>
            {Object.values(KONDISI_ASET).map(c => <option key={c}>{c}</option>)}
          </FormSelect>
          <FormInput label="Tanggal Pengadaan" name="tanggalPengadaan" type="date" value={form.tanggalPengadaan} onChange={handleChange} />
          <FormInput label="Penanggung Jawab" name="penanggungJawab" value={form.penanggungJawab} onChange={handleChange} placeholder="cth. dr. Ahmad Fauzi, Sp.JP" />
          <FormInput label="Unit Penanggung" name="unitPenanggung" value={form.unitPenanggung} onChange={handleChange} placeholder="cth. ICU" />
          <div className="sm:col-span-2">
            <FormTextarea label="Catatan" name="catatan" value={form.catatan} onChange={handleChange} placeholder="Catatan kondisi, riwayat, atau informasi tambahan..." />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Hapus Aset" size="sm"
        footer={<>
          <button className="btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button className="btn-danger" onClick={handleDelete}>Ya, Hapus</button>
        </>}
      >
        <p className="text-sm text-slate-600">Anda akan menghapus aset <span className="font-semibold text-slate-800">{selected?.nama}</span> ({selected?.kode}). Tindakan ini tidak dapat dibatalkan.</p>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppLayout>
  );
}
