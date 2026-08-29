const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/installer/jobs/InstallerAuditModal.tsx', 'utf8');

content = content.replace('MapPin,', 'MapPin,\n  ChevronRight,');

content = content.replace('<DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl">', 
`<DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl">
        {/* Top Section Process Bar */}
        <div className="flex items-center justify-between text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 mb-1">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px]">1</span>
            <span>Installer Audit</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className="flex items-center gap-2 text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">2</span>
            <span>Manager Approval</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className="flex items-center gap-2 text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">3</span>
            <span>IP NOC Update</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <div className="flex items-center gap-2 text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px]">4</span>
            <span>Account Activated</span>
          </div>
        </div>`);

// Replace inverter state
content = content.replace(
  /const \[inverterSerial, setInverterSerial\] = React\.useState\(solar\.inverterSerial \|\| ''\)\s*const \[inverterWarrantyEnd, setInverterWarrantyEnd\] = React\.useState\(\s*solar\.inverterWarrantyEnd \? new Date\(solar\.inverterWarrantyEnd\)\.toISOString\(\)\.split\('T'\)\[0\] : ''\s*\)\s*const \[inverterImageUrl, setInverterImageUrl\] = React\.useState\(solar\.inverterImages\?\.\[0\] \|\| ''\)\s*const \[uploadingInverter, setUploadingInverter\] = React\.useState\(false\)/,
  `const [inverterSerials, setInverterSerials] = React.useState<string[]>(solar.inverterSerials?.length ? solar.inverterSerials : [solar.inverterSerial || ''])
  const [inverterWarrantyEnds, setInverterWarrantyEnds] = React.useState<string[]>(
    solar.inverterWarrantyEnds?.length ? solar.inverterWarrantyEnds.map((d: any) => new Date(d).toISOString().split('T')[0]) : [solar.inverterWarrantyEnd ? new Date(solar.inverterWarrantyEnd).toISOString().split('T')[0] : '']
  )
  const [inverterImageUrls, setInverterImageUrls] = React.useState<string[]>(solar.inverterImages?.length ? solar.inverterImages : [])
  const [uploadingInverter, setUploadingInverter] = React.useState<number | null>(null)`
);

// Replace battery state
content = content.replace(
  /const \[batterySerial, setBatterySerial\] = React\.useState\(solar\.batterySerial \|\| ''\)\s*const \[batteryWarrantyEnd, setBatteryWarrantyEnd\] = React\.useState\(\s*solar\.batteryWarrantyEnd \? new Date\(solar\.batteryWarrantyEnd\)\.toISOString\(\)\.split\('T'\)\[0\] : ''\s*\)\s*const \[batteryImageUrl, setBatteryImageUrl\] = React\.useState\(solar\.batteryImages\?\.\[0\] \|\| ''\)\s*const \[uploadingBattery, setUploadingBattery\] = React\.useState\(false\)/,
  `const [batterySerials, setBatterySerials] = React.useState<string[]>(solar.batterySerials?.length ? solar.batterySerials : [solar.batterySerial || ''])
  const [batteryWarrantyEnds, setBatteryWarrantyEnds] = React.useState<string[]>(
    solar.batteryWarrantyEnds?.length ? solar.batteryWarrantyEnds.map((d: any) => new Date(d).toISOString().split('T')[0]) : [solar.batteryWarrantyEnd ? new Date(solar.batteryWarrantyEnd).toISOString().split('T')[0] : '']
  )
  const [batteryImageUrls, setBatteryImageUrls] = React.useState<string[]>(solar.batteryImages?.length ? solar.batteryImages : [])
  const [uploadingBattery, setUploadingBattery] = React.useState<number | null>(null)`
);

// Replace inverter useEffect resets
content = content.replace(
  /setInverterSerial\(s\.inverterSerial \|\| ''\)\s*setInverterWarrantyEnd\(s\.inverterWarrantyEnd \? new Date\(s\.inverterWarrantyEnd\)\.toISOString\(\)\.split\('T'\)\[0\] : ''\)\s*setInverterImageUrl\(s\.inverterImages\?\.\[0\] \|\| ''\)/,
  `setInverterSerials(s.inverterSerials?.length ? s.inverterSerials : [s.inverterSerial || ''])
      setInverterWarrantyEnds(s.inverterWarrantyEnds?.length ? s.inverterWarrantyEnds.map((d: any) => new Date(d).toISOString().split('T')[0]) : [s.inverterWarrantyEnd ? new Date(s.inverterWarrantyEnd).toISOString().split('T')[0] : ''])
      setInverterImageUrls(s.inverterImages?.length ? s.inverterImages : [])`
);

