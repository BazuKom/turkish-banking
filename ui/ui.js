window.addEventListener('message', function (event) {
  if (event.data.action === "openBankUI") {
    document.getElementById("banka-cerceve").style.display = "block";

    // Oyuncu verisini al ve UI'ya aktar
    const playerMoney = event.data.money;
    if (playerMoney && playerMoney.bank !== undefined) {
      document.querySelector('.bakiye-bilgi').textContent = `${playerMoney.bank} $`;
    }
  }

  if (event.data.action === "updateMoney") {
    const playerMoney = event.data.money;
    if (playerMoney && playerMoney.bank !== undefined) {
      document.querySelector('.bakiye-bilgi').textContent = `${playerMoney.bank} $`;
    }
  }

  if (event.data.action === "closeBankUI") {
    document.getElementById("banka-cerceve").style.display = "none";
    fetch(`https://turkish-banking/close`, {
      method: "POST"
    });
  }
});


document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    document.getElementById("banka-cerceve").style.display = "none";
    fetch(`https://turkish-banking/close`, {
      method: "POST"
    });
  }
});

document.querySelectorAll('.banka-kapat, .banka-cıkıs').forEach(el => {
  el.addEventListener('click', () => {
    document.getElementById("banka-cerceve").style.display = "none";
    fetch(`https://${GetParentResourceName()}/close`, {
      method: "POST"
    });
  });
});

function fadeOut(el, duration = 300) {
  el.style.opacity = 1;
  let last = +new Date();
  const tick = () => {
    el.style.opacity = +el.style.opacity - (new Date() - last) / duration;
    last = +new Date();
    if (+el.style.opacity > 0) {
      requestAnimationFrame(tick);
    } else {
      el.style.display = 'none';
    }
  };
  tick();
}

function fadeIn(el, duration = 300) {
  el.style.opacity = 0;
  el.style.display = 'block';
  let last = +new Date();
  const tick = () => {
    el.style.opacity = +el.style.opacity + (new Date() - last) / duration;
    last = +new Date();
    if (+el.style.opacity < 1) {
      requestAnimationFrame(tick);
    }
  };
  tick();
}

