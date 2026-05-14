import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Database, Check } from 'lucide-react';

export default function DataImport() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(files.map(f => f.name));
      setStatus('uploading');
      
      // Simulate processing
      setTimeout(() => {
        setStatus('processing');
        setTimeout(() => {
          setStatus('done');
        }, 2000);
      }, 1500);
    }
  };

  const tpExportSteps = [
    { 
      title: 'Export from TrainingPeaks',
      desc: 'Go to TrainingPeaks → Account → Export Data. Select date range (all time) and export as CSV.',
      icon: Download
    },
    { 
      title: 'Upload to VeloCommand',
      desc: 'Drag & drop the CSV files into the upload area below. We support workouts.csv, metrics.csv, and zones.csv.',
      icon: Upload
    },
    { 
      title: 'Auto-Process',
      desc: 'We parse your data, calculate PMC curves, power zones, and build your athlete profile automatically.',
      icon: Database
    },
  ];

  return (
    <div className="space-y-6">
      {/* How-to Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tpExportSteps.map((step, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cycling-500/20 rounded-lg flex items-center justify-center">
                <step.icon className="w-5 h-5 text-cycling-400" />
              </div>
              <span className="text-sm font-medium text-gray-400">Step {i + 1}</span>
            </div>
            <h3 className="text-white font-medium mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-cycling-400" />
          Data Import
        </h3>

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? 'border-cycling-500 bg-cycling-500/10' : 'border-gray-700 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Drop your TrainingPeaks CSV files here</p>
          <p className="text-sm text-gray-400">or click to browse</p>
          <input 
            type="file" 
            className="hidden" 
            accept=".csv"
            onChange={(e) => {
              if (e.target.files) {
                setUploadedFiles(Array.from(e.target.files).map(f => f.name));
              }
            }}
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400 mb-2">Uploaded files:</p>
            {uploadedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                {status === 'done' ? (
                  <Check className="w-4 h-4 text-cycling-400" />
                ) : (
                  <div className="w-4 h-4 border-2 border-cycling-500 border-t-transparent rounded-full animate-spin" />
                )}
                <span>{file}</span>
                <span className="text-gray-500">
                  {status === 'uploading' && '(uploading...)'}
                  {status === 'processing' && '(processing...)'}
                  {status === 'done' && '(done!)'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Data Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">Total Workouts</p>
            <p className="text-xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">Date Range</p>
            <p className="text-sm font-medium text-white">-</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">Total TSS</p>
            <p className="text-xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">Hours</p>
            <p className="text-xl font-bold text-white">0h</p>
          </div>
        </div>
      </div>

      {/* API Integration Note */}
      <div className="card bg-blue-500/5 border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-400 mb-2">Coming Soon: Auto-Sync</h4>
        <p className="text-sm text-gray-400">
          Direct TrainingPeaks API integration is in development. This will allow automatic daily sync of your training data without manual exports.
        </p>
      </div>
    </div>
  );
}
