from pathlib import Path
p = Path('src/components/admin/AdminPanel.js')
text = p.read_text(encoding='utf-8')
old = '                              ? <a href={full} target="_blank" rel="noreferrer">\n                                  <img src={full} alt={label} style={{width:"100%",height:100,objectFit:"cover",display:"block",cursor:"pointer"}}/>\n                                </a>'
new = '                              ? <button onClick={()=>setPreviewImage(full)} style={{all:"unset",cursor:"pointer",display:"block",width:"100%"}}>\n                                  <img src={full} alt={label} style={{width:"100%",height:100,objectFit:"cover",display:"block"}}/>\n                                </button>'
if old not in text:
    raise SystemExit('anchor block not found')
text = text.replace(old, new)
old2 = '{full&&<a href={full} target="_blank" rel="noreferrer" style={{fontSize:10,color:"var(--blue)",textDecoration:"none",fontWeight:700}}>View ↗</a>}'
new2 = '{full&&<button onClick={()=>setPreviewImage(full)} style={{all:"unset",cursor:"pointer",fontSize:10,color:"var(--blue)",textDecoration:"underline",fontWeight:700}}>View</button>}'
if old2 not in text:
    raise SystemExit('view link block not found')
text = text.replace(old2, new2)
old3 = '  const imgUrl = (p) => {\n    if (!p) return null;\n    if (/^(https?:|data:)/.test(p)) return p;\n    const base = API.replace("/api", "");\n    return `${base}${p.startsWith("/") ? "" : "/"}${p}`;\n  };\n\n  return(\n'
new3 = '  const imgUrl = (p) => {\n    if (!p) return null;\n    if (/^(https?:|data:)/.test(p)) return p;\n    const base = API.replace("/api", "");\n    return `${base}${p.startsWith("/") ? "" : "/"}${p}`;\n  };\n\n  return(\n    <>\n      {previewImage && (\n        <div onClick={()=>setPreviewImage(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>\n          <img src={previewImage} alt="KYC preview" style={{maxWidth:"100%",maxHeight:"100%",borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}/>\n        </div>\n      )}\n'
if old3 not in text:
    raise SystemExit('return block not found')
text = text.replace(old3, new3)
p.write_text(text, encoding='utf-8')
print('patched')
