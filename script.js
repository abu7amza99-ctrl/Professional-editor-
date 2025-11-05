document.addEventListener('DOMContentLoaded', function () {
  /* ===== إعداد المتغيرات ===== */
  const canvas = document.getElementById('canvas');
  const preview = document.getElementById('preview');

  const projectsPanel = document.getElementById('projects-panel');
  const projectListEl = document.getElementById('project-list');
  const saveProjectBtn = document.getElementById('save-project-btn');
  const projectNameInput = document.getElementById('project-name');

  const textPanel = document.getElementById('text-panel');
  const addTextBtn = document.getElementById('add-text-btn');
  const fontSelect = document.getElementById('font-select');
  const fontFile = document.getElementById('font-file');
  const textSizeRange = document.getElementById('text-size');
  const textSizeVal = document.getElementById('text-size-val');
  const textRotateRange = document.getElementById('text-rotate');
  const textRotateVal = document.getElementById('text-rotate-val');
  const textColorGrid = document.getElementById('text-color-grid');
  const openTextGrad = document.getElementById('open-text-grad');
  const gradC1 = document.getElementById('grad-c1');
  const gradC2 = document.getElementById('grad-c2');
  const applyCustomGrad = document.getElementById('apply-custom-grad');

  const imagePanel = document.getElementById('image-panel');
  const imgFile = document.getElementById('img-file');
  const imgScale = document.getElementById('img-scale');
  const imgScaleVal = document.getElementById('img-scale-val');
  const imgRotate = document.getElementById('img-rotate');
  const imgRotateVal = document.getElementById('img-rotate-val');
  const imgGradGrid = document.getElementById('img-grad-grid');

  const gradPanel = document.getElementById('grad-panel');
  const textGradList = document.getElementById('text-grad-list');

  const toolScroll = document.getElementById('tool-scroll');

  let activeElement = null;

  /* ===== قائمة الخطوط الافتراضية (50) ===== */
  const defaultFonts = [
    'Roboto','Open Sans','Lato','Montserrat','Poppins','Raleway','Oswald','Playfair Display','Merriweather','Nunito',
    'Rubik','Ubuntu','PT Sans','Quicksand','Noto Sans','Source Sans 3','Work Sans','Archivo','Karla','Inter',
    'Fira Sans','Mulish','Alegreya','Bitter','Cabin','Cardo','Mada','Cairo','Tajawal','El Messiri',
    'Amiri','Scheherazade New','Heebo','Varela Round','Zilla Slab','Nunito Sans','Spectral','Josefin Sans','Inconsolata','Rokkitt',
    'Anton','Play','Oxygen','Koulen','Merriweather Sans','Arimo','Bree Serif','Cormorant Garamond','Satisfy','Bree Serif'
  ];

  /* ===== توليد 50 لون افتراضي ===== */
  const colorPalette = [
    "#F44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4",
    "#009688","#4CAF50","#8BC34A","#CDDC39","#FFEB3B","#FFC107","#FF9800","#FF5722",
    "#795548","#9E9E9E","#607D8B","#000000","#FFFFFF","#FFE0B2","#F8BBD0","#D1C4E9",
    "#C5CAE9","#B3E5FC","#B2DFDB","#DCEDC8","#F0F4C3","#FFF9C4","#FFECB3","#FFE0E0",
    "#EF9A9A","#F48FB1","#CE93D8","#B39DDB","#9FA8DA","#90CAF9","#81D4FA","#80DEEA",
    "#80CBC4","#A5D6A7","#E6EE9C","#FFF59D","#FFE082","#FFCC80","#FFAB91","#BCAAA4",
    "#CFD8DC","#F5F5F5"
  ];

  /* ===== توليد 50 تدرج جاهز ===== */
  const gradients = [];
  for(let i=0;i<50;i++){
    const c1 = colorPalette[i % colorPalette.length];
    const c2 = colorPalette[(i+7) % colorPalette.length];
    gradients.push(`linear-gradient(90deg, ${c1}, ${c2})`);
  }

  /* ===== ملء القوائم عند البداية ===== */
  function populateFontSelect(){
    fontSelect.innerHTML = '';
    defaultFonts.forEach(f=>{
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      opt.style.fontFamily = f;
      fontSelect.appendChild(opt);
    });
  }

  function populateColorGrid(){
    textColorGrid.innerHTML = '';
    colorPalette.forEach(c=>{
      const s = document.createElement('div');
      s.className = 'color-swatch';
      s.style.background = c;
      s.innerHTML = `<button data-color="${c}" title="${c}"></button>`;
      textColorGrid.appendChild(s);
    });
    textColorGrid.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const c = e.currentTarget.dataset.color;
        if(activeElement && activeElement.dataset.type === 'text'){
          const ed = activeElement.querySelector('.editable');
          ed.style.color = c;
        } else {
          alert('اختر نصاً داخل المعاينة أولاً');
        }
      });
    });
  }

  function populateGradLists(){
    textGradList.innerHTML = '';
    gradients.forEach((g,idx)=>{
      const item = document.createElement('div');
      item.className='grad-item';
      item.style.background = g;
      item.innerHTML = `<button data-idx="${idx}" title="تدرج ${idx}"></button>`;
      textGradList.appendChild(item);
    });
    textGradList.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        const idx = e.currentTarget.dataset.idx;
        applyGradientToActiveText(gradients[idx]);
        closePanel('grad-panel');
      });
    });

    imgGradGrid.innerHTML='';
    gradients.forEach((g,idx)=>{
      const s = document.createElement('div');
      s.className='color-swatch';
      s.style.background = g;
      s.innerHTML = `<button data-idx="${idx}"></button>`;
      imgGradGrid.appendChild(s);
    });
    imgGradGrid.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',(e)=>{
        const idx = e.currentTarget.dataset.idx;
        applyGradientToActiveImage(gradients[idx]);
      });
    });
  }

  /* ===== دوال فتح/اغلاق اللوحات ===== */
  function openPanel(idOrEl){
    const el = (typeof idOrEl === 'string') ? document.getElementById(idOrEl) : idOrEl;
    if(!el) return;
    el.classList.add('visible');
  }
  function closePanel(idOrEl){
    const el = (typeof idOrEl === 'string') ? document.getElementById(idOrEl) : idOrEl;
    if(!el) return;
    el.classList.remove('visible');
  }
  document.querySelectorAll('.close').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.close;
      closePanel(id);
    });
  });

  /* ===== أدوات شريط الأدوات الرئيسية ===== */
  document.getElementById('tool-projects').addEventListener('click', ()=> openPanel('projects-panel'));
  document.getElementById('tool-text').addEventListener('click', ()=> openPanel('text-panel'));
  document.getElementById('tool-image').addEventListener('click', ()=> openPanel('image-panel'));
  document.getElementById('tool-gradient').addEventListener('click', ()=> openPanel('grad-panel'));
  document.getElementById('tool-fonts').addEventListener('click', ()=> openPanel('text-panel'));
  document.getElementById('tool-colors').addEventListener('click', ()=> openPanel('text-panel'));

  /* شريط علوي */
  document.getElementById('btn-new').addEventListener('click', ()=>{
    if(confirm('إنشاء مشروع جديد · سيتم مسح اللوحة؟')){
      canvas.innerHTML = '';
    }
  });
  document.getElementById('btn-save').addEventListener('click', ()=> openPanel('projects-panel'));
  document.getElementById('btn-share').addEventListener('click', ()=>{
    const data = exportProject();
    navigator.clipboard?.writeText(JSON.stringify(data)).then(()=> alert('نسخ JSON إلى الحافظة'));
  });
  document.getElementById('btn-undo').addEventListener('click', ()=> {
    if(canvas.lastElementChild) canvas.removeChild(canvas.lastElementChild);
  });
  document.getElementById('btn-grid').addEventListener('click', ()=>{
    preview.classList.toggle('show-grid');
    if(preview.classList.contains('show-grid')){
      preview.style.backgroundImage = 'linear-gradient(transparent 23px, rgba(0,0,0,0.03) 24px), linear-gradient(90deg, transparent 23px, rgba(0,0,0,0.03) 24px)';
      preview.style.backgroundSize = '24px 24px';
    } else {
      preview.style.backgroundImage = '';
    }
  });

