import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, Calendar, User, Trash2, Download, PieChart, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

interface Document {
  id: string;
  name: string;
  file_path: string;
  content_type: string;
  written_at: string;
  author_name?: string;
  valid_until?: string;
  client_id?: string;
  accessible_roles: { id: string; name: string }[];
}

export function DocumentsPanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  
  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
  const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
  
  const [uploadForm, setUploadForm] = useState({
    name: '',
    written_at: new Date().toISOString().split('T')[0],
    author_name: '',
    valid_until: '',
    client_id: '',
    role_ids: [] as string[],
    file: null as File | null
  });

  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    fetchData();
    fetchSupportData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('documents/');
      setDocuments(res.data);
    } catch (err) {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [rRes, cRes] = await Promise.all([
        api.get('roles/'),
        api.get('clients/')
      ]);
      setRoles(rRes.data);
      setClients(cRes.data);
    } catch (err) {
      console.error('Error fetching support data', err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Selecione um arquivo');

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('name', uploadForm.name);
    formData.append('written_at', uploadForm.written_at);
    if (uploadForm.author_name) formData.append('author_name', uploadForm.author_name);
    if (uploadForm.valid_until) formData.append('valid_until', uploadForm.valid_until);
    if (uploadForm.client_id) formData.append('client_id', uploadForm.client_id);
    formData.append('role_ids', JSON.stringify(uploadForm.role_ids));
    
    // Auth user as author if selected
    if (currentUser) formData.append('author_id', currentUser.id);

    try {
      await api.post('documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Documento enviado com sucesso!');
      setIsUploadOpen(false);
      fetchData();
      resetForm();
    } catch (err) {
      toast.error('Erro ao enviar documento');
    }
  };

  const resetForm = () => {
    setUploadForm({
      name: '',
      written_at: new Date().toISOString().split('T')[0],
      author_name: '',
      valid_until: '',
      client_id: '',
      role_ids: [],
      file: null
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir documento permanentemente?')) return;
    try {
      await api.delete(`documents/${id}`);
      toast.success('Documento excluído');
      fetchData();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.author_name?.toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isQuarantine = (date?: string) => {
    if (!date) return false;
    const exp = new Date(date);
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);
    return exp > now && exp < thirtyDays;
  };

  const stats = {
    expired: documents.filter(d => isExpired(d.valid_until)).length,
    quarantine: documents.filter(d => isQuarantine(d.valid_until)).length,
    ok: documents.filter(d => d.valid_until && !isExpired(d.valid_until) && !isQuarantine(d.valid_until)).length + documents.filter(d => !d.valid_until).length,
    total: documents.length
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-primary font-outfit">Gestão de Documentos</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-wider text-italic">Arquivo digital e controle de validade</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-accent hover:text-primary transition-all font-bold">
              <Plus className="mr-2 h-4 w-4" /> Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic uppercase text-primary">Upload de Documento</DialogTitle>
              <DialogDescription className="font-bold uppercase text-[10px] text-primary/60">Anexe o arquivo e preencha as informações necessárias.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-primary/20 p-8 rounded-lg text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={e => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                  />
                  <div className="space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-primary/40" />
                    <div className="text-sm font-bold uppercase text-primary">
                      {uploadForm.file ? uploadForm.file.name : 'Clique ou arraste para enviar'}
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">PDF, DOCX, PNG, JPG (MÁX. 10MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Nome do Documento</Label>
                    <Input required value={uploadForm.name} onChange={e => setUploadForm({...uploadForm, name: e.target.value})} placeholder="Ex: Contrato de Prestação" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Autor (Nome)</Label>
                    <Input value={uploadForm.author_name} onChange={e => setUploadForm({...uploadForm, author_name: e.target.value})} placeholder="Quem escreveu?" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Escrito em</Label>
                    <Input type="date" required value={uploadForm.written_at} onChange={e => setUploadForm({...uploadForm, written_at: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Validade até</Label>
                    <Input type="date" value={uploadForm.valid_until} onChange={e => setUploadForm({...uploadForm, valid_until: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Pode ser acessado por:</Label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 border border-slate-200 rounded-md">
                    {roles.map(role => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`role-${role.id}`}
                          checked={uploadForm.role_ids.includes(role.id)}
                          onChange={(e) => {
                            const newRoles = e.target.checked 
                              ? [...uploadForm.role_ids, role.id]
                              : uploadForm.role_ids.filter(id => id !== role.id);
                            setUploadForm({...uploadForm, role_ids: newRoles});
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-[11px] font-bold uppercase cursor-pointer">
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase">Administradores possuem acesso total por padrão.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Vincular Cliente (Opcional)</Label>
                  <Select value={uploadForm.client_id} onValueChange={(val) => setUploadForm({...uploadForm, client_id: val})}>
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-accent hover:text-primary transition-colors font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(240,185,11,1)]">
                Finalizar Upload
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 border-2 border-primary mb-6">
          <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest px-6 py-2">
            <FileText className="w-3 h-3 mr-2" /> Listagem Geral
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold uppercase text-[10px] tracking-widest px-6 py-2">
            <PieChart className="w-3 h-3 mr-2" /> Acompanhamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center h-12 border-2 border-primary/20 focus-within:border-primary transition-all bg-white rounded-md px-5 gap-4 shadow-sm group">
            <Search className="h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors shrink-0" />
            <input 
               placeholder="Buscar por nome ou autor..." 
               className="flex-1 bg-transparent border-none outline-none font-bold text-primary placeholder:text-primary/30 h-full text-sm" 
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border-2 border-primary overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b-2 border-primary hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                  <TableHead className="font-bold text-primary px-6 py-4">Documento</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4">Autor/Escrita</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4">Status Validade</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4">Acesso</TableHead>
                  <TableHead className="font-bold text-primary px-6 py-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
                ) : filteredDocuments.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground uppercase text-xs font-bold">Nenhum documento encontrado.</TableCell></TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/5 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{doc.content_type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs font-bold text-primary">
                            <User className="h-3 w-3 mr-1" /> {doc.author_name || 'Desconhecido'}
                          </div>
                          <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase">
                            <Calendar className="h-3 w-3 mr-1" /> {new Date(doc.written_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {doc.valid_until ? (
                          <div className="flex flex-col gap-1">
                            <Badge className={`font-black text-[10px] tracking-tighter w-fit ${isExpired(doc.valid_until) ? "bg-red-500" : "bg-[#00c853]"}`}>
                               {isExpired(doc.valid_until) ? 'EXPIRADO' : 'DENTRO DA VALIDADE'}
                            </Badge>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground italic">Expira em {new Date(doc.valid_until).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200">Sem Validade Definida</Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                         <div className="flex flex-wrap gap-1 max-w-[200px]">
                           {doc.accessible_roles.length === 0 ? (
                             <Badge variant="outline" className="text-[9px] font-bold uppercase bg-orange-50 text-orange-600 border-orange-200">Apenas Admin</Badge>
                           ) : (
                             doc.accessible_roles.map(r => (
                               <Badge key={r.id} variant="secondary" className="text-[8px] font-bold uppercase bg-blue-50 text-blue-600 border-blue-100">
                                 {r.name}
                               </Badge>
                             ))
                           )}
                         </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <a 
                             href={`${api.defaults.baseURL}/documents/${doc.id}/download`} 
                             target="_blank" 
                             rel="noreferrer"
                             className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-green-50 text-[#00c853] transition-colors"
                             title="Download"
                           >
                             <Download className="h-4 w-4" />
                           </a>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(doc.id)} title="Excluir">
                             <Trash2 className="h-4 w-4 text-red-500" />
                           </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-8 animate-in fade-in slide-in-from-right-4">
           {/* Stats Summary */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 border-2 border-primary rounded-lg shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-center gap-4 hover:translate-y-[-2px] transition-transform">
                <div className="bg-red-50 p-3 rounded-md"><ShieldAlert className="h-6 w-6 text-red-600" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-red-600">Vencidos</p>
                  <p className="text-3xl font-black italic text-primary">{stats.expired}</p>
                </div>
             </div>
             <div className="bg-white p-6 border-2 border-primary rounded-lg shadow-[4px_4px_0px_0px_rgba(251,146,60,1)] flex items-center gap-4 hover:translate-y-[-2px] transition-transform">
                <div className="bg-orange-50 p-3 rounded-md"><Clock className="h-6 w-6 text-orange-500" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-500">Em Quarentena</p>
                  <p className="text-3xl font-black italic text-primary">{stats.quarantine}</p>
                </div>
             </div>
             <div className="bg-white p-6 border-2 border-primary rounded-lg shadow-[4px_4px_0px_0px_rgba(0,200,83,1)] flex items-center gap-4 hover:translate-y-[-2px] transition-transform">
                <div className="bg-green-50 p-3 rounded-md"><CheckCircle2 className="h-6 w-6 text-[#00c853]" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[#00c853]">Em Ordem</p>
                  <p className="text-3xl font-black italic text-primary">{stats.ok}</p>
                </div>
             </div>
           </div>

           {/* Custom Chart Section */}
           <div className="bg-white p-8 border-2 border-primary rounded-lg space-y-8 shadow-[8px_8px_0px_0px_rgba(6,36,100,0.05)]">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-black italic uppercase text-primary font-outfit">Distribuição de Status</h3>
                <div className="text-[10px] font-bold uppercase text-primary/40 tracking-tighter">Total de {stats.total} documentos</div>
             </div>
             
             <div className="flex justify-between items-end gap-6 h-64 border-b-2 border-slate-100 pb-2">
                <div className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                  <div className="w-full bg-slate-50 relative h-full rounded-t-xl overflow-hidden flex flex-col justify-end border-x-2 border-t-2 border-transparent group-hover:border-red-500/20 transition-all">
                    <div className="bg-red-500 w-full transition-all duration-1000 ease-out shadow-[0_-4px_12px_rgba(239,68,68,0.2)]" style={{ height: `${(stats.expired / stats.total) * 100 || 0}%` }}></div>
                    <div className="absolute top-2 w-full text-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round((stats.expired / stats.total) * 100 || 0)}%
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-red-600">Vencidos</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{stats.expired} un.</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                  <div className="w-full bg-slate-50 relative h-full rounded-t-xl overflow-hidden flex flex-col justify-end border-x-2 border-t-2 border-transparent group-hover:border-orange-400/20 transition-all">
                    <div className="bg-orange-400 w-full transition-all duration-1000 ease-out shadow-[0_-4px_12px_rgba(251,146,60,0.2)]" style={{ height: `${(stats.quarantine / stats.total) * 100 || 0}%` }}></div>
                    <div className="absolute top-2 w-full text-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round((stats.quarantine / stats.total) * 100 || 0)}%
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-orange-500">Quarentena</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{stats.quarantine} un.</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                  <div className="w-full bg-slate-50 relative h-full rounded-t-xl overflow-hidden flex flex-col justify-end border-x-2 border-t-2 border-transparent group-hover:border-green-500/20 transition-all">
                    <div className="bg-[#00c853] w-full transition-all duration-1000 ease-out shadow-[0_-4px_12px_rgba(0,200,83,0.2)]" style={{ height: `${(stats.ok / stats.total) * 100 || 0}%` }}></div>
                    <div className="absolute top-2 w-full text-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round((stats.ok / stats.total) * 100 || 0)}%
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#00c853]">Em Ordem</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{stats.ok} un.</span>
                  </div>
                </div>
             </div>
           </div>

           {/* Detailed Status Table */}
           <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black italic uppercase text-primary tracking-wider">Detalhamento de Alertas e Prazos</h3>
             </div>
             
             <div className="rounded-md border-2 border-primary overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-b-2 border-primary uppercase text-[10px] font-black tracking-widest">
                      <TableHead className="px-6 py-4">Documento</TableHead>
                      <TableHead className="px-6 py-4">Vencimento</TableHead>
                      <TableHead className="px-6 py-4">Status Crítico</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.filter(d => d.valid_until && (isExpired(d.valid_until) || isQuarantine(d.valid_until))).map(doc => (
                      <TableRow key={doc.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <TableCell className="px-6 py-4 font-bold text-primary">{doc.name}</TableCell>
                        <TableCell className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">{new Date(doc.valid_until!).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className={`font-black text-[9px] px-3 py-1 ${isExpired(doc.valid_until) ? 'bg-red-500' : 'bg-orange-500'}`}>
                            {isExpired(doc.valid_until) ? 'VENCIDO' : 'QUARENTENA'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {documents.filter(d => d.valid_until && (isExpired(d.valid_until) || isQuarantine(d.valid_until))).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <CheckCircle2 className="h-10 w-10 text-green-200 mx-auto mb-3" />
                          <p className="font-black uppercase text-primary/40 text-[11px] tracking-widest">Tudo em ordem! Nenhum documento em estado crítico.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
             </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