document.querySelectorAll('.banka-footer > div').forEach(item => {
  item.addEventListener('click', () => {
    if (item.classList.contains('banka-cıkıs')) {
      document.getElementById("banka-cerceve").style.display = "none";
      fetch(`https://${GetParentResourceName()}/closeBankUI`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      return;
    }

    // Eğer zaten aktifse tıklamayı görmezden gel
    if (item.classList.contains('active')) {
      return;
    }

    // Aktifliği güncelle
    document.querySelectorAll('.banka-footer > div').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Hedef sayfayı belirle
    let pageClass = "";
    if (item.classList.contains('banka-anasayfa')) {
      pageClass = '.banka-ana-sayfa';
    } else if (item.classList.contains('banka-faturalar')) {
      pageClass = '.banka-faturalar-sayfa';
    } else if (item.classList.contains('banka-yatırımlar')) {
      pageClass = '.banka-yatirimlar-sayfa';
    } else if (item.classList.contains('banka-kripto')) {
      pageClass = '.banka-kripto-sayfa';
    } else if (item.classList.contains('banka-gecmis')) {
      pageClass = '.banka-gecmis-sayfa';
    } else if (item.classList.contains('banka-ayarlar')) {
      pageClass = '.banka-ayarlar-sayfa';
    }

    // Mevcut açık sayfaları kapat
    document.querySelectorAll('[class$="-sayfa"]').forEach(page => {
      if (page.style.display !== 'none') {
        fadeOut(page, 200);
      } else {
        page.style.display = 'none';
      }
    });

    // Yeni sayfayı aç
    if (pageClass) {
      const targetPage = document.querySelector(pageClass);
      setTimeout(() => {
        fadeIn(targetPage, 200);
      }, 200);
    }
  });
});





  const data = [10000, 50000, 100000, 500000, 1000000, 250000, 10000000];

  function getSmoothPath(points) {
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x},${points[i].y} ${xc},${yc}`;
    }
    return d;
  }

function getDayLabel(dateStr) {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function prepareWeeklyIncomeData(history) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const incomeByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  // Son günü bul (örnek: Thu)
  const latestDate = new Date(Math.max(...history.map(tx => new Date(tx.date))));
  const latestDay = getDayLabel(latestDate);

  // Yeşil işlemleri günlere göre grupla
  history.forEach(tx => {
    if (tx.color === 'green') {
      const day = getDayLabel(tx.date);
      if (incomeByDay[day] !== undefined) {
        incomeByDay[day] += tx.amount;
      }
    }
  });

  // Grafikte bugüne kadar olan günleri al (örnek: Mon–Thu)
  const endIndex = days.indexOf(latestDay);
  const activeDays = days.slice(0, endIndex + 1);

  const values = activeDays.map(day => incomeByDay[day]);

  return { values, activeDays };
}

function drawSmoothGraph(values) {
  const svg = document.getElementById('paraSvg');
  if (!svg) return;

  const width = 100;
  const height = 40;

function getAdjustedMax(values) {
  const max = Math.max(...values);

  if (max <= 20) return 100;       
  if (max <= 350) return 900;      
  if (max <= 800) return 100;      
  if (max <= 900) return 200;      
  if (max <= 5000) return 100;  
  return 120000;                
}

  const max = getAdjustedMax(values);

  if (!values || values.length < 2) {
    // Düz çizgiyi grafik yüksekliğinin en altında çiz
    svg.innerHTML = `<path d="M 0,${height} L ${width},${height}" fill="none" stroke="#4a90e2" stroke-width="1.5"/>`;
    return;
  }

  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = Math.max(2, height - (v / max) * height);
    return { x, y };
  });

  const pathData = getSmoothPath(points);
  svg.innerHTML = `
    <path d="${pathData}" fill="none" stroke="#4a90e2" stroke-width="1.5"/>
    <path d="${pathData} L ${points[points.length - 1].x},${height} L 0,${height} Z"
      fill="rgba(74,144,226,0.15)" stroke="none" />
  `;
}

  const bakiyeKonteyner = document.querySelector('.bakiye-konteyner');

bakiyeKonteyner.addEventListener('wheel', function (e) {
  e.preventDefault();
  bakiyeKonteyner.scrollLeft += e.deltaY;
});

  const satButonlari = document.querySelectorAll('.banka-kripto-sat');
  const alButonlari = document.querySelectorAll('.banka-kripto-al');
  const modal = document.querySelector('.kripto-satis-modal');
  const closeBtn = document.querySelector('.modal-close');
  const onayBtn = document.getElementById('modal-onay');
  const baslik = document.getElementById('modal-baslik');
  const kazanc = document.getElementById('modal-kazanc');
  const adetInput = document.getElementById('satis-adet');

  let islemTipi = 'sat'; 
  let birimFiyat = 0;
  let coinAdi = '';

  function modalAc(tip, coin, fiyat) {
    islemTipi = tip;
    coinAdi = coin;
    birimFiyat = fiyat;

    baslik.textContent = `${coin} ${tip === 'sat' ? 'Satışı' : 'Alımı'}`;
    onayBtn.textContent = tip === 'sat' ? 'Satışı Onayla' : 'Satın Al';
    kazanc.textContent = 'Toplam: 0$';
    adetInput.value = '';
    modal.style.display = 'flex';
  }

  satButonlari.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.banka-kripto-item');
      const coin = item.querySelector('.banka-kripto-header').textContent;
      const fiyat = parseFloat(item.querySelector('.banka-kripto-fiyat').textContent.replace('$', ''));
      modalAc('sat', coin, fiyat);
    });
  });

  alButonlari.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.banka-kripto-item');
      const coin = item.querySelector('.banka-kripto-header').textContent;
      const fiyat = parseFloat(item.querySelector('.banka-kripto-fiyat').textContent.replace('$', ''));
      modalAc('al', coin, fiyat);
    });
  });

  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  adetInput.addEventListener('input', () => {
    const adet = parseFloat(adetInput.value) || 0;
    const toplam = adet * birimFiyat;
    kazanc.textContent = `Toplam: ${toplam.toLocaleString('en-US', {minimumFractionDigits: 2})}$`;
  });

  onayBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

function setTheme(theme) {
  const cerceve = document.getElementById("banka-cerceve");
  if (theme === "light") {
    cerceve.style.background = "linear-gradient(#162531,rgb(26, 78, 150))";
  } else {
    cerceve.style.background = "linear-gradient(#16222b, #162531, #16222b)";
  }
  localStorage.setItem("bankTheme", theme);
}

document.getElementById("tema-acik").addEventListener("click", () => {
  setTheme("light");
});

document.getElementById("tema-koyu").addEventListener("click", () => {
  setTheme("dark");
});

document.querySelectorAll(".renk-secim").forEach(item => {
  item.addEventListener("click", () => {
    const renk = item.getAttribute("data-renk");
    document.getElementById("banka-cerceve").style.background = renk;
    localStorage.setItem("bankThemeCustom", renk);
  });
});

document.getElementById("tema-sifirla").addEventListener("click", () => {
  localStorage.removeItem("bankTheme");
  localStorage.removeItem("bankThemeCustom");
  setTheme("dark");
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("bankTheme");
  const savedColor = localStorage.getItem("bankThemeCustom");
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme("dark");
  }
  if (savedColor) {
    document.getElementById("banka-cerceve").style.background = savedColor;
  }
});

window.TURKISH = window.TURKISH || {};
TURKISH.BANKING = TURKISH.BANKING || {};
TURKISH.BANKING.CREATE = TURKISH.BANKING.CREATE || {};

TURKISH.BANKING.CREATE._notifyTimeoutId = null; // timeout ID için global değişken

TURKISH.BANKING.CREATE.NOTIFY = function({ Message, icon = 'info' }) {
  const merkez = document.querySelector('.banka-bildirim-merkezi');
  if (!merkez) return;

  // Eğer varsa eski timeout'u iptal et
  if (TURKISH.BANKING.CREATE._notifyTimeoutId) {
    clearTimeout(TURKISH.BANKING.CREATE._notifyTimeoutId);
    TURKISH.BANKING.CREATE._notifyTimeoutId = null;
  }

  merkez.innerHTML = '';

  let ikonHTML = '';
  if (icon === 'success') ikonHTML = '<span class="bildirim-icon">✅</span>';
  else if (icon === 'unsuccess') ikonHTML = '<span class="bildirim-icon">❌</span>';
  else ikonHTML = '<span class="bildirim-icon">ℹ️</span>';

  const icerik = document.createElement('div');
  icerik.className = 'bildirim-icerik';
  icerik.innerHTML = `${ikonHTML}<span>${Message}</span>`;
  merkez.appendChild(icerik);

  merkez.style.width = '44vh';
  merkez.style.height = '6vh';
  merkez.style.bottom = '72vh';

  TURKISH.BANKING.CREATE._notifyTimeoutId = setTimeout(() => {
    merkez.style.width = '14vh';
    merkez.style.height = '4vh';
    merkez.style.bottom = '73vh';
    merkez.innerHTML = '';
    TURKISH.BANKING.CREATE._notifyTimeoutId = null; // timeout temizlendi
  }, 2500);
};

function ekleGecmise(tur, miktar, color = 'transparent') {
  const rgbaColor = color === 'red'
    ? 'rgba(77, 56, 56, 0.7)'
    : color === 'green'
      ? 'rgba(46, 66, 46, 0.7)'
      : 'transparent';

  // 1. konteyner ve header
  const gecmisContainer1 = document.querySelector('.banka-islem-gecmisi');
  const header1 = document.querySelector('.banka-islem-header');

  if (gecmisContainer1 && header1) {
    const div1 = document.createElement('div');
    div1.className = 'banka-islem-item';
    div1.style.backgroundColor = rgbaColor;
    div1.innerHTML = `
      <div class="banka-islem-baslik">${tur}</div>
      <div class="banka-islem-tutar">${miktar} $</div>
    `;
    header1.insertAdjacentElement('afterend', div1);
  }

  // 2. konteyner ve header
  const header2 = document.querySelector('.banka-islem-header2');
  if (header2) {
    const div2 = document.createElement('div');
    div2.className = 'banka-islem-item2';
    div2.style.backgroundColor = rgbaColor;
    div2.innerHTML = `
      <div class="banka-islem-baslik2">${tur}</div>
      <div class="banka-islem-tutar2">${miktar} $</div>
    `;
    header2.insertAdjacentElement('afterend', div2);
  }
}

document.getElementById('buton-para-yatir').addEventListener('click', () => {
  const amount = parseInt(document.getElementById('deposit-amount').value);
  if (!amount || amount <= 0) {
    return TURKISH.BANKING.CREATE.NOTIFY({ Message: 'Geçersiz miktar!', icon: 'unsuccess' });
  }

  fetch(`https://turkish-banking/deposit`, {
    method: "POST",
    body: JSON.stringify({ amount })
  });
});

