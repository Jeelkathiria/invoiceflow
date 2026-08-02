import { Check, Sparkles, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react'

const pipelineStages = [
  { id: 1, name: 'Uploaded', icon: Clock },
  { id: 2, name: 'AI Processed', icon: Sparkles },
  { id: 3, name: 'Needs Review', icon: AlertCircle },
  { id: 4, name: 'Pending Approval', icon: ShieldCheck },
  { id: 5, name: 'Approved', icon: CheckCircle2 },
]

export function InvoicePipeline({ currentStage = 'Pending Approval' }) {
  // Map currentStage string to step index (1-based)
  const getStageIndex = (stageStr) => {
    switch (stageStr) {
      case 'Uploaded': return 1
      case 'AI Processed': return 2
      case 'Needs Review': return 3
      case 'Pending Approval': return 4
      case 'Approved': return 5
      case 'Rejected': return 3 // Shows stuck at review/rejection step
      default: return 4
    }
  }

  const activeIndex = getStageIndex(currentStage)

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl light:border-slate-200 light:bg-white">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 light:border-slate-200">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">Invoice Audit Pipeline</h3>
          <p className="text-xs text-slate-500 light:text-slate-400 mt-0.5">End-to-end lifecycle from ingestion to final settlement</p>
        </div>
        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-extrabold text-indigo-400 light:bg-indigo-50 light:text-indigo-600">
          Stage: {currentStage}
        </span>
      </div>

      {/* Stepper Pipeline */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 relative">
        {pipelineStages.map((stage, idx) => {
          const isCompleted = stage.id < activeIndex
          const isCurrent = stage.id === activeIndex
          const isPending = stage.id > activeIndex
          const IconComponent = stage.icon

          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center relative z-10 w-full md:w-auto">
              <div className="flex items-center gap-3 md:flex-col md:gap-2">
                {/* Stage Circle Icon */}
                <div 
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 light:bg-emerald-100 light:text-emerald-700'
                      : isCurrent
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-glow ring-4 ring-indigo-500/20'
                      : 'border-slate-800 bg-slate-950 text-slate-600 light:border-slate-200 light:bg-slate-100 light:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : <IconComponent className="h-5 w-5" />}
                </div>

                {/* Stage Title */}
                <div className="text-left md:text-center">
                  <p className={`text-xs font-bold ${
                    isCurrent ? 'text-indigo-400 light:text-indigo-600' : isCompleted ? 'text-emerald-400 light:text-emerald-600' : 'text-slate-500'
                  }`}>
                    {stage.name}
                  </p>
                  <p className="text-[10px] text-slate-500">Step 0{stage.id}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
