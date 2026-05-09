/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Layers, 
  Calculator, 
  CheckCircle2, 
  Info, 
  Maximize2, 
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  ChevronRight,
  Zap,
  ShieldCheck,
  Crown,
  Building2,
  Palette,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignChoice, RABSection, RABItem, MaterialTier } from './types';
import { RAB_DATA, DESIGN_STYLES } from './constants';
import { GoogleGenAI } from "@google/genai";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function App() {
  const [design, setDesign] = useState<DesignChoice>({
    style: 'modern',
    houseSize: 100,
    tier: 'standard',
    rooms: {
      bedroom: 3,
      bathroom: 2,
      livingRoom: true,
      kitchen: true,
      garden: true
    }
  });

  const [aiInsight, setAiInsight] = useState<string>("Menganalisis desain Anda...");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!process.env.GEMINI_API_KEY) {
        setAiInsight("Pilih desain untuk melihat saran arsitektural di sini.");
        return;
      }
      
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Sebagai arsitek profesional, berikan 1 paragraf singkat (maks 3 kalimat) saran teknis dan estetik untuk rumah gaya ${design.style} dengan luas ${design.houseSize}m2 dan kualitas material ${design.tier}. Fokus pada efisiensi anggaran dan ketahanan bangunan. Gunakan bahasa Indonesia yang profesional.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        setAiInsight(response.text || "Pilih desain untuk melihat saran arsitektural di sini.");
      } catch (error) {
        setAiInsight("Saran: Fokus pada pemilihan material lokal berkualitas untuk menekan biaya logistik tanpa mengurangi estetika.");
      } finally {
        setIsAiLoading(false);
      }
    };

    const timer = setTimeout(fetchInsight, 1000);
    return () => clearTimeout(timer);
  }, [design.style, design.houseSize, design.tier]);

  useEffect(() => {
    // Reset generated image when design style changes significantly
    setGeneratedImg(null);
    setLastGeneratedAt(null);
  }, [design.style, design.tier, design.houseSize]);

  const [activeTab, setActiveTab] = useState<'visualizer' | 'rab'>('visualizer');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const handleGenerateVisual = async () => {
    if (!process.env.GEMINI_API_KEY) {
      alert("API Key tidak ditemukan. Pastikan Anda telah mengonfigurasi Secrets.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Create a breathtaking ultra-realistic 3D architectural render of a ${design.style} house exterior. 
      House size: ${design.houseSize} square meters. 
      Material tier: ${design.tier} quality. 
      Details: Cinematic sunset lighting, 8k resolution, photorealistic textures, professionally captured architectural photography style. 
      Aspect ratio: 16:9. No people in the image.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          }
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          setGeneratedImg(`data:image/png;base64,${base64Data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image data in response");
      }
      
      setLastGeneratedAt(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Image generation failed:", error);
      // Fallback message or state transition
      setLastGeneratedAt("Failed at " + new Date().toLocaleTimeString());
    } finally {
      setIsGenerating(true);
      // Keep loading state for a bit for "wow" factor or ensure smoothness
      setTimeout(() => setIsGenerating(false), 800);
    }
  };

  // Realistic render images (Defaults/Initial)
  const defaultImages = {
    modern: 'https://images.unsplash.com/photo-1600585154340-be6191daef10?q=80&w=2070&auto=format&fit=crop',
    scandinavian: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2070&auto=format&fit=crop',
    tropical: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop',
    industrial: 'https://images.unsplash.com/photo-1536376074432-a72a56e432c3?q=80&w=2070&auto=format&fit=crop'
  };

  const rabResult = useMemo((): RABSection[] => {
    const sections: Record<string, RABItem[]> = {};

    RAB_DATA.forEach(material => {
      const quantity = material.quantityPerM2 * design.houseSize;
      const priceUnit = material.pricePerUnit[design.tier];
      const total = quantity * priceUnit;

      if (!sections[material.category]) {
        sections[material.category] = [];
      }

      sections[material.category].push({
        category: material.category,
        item: material.item,
        unit: material.unit,
        quantity,
        priceUnit,
        total
      });
    });

    return Object.entries(sections).map(([title, items]) => ({ title, items }));
  }, [design]);

  const totalCost = useMemo(() => {
    return rabResult.reduce((acc, section) => {
      return acc + section.items.reduce((secAcc, item) => secAcc + item.total, 0);
    }, 0);
  }, [rabResult]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-100 px-6 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#1A1A1A] text-white p-1.5 rounded-lg">
            <Building2 size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">GriyaDesign</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium hover:text-gray-600 transition-colors hidden md:block">Proyek</button>
          <button className="text-sm font-medium hover:text-gray-600 transition-colors hidden md:block">Layanan</button>
          <button className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2">
            Konsultasi Gratis <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="text-gray-400" size={20} />
              <h2 className="text-lg font-bold">Kustomisasi Desain</h2>
            </div>

            {/* House Size Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Luas Bangunan</label>
                <span className="text-2xl font-bold">{design.houseSize} <span className="text-sm font-normal text-gray-400">m²</span></span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="500" 
                step="5"
                value={design.houseSize}
                onChange={(e) => setDesign({...design, houseSize: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>30 m²</span>
                <span>500 m²</span>
              </div>
            </div>

            {/* Design Style */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Gaya Arsitektur</label>
              <div className="grid grid-cols-2 gap-2">
                {DESIGN_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setDesign({...design, style: style.id as any})}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      design.style === style.id 
                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' 
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-bold">{style.name}</div>
                    <div className={`text-[10px] mt-1 ${design.style === style.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {style.id === 'modern' && 'Minimalis & Bersih'}
                      {style.id === 'scandinavian' && 'Hangat & Terang'}
                      {style.id === 'tropical' && 'Alami & Sejuk'}
                      {style.id === 'industrial' && 'Maskulin & Berani'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Material Tier */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Kualitas Material</label>
              <div className="flex flex-col gap-2">
                {(['economical', 'standard', 'premium'] as MaterialTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDesign({...design, tier: t})}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      design.tier === t 
                        ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A] bg-gray-50' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        t === 'economical' ? 'bg-emerald-50 text-emerald-600' :
                        t === 'standard' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {t === 'economical' && <Zap size={18} />}
                        {t === 'standard' && <ShieldCheck size={18} />}
                        {t === 'premium' && <Crown size={18} />}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold capitalize">{t === 'economical' ? 'Ekonomis' : t === 'standard' ? 'Standar' : 'Premium'}</div>
                        <div className="text-[10px] text-gray-500">
                          {t === 'economical' && 'Fungsional, terjangkau'}
                          {t === 'standard' && 'Kualitas teruji, estetis'}
                          {t === 'premium' && 'Mewah, material impor'}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 
                      size={20} 
                      className={design.tier === t ? 'text-[#1A1A1A]' : 'text-transparent'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* AI Advisor Card */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <Lightbulb size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Saran Arsitek AI</span>
              </div>
              <p className={`text-xs text-amber-900/80 leading-relaxed italic ${isAiLoading ? 'animate-pulse' : ''}`}>
                "{aiInsight}"
              </p>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 opacity-60">
              <Calculator size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Estimasi Total Biaya</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold tracking-tight">{formatCurrency(totalCost)}</div>
              <div className="text-xs text-gray-400">
                ± {formatCurrency(totalCost / design.houseSize)} / m²
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase text-gray-500 font-bold">Waktu Bangun</div>
                <div className="text-sm font-medium">4 - 6 Bulan</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase text-gray-500 font-bold">Garansi Struktur</div>
                <div className="text-sm font-medium">10 Tahun</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Display & RAB */}
        <section className="lg:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 w-fit">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'visualizer' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Home size={16} /> Render Visual
            </button>
            <button
              onClick={() => setActiveTab('rab')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'rab' ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              <Layers size={16} /> Rincian RAB
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'visualizer' ? (
              <motion.div
                key="visualizer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Render Display Component */}
                <div className="relative group overflow-hidden rounded-[40px] bg-gray-900 aspect-[16/10] shadow-2xl border-4 border-white">
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center text-white"
                      >
                        <div className="relative mb-6">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 border-t-2 border-r-2 border-white/20 rounded-full"
                          />
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 m-auto w-16 h-16 border-b-2 border-l-2 border-white/60 rounded-full"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-white animate-pulse" size={32} />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-black tracking-widest uppercase">Rendering AI...</h3>
                          <div className="flex gap-1 justify-center">
                            {[0, 1, 2].map((i) => (
                              <motion.div 
                                key={i}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                                className="w-1.5 h-1.5 bg-white rounded-full"
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.3em] mt-4">Calculating Light Physics & Shadows</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <img 
                    src={generatedImg || defaultImages[design.style]} 
                    alt="House Render"
                    className={`w-full h-full object-cover transition-all duration-1000 ${isGenerating ? 'scale-110 blur-sm brightness-50' : 'scale-100 blur-0 brightness-100'}`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Scanning Effect during loading */}
                  {isGenerating && (
                    <motion.div 
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10 text-white">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tight uppercase">{DESIGN_STYLES.find(s => s.id === design.style)?.name}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase">
                            <Maximize2 size={12} /> {design.houseSize} m²
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase">
                            <CheckCircle2 size={12} /> {design.tier} Quality
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={handleGenerateVisual}
                        disabled={isGenerating}
                        className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Sparkles size={16} /> Generate Visual
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                      </button>
                    </div>
                  </div>

                  {lastGeneratedAt && !isGenerating && (
                    <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80">
                      Last Updated: {lastGeneratedAt}
                    </div>
                  )}
                </div>

                {/* Material Board Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Pilihan Material Struktur</h4>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        design.tier === 'premium' ? 'bg-amber-100 text-amber-700' :
                        design.tier === 'standard' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        Tier {design.tier}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pondasi & Struktur</div>
                          <div className="text-sm font-bold mt-0.5">
                            {design.tier === 'premium' ? 'Footplat Beton K-350 / Baja H-Beam' : design.tier === 'standard' ? 'Cakar Ayam & Beton Bertulang K-225' : 'Pasangan Batu Belah & Beton Ringan'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                          <Layers size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pelapis Dinding</div>
                          <div className="text-sm font-bold mt-0.5">
                            {design.tier === 'premium' ? 'Travertine / Marmer Impor 100x100' : design.tier === 'standard' ? 'Granit Tile High Gloss 60x60' : 'Keramik Motif 40x40 Standar'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] p-8 rounded-[32px] text-white space-y-6">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Sparkles size={18} />
                      <h4 className="text-sm font-black uppercase tracking-widest">Analisis Spesifikasi</h4>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400 leading-relaxed italic">
                        "Dengan budget {design.tier}, kami mengoptimasikan {design.style} Anda menggunakan pendekatan pre-fabricated untuk struktur atap dan aksen interior, guna menekan biaya tenaga kerja hingga 15%."
                      </p>
                      <div className="flex gap-4 pt-4 border-t border-white/10">
                        <div className="flex-1 p-4 rounded-2xl bg-white/5">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Durabilitas</div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: design.tier === 'premium' ? '95%' : design.tier === 'standard' ? '75%' : '55%' }}
                              className="h-full bg-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex-1 p-4 rounded-2xl bg-white/5">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Presisi AI</div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '88%' }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Info Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col gap-3">
                    <div className="p-2 w-fit bg-orange-50 text-orange-600 rounded-lg">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Optimasi Desain AI</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">Layout ini telah dioptimasi untuk pencahayaan alami dan sirkulasi udara maksimal.</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col gap-3">
                    <div className="p-2 w-fit bg-blue-50 text-blue-600 rounded-lg">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Standard Industri</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">Spesifikasi {design.tier} memenuhi standar kekuatan konstruksi nasional.</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col gap-3">
                    <div className="p-2 w-fit bg-purple-50 text-purple-600 rounded-lg">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Siap Bangun</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">Dapatkan dokumen legal dan gambar IMB lengkap setelah konsultasi.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Rencana Anggaran Biaya (RAB)</h2>
                    <p className="text-sm text-gray-500 mt-1">Estimasi detail untuk proyek {design.houseSize}m² gaya {design.style}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                      <Download size={16} /> PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                      <Share2 size={16} /> Bagikan
                    </button>
                  </div>
                </div>
                
                <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {rabResult.map((section, idx) => (
                    <div key={idx} className="border-b border-gray-50 last:border-0">
                      <div className="bg-gray-50/30 px-8 py-4 flex items-center gap-2">
                        <ChevronRight className="text-gray-300" size={16} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">{section.title}</h3>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-50">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Deskripsi Pekerjaan</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Volume</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Harga Satuan</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.items.map((item, iIdx) => (
                            <tr key={iIdx} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-8 py-5">
                                <div className="text-sm font-bold text-gray-700">{item.item}</div>
                                <div className="text-[10px] text-gray-400">Material grade {design.tier}</div>
                              </td>
                              <td className="px-4 py-5 text-sm text-center font-mono">
                                {item.quantity.toFixed(2)} <span className="text-[10px] font-bold text-gray-400">{item.unit}</span>
                              </td>
                              <td className="px-4 py-5 text-sm text-right font-medium text-gray-500">
                                {formatCurrency(item.priceUnit).replace('Rp', '')}
                              </td>
                              <td className="px-8 py-5 text-sm text-right font-bold text-[#1A1A1A]">
                                {formatCurrency(item.total).replace('Rp', '')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50/20">
                            <td colSpan={3} className="px-8 py-4 text-xs font-bold text-gray-400 text-right">Subtotal {section.title}</td>
                            <td className="px-8 py-4 text-sm font-black text-right">
                              {formatCurrency(section.items.reduce((sum, i) => sum + i.total, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ))}
                </div>

                {/* RAB Footer Disclaimer */}
                <div className="p-8 bg-gray-50 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg text-gray-400">
                    <Info size={16} />
                  </div>
                  <div className="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
                    <span className="font-bold">Disclaimer:</span> Harga di atas adalah estimasi berdasarkan data pasar rata-rata tahun 2026. Biaya nyata dapat bervariasi ±10-15% tergantung pada lokasi proyek, kondisi tanah, dan fluktuasi harga material konstruksi. Kami menyarankan survei lokasi dan konsultasi arsitek untuk RAB final.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-100 px-8 py-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
             <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="bg-[#1A1A1A] text-white p-1 rounded-md">
                <Building2 size={18} />
              </div>
              <span className="text-lg font-bold">GriyaDesign</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Membangun impian dengan presisi teknologi dan keindahan arsitektur sejak 2018.
            </p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-gray-500">
            <a href="#" className="hover:text-[#1A1A1A]">Kebijakan Privasi</a>
            <a href="#" className="hover:text-[#1A1A1A]">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-[#1A1A1A]">Hubungi Kami</a>
          </div>
          <div className="text-[11px] text-gray-400">
            © 2026 GriyaDesign Studio. All rights reserved.
          </div>
        </div>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E5E5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D1D1; }
      `}</style>
    </div>
  );
}