document.getElementById('buton-para-cek').addEventListener('click', () => {
  const amount = parseInt(document.getElementById('withdraw-amount').value);
  if (!amount || amount <= 0) {
    return TURKISH.BANKING.CREATE.NOTIFY({ Message: 'Geçersiz miktar!', icon: 'unsuccess' });
  }

  fetch(`https://turkish-banking/withdraw`, {
    method: "POST",
    body: JSON.stringify({ amount })
  });
});

document.getElementById('buton-para-gonder').addEventListener('click', () => {
  const amount = parseInt(document.getElementById('send-amount').value);
  const receiver = document.getElementById('send-receiver').value;

  if (!amount || amount <= 0 || !receiver) {
    return TURKISH.BANKING.CREATE.NOTIFY({ Message: 'Geçersiz bilgi!', icon: 'unsuccess' });
  }

  fetch(`https://turkish-banking/send`, {
    method: "POST",
    body: JSON.stringify({ amount, receiver })
  });
});

window.addEventListener('message', function(event) {
  const data = event.data;
  if (!data) return;

  if (data.action === "showNotify") {
    TURKISH.BANKING.CREATE.NOTIFY({
      Message: data.message,
      icon: data.icon
    });
  }
});

const islemKayitSeti = new Set();

window.addEventListener("message", function (event) {
  const data = event.data;

  if (data.action === "loadHistory" && data.history) {
    // ✅ Sadece color === 'green' olanları grafik için filtrele
    const greenValues = data.history
      .filter(tx => tx.color === 'green')
      .map(tx => tx.amount);

    drawSmoothGraph(greenValues); // 🎯 Grafik sadece gelen paralardan oluşur

    // 🔁 İşlem geçmişini DOM'a ekleme
  data.history.slice().reverse().forEach(tx => {
    const key = `${tx.type}_${tx.amount}_${tx.id}`;
  
    if (!islemKayitSeti.has(key)) {
      islemKayitSeti.add(key);
      ekleGecmise(tx.type, tx.amount, tx.color);
    }
  });
  }
});

    window.onload = function() {
        fetch(`https://${GetParentResourceName()}/getPlayerName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({})
        }).then(resp => resp.json()).then(data => {
            document.querySelector(".merhaba").innerText = `Merhaba ${data.name}`;
        });
    };