/* ===== إضافة نص قابل للتعديل ===== */
addTextBtn.addEventListener('click', () => {
  const userText = prompt('أدخل النص الذي تريد إضافته:');
  if (!userText) return;

  const el = document.createElement('div');
  el.className = 'element';
  el.dataset.type = 'text';
  el.style.left = '20%';
  el.style.top = '30%';
  el.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
  el.style.minWidth = '40px';
  el.innerHTML = `
    <div contenteditable="true" class="editable"
         style="font-size:${textSizeRange.value}px;
                font-family:${fontSelect.value};
                color:#222;
                padding:6px">${userText}</div>
    <div class="resize-handle">↘</div>
  `;

  canvas.appendChild(el);
  makeElementInteractive(el);
  selectElement(el);

  // ✅ عند النقر المزدوج يمكن تعديل النص
  const editable = el.querySelector('.editable');
  editable.addEventListener('dblclick', () => {
    editable.contentEditable = 'true';
    editable.focus();
  });

  // عند الخروج يوقف التحرير
  editable.addEventListener('blur', () => {
    editable.contentEditable = 'false';
  });
});

  /* إنشاء عنصر نصي مسبقاً */
  function createTextElement(text){
    const el = document.createElement('div');
    el.className = 'element';
    el.dataset.type = 'text';
    el.style.left = '20%';
    el.style.top = '30%';
    el.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
    el.style.minWidth = '40px';
    el.innerHTML = `<div contenteditable="true" class="editable" style="font-size:${textSizeRange.value}px;font-family:${fontSelect.value};color:#222;padding:6px">${text}</div>
                    <div class="resize-handle">↘</div>`;
    return el;
  }

  /* ===== اختيار عنصر نشط (active) ===== */
  function selectElement(el){
    if(!el) return;
    // إزالة التحديد من الآخرين
    document.querySelectorAll('.element').forEach(x=> x.style.outline='none');
    el.style.outline = '2px dashed rgba(0,0,0,0.12)';
    activeElement = el;
    // توجيه الأدوات حسب النوع
    if(el.dataset.type === 'text'){
      const ed = el.querySelector('.editable');
      const fs = parseInt(window.getComputedStyle(ed).fontSize) || 36;
      textSizeRange.value = fs;
      textSizeVal.textContent = fs;
      const rot = getRotationFromTransform(el.style.transform);
      textRotateRange.value = rot;
      textRotateVal.textContent = rot;
      // اختر الخط في القائمة إن أمكن
      const fontFamily = window.getComputedStyle(ed).fontFamily.split(',')[0].replace(/["']/g,'');
      // محاولة اختيار القيمة بأقرب اسم
      for(const o of fontSelect.options){ if(o.value === fontFamily || o.textContent === fontFamily){ fontSelect.value = o.value; break; } }
    } else if(el.dataset.type === 'image'){
      // تحديث مقاييس الصورة
      const s = getScaleFromTransform(el.style.transform);
      imgScale.value = Math.round(s * 100);
      imgScaleVal.textContent = imgScale.value + '%';
      imgRotate.value = getRotationFromTransform(el.style.transform);
      imgRotateVal.textContent = imgRotate.value + '°';
    }
  }

  /* إلغاء التحديد عند النقر خارج */
  document.body.addEventListener('click', (e)=>{
    if(!e.target.closest('.element') && !e.target.closest('.panel') && !e.target.closest('.tool-item')){
      document.querySelectorAll('.element').forEach(x=> x.style.outline='none');
      activeElement = null;
    }
  });

  /* ===== تحكم النص: حجم وتدوير وخط ===== */
  textSizeRange.addEventListener('input', ()=>{
    textSizeVal.textContent = textSizeRange.value;
    if(activeElement && activeElement.dataset.type === 'text'){
      activeElement.querySelector('.editable').style.fontSize = textSizeRange.value + 'px';
    }
  });
  textRotateRange.addEventListener('input', ()=>{
    textRotateVal.textContent = textRotateRange.value;
    if(activeElement){
      const s = getScaleFromTransform(activeElement.style.transform);
      activeElement.style.transform = `translate(0,0) rotate(${textRotateRange.value}deg) scale(${s})`;
      activeElement.setAttribute('data-style', activeElement.style.cssText);
    }
  });
  fontSelect.addEventListener('change', ()=>{
    if(activeElement && activeElement.dataset.type === 'text'){
      activeElement.querySelector('.editable').style.fontFamily = fontSelect.value;
    }
  });

  /* ===== استيراد خط من الجهاز (يطبق محلياً فقط) ===== */
  fontFile.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const name = f.name.replace(/\.[^/.]+$/,'');
    const reader = new FileReader();
    reader.onload = function(){
      const url = reader.result;
      const style = document.createElement('style');
      style.innerHTML = `@font-face{font-family:'${name}';src:url(${url});}`;
      document.head.appendChild(style);
      // إضافة للاختيار
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name + ' (مستورد)';
      fontSelect.appendChild(opt);
      fontSelect.value = name;
      alert('تم استيراد الخط محلياً: ' + name);
      // لو كان هناك عنصر نصي نشط، نطبقه عليه
      if(activeElement && activeElement.dataset.type === 'text'){
        activeElement.querySelector('.editable').style.fontFamily = name;
      }
    };
    reader.readAsDataURL(f);
    // إعادة تهيئة قيمة input
    e.target.value = '';
  });

  /* ===== تدرجات النص المخصصة ===== */
  openTextGrad.addEventListener('click', ()=> openPanel('grad-panel'));
  applyCustomGrad.addEventListener('click', ()=>{
    if(!activeElement || activeElement.dataset.type !== 'text'){ alert('اختر نصاً أولاً'); return; }
    const g = `linear-gradient(90deg, ${gradC1.value}, ${gradC2.value})`;
    const ed = activeElement.querySelector('.editable');
    ed.style.background = g;
    ed.style.webkitBackgroundClip = 'text';
    ed.style.backgroundClip = 'text';
    ed.style.color = 'transparent';
  });

  /* تطبيق تدرج من القائمة على النص */
  function applyGradientToActiveText(gradient){
    if(!activeElement || activeElement.dataset.type !== 'text'){ alert('اختر نصاً أولاً'); return; }
    const ed = activeElement.querySelector('.editable');
    ed.style.background = gradient;
    ed.style.webkitBackgroundClip = 'text';
    ed.style.backgroundClip = 'text';
    ed.style.color = 'transparent';
  }

  /* تطبيق تدرج على الصورة (طبقة overlay داخل العنصر) */
  function applyGradientToActiveImage(gradient){
    if(!activeElement || activeElement.dataset.type !== 'image'){ alert('اختر صورة أولاً'); return; }
    let overlay = activeElement.querySelector('.grad-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'grad-overlay';
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.mixBlendMode = 'overlay';
      activeElement.appendChild(overlay);
    }
    overlay.style.background = gradient;
  }

  /* ===== إضافة صورة من الجهاز ===== */
  imgFile.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(){
      const url = reader.result;
      const el = document.createElement('div');
      el.className = 'element';
      el.dataset.type = 'image';
      el.style.left = '25%'; el.style.top = '20%';
      el.style.transform = 'translate(0,0) rotate(0deg) scale(1)';
      el.innerHTML = `<img src="${url}" style="max-width:260px;display:block;pointer-events:none"><div class="resize-handle">↘</div>`;
      makeElementInteractive(el);
      canvas.appendChild(el);
      selectElement(el);
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  });

  /* تحكمات الصورة من اللوحة */
  imgScale.addEventListener('input', ()=>{
    imgScaleVal.textContent = imgScale.value + '%';
    if(activeElement && activeElement.dataset.type === 'image'){
      const s = imgScale.value/100;
      const rot = getRotationFromTransform(activeElement.style.transform);
      activeElement.style.transform = `translate(0,0) rotate(${rot}deg) scale(${s})`;
    }
  });
  imgRotate.addEventListener('input', ()=>{
    imgRotateVal.textContent = imgRotate.value + '°';
    if(activeElement && activeElement.dataset.type === 'image'){
      const s = getScaleFromTransform(activeElement.style.transform);
      activeElement.style.transform = `translate(0,0) rotate(${imgRotate.value}deg) scale(${s})`;
    }
  });

  /* ===== وظائف التفاعل للعناصر: سحب، تغيير حجم، تحديد ===== */
  function makeElementInteractive(el){
    // نص: اجعل المحتوى قابل للتحرير
    if(el.dataset.type === 'text'){
      const editable = el.querySelector('.editable');
      editable.setAttribute('contenteditable','true');
      editable.addEventListener('focus', ()=> selectElement(el));
    }

    // الأحداث pointer لجعلها تعمل على اللمس والماوس
    let startX=0,startY=0,origLeft=0,origTop=0,dragging=false;
    el.addEventListener('pointerdown', (ev)=>{
      ev.preventDefault();
      el.setPointerCapture(ev.pointerId);
      startX = ev.clientX;
      startY = ev.clientY;
      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      origLeft = rect.left - canvasRect.left;
      origTop = rect.top - canvasRect.top;
      dragging = true;
      selectElement(el);
    });
    el.addEventListener('pointermove', (ev)=>{
      if(!dragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const canvasRect = canvas.getBoundingClientRect();
      const x = origLeft + dx;
      const y = origTop + dy;
      const leftPct = (x / canvasRect.width) * 100;
      const topPct = (y / canvasRect.height) * 100;
      el.style.left = leftPct + '%';
      el.style.top = topPct + '%';
      el.setAttribute('data-style', el.style.cssText);
    });
    el.addEventListener('pointerup', (ev)=>{ dragging=false; try{ el.releasePointerCapture(ev.pointerId);}catch(e){} });
    el.addEventListener('pointercancel', ()=> dragging=false);

    // تغيير الحجم عبر المقبض
    const handle = el.querySelector('.resize-handle');
    if(handle){
      let resizing=false,startX2=0,origScale=1;
      handle.addEventListener('pointerdown', (ev)=>{
        ev.stopPropagation(); ev.preventDefault();
        handle.setPointerCapture(ev.pointerId);
        resizing = true;
        startX2 = ev.clientX;
        origScale = getScaleFromTransform(el.style.transform);
      });
      handle.addEventListener('pointermove', (ev)=>{
        if(!resizing) return;
        const dx = ev.clientX - startX2;
        const factor = 1 + dx/150;
        const newScale = Math.max(0.1, origScale * factor);
        const rot = getRotationFromTransform(el.style.transform);
        el.style.transform = `translate(0,0) rotate(${rot}deg) scale(${newScale})`;
        el.setAttribute('data-style', el.style.cssText);
      });
      handle.addEventListener('pointerup', (ev)=>{ resizing=false; try{ handle.releasePointerCapture(ev.pointerId);}catch(e){} });
    }

    // الضغط يحدد العنصر
    el.addEventListener('click', (e)=>{ e.stopPropagation(); selectElement(el); });

    // حذف العنصر عبر dblclick
    el.addEventListener('dblclick', ()=> {
      if(confirm('حذف العنصر؟')) el.remove();
    });
  }

  /* ===== دوال مساعدة لقراءة وتحويل التحويلات ===== */
  function getRotationFromTransform(t){
    if(!t) return 0;
    const m = /rotate\(([-0-9.]+)deg\)/.exec(t);
    return m? parseFloat(m[1]) : 0;
  }
  function getScaleFromTransform(t){
    if(!t) return 1;
    const m = /scale\(([-0-9.]+)\)/.exec(t);
    return m? parseFloat(m[1]) : 1;
  }
    
  /* ===== مشاريع: حفظ واسترجاع في localStorage ===== */
  function exportProject(){
    const items = Array.from(canvas.children).map(el=>{
      return {
        type: el.dataset.type,
        html: el.innerHTML,
        style: el.getAttribute('style') || el.style.cssText,
        left: el.style.left, top: el.style.top
      };
    });
    return {timestamp:Date.now(), items};
  }
  function importProject(data){
    canvas.innerHTML = '';
    if(!data || !data.items) return;
    data.items.forEach(it=>{
      const wrapper = document.createElement('div');
      wrapper.className = 'element';
      wrapper.dataset.type = it.type || 'unknown';
      wrapper.style.cssText = it.style || '';
      wrapper.innerHTML = it.html || '';
      makeElementInteractive(wrapper);
      canvas.appendChild(wrapper);
    });
  }
  function loadProjectList(){
    projectListEl.innerHTML = '';
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('pxproj:'));
    if(keys.length === 0){ projectListEl.innerHTML = '<div style="opacity:.6">لا توجد مشاريع محفوظة</div>'; return; }
    keys.forEach(k=>{
      const name = k.replace('pxproj:','');
      const item = document.createElement('div');
      item.className = 'project-item';
      item.innerHTML = `<div>${name}</div><div style="display:flex;gap:6px">
        <button class="btn" data-load="${k}">تحميل</button>
        <button
        data-delete="${k}">حذف</button>
      </div>`;
      projectListEl.appendChild(item);
    });
    projectListEl.querySelectorAll('[data-load]').forEach(b=>{
      b.addEventListener('click', (e)=>{
        const k = e.currentTarget.dataset.load;
        const data = JSON.parse(localStorage.getItem(k));
        importProject(data);
        closePanel('projects-panel');
      });
    });
    projectListEl.querySelectorAll('[data-delete]').forEach(b=>{
      b.addEventListener('click', (e)=>{
        const k = e.currentTarget.dataset.delete;
        if(confirm('حذف هذا المشروع نهائياً؟')){ localStorage.removeItem(k); loadProjectList(); }
      });
    });
  }

  saveProjectBtn.addEventListener('click', ()=>{
    const name = projectNameInput.value.trim() || ('project-' + Date.now());
    const key = 'pxproj:' + name;
    localStorage.setItem(key, JSON.stringify(exportProject()));
    projectNameInput.value = '';
    loadProjectList();
    alert('تم الحفظ محلياً');
  });

  document.getElementById('tool-projects').addEventListener('click', loadProjectList);

  /* ===== السحب الأفقي لشريط الأدوات (touch friendly) ===== */
  (function horizontalScroll(){
    let isDown=false,startX,scrollLeft;
    const scroll = toolScroll;
    scroll.addEventListener('pointerdown', (e)=>{ isDown=true; startX = e.pageX - scroll.offsetLeft; scrollLeft = scroll.scrollLeft; scroll.setPointerCapture(e.pointerId);});
    scroll.addEventListener('pointermove', (e)=>{ if(!isDown) return; const x = e.pageX - scroll.offsetLeft; const walk = (x - startX); scroll.scrollLeft = scrollLeft - walk; });
    scroll.addEventListener('pointerup', (e)=>{ isDown=false; try{ scroll.releasePointerCapture(e.pointerId);}catch(e){} });
    scroll.addEventListener('pointerleave', ()=> isDown=false);
  })();

  /* ===== تنفيذ البدء: تهيئة القوائم واللوحات ===== */
  (function init(){
    populateFontSelect();
    populateColorGrid();
    populateGradLists();
    loadProjectList();
  })();
});
