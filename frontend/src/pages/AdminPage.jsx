import { useState, useEffect } from 'react';
import {
    Plus, Search, FileText, Trash2, Edit, Upload,
    X, Loader2, FileCheck, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '../components/ui/table';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger
} from '../components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import api from '../lib/api';

const emptyForm = {
    id: '', title: '', subject: '',
    category: 'placement', description: '',
    file: null, fileUrl: '', fileName: '', fileType: '',
};

export function AdminPage() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { fetchResources(); }, []);

    async function fetchResources() {
        setLoading(true);
        try {
            const { data } = await api.get('/resources');
            setResources(data);
        } catch {
            toast.error('Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = (e) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['pdf', 'docx', 'doc'].includes(ext)) {
                toast.error('Please upload PDF or DOCX files only');
                return;
            }
            setFormData((p) => ({ ...p, file, fileName: file.name, fileType: ext || '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.subject || (!formData.file && !formData.id)) {
            toast.warning('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            const body = new FormData();
            body.append('title', formData.title);
            body.append('subject', formData.subject);
            body.append('category', formData.category);
            body.append('description', formData.description);
            if (formData.file) body.append('file', formData.file);

            if (formData.id) {
                await api.put(`/resources/${formData.id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Resource updated');
            } else {
                await api.post('/resources', body, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Resource added');
            }
            setIsDialogOpen(false);
            setFormData(emptyForm);
            fetchResources();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await api.delete(`/resources/${id}`);
            toast.success('Resource deleted');
            fetchResources();
        } catch {
            toast.error('Delete failed');
        }
    };

    const openEdit = (res) => {
        setFormData({ id: res._id, title: res.title, subject: res.subject, category: res.category, description: res.description || '', file: null, fileUrl: res.fileUrl, fileName: res.fileName, fileType: res.fileType });
        setIsDialogOpen(true);
    };

    const filtered = resources.filter(
        (r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage educational resources for students.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setFormData(emptyForm); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 h-11 px-6 rounded-xl">
                            <Plus className="h-5 w-5" /> Add New Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{formData.id ? 'Edit Resource' : 'Upload New Resource'}</DialogTitle>
                            <DialogDescription>Fill in the details below.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Title *</label>
                                    <Input placeholder="e.g. Master React" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="h-11" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Subject *</label>
                                    <Input placeholder="e.g. Web Development" value={formData.subject} onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))} className="h-11" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="placement">Placement</SelectItem>
                                        <SelectItem value="academics">Academics</SelectItem>
                                        <SelectItem value="aptitude">Aptitude</SelectItem>
                                        <SelectItem value="resume">Resume</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea placeholder="Briefly describe this resource..." className="resize-none min-h-[90px]" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">File (PDF / DOCX) *</label>
                                <div className={cn('relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors', formData.fileName ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40')}>
                                    {formData.fileName ? (
                                        <div className="flex items-center gap-3 text-primary">
                                            <FileCheck className="h-7 w-7" />
                                            <div>
                                                <p className="text-sm font-medium line-clamp-1">{formData.fileName}</p>
                                                <p className="text-[10px] uppercase opacity-60">{formData.fileType}</p>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 ml-2 rounded-full" onClick={() => setFormData((p) => ({ ...p, file: null, fileName: p.id ? p.fileName : '', fileType: p.id ? p.fileType : '' }))}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-medium">Click or drag to upload</p>
                                            <p className="text-xs text-muted-foreground">PDF, DOCX up to 10MB</p>
                                        </>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".pdf,.docx,.doc" />
                                </div>
                                {formData.id && !formData.file && (
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Leave empty to keep existing file
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : formData.id ? 'Save Changes' : 'Upload'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="bg-background/40 backdrop-blur-sm rounded-2xl border border-border/50 shadow-elegant overflow-hidden">
                <div className="p-4 border-b bg-background/50 flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search resources..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchResources}>Refresh</Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[280px]">Resource</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((res) => (
                                    <TableRow key={res._id} className="group hover:bg-primary/5">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="max-w-[180px]">
                                                    <p className="truncate text-sm">{res.title}</p>
                                                    <p className="text-[10px] uppercase text-muted-foreground">{res.fileType}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{res.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{res.subject}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{new Date(res.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openEdit(res)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(res._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No resources found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
