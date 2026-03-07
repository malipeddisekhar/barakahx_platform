import { motion } from 'framer-motion';
import { Search, Book, Download } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useState, useEffect } from 'react';
import api from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function downloadFile(resourceId, fileName) {
    try {
        const token = localStorage.getItem('barakahx_token');
        const response = await fetch(`${API_BASE}/resources/${resourceId}/download`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download error:', err);
        alert('Download failed. Please try again.');
    }
}

export function LibraryPage() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(null);

    useEffect(() => {
        fetchResources();
    }, []);

    async function fetchResources() {
        try {
            const { data } = await api.get('/resources');
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredResources = resources.filter((res) => {
        const matchesSearch =
            res.title.toLowerCase().includes(search.toLowerCase()) ||
            res.subject.toLowerCase().includes(search.toLowerCase()) ||
            (res.description && res.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = !category || res.category === category;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { id: 'placement', label: 'Placement' },
        { id: 'academics', label: 'Academics' },
        { id: 'aptitude', label: 'Aptitude' },
        { id: 'resume', label: 'Resume' },
    ];

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-12 pb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                >
                    Your peaceful learning space
                </motion.div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
                    Study <span className="text-primary">calmly.</span><br />
                    Prepare <span className="text-accent">confidently.</span><br />
                    <span className="text-sm text-muted-foreground mt-2 block">
                        With ❤️ by BarakahX-head محمد اکمل عرفان
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                    Access high-quality academic and placement resources in a non-judgmental, supportive environment.
                    Everything you need to succeed, without the stress.
                </p>
            </section>

            {/* Search & Filter */}
            <section className="max-w-4xl mx-auto space-y-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search by title, subject, or keywords..."
                        className="pl-12 h-14 text-lg bg-background/50 border-border/50 shadow-elegant focus:border-primary/50 transition-smooth"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                        variant={category === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCategory(null)}
                        className="rounded-full px-6"
                    >
                        All Resources
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={category === cat.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategory(cat.id)}
                            className="rounded-full px-6"
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
            </section>

            {/* Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="border-border/50 bg-background/40 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))
                ) : filteredResources.length > 0 ? (
                    filteredResources.map((res, index) => (
                        <motion.div
                            key={res._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full border-border/50 bg-background/40 backdrop-blur-sm hover:bg-background/60 hover:shadow-elegant transition-smooth group flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary" className="capitalize bg-primary/5 text-primary border-primary/10">
                                            {res.category}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(res.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                                        {res.title}
                                    </CardTitle>
                                    <CardDescription className="font-medium text-primary/80">
                                        {res.subject}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {res.description || 'No description provided.'}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-border/20">
                                    <Button
                                        className="w-full gap-2 shadow-sm"
                                        onClick={() => downloadFile(res._id, res.fileName)}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download {res.fileType ? res.fileType.toUpperCase() : 'FILE'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-muted-foreground/40">
                            <Book className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-semibold">No resources found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                        <Button variant="ghost" onClick={() => { setSearch(''); setCategory(null); }}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}
