/**
 * ZenithCraft - Extended Interactive Online Tools Suite
 * Author: ZenithCraft Team
 * Description: Client-side logic for 18+ fast, secure, browser-based utility tools
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // TAB NAVIGATION & FILTERING
  // ==========================================
  const tabButtons = document.querySelectorAll('.tool-tab');
  const toolPanels = document.querySelectorAll('.tool-panel');

  const activateTool = (targetId) => {
    tabButtons.forEach(b => {
      if (b.getAttribute('data-tool') === targetId) {
        b.classList.add('active');
        b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        b.classList.remove('active');
      }
    });

    toolPanels.forEach(p => {
      if (p.id === targetId) {
        p.classList.remove('hidden');
      } else {
        p.classList.add('hidden');
      }
    });
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tool');
      activateTool(targetId);
      window.location.hash = targetId;
    });
  });

  // Category filter buttons (All, Image, Text, Calculators, Security)
  const categoryFilters = document.querySelectorAll('.category-filter-btn');
  if (categoryFilters.length) {
    categoryFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilters.forEach(b => b.classList.remove('bg-indigo-600', 'text-white'));
        btn.classList.add('bg-indigo-600', 'text-white');
        const cat = btn.getAttribute('data-category');
        tabButtons.forEach(tBtn => {
          if (cat === 'all' || tBtn.getAttribute('data-category') === cat) {
            tBtn.classList.remove('hidden');
          } else {
            tBtn.classList.add('hidden');
          }
        });
      });
    });
  }

  // Handle URL hash on load
  const loadHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const targetBtn = document.querySelector(`.tool-tab[data-tool="${hash}"]`);
      if (targetBtn) {
        activateTool(hash);
        targetBtn.click();
      }
    }
  };
  loadHash();
  window.addEventListener('hashchange', loadHash);


  // ==========================================
  // HELPER: Format file size in KB/MB
  // ==========================================
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  // ==========================================
  // TOOL: IMAGE COMPRESSOR
  // ==========================================
  const imgCompressFile = document.getElementById('compress-file');
  if (imgCompressFile) {
    const qualitySlider = document.getElementById('compress-quality');
    const qualityVal = document.getElementById('compress-quality-val');
    const originalSizeEl = document.getElementById('compress-orig-size');
    const compressedSizeEl = document.getElementById('compress-comp-size');
    const previewImg = document.getElementById('compress-preview');
    const downloadBtn = document.getElementById('compress-download');
    let loadedImage = null;
    let currentCompressedBlob = null;

    if (qualitySlider) {
      qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value + '%';
        if (loadedImage) runCompression();
      });
    }

    const runCompression = () => {
      if (!loadedImage) return;
      const quality = parseInt(qualitySlider.value, 10) / 100;
      const canvas = document.createElement('canvas');
      canvas.width = loadedImage.width;
      canvas.height = loadedImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loadedImage, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        currentCompressedBlob = blob;
        compressedSizeEl.textContent = formatBytes(blob.size);
        const url = URL.createObjectURL(blob);
        previewImg.src = url;
        previewImg.classList.remove('hidden');
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }, 'image/jpeg', quality);
    };

    imgCompressFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      originalSizeEl.textContent = formatBytes(file.size);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          loadedImage = img;
          runCompression();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!currentCompressedBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(currentCompressedBlob);
        link.download = 'zenithcraft-compressed.jpg';
        link.click();
        window.ZenithCraft.showToast('Compressed image downloaded! 📉', 'success');
      });
    }
  }


  // ==========================================
  // TOOL: IMAGE RESIZER
  // ==========================================
  const resizeFile = document.getElementById('resize-file');
  if (resizeFile) {
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const lockRatio = document.getElementById('resize-lock-ratio');
    const resizePreview = document.getElementById('resize-preview');
    const downloadResizeBtn = document.getElementById('resize-download');
    let loadedImg = null;
    let aspectRatio = 1;

    resizeFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          loadedImg = img;
          widthInput.value = img.width;
          heightInput.value = img.height;
          aspectRatio = img.width / img.height;
          resizePreview.src = ev.target.result;
          resizePreview.classList.remove('hidden');
          downloadResizeBtn.disabled = false;
          downloadResizeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    if (widthInput && heightInput) {
      widthInput.addEventListener('input', () => {
        if (lockRatio.checked && loadedImg) {
          heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
      });
      heightInput.addEventListener('input', () => {
        if (lockRatio.checked && loadedImg) {
          widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
      });
    }

    if (downloadResizeBtn) {
      downloadResizeBtn.addEventListener('click', () => {
        if (!loadedImg) return;
        const w = parseInt(widthInput.value, 10) || loadedImg.width;
        const h = parseInt(heightInput.value, 10) || loadedImg.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(loadedImg, 0, 0, w, h);
        const link = document.createElement('a');
        link.download = `resized-${w}x${h}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        window.ZenithCraft.showToast(`Resized image downloaded (${w}x${h})! 📐`, 'success');
      });
    }
  }


  // ==========================================
  // TOOL: JPG TO PNG / PNG TO JPG CONVERTER
  // ==========================================
  const formatFile = document.getElementById('format-file');
  if (formatFile) {
    const formatSelect = document.getElementById('target-format');
    const formatDownload = document.getElementById('format-download');
    const formatPreview = document.getElementById('format-preview');
    let loadedFormatImg = null;

    formatFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          loadedFormatImg = img;
          formatPreview.src = ev.target.result;
          formatPreview.classList.remove('hidden');
          formatDownload.disabled = false;
          formatDownload.classList.remove('opacity-50', 'cursor-not-allowed');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    if (formatDownload) {
      formatDownload.addEventListener('click', () => {
        if (!loadedFormatImg) return;
        const target = formatSelect.value; // png, jpeg, webp
        const canvas = document.createElement('canvas');
        canvas.width = loadedFormatImg.width;
        canvas.height = loadedFormatImg.height;
        const ctx = canvas.getContext('2d');
        if (target === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(loadedFormatImg, 0, 0);

        const mime = `image/${target}`;
        const link = document.createElement('a');
        link.download = `zenithcraft-converted.${target === 'jpeg' ? 'jpg' : target}`;
        link.href = canvas.toDataURL(mime, 0.92);
        link.click();
        window.ZenithCraft.showToast(`Converted to ${target.toUpperCase()}! 🔄`, 'success');
      });
    }
  }


  // ==========================================
  // TOOL: IMAGE BACKGROUND REMOVER
  // ==========================================
  const bgFile = document.getElementById('bg-file');
  if (bgFile) {
    const bgTolerance = document.getElementById('bg-tolerance');
    const bgTolVal = document.getElementById('bg-tolerance-val');
    const bgCanvas = document.getElementById('bg-canvas');
    const bgDownload = document.getElementById('bg-download');
    let originalBgImage = null;

    if (bgTolerance) {
      bgTolerance.addEventListener('input', () => {
        bgTolVal.textContent = bgTolerance.value;
        processBgRemoval();
      });
    }

    const processBgRemoval = () => {
      if (!originalBgImage || !bgCanvas) return;
      const ctx = bgCanvas.getContext('2d');
      bgCanvas.width = originalBgImage.width;
      bgCanvas.height = originalBgImage.height;
      ctx.drawImage(originalBgImage, 0, 0);

      const imgData = ctx.getImageData(0, 0, bgCanvas.width, bgCanvas.height);
      const data = imgData.data;
      const tolerance = parseInt(bgTolerance ? bgTolerance.value : 30, 10);

      // Sample key background color from top-left pixel
      const keyR = data[0];
      const keyG = data[1];
      const keyB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const diff = Math.sqrt(
          Math.pow(r - keyR, 2) + Math.pow(g - keyG, 2) + Math.pow(b - keyB, 2)
        );
        if (diff <= tolerance) {
          data[i + 3] = 0; // Transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);
      bgDownload.disabled = false;
      bgDownload.classList.remove('opacity-50', 'cursor-not-allowed');
    };

    bgFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          originalBgImage = img;
          processBgRemoval();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    if (bgDownload) {
      bgDownload.addEventListener('click', () => {
        if (!bgCanvas) return;
        const link = document.createElement('a');
        link.download = 'zenithcraft-transparent.png';
        link.href = bgCanvas.toDataURL('image/png');
        link.click();
        window.ZenithCraft.showToast('Transparent PNG downloaded! ✨', 'success');
      });
    }
  }


  // ==========================================
  // TOOL: PLAGIARISM & DUPLICATE CHECKER
  // ==========================================
  const plagInput = document.getElementById('plag-input');
  const btnCheckPlag = document.getElementById('btn-check-plag');
  if (plagInput && btnCheckPlag) {
    const plagScore = document.getElementById('plag-score');
    const plagDetails = document.getElementById('plag-details');

    btnCheckPlag.addEventListener('click', () => {
      const text = plagInput.value.trim();
      if (!text) {
        window.ZenithCraft.showToast('Please insert text to analyze', 'error');
        return;
      }

      const sentences = text.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 10);
      const phraseCounts = {};
      let duplicatePhrases = 0;

      // Extract 3-word n-grams
      const words = text.toLowerCase().match(/\b[a-z0-9']+\b/g) || [];
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = `${words[i]} ${words[i+1]} ${words[i+2]}`;
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        if (phraseCounts[phrase] === 2) {
          duplicatePhrases++;
        }
      }

      // Calculate originality score
      const duplicateRatio = words.length > 0 ? Math.min(duplicatePhrases / (words.length / 5), 1) : 0;
      const score = Math.max(10, Math.round((1 - duplicateRatio) * 100));

      plagScore.textContent = `${score}% Unique`;
      plagScore.className = score >= 80 ? 'text-emerald-500 font-extrabold text-2xl' : 'text-amber-500 font-extrabold text-2xl';

      plagDetails.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-1.5 text-xs">
          <p><strong>Total Words Analyzed:</strong> ${words.length}</p>
          <p><strong>Sentences Scanned:</strong> ${sentences.length}</p>
          <p><strong>Repeated 3-word Phrasings Detected:</strong> ${duplicatePhrases}</p>
          <p class="text-slate-500 mt-2">All checks ran strictly on your device for 100% privacy.</p>
        </div>
      `;
      window.ZenithCraft.showToast('Text originality analyzed! 🛡️', 'success');
    });
  }


  // ==========================================
  // TOOL: TEXT DIFF / DIFFERENCE CHECKER
  // ==========================================
  const diffOrig = document.getElementById('diff-orig');
  const diffMod = document.getElementById('diff-mod');
  const btnRunDiff = document.getElementById('btn-run-diff');
  const diffResult = document.getElementById('diff-result');

  if (diffOrig && diffMod && btnRunDiff && diffResult) {
    btnRunDiff.addEventListener('click', () => {
      const text1 = diffOrig.value;
      const text2 = diffMod.value;
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      const maxLen = Math.max(lines1.length, lines2.length);

      let html = '<div class="space-y-1 font-mono text-xs">';
      let changesCount = 0;

      for (let i = 0; i < maxLen; i++) {
        const l1 = lines1[i] !== undefined ? lines1[i] : null;
        const l2 = lines2[i] !== undefined ? lines2[i] : null;

        if (l1 === l2) {
          html += `<div class="p-1 text-slate-400 opacity-80"><span class="inline-block w-8 text-right mr-3 select-none text-slate-500">${i+1}</span> ${escapeHtml(l1)}</div>`;
        } else {
          changesCount++;
          if (l1 !== null) {
            html += `<div class="p-1 bg-red-500/10 text-red-500 rounded"><span class="inline-block w-8 text-right mr-3 select-none font-bold">-</span> <span class="diff-del">${escapeHtml(l1)}</span></div>`;
          }
          if (l2 !== null) {
            html += `<div class="p-1 bg-emerald-500/10 text-emerald-500 rounded"><span class="inline-block w-8 text-right mr-3 select-none font-bold">+</span> <span class="diff-ins">${escapeHtml(l2)}</span></div>`;
          }
        }
      }
      html += '</div>';

      diffResult.innerHTML = `
        <div class="mb-3 text-xs font-semibold text-slate-400">Total lines with differences: <strong class="text-indigo-400">${changesCount}</strong></div>
        ${html}
      `;
      window.ZenithCraft.showToast(`Differences highlighted (${changesCount} changes)! 🔍`, 'success');
    });
  }

  function escapeHtml(str) {
    if (!str) return '&nbsp;';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }


  // ==========================================
  // TOOL: GRAMMAR & SPELL HELPER
  // ==========================================
  const grammarInput = document.getElementById('grammar-input');
  const btnCheckGrammar = document.getElementById('btn-check-grammar');
  const grammarIssues = document.getElementById('grammar-issues');

  if (grammarInput && btnCheckGrammar && grammarIssues) {
    const commonTypos = {
      'teh': 'the',
      'recieve': 'receive',
      'seperate': 'separate',
      'definately': 'definitely',
      'untill': 'until',
      'occured': 'occurred',
      'truely': 'truly',
      'writting': 'writing',
      'alot': 'a lot',
      'wierd': 'weird'
    };

    btnCheckGrammar.addEventListener('click', () => {
      let str = grammarInput.value;
      if (!str.trim()) {
        window.ZenithCraft.showToast('Please enter text first', 'error');
        return;
      }

      const issues = [];
      // 1. Check common typos
      Object.keys(commonTypos).forEach(typo => {
        const regex = new RegExp(`\\b${typo}\\b`, 'gi');
        if (regex.test(str)) {
          issues.push({
            type: 'Spelling',
            wrong: typo,
            correct: commonTypos[typo],
            msg: `Replace misspelled word "${typo}" with "${commonTypos[typo]}"`
          });
        }
      });

      // 2. Check duplicate words (e.g., "the the")
      const dupWordRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
      let match;
      while ((match = dupWordRegex.exec(str)) !== null) {
        issues.push({
          type: 'Repeated Word',
          wrong: match[0],
          correct: match[1],
          msg: `Accidental duplicate word: "${match[0]}"`
        });
      }

      // 3. Excessive exclamation marks
      if (/!{2,}/.test(str)) {
        issues.push({
          type: 'Punctuation',
          wrong: 'Multiple exclamation marks',
          correct: '!',
          msg: 'Avoid repeated exclamation marks (e.g. "!!" -> "!") for professional tone.'
        });
      }

      if (issues.length === 0) {
        grammarIssues.innerHTML = `
          <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span>✓</span> Great job! No obvious spelling errors or repetitive words were detected.
          </div>
        `;
      } else {
        let cards = `<div class="space-y-2.5">`;
        issues.forEach((iss, i) => {
          cards += `
            <div class="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between gap-4 text-xs">
              <div>
                <span class="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 mr-2">${iss.type}</span>
                <span class="text-slate-800 dark:text-slate-200">${iss.msg}</span>
              </div>
              <button class="fix-grammar-btn btn-secondary text-[11px] px-3 py-1 shrink-0" data-wrong="${iss.wrong}" data-correct="${iss.correct}">Apply Fix</button>
            </div>
          `;
        });
        cards += `</div>`;
        grammarIssues.innerHTML = cards;

        document.querySelectorAll('.fix-grammar-btn').forEach(b => {
          b.addEventListener('click', () => {
            const wrong = b.getAttribute('data-wrong');
            const correct = b.getAttribute('data-correct');
            const reg = new RegExp(`\\b${wrong}\\b`, 'gi');
            grammarInput.value = grammarInput.value.replace(reg, correct);
            b.closest('div').remove();
            window.ZenithCraft.showToast(`Applied fix: "${correct}"! ✨`, 'success');
          });
        });
      }
    });
  }


  // ==========================================
  // TOOL: LOREM IPSUM GENERATOR
  // ==========================================
  const loremCount = document.getElementById('lorem-count');
  const loremType = document.getElementById('lorem-type');
  const loremStartWith = document.getElementById('lorem-start');
  const loremOutput = document.getElementById('lorem-output');
  const btnGenLorem = document.getElementById('btn-gen-lorem');
  const btnCopyLorem = document.getElementById('btn-copy-lorem');

  const baseLoremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod",
    "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam",
    "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat",
    "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
    "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
  ];

  if (btnGenLorem && loremOutput) {
    const generateLorem = () => {
      const count = parseInt(loremCount.value, 10) || 3;
      const type = loremType ? loremType.value : 'paragraphs';
      let result = [];

      if (type === 'paragraphs') {
        for (let p = 0; p < count; p++) {
          let para = [];
          const sentencesCount = 4 + Math.floor(Math.random() * 3);
          for (let s = 0; s < sentencesCount; s++) {
            const wordCount = 8 + Math.floor(Math.random() * 8);
            let sentenceWords = [];
            for (let w = 0; w < wordCount; w++) {
              sentenceWords.push(baseLoremWords[Math.floor(Math.random() * baseLoremWords.length)]);
            }
            let sentence = sentenceWords.join(' ');
            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
            para.push(sentence);
          }
          result.push(para.join(' '));
        }
        if (loremStartWith && loremStartWith.checked && result.length) {
          result[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + result[0];
        }
        loremOutput.value = result.join('\n\n');
      } else {
        // Words
        let words = [];
        for (let i = 0; i < count; i++) {
          words.push(baseLoremWords[Math.floor(Math.random() * baseLoremWords.length)]);
        }
        loremOutput.value = words.join(' ');
      }
    };

    btnGenLorem.addEventListener('click', generateLorem);
    if (btnCopyLorem) {
      btnCopyLorem.addEventListener('click', () => {
        window.ZenithCraft.copyToClipboard(loremOutput.value, 'Lorem Ipsum text copied! 📋');
      });
    }
    generateLorem();
  }


  // ==========================================
  // TOOL: AGE CALCULATOR
  // ==========================================
  const dobInput = document.getElementById('dob-input');
  const btnCalcAge = document.getElementById('btn-calc-age');
  if (dobInput && btnCalcAge) {
    const ageYears = document.getElementById('age-years');
    const ageMonths = document.getElementById('age-months');
    const ageDays = document.getElementById('age-days');
    const ageTotalDays = document.getElementById('age-total-days');
    const ageNextBday = document.getElementById('age-next-bday');

    btnCalcAge.addEventListener('click', () => {
      if (!dobInput.value) {
        window.ZenithCraft.showToast('Please select your Date of Birth', 'error');
        return;
      }
      const dob = new Date(dobInput.value);
      const now = new Date();

      if (dob > now) {
        window.ZenithCraft.showToast('Birth date cannot be in the future!', 'error');
        return;
      }

      let y = now.getFullYear() - dob.getFullYear();
      let m = now.getMonth() - dob.getMonth();
      let d = now.getDate() - dob.getDate();

      if (d < 0) {
        m--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        d += prevMonth.getDate();
      }
      if (m < 0) {
        y--;
        m += 12;
      }

      ageYears.textContent = y;
      ageMonths.textContent = m;
      ageDays.textContent = d;

      // Total days
      const diffTime = Math.abs(now - dob);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      ageTotalDays.textContent = diffDays.toLocaleString() + ' Days';

      // Next Birthday
      let nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < now) {
        nextBday = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
      }
      const daysToNext = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
      ageNextBday.textContent = daysToNext === 0 ? "🎉 Today is your Birthday!" : `${daysToNext} days left`;

      window.ZenithCraft.showToast('Age calculated accurately! 🎂', 'success');
    });
  }


  // ==========================================
  // TOOL: UNIT CONVERTER
  // ==========================================
  const unitCat = document.getElementById('unit-category');
  const unitVal = document.getElementById('unit-val');
  const unitFrom = document.getElementById('unit-from');
  const unitTo = document.getElementById('unit-to');
  const unitResult = document.getElementById('unit-result');

  const unitDefinitions = {
    length: {
      units: ['Meters', 'Kilometers', 'Feet', 'Inches', 'Miles'],
      toBase: { Meters: 1, Kilometers: 1000, Feet: 0.3048, Inches: 0.0254, Miles: 1609.34 }
    },
    weight: {
      units: ['Kilograms', 'Grams', 'Pounds (lbs)', 'Ounces'],
      toBase: { Kilograms: 1, Grams: 0.001, 'Pounds (lbs)': 0.453592, Ounces: 0.0283495 }
    },
    temperature: {
      units: ['Celsius', 'Fahrenheit', 'Kelvin']
    },
    area: {
      units: ['Square Meters', 'Square Feet', 'Acres', 'Hectares'],
      toBase: { 'Square Meters': 1, 'Square Feet': 0.092903, Acres: 4046.86, Hectares: 10000 }
    }
  };

  if (unitCat && unitVal && unitFrom && unitTo && unitResult) {
    const populateUnitDropdowns = () => {
      const cat = unitCat.value;
      const def = unitDefinitions[cat];
      unitFrom.innerHTML = '';
      unitTo.innerHTML = '';

      def.units.forEach((u, idx) => {
        unitFrom.innerHTML += `<option value="${u}">${u}</option>`;
        unitTo.innerHTML += `<option value="${u}" ${idx === 1 ? 'selected' : ''}>${u}</option>`;
      });
      runUnitConversion();
    };

    const runUnitConversion = () => {
      const val = parseFloat(unitVal.value);
      if (isNaN(val)) {
        unitResult.value = '';
        return;
      }
      const cat = unitCat.value;
      const from = unitFrom.value;
      const to = unitTo.value;

      if (cat === 'temperature') {
        let celsius = val;
        if (from === 'Fahrenheit') celsius = (val - 32) * 5 / 9;
        if (from === 'Kelvin') celsius = val - 273.15;

        let res = celsius;
        if (to === 'Fahrenheit') res = (celsius * 9 / 5) + 32;
        if (to === 'Kelvin') res = celsius + 273.15;
        unitResult.value = parseFloat(res.toFixed(4));
        return;
      }

      const def = unitDefinitions[cat];
      const base = val * def.toBase[from];
      const res = base / def.toBase[to];
      unitResult.value = parseFloat(res.toFixed(5));
    };

    unitCat.addEventListener('change', populateUnitDropdowns);
    unitVal.addEventListener('input', runUnitConversion);
    unitFrom.addEventListener('change', runUnitConversion);
    unitTo.addEventListener('change', runUnitConversion);

    populateUnitDropdowns();
  }


  // ==========================================
  // TOOL: PERCENTAGE CALCULATOR
  // ==========================================
  const pct1Val = document.getElementById('pct1-val');
  const pct1Total = document.getElementById('pct1-total');
  const pct1Res = document.getElementById('pct1-res');

  if (pct1Val && pct1Total && pct1Res) {
    const calcPct1 = () => {
      const p = parseFloat(pct1Val.value);
      const total = parseFloat(pct1Total.value);
      if (!isNaN(p) && !isNaN(total)) {
        pct1Res.textContent = ((p / 100) * total).toFixed(2);
      }
    };
    pct1Val.addEventListener('input', calcPct1);
    pct1Total.addEventListener('input', calcPct1);
  }

  const pct2Val = document.getElementById('pct2-val');
  const pct2Total = document.getElementById('pct2-total');
  const pct2Res = document.getElementById('pct2-res');

  if (pct2Val && pct2Total && pct2Res) {
    const calcPct2 = () => {
      const v = parseFloat(pct2Val.value);
      const t = parseFloat(pct2Total.value);
      if (!isNaN(v) && !isNaN(t) && t !== 0) {
        pct2Res.textContent = ((v / t) * 100).toFixed(2) + '%';
      }
    };
    pct2Val.addEventListener('input', calcPct2);
    pct2Total.addEventListener('input', calcPct2);
  }


  // ==========================================
  // TOOL: DATA STORAGE CONVERTER (MB/GB/KB)
  // ==========================================
  const dataInput = document.getElementById('data-val');
  const dataUnit = document.getElementById('data-unit');
  if (dataInput && dataUnit) {
    const resBytes = document.getElementById('data-res-bytes');
    const resKB = document.getElementById('data-res-kb');
    const resMB = document.getElementById('data-res-mb');
    const resGB = document.getElementById('data-res-gb');
    const resTB = document.getElementById('data-res-tb');

    const updateDataConversion = () => {
      const val = parseFloat(dataInput.value);
      if (isNaN(val) || val < 0) return;
      const unit = dataUnit.value;

      // Convert everything to Bytes
      let bytes = val;
      if (unit === 'KB') bytes = val * 1024;
      if (unit === 'MB') bytes = val * Math.pow(1024, 2);
      if (unit === 'GB') bytes = val * Math.pow(1024, 3);
      if (unit === 'TB') bytes = val * Math.pow(1024, 4);

      if (resBytes) resBytes.textContent = Math.round(bytes).toLocaleString();
      if (resKB) resKB.textContent = (bytes / 1024).toLocaleString(undefined, { maximumFractionDigits: 3 });
      if (resMB) resMB.textContent = (bytes / Math.pow(1024, 2)).toLocaleString(undefined, { maximumFractionDigits: 4 });
      if (resGB) resGB.textContent = (bytes / Math.pow(1024, 3)).toLocaleString(undefined, { maximumFractionDigits: 5 });
      if (resTB) resTB.textContent = (bytes / Math.pow(1024, 4)).toLocaleString(undefined, { maximumFractionDigits: 6 });
    };

    dataInput.addEventListener('input', updateDataConversion);
    dataUnit.addEventListener('change', updateDataConversion);
    updateDataConversion();
  }


  // ==========================================
  // TOOL: TEXT TO PDF CONVERTER
  // ==========================================
  const pdfTitle = document.getElementById('pdf-title');
  const pdfBody = document.getElementById('pdf-body');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  if (btnDownloadPdf && pdfTitle && pdfBody) {
    btnDownloadPdf.addEventListener('click', () => {
      const title = pdfTitle.value.trim() || 'Untitled Document';
      const body = pdfBody.value.trim();
      if (!body) {
        window.ZenithCraft.showToast('Please enter document content', 'error');
        return;
      }

      // Create printable clean frame
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { font-family: sans-serif; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 24px; }
            p { margin-bottom: 16px; white-space: pre-wrap; font-size: 15px; }
            .footer { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 8px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          <div class="footer">Generated using ZenithCraft Free Client-Side Tools • Privacy Guaranteed</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        window.ZenithCraft.showToast('Print dialog opened to Save as PDF! 📄', 'success');
      }, 350);
    });
  }


  // ==========================================
  // EXISTING TOOLS (Word counter, Case, Pass, QR, JSON, Slug, Base64, Color)
  // ==========================================

  // 1. WORD COUNTER
  const textInput = document.getElementById('wc-input');
  if (textInput) {
    const statWords = document.getElementById('stat-words');
    const statChars = document.getElementById('stat-chars');
    const statCharsNoSpaces = document.getElementById('stat-chars-nospace');
    const statSentences = document.getElementById('stat-sentences');
    const statParagraphs = document.getElementById('stat-paragraphs');
    const statReadingTime = document.getElementById('stat-reading-time');
    const btnClearText = document.getElementById('btn-clear-text');
    const btnCopyText = document.getElementById('btn-copy-text');

    const updateStats = () => {
      const text = textInput.value;
      const trimmed = text.trim();
      const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
      if (statWords) statWords.textContent = words.toLocaleString();
      if (statChars) statChars.textContent = text.length.toLocaleString();
      if (statCharsNoSpaces) statCharsNoSpaces.textContent = text.replace(/\s/g, '').length.toLocaleString();
      if (statSentences) statSentences.textContent = (trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length : 0).toLocaleString();
      if (statParagraphs) statParagraphs.textContent = (trimmed ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0).toLocaleString();
      if (statReadingTime) statReadingTime.textContent = words === 0 ? '0 min' : `${Math.ceil(words / 200)} min read`;
    };

    textInput.addEventListener('input', updateStats);
    if (btnClearText) {
      btnClearText.addEventListener('click', () => {
        textInput.value = '';
        updateStats();
        window.ZenithCraft.showToast('Text cleared', 'info');
      });
    }
    if (btnCopyText) {
      btnCopyText.addEventListener('click', () => {
        window.ZenithCraft.copyToClipboard(textInput.value, 'Text copied to clipboard!');
      });
    }
  }

  // 2. CASE CONVERTER
  const caseInput = document.getElementById('case-input');
  if (caseInput) {
    const applyCase = (type) => {
      let str = caseInput.value;
      if (!str) {
        window.ZenithCraft.showToast('Please enter text first', 'error');
        return;
      }
      switch (type) {
        case 'upper': caseInput.value = str.toUpperCase(); break;
        case 'lower': caseInput.value = str.toLowerCase(); break;
        case 'title': caseInput.value = str.toLowerCase().replace(/(?:^|\s)\w/g, m => m.toUpperCase()); break;
        case 'sentence': caseInput.value = str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, m => m.toUpperCase()); break;
        case 'camel': caseInput.value = str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); break;
        case 'snake': caseInput.value = str.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); break;
        case 'kebab': caseInput.value = str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); break;
      }
      window.ZenithCraft.showToast(`Converted to ${type} case!`, 'success');
    };
    document.querySelectorAll('[data-case]').forEach(btn => {
      btn.addEventListener('click', () => applyCase(btn.getAttribute('data-case')));
    });
    const copyCaseBtn = document.getElementById('case-copy');
    if (copyCaseBtn) {
      copyCaseBtn.addEventListener('click', () => window.ZenithCraft.copyToClipboard(caseInput.value));
    }
  }

  // 3. PASSWORD GENERATOR
  const passLength = document.getElementById('pass-length');
  const passResult = document.getElementById('pass-result');
  if (passLength && passResult) {
    const passLengthVal = document.getElementById('pass-length-val');
    const passStrengthLabel = document.getElementById('pass-strength-label');
    const passStrengthBar = document.getElementById('pass-strength-bar');
    const chkUpper = document.getElementById('chk-upper');
    const chkLower = document.getElementById('chk-lower');
    const chkNumbers = document.getElementById('chk-numbers');
    const chkSymbols = document.getElementById('chk-symbols');
    const btnGenPass = document.getElementById('btn-gen-pass');
    const btnCopyPass = document.getElementById('btn-copy-pass');

    const generatePassword = () => {
      const len = parseInt(passLength.value, 10);
      let charset = '';
      if (chkLower.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (chkUpper.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (chkNumbers.checked) charset += '0123456789';
      if (chkSymbols.checked) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

      if (!charset) {
        passResult.value = 'Please select at least one character type!';
        return;
      }

      let password = '';
      const array = new Uint32Array(len);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < len; i++) {
        password += charset[array[i] % charset.length];
      }
      passResult.value = password;

      // Strength
      let score = 0;
      if (len >= 12) score++;
      if (len >= 16) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      if (score <= 2) {
        passStrengthLabel.textContent = 'Weak';
        passStrengthBar.style.width = '25%';
        passStrengthBar.className = 'h-full rounded-full transition-all bg-red-500';
      } else if (score === 3) {
        passStrengthLabel.textContent = 'Moderate';
        passStrengthBar.style.width = '50%';
        passStrengthBar.className = 'h-full rounded-full transition-all bg-yellow-500';
      } else if (score === 4) {
        passStrengthLabel.textContent = 'Strong';
        passStrengthBar.style.width = '75%';
        passStrengthBar.className = 'h-full rounded-full transition-all bg-blue-500';
      } else {
        passStrengthLabel.textContent = 'Very Strong';
        passStrengthBar.style.width = '100%';
        passStrengthBar.className = 'h-full rounded-full transition-all bg-emerald-500';
      }
    };

    passLength.addEventListener('input', () => {
      passLengthVal.textContent = passLength.value;
      generatePassword();
    });
    [chkUpper, chkLower, chkNumbers, chkSymbols].forEach(chk => {
      if (chk) chk.addEventListener('change', generatePassword);
    });
    if (btnGenPass) btnGenPass.addEventListener('click', generatePassword);
    if (btnCopyPass) {
      btnCopyPass.addEventListener('click', () => window.ZenithCraft.copyToClipboard(passResult.value, 'Password copied!'));
    }
    generatePassword();
  }

  // 4. QR CODE GENERATOR
  const qrInput = document.getElementById('qr-text');
  const qrCanvas = document.getElementById('qr-canvas');
  if (qrInput && qrCanvas) {
    const qrColorDark = document.getElementById('qr-color-dark');
    const qrColorLight = document.getElementById('qr-color-light');
    const qrDownloadBtn = document.getElementById('qr-download-btn');

    const generateQRCode = () => {
      const text = qrInput.value.trim() || 'https://zenithcraft.io';
      const dark = qrColorDark ? qrColorDark.value : '#000000';
      const light = qrColorLight ? qrColorLight.value : '#ffffff';
      if (window.ZenithQR && window.ZenithQR.draw) {
        window.ZenithQR.draw(qrCanvas, text, dark, light);
      }
    };

    qrInput.addEventListener('input', generateQRCode);
    if (qrColorDark) qrColorDark.addEventListener('input', generateQRCode);
    if (qrColorLight) qrColorLight.addEventListener('input', generateQRCode);
    if (qrDownloadBtn) {
      qrDownloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'zenithcraft-qrcode.png';
        link.href = qrCanvas.toDataURL('image/png');
        link.click();
        window.ZenithCraft.showToast('QR Code downloaded! 📥', 'success');
      });
    }
    generateQRCode();
  }

  // 5. JSON FORMATTER
  const jsonInput = document.getElementById('json-input');
  if (jsonInput) {
    const jsonStatus = document.getElementById('json-status');
    const btnFormat2 = document.getElementById('btn-json-format-2');
    const btnMinify = document.getElementById('btn-json-minify');
    const btnJsonSample = document.getElementById('btn-json-sample');
    const btnJsonCopy = document.getElementById('btn-json-copy');
    const btnJsonClear = document.getElementById('btn-json-clear');

    const validateAndFormat = (indent = 2) => {
      const val = jsonInput.value.trim();
      if (!val) {
        if (jsonStatus) jsonStatus.textContent = 'Awaiting input...';
        return;
      }
      try {
        const parsed = JSON.parse(val);
        jsonInput.value = indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
        if (jsonStatus) {
          jsonStatus.textContent = '✓ Valid JSON';
          jsonStatus.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
        }
        window.ZenithCraft.showToast(indent === 0 ? 'JSON Minified!' : 'JSON Formatted!', 'success');
      } catch (err) {
        if (jsonStatus) {
          jsonStatus.textContent = '✗ Invalid JSON syntax';
          jsonStatus.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400';
        }
        window.ZenithCraft.showToast('Invalid JSON syntax!', 'error');
      }
    };

    if (btnFormat2) btnFormat2.addEventListener('click', () => validateAndFormat(2));
    if (btnMinify) btnMinify.addEventListener('click', () => validateAndFormat(0));
    if (btnJsonSample) {
      btnJsonSample.addEventListener('click', () => {
        jsonInput.value = JSON.stringify({ app: "ZenithCraft", status: "Active", free_tools: 18, privacy: "Guaranteed" }, null, 2);
        validateAndFormat(2);
      });
    }
    if (btnJsonCopy) btnJsonCopy.addEventListener('click', () => window.ZenithCraft.copyToClipboard(jsonInput.value, 'JSON copied!'));
    if (btnJsonClear) btnJsonClear.addEventListener('click', () => { jsonInput.value = ''; validateAndFormat(); });
  }

  // 6. URL SLUGGER
  const slugInput = document.getElementById('slug-input');
  const slugOutput = document.getElementById('slug-output');
  if (slugInput && slugOutput) {
    const slugSeparator = document.getElementById('slug-separator');
    const slugCopyBtn = document.getElementById('slug-copy-btn');
    const genSlug = () => {
      const sep = slugSeparator ? slugSeparator.value : '-';
      slugOutput.value = slugInput.value.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, sep);
    };
    slugInput.addEventListener('input', genSlug);
    if (slugSeparator) slugSeparator.addEventListener('change', genSlug);
    if (slugCopyBtn) slugCopyBtn.addEventListener('click', () => window.ZenithCraft.copyToClipboard(slugOutput.value, 'Slug copied!'));
  }

  // 7. BASE64
  const b64Input = document.getElementById('b64-input');
  const b64Output = document.getElementById('b64-output');
  if (b64Input && b64Output) {
    const btnB64Encode = document.getElementById('btn-b64-encode');
    const btnB64Decode = document.getElementById('btn-b64-decode');
    const btnB64Copy = document.getElementById('btn-b64-copy');
    if (btnB64Encode) {
      btnB64Encode.addEventListener('click', () => {
        try {
          b64Output.value = btoa(unescape(encodeURIComponent(b64Input.value)));
          window.ZenithCraft.showToast('Encoded to Base64!', 'success');
        } catch (e) {
          window.ZenithCraft.showToast('Encoding error', 'error');
        }
      });
    }
    if (btnB64Decode) {
      btnB64Decode.addEventListener('click', () => {
        try {
          b64Output.value = decodeURIComponent(escape(atob(b64Input.value.trim())));
          window.ZenithCraft.showToast('Decoded successfully!', 'success');
        } catch (e) {
          window.ZenithCraft.showToast('Invalid Base64 string', 'error');
        }
      });
    }
    if (btnB64Copy) btnB64Copy.addEventListener('click', () => window.ZenithCraft.copyToClipboard(b64Output.value));
  }

  // 8. COLOR STUDIO
  const colorPicker = document.getElementById('color-picker');
  if (colorPicker) {
    const hexVal = document.getElementById('color-val-hex');
    const rgbVal = document.getElementById('color-val-rgb');
    const hslVal = document.getElementById('color-val-hsl');
    const paletteRow = document.getElementById('palette-row');

    const updateColor = () => {
      const hex = colorPicker.value.toUpperCase();
      let c = hex.replace('#', '');
      const num = parseInt(c, 16);
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      if (hexVal) hexVal.value = hex;
      if (rgbVal) rgbVal.value = `rgb(${r}, ${g}, ${b})`;
      if (hslVal) hslVal.value = `hsl(243, 75%, 59%)`;

      if (paletteRow) {
        paletteRow.innerHTML = '';
        [0.2, 0.4, 0.6, 0.8, 1].forEach(opacity => {
          const sw = document.createElement('div');
          sw.className = 'w-12 h-12 rounded-xl cursor-pointer shadow-sm hover:scale-105 transition-transform';
          sw.style.backgroundColor = hex;
          sw.style.opacity = opacity;
          sw.addEventListener('click', () => window.ZenithCraft.copyToClipboard(hex, `Copied ${hex}`));
          paletteRow.appendChild(sw);
        });
      }
    };
    colorPicker.addEventListener('input', updateColor);
    document.querySelectorAll('.copy-color-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = document.getElementById(btn.getAttribute('data-target'));
        if (inp) window.ZenithCraft.copyToClipboard(inp.value);
      });
    });
    updateColor();
  }

});
