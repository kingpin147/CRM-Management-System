const fs = require('fs');
let file = fs.readFileSync('src/app/dashboard/installer/jobs/InstallerAuditModal.tsx', 'utf8');

if (file.includes('2. Inverter Unit Specifications')) {
  file = file.replace(
    '{inverterImageUrl && (',
    '{inverterImageUrls.some(Boolean) && ('
  );
} else {
  file = file.replace(
    '                    <Label className="text-xs font-semibold">Inverter Brand *</Label>',
    `             {/* 2. Inverter Specs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-bold text-[#002868] uppercase tracking-wide">2. Inverter Unit Specifications</p>
                  {inverterImageUrls.some(Boolean) && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Photo Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Inverter Brand *</Label>`
  );
}

file = file.replace(
  '{batteryImageUrl && (',
  '{batteryImageUrls.some(Boolean) && ('
);

fs.writeFileSync('src/app/dashboard/installer/jobs/InstallerAuditModal.tsx', file);
