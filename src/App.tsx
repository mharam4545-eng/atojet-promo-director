import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePromoConcept, PromoConcept } from './services/geminiService';
import { Droplets, Sparkles, Calendar, Tag, Loader2, Copy, CheckCircle2, LayoutTemplate, PenTool, MessageSquare, Lightbulb, Key } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [period, setPeriod] = useState('');
  const [features, setFeatures] = useState('');
  const [creativity, setCreativity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PromoConcept | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!period || !features) return;
    
    setIsGenerating(true);
    try {
      const data = await generatePromoConcept(period, features, creativity, apiKey);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `
[프로모션 명] ${result.promotionName}
[컨셉 요약] ${result.conceptSummary}

[메인 카피] ${result.copywriting.mainCopy}
[서브 카피] ${result.copywriting.subCopy}
[키워드] ${result.copywriting.keywords.join(', ')}

[레이아웃 및 구성]
${result.layout.map((l, i) => `
${i + 1}. ${l.sectionName}
- 시각 요소: ${l.visualDescription}
- 카피: ${l.copy}
`).join('')}

[팀장 지시사항]
${result.directorNotes}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Left Panel - Input Form */}
      <div className="w-full md:w-[400px] lg:w-[480px] bg-white border-r border-slate-200 p-8 flex flex-col h-screen overflow-y-auto shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Droplets size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Atojet Director</h1>
            <p className="text-xs text-slate-500 font-medium">프로모션 콘티 제너레이터</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-6 flex-1">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Key size={16} className="text-blue-500" />
              Gemini API Key (선택)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="입력하지 않으면 기본 키가 사용됩니다"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar size={16} className="text-blue-500" />
              프로모션 기간 / 시즌
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="예: 여름 바캉스 시즌, 가정의 달, 블랙프라이데이"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Tag size={16} className="text-blue-500" />
              강조할 제품 특징
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="예: 비타민C 필터, 강력한 수압 상승, 녹물 제거, 은은한 레몬향"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles size={16} className="text-blue-500" />
                창의력 수준 (Creativity)
              </label>
              <span className="text-xs font-mono font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                Level {creativity}
              </span>
            </div>
            
            <input
              type="range"
              min="1"
              max="10"
              value={creativity}
              onChange={(e) => setCreativity(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>안정적/직관적</span>
              <span>파격적/독창적</span>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button
              type="submit"
              disabled={isGenerating || !period || !features}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  콘티 생성 중...
                </>
              ) : (
                <>
                  <PenTool size={18} />
                  작업 지시서 생성하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Panel - Result Display */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-100 p-4 md:p-8 lg:p-12">
        <AnimatePresence mode="wait">
          {!result && !isGenerating ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                <LayoutTemplate size={32} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium">좌측 폼을 입력하여 프로모션 콘티를 생성해보세요.</p>
            </motion.div>
          ) : isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-slate-700">AI 디렉터가 콘티를 기획하고 있습니다</p>
                <p className="text-sm text-slate-400">최적의 레이아웃과 카피를 고민 중입니다...</p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6 pb-20"
            >
              {/* Header Actions */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  기획안 생성이 완료되었습니다
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copied ? '복사됨!' : '텍스트 복사'}
                </button>
              </div>

              {/* Document Paper */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Title Section */}
                <div className="bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-blue-200 mb-4 border border-white/10">
                      <Sparkles size={14} />
                      PROMOTION CONCEPT
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
                      {result.promotionName}
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                      {result.conceptSummary}
                    </p>
                  </div>
                </div>

                <div className="p-8 md:p-10 space-y-12">
                  {/* Copywriting Section */}
                  <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                      <MessageSquare size={20} className="text-blue-500" />
                      핵심 카피라이팅
                    </h3>
                    <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100/50">
                      <div className="mb-6">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">Main Copy</span>
                        <p className="text-2xl font-bold text-slate-900 leading-snug">"{result.copywriting.mainCopy}"</p>
                      </div>
                      <div className="mb-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sub Copy</span>
                        <p className="text-slate-600 text-lg">"{result.copywriting.subCopy}"</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Design Keywords</span>
                        <div className="flex flex-wrap gap-2">
                          {result.copywriting.keywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Layout Section */}
                  <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                      <LayoutTemplate size={20} className="text-blue-500" />
                      섹션별 레이아웃 구성
                    </h3>
                    <div className="space-y-4">
                      {result.layout.map((section, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                          <div className="md:w-48 shrink-0">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {index + 1}
                            </div>
                            <h4 className="font-bold text-slate-900">{section.sectionName}</h4>
                          </div>
                          <div className="flex-1 space-y-3 md:border-l md:border-slate-100 md:pl-6">
                            <div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Visual Elements</span>
                              <p className="text-sm text-slate-700 leading-relaxed">{section.visualDescription}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Section Copy</span>
                              <p className="text-sm font-medium text-slate-800">"{section.copy}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Director Notes */}
                  <section>
                    <div className="bg-slate-900 rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4 relative z-10">
                        <Lightbulb size={20} className="text-emerald-400" />
                        디렉터 특별 지시사항
                      </h3>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed relative z-10 whitespace-pre-wrap">
                        {result.directorNotes}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