// Replace battery useEffect resets
content = content.replace(
  /setBatterySerial\(s\.batterySerial \|\| ''\)\s*setBatteryWarrantyEnd\(s\.batteryWarrantyEnd \? new Date\(s\.batteryWarrantyEnd\)\.toISOString\(\)\.split\('T'\)\[0\] : ''\)\s*setBatteryImageUrl\(s\.batteryImages\?\.\[0\] \|\| ''\)/,
  `setBatterySerials(s.batterySerials?.length ? s.batterySerials : [s.batterySerial || ''])
      setBatteryWarrantyEnds(s.batteryWarrantyEnds?.length ? s.batteryWarrantyEnds.map((d: any) => new Date(d).toISOString().split('T')[0]) : [s.batteryWarrantyEnd ? new Date(s.batteryWarrantyEnd).toISOString().split('T')[0] : ''])
      setBatteryImageUrls(s.batteryImages?.length ? s.batteryImages : [])`
);

// Replace handleInverterPhoto
content = content.replace(
  /async function handleInverterPhoto\(e: React\.ChangeEvent<HTMLInputElement>\) \{[\s\S]*?finally \{\s*setUploadingInverter\(false\)\s*\}\s*\}/,
  `async function handleInverterPhoto(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingInverter(index)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/inverters')
      if (url) {
        const newUrls = [...inverterImageUrls]
        newUrls[index] = url
        setInverterImageUrls(newUrls)
      }
    } catch (err: any) {
      setError(\`Inverter Photo Upload Error: \${err.message}\`)
    } finally {
      setUploadingInverter(null)
    }
  }`
);

// Replace handleBatteryPhoto
content = content.replace(
  /async function handleBatteryPhoto\(e: React\.ChangeEvent<HTMLInputElement>\) \{[\s\S]*?finally \{\s*setUploadingBattery\(false\)\s*\}\s*\}/,
  `async function handleBatteryPhoto(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBattery(index)
    setError(null)
    try {
      const url = await uploadEquipmentPhoto(file, 'equipment/batteries')
      if (url) {
        const newUrls = [...batteryImageUrls]
        newUrls[index] = url
        setBatteryImageUrls(newUrls)
      }
    } catch (err: any) {
      setError(\`Battery Photo Upload Error: \${err.message}\`)
    } finally {
      setUploadingBattery(null)
    }
  }`
);

// Replace handleSubmit appending for inverter
content = content.replace(
  /formData\.append\('inverterSerial', inverterSerial\)\s*formData\.append\('inverterWarrantyEnd', inverterWarrantyEnd\)\s*formData\.append\('inverterImageUrl', inverterImageUrl\)/,
  `formData.append('inverterSerials', JSON.stringify(inverterSerials.slice(0, noOfInverters)))
      formData.append('inverterWarrantyEnds', JSON.stringify(inverterWarrantyEnds.slice(0, noOfInverters)))
      formData.append('inverterImageUrls', JSON.stringify(inverterImageUrls.slice(0, noOfInverters)))`
);

// Replace handleSubmit appending for battery
content = content.replace(
  /formData\.append\('batterySerial', batterySerial\)\s*formData\.append\('batteryWarrantyEnd', batteryWarrantyEnd\)\s*formData\.append\('batteryImageUrl', batteryImageUrl\)/,
  `formData.append('batterySerials', JSON.stringify(batterySerials.slice(0, noOfBatteries)))
      formData.append('batteryWarrantyEnds', JSON.stringify(batteryWarrantyEnds.slice(0, noOfBatteries)))
      formData.append('batteryImageUrls', JSON.stringify(batteryImageUrls.slice(0, noOfBatteries)))`
);

// Replace inverter mapping in JSX
const oldInverterJSX = `<div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-semibold">Inverter Serial # *</Label>
                    <Input
                      value={inverterSerial}
                      onChange={(e) => setInverterSerial(e.target.value)}
                      placeholder="e.g. SN-INV-049812"
                      className="h-9 text-xs font-mono bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Inverter Warranty Expiry Date</Label>
                    <DateInput
                      value={inverterWarrantyEnd}
                      onChange={(e) => setInverterWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-amber-600" />
                      Inverter Hardware Photo
                    </Label>
                    <div className="relative flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleInverterPhoto}
                        disabled={uploadingInverter}
                        className="h-9 text-xs bg-white border-amber-200 file:bg-amber-100 file:text-amber-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingInverter && (
                        <div className="absolute right-3 flex items-center gap-1 text-xs text-amber-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                      {inverterImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setInverterImageUrl('')}
                          className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>`;

const newInverterJSX = `</div>
                
                {Array.from({ length: noOfInverters }).map((_, i) => (
                  <div key={i} className="pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-amber-900 mb-2">Inverter {i + 1} Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs font-semibold">Inverter Serial # *</Label>
                        <Input
                          value={inverterSerials[i] || ''}
                          onChange={(e) => {
                            const newSerials = [...inverterSerials];
                            newSerials[i] = e.target.value;
                            setInverterSerials(newSerials);
                          }}
                          placeholder="e.g. SN-INV-049812"
                          className="h-9 text-xs font-mono bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-amber-900">Warranty Expiry</Label>
                        <DateInput
                          value={inverterWarrantyEnds[i] || ''}
                          onChange={(e) => {
                            const newDates = [...inverterWarrantyEnds];
                            newDates[i] = e.target.value;
                            setInverterWarrantyEnds(newDates);
                          }}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5 text-amber-600" />
                          Hardware Photo
                        </Label>
                        <div className="relative flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleInverterPhoto(e, i)}
                            disabled={uploadingInverter === i}
                            className="h-9 text-xs bg-white border-amber-200 file:bg-amber-100 file:text-amber-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                          />
                          {uploadingInverter === i && (
                            <div className="absolute right-3 flex items-center gap-1 text-xs text-amber-700 font-semibold bg-white/90 px-1.5 rounded">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                            </div>
                          )}
                          {inverterImageUrls[i] && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newUrls = [...inverterImageUrls];
                                newUrls[i] = '';
                                setInverterImageUrls(newUrls);
                              }}
                              className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                              title="Remove Photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}`;

content = content.replace(oldInverterJSX, newInverterJSX);

// Replace battery mapping in JSX
const oldBatteryJSX = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Battery Serial #</Label>
                    <Input
                      value={batterySerial}
                      onChange={(e) => setBatterySerial(e.target.value)}
                      placeholder="e.g. SN-BAT-092819 (Optional)"
                      className="h-9 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900">Battery Warranty Expiry Date</Label>
                    <DateInput
                      value={batteryWarrantyEnd}
                      onChange={(e) => setBatteryWarrantyEnd(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-sky-600" />
                      Battery Bank Photo
                    </Label>
                    <div className="relative flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleBatteryPhoto}
                        disabled={uploadingBattery}
                        className="h-9 text-xs bg-white border-slate-300 file:bg-slate-100 file:text-slate-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                      />
                      {uploadingBattery && (
                        <div className="absolute right-3 flex items-center gap-1 text-xs text-sky-700 font-semibold bg-white/90 px-1.5 rounded">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </div>
                      )}
                      {batteryImageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setBatteryImageUrl('')}
                          className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>`;

const newBatteryJSX = `</div>
                
                {Array.from({ length: noOfBatteries }).map((_, i) => (
                  <div key={i} className="pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-sky-900 mb-2">Battery {i + 1} Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs font-semibold">Battery Serial #</Label>
                        <Input
                          value={batterySerials[i] || ''}
                          onChange={(e) => {
                            const newSerials = [...batterySerials];
                            newSerials[i] = e.target.value;
                            setBatterySerials(newSerials);
                          }}
                          placeholder="e.g. SN-BAT-092819 (Optional)"
                          className="h-9 text-xs font-mono bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-amber-900">Warranty Expiry</Label>
                        <DateInput
                          value={batteryWarrantyEnds[i] || ''}
                          onChange={(e) => {
                            const newDates = [...batteryWarrantyEnds];
                            newDates[i] = e.target.value;
                            setBatteryWarrantyEnds(newDates);
                          }}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5 text-sky-600" />
                          Bank Photo
                        </Label>
                        <div className="relative flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBatteryPhoto(e, i)}
                            disabled={uploadingBattery === i}
                            className="h-9 text-xs bg-white border-slate-300 file:bg-slate-100 file:text-slate-900 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold cursor-pointer"
                          />
                          {uploadingBattery === i && (
                            <div className="absolute right-3 flex items-center gap-1 text-xs text-sky-700 font-semibold bg-white/90 px-1.5 rounded">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                            </div>
                          )}
                          {batteryImageUrls[i] && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newUrls = [...batteryImageUrls];
                                newUrls[i] = '';
                                setBatteryImageUrls(newUrls);
                              }}
                              className="h-9 px-2 text-red-600 hover:bg-red-50 text-xs shrink-0"
                              title="Remove Photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}`;

content = content.replace(oldBatteryJSX, newBatteryJSX);


fs.writeFileSync('src/app/dashboard/installer/jobs/InstallerAuditModal.tsx', content);
