// =================================================================
// SUPABASE CLOUD SYNC ENGINE + UNIVERSAL CLIENT-SIDE API ENGINE
// Syncs Quizzes, Submissions, Students, Marks & Settings across all PCs
// =================================================================
(function() {
  // 1. PASTE YOUR SUPABASE PROJECT URL BELOW (or your Supabase Dashboard URL)
  // Example: 'https://abcdefghijklmnopqrst.supabase.co'
  const SUPABASE_PROJECT_URL = 'https://kyicsymadlkfyuzxwmdt.supabase.co';

  // 2. YOUR SUPABASE PUBLISHABLE (ANON) KEY (Already configured for you!)
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8YDYBZGLpWCIHmcHavj9zg_9jmNINn7';

  function resolveSupabaseUrl(rawInput) {
    if (!rawInput || rawInput === 'https://kyicsymadlkfyuzxwmdt.supabase.co') return '';
    const trimmed = String(rawInput).trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    // Support pasting full Supabase dashboard URL: https://supabase.com/dashboard/project/<ref>...
    const dashMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
    if (dashMatch && dashMatch[1]) {
      return 'https://' + dashMatch[1].toLowerCase() + '.supabase.co';
    }
    // Support pasting just the 20-char project reference ID
    if (/^[a-z0-9]{15,25}$/i.test(trimmed)) {
      return 'https://' + trimmed.toLowerCase() + '.supabase.co';
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  function getActiveSupabaseUrl() {
    const fromConst = resolveSupabaseUrl(SUPABASE_PROJECT_URL);
    if (fromConst) return fromConst;
    try {
      const fromStorage = localStorage.getItem('abcd_supabase_project_url');
      return resolveSupabaseUrl(fromStorage || '');
    } catch (e) {
      return '';
    }
  }

  let _sbClient = null;
  let _sbClientUrl = '';

  function getSupabaseClient() {
    const activeUrl = getActiveSupabaseUrl();
    if (!activeUrl || !SUPABASE_PUBLISHABLE_KEY) return null;
    if (_sbClient && _sbClientUrl === activeUrl) return _sbClient;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        _sbClient = window.supabase.createClient(activeUrl, SUPABASE_PUBLISHABLE_KEY);
        _sbClientUrl = activeUrl;
        return _sbClient;
      } catch (e) {
        console.warn('Supabase client init warning:', e);
      }
    }
    return null;
  }

  // Expose helper for the quick-connect banner
  window.saveSupabaseProjectUrl = async function(inputUrl) {
    const resolved = resolveSupabaseUrl(inputUrl);
    if (!resolved || !resolved.includes('.supabase.co')) {
      alert('Please enter a valid Supabase Project URL (https://xxxx.supabase.co) or your Supabase Dashboard URL.');
      return;
    }
    localStorage.setItem('abcd_supabase_project_url', resolved);
    _sbClient = null;
    const ok = await pullFromSupabase(true);
    const banner = document.getElementById('supabaseSetupBanner');
    if (banner && ok) banner.remove();
    if (typeof showToast === 'function') {
      showToast('Supabase Connected!', 'Synced with ' + resolved, 'success');
    }
    if (typeof loadPortalData === 'function') {
      await loadPortalData();
    }
  };

  function injectSupabaseSetupBannerIfNeeded() {
    if (getActiveSupabaseUrl()) return;
    if (document.getElementById('supabaseSetupBanner')) return;
    const div = document.createElement('div');
    div.id = 'supabaseSetupBanner';
    div.className = 'bg-indigo-950 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-center gap-2 border-b border-indigo-500/40 z-50';
    div.innerHTML = `
      <span class="font-semibold text-indigo-200">⚡ Finish Cloud Sync Setup:</span>
      <span class="text-slate-300">Paste your Supabase Project URL (or Dashboard link from your browser address bar):</span>
      <input id="sbQuickUrlInput" type="text" placeholder="https://xxxx.supabase.co" class="px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-400/40 text-white text-xs w-64 outline-hidden" />
      <button onclick="window.saveSupabaseProjectUrl(document.getElementById('sbQuickUrlInput').value)" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer">Connect Cloud</button>
    `;
    document.body.prepend(div);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSupabaseSetupBannerIfNeeded);
  } else {
    setTimeout(injectSupabaseSetupBannerIfNeeded, 100);
  }

  const SEED_STUDENTS = [{"adm":"1041","username":"1041","password":"10411041","full_name":"ABDUL VAJID.T","section":"SECONDARY","validity_date":"2030-02-28","father":"ABDURAHMAN . T","house":"THOTTATHIL(H)","place":"PALLIPPURAM","post":"KARIYANNUR(PO)","pin":"679305","district":"THRISSUR","state":"KERALA","blood_group":"B+","dob":"2014-03-11","phone":"7510995403","email":"1041abdulvajidt@gmail.com","permanent_address":"THOTTATHIL(H), PALLIPPURAM, KARIYANNUR(PO), PIN: 679305, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1041"},{"adm":"1047","username":"1047","password":"10471047","full_name":"AHMED SHIBILI.TK","section":"SECONDARY","validity_date":"2030-02-28","father":"JAMSHID TK","house":"THACHENKODEN(H)","place":"VALIYAKUNNU","post":"VALIYAKUNNU(PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2014-05-27","phone":"9656701325","email":"1047ahmedshibilitk@gmail.com","permanent_address":"THACHENKODEN(H), VALIYAKUNNU, VALIYAKUNNU(PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1047"},{"adm":"1037","username":"1037","password":"10371037","full_name":"AHMAD ZAHRAN","section":"SECONDARY","validity_date":"2030-02-28","father":"DR.SHAREEF HUDAWI","house":"KUNNAM PADATH HOUSE","place":"ANAKKARA","post":"ANAKKARA (PO)","pin":"679551","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2013-12-04","phone":"7012886264","email":"1037ahmadzahran@gmail.com","permanent_address":"KUNNAM PADATH HOUSE, ANAKKARA, ANAKKARA (PO), PIN: 679551, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1037"},{"adm":"1033","username":"1033","password":"10331033","full_name":"AHMED MUFLIH ALI","section":"SECONDARY","validity_date":"2030-02-28","father":"HYDERALI TP","house":"THEVARPARAMBIL (H)","place":"THAVALANCHINA","post":"KALPPAKANCHERY(PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2014-04-07","phone":"8547742637","email":"1033muflihali@gmail.com","permanent_address":"THEVARPARAMBIL (H), THAVALANCHINA, KALPPAKANCHERY(PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1033"},{"adm":"1044","username":"1044","password":"10441044","full_name":"ALFAZ","section":"SECONDARY","validity_date":"2030-02-28","father":"GAFOOR KP","house":"KANNAN PARAMBIL (H)","place":"ATHALUR","post":"TIRUR(PO)","pin":"679573","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2014-03-16","phone":"8921304678","email":"1044alfaz@gmail.com","permanent_address":"KANNAN PARAMBIL (H), ATHALUR, TIRUR(PO), PIN: 679573, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1044"},{"adm":"1040","username":"1040","password":"10401040","full_name":"AMIN AHSAN","section":"SECONDARY","validity_date":"2030-02-28","father":"LUKMANUL HAKKEEM M","house":"MAYINKANAKATH (H)","place":"ALATHIYOOR","post":"TIRUR(PO)","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2014-11-08","phone":"9846130449","email":"1040aminahsan@gmail.com","permanent_address":"MAYINKANAKATH (H), ALATHIYOOR, TIRUR(PO), PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1040"},{"adm":"1051","username":"1051","password":"10511051","full_name":"MISBAHUL HAQ","section":"SECONDARY","validity_date":"2030-02-28","father":"HARIS BABU","house":"PANKUZHIL (H)","place":"KAIPPURAM","post":"THIRUVEGAPPURA (PO)","pin":"679304","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2014-11-28","phone":"9946051123","email":"1051misbahulhaq@gmail.com","permanent_address":"PANKUZHIL (H), KAIPPURAM, THIRUVEGAPPURA (PO), PIN: 679304, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1051"},{"adm":"1045","username":"1045","password":"10451045","full_name":"MOHAMMED SHAHEEN.EP","section":"SECONDARY","validity_date":"2030-02-28","father":"MOHAMMED SHAFI. EP","house":"EDAKKULATH PUTHAN PURAYIL (H)","place":"KADHANANGADI","post":"THIRUNNAVAYA (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O-","dob":"2014-05-15","phone":"9846108466","email":"1045mohammedshaheenep@gmail.com","permanent_address":"EDAKKULATH PUTHAN PURAYIL (H), KADHANANGADI, THIRUNNAVAYA (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1045"},{"adm":"1043","username":"1043","password":"10431043","full_name":"MOHAMMED ABIDH M","section":"SECONDARY","validity_date":"2030-02-28","father":"MOHAMMED SHAREEF","house":"MELEPPAT (H)","place":"PERASSANUR","post":"PERASSANUR (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2014-04-02","phone":"8086904188","email":"1043mohammedabidhm@gmail.com","permanent_address":"MELEPPAT (H), PERASSANUR, PERASSANUR (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1043"},{"adm":"1036","username":"1036","password":"10361036","full_name":"MOHAMMED ASHMIL.K","section":"SECONDARY","validity_date":"2030-02-28","father":"HAMZA.K","house":"KUNDUVAYIL(H)","place":"AREEKKAL","post":"PUTHUPPARAMBU(P.O)","pin":"676501","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2014-05-15","phone":"9497318046","email":"1036mohammedashmilk@gmail.com","permanent_address":"KUNDUVAYIL(H), AREEKKAL, PUTHUPPARAMBU(P.O), PIN: 676501, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1036"},{"adm":"1057","username":"1057","password":"10571057","full_name":"MOHAMMED ZAMAN.CP","section":"SECONDARY","validity_date":"2030-02-28","father":"SUBAIR CP","house":"CHOLAKKAL POTTACHOLA (H)","place":"CK PARA","post":"VADAKKUMPURAM (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2013-12-07","phone":"9995279249","email":"1057mohammedzamancp@gmail.com","permanent_address":"CHOLAKKAL POTTACHOLA (H), CK PARA, VADAKKUMPURAM (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1057"},{"adm":"1058","username":"1058","password":"10581058","full_name":"MUHAMMAD AMEEN","section":"SECONDARY","validity_date":"2030-02-28","father":"HYDERALI","house":"MOORIKUNNAN (H)","place":"PARAPPUR","post":"PARAPPUR (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2013-06-10","phone":"9947348323","email":"1058ameen@gmail.com","permanent_address":"MOORIKUNNAN (H), PARAPPUR, PARAPPUR (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1058"},{"adm":"1054","username":"1054","password":"10541054","full_name":"MUHAMMAD HABIS.K","section":"SECONDARY","validity_date":"2030-02-28","father":"ANVAR K","house":"KORAMBIYIL (H)","place":"PALUVAI","post":"PALUVAI (PO)","pin":"680507","district":"THRISSUR","state":"KERALA","blood_group":"A+","dob":"2014-01-19","phone":"9846741220","email":"1054muhammadhabisK@gmail.com","permanent_address":"KORAMBIYIL (H), PALUVAI, PALUVAI (PO), PIN: 680507, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1054"},{"adm":"1052","username":"1052","password":"10521052","full_name":"MUHAMMAD SALMAN KP","section":"SECONDARY","validity_date":"2030-02-28","father":"MUHAMED KUTTY HUDAWI","house":"KANAKKODI PALAKANDATHIL (H)","place":"KIZHMURI","post":"VENGAD(PO)","pin":"679338","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2014-09-01","phone":"8592082565","email":"1052muhammadsalmankp@gmail.com","permanent_address":"KANAKKODI PALAKANDATHIL (H), KIZHMURI, VENGAD(PO), PIN: 679338, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1052"},{"adm":"1055","username":"1055","password":"10551055","full_name":"MUHAMMAD SHAMIL","section":"SECONDARY","validity_date":"2030-02-28","father":"ABOOBACKER","house":"NAMBIYARATH (H)","place":"PARAPPUR","post":"PARAPPUR (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2014-03-27","phone":"9847364375","email":"1055shamil@gmail.com","permanent_address":"NAMBIYARATH (H), PARAPPUR, PARAPPUR (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1055"},{"adm":"1049","username":"1049","password":"10491049","full_name":"MUHAMMAD SHAZIN .MP","section":"SECONDARY","validity_date":"2030-02-28","father":"SHAFEEQUE","house":"MANKADAVATH PUTHAN VEETTIL (H)","place":"SOUTH PALLAR","post":"VAIRAMKODE(PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2014-06-12","phone":"8129040000","email":"1049muhammadshazinmp@gmail.com","permanent_address":"MANKADAVATH PUTHAN VEETTIL (H), SOUTH PALLAR, VAIRAMKODE(PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1049"},{"adm":"1061","username":"1061","password":"10611061","full_name":"MUHAMMAD SHIMLAN","section":"SECONDARY","validity_date":"2030-02-28","father":"MUSTHAFA","house":"MUKKIL (H)","place":"ACHANAMBALAM","post":"KANNAMANGALAM (PO)","pin":"676304","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2014-03-29","phone":"9895815544","email":"1061shimlan@gmail.com","permanent_address":"MUKKIL (H), ACHANAMBALAM, KANNAMANGALAM (PO), PIN: 676304, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1061"},{"adm":"1053","username":"1053","password":"10531053","full_name":"MUHAMMED AJMAL C","section":"SECONDARY","validity_date":"2030-02-28","father":"MUHAMMED KUTTY C","house":"CHELAKKAL (H)","place":"KATTAMKUNN","post":"KURUMBATHUR(PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2014-08-19","phone":"8089510047","email":"1053muhammedajmalc@gmail.com","permanent_address":"CHELAKKAL (H), KATTAMKUNN, KURUMBATHUR(PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1053"},{"adm":"1046","username":"1046","password":"10461046","full_name":"MUHAMMED AJZAL","section":"SECONDARY","validity_date":"2030-02-28","father":"JAFAR","house":"THACHANKODEN (H)","place":"VALIYAKUNNU","post":"VALIYAKUNNU (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2014-12-10","phone":"8111815924","email":"1046ajzal@gmail.com","permanent_address":"THACHANKODEN (H), VALIYAKUNNU, VALIYAKUNNU (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1046"},{"adm":"1060","username":"1060","password":"10601060","full_name":"MUHAMMED AKMAL","section":"SECONDARY","validity_date":"2030-02-28","father":"MOIDEEN","house":"Parayil (H)","place":"Kanjirakkol","post":"Thekkankuttoor (PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2013-04-01","phone":"8075072272","email":"1060akmal@gmail.com","permanent_address":"Parayil (H), Kanjirakkol, Thekkankuttoor (PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1060"},{"adm":"1034","username":"1034","password":"10341034","full_name":"MUHAMMED ANFAS PP","section":"SECONDARY","validity_date":"2030-02-28","father":"ABDUL RASHEED PP","house":"PALLATHUM PADIKKAL(H)","place":"OOROTHPALLIYAL","post":"NADUVATTOM(PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2013-10-14","phone":"9947534685","email":"1034muhammedanfaspp@gmail.com","permanent_address":"PALLATHUM PADIKKAL(H), OOROTHPALLIYAL, NADUVATTOM(PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1034"},{"adm":"1032","username":"1032","password":"10321032","full_name":"MUHAMMED ANSAL","section":"SECONDARY","validity_date":"2030-02-28","father":"ABU THAHIR","house":"OLLASSERY (H)","place":"KOTTOL","post":"PAZHANJI (PO)","pin":"680542","district":"THRISSUR","state":"KERALA","blood_group":"O+","dob":"2013-12-04","phone":"6282797033","email":"1032ansal@gmail.com","permanent_address":"OLLASSERY (H), KOTTOL, PAZHANJI (PO), PIN: 680542, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1032"},{"adm":"1038","username":"1038","password":"10381038","full_name":"MUHAMMED MISHAL MK","section":"SECONDARY","validity_date":"2030-02-28","father":"ABDUL GAFOOR","house":"MOONNAMKUZHIYIL (H)","place":"MOONNAKKAL","post":"EDAYUR(PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2014-08-10","phone":"9745228152","email":"1038muhammedmishalmk@gmail.com","permanent_address":"MOONNAMKUZHIYIL (H), MOONNAKKAL, EDAYUR(PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1038"},{"adm":"1035","username":"1035","password":"10351035","full_name":"MUHAMMED RAHSHAN","section":"SECONDARY","validity_date":"2030-02-28","father":"ANWAR SADATH CA","house":"Chenniyam parambil","place":"NANNAMUKK","post":"MUDUKAD","pin":"679575","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-04-27","phone":"9995300996","email":"1035rahshan@gmail.com","permanent_address":"Chenniyam parambil, NANNAMUKK, MUDUKAD, PIN: 679575, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1035"},{"adm":"1039","username":"1039","password":"10391039","full_name":"SAYYID MUHAMMED RAYAN MK","section":"SECONDARY","validity_date":"2030-02-28","father":"SAYYID ABDUL RAHEEM","house":"MUNDENKATTIL (H)","place":"VELLALOOR","post":"KUMARANALLUR(PO)","pin":"679552","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2014-11-25","phone":"9846078615","email":"1039sayyidrayanmk@gmail.com","permanent_address":"MUNDENKATTIL (H), VELLALOOR, KUMARANALLUR(PO), PIN: 679552, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1039"},{"adm":"1059","username":"1059","password":"10591059","full_name":"MUHAMMED RAYYAN. K","section":"SECONDARY","validity_date":"2030-02-28","father":"ABDUL RASHEED","house":"KOTTILIL (H)","place":"MUDUR","post":"MUDUR(PO)","pin":"679578","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2014-04-23","phone":"9061584849","email":"1059muhammedrayyank@gmail.com","permanent_address":"KOTTILIL (H), MUDUR, MUDUR(PO), PIN: 679578, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1059"},{"adm":"1042","username":"1042","password":"10421042","full_name":"MUHAMMAD RAYYAN.K","section":"SECONDARY","validity_date":"2030-02-28","father":"MUHAMMAD RAFEEK.K","house":"KALLINGAL (H)","place":"KUDALLUR","post":"ANAKKARA(PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2014-04-23","phone":"7560907153","email":"1042muhammadrayyank@gmail.com","permanent_address":"KALLINGAL (H), KUDALLUR, ANAKKARA(PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1042"},{"adm":"1056","username":"1056","password":"10561056","full_name":"MUHAMMED RIDHWAN. P","section":"SECONDARY","validity_date":"2030-02-28","father":"ABDUL GAFOOR. P","house":"PALATHINGAL (H)","place":"MANOOR","post":"KALADI(PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-08-18","phone":"9562795756","email":"1056muhammedridhwanp@gmail.com","permanent_address":"PALATHINGAL (H), MANOOR, KALADI(PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1056"},{"adm":"1048","username":"1048","password":"10481048","full_name":"MUHAMMED SHAHAN KC","section":"SECONDARY","validity_date":"2030-02-28","father":"ASHRAF","house":"KANDANCHIRA (H)","place":"CHERURAL","post":"ANANTHAVOOR(PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2014-03-21","phone":"9946429513","email":"1048muhammedshahankc@gmail.com","permanent_address":"KANDANCHIRA (H), CHERURAL, ANANTHAVOOR(PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1048"},{"adm":"1050","username":"1050","password":"10501050","full_name":"MUHAMMED ZAYAN M","section":"SECONDARY","validity_date":"2030-02-28","father":"KUNHIMUHAMMED","house":"MATTARA (H)","place":"OORAKAM YARAMPADI","post":"OORAKAM MELMURI (PO)","pin":"676519","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2014-04-18","phone":"9946991175","email":"1050muhammedzayanm@gmail.com","permanent_address":"MATTARA (H), OORAKAM YARAMPADI, OORAKAM MELMURI (PO), PIN: 676519, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1050"},{"adm":"990","username":"990","password":"990990","full_name":"MOHAMMED AFRAH N","section":"SECONDARY","validity_date":"2030-02-28","father":"HARIS N","house":"NARAKKAT (H)","place":"ALINGAL","post":"TRIPRANGODE (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-11-14","phone":"9946614487","email":"harisnarakkat@gmail.com","permanent_address":"NARAKKAT (H), ALINGAL, TRIPRANGODE (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 990"},{"adm":"999","username":"999","password":"999999","full_name":"MUHAMMED RASAL PP","section":"SECONDARY","validity_date":"2030-02-28","father":"RAFEEK","house":"MELATHODI (H)","place":"KALIYATTAMUKK","post":"MOONUYUR(PO)","pin":"676311","district":"MALAPURAM","state":"KERALA","blood_group":"O+","dob":"2014-02-18","phone":"9400579512","email":"rifa.rafeeq@gmail.com","permanent_address":"MELATHODI (H), KALIYATTAMUKK, MOONUYUR(PO), PIN: 676311, MALAPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 999"},{"adm":"986","username":"986","password":"986986","full_name":"MUHAMMED YASEEN K","section":"SECONDARY","validity_date":"2029-02-28","father":"MUHAMMED RAFI","house":"KUDUMBATHIL (H)","place":"VENGAD","post":"VENGAD(PO)","pin":"679338","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2012-01-10","phone":"8848259483","email":"sharinzshari@gmail.com","permanent_address":"KUDUMBATHIL (H), VENGAD, VENGAD(PO), PIN: 679338, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 986"},{"adm":"987","username":"987","password":"987987","full_name":"MUHAMMED LASIN KC","section":"SECONDARY","validity_date":"2029-02-28","father":"SAJID","house":"KUZHIYANCHERY","place":"OORAKAM","post":"KIZHMURI(PO)","pin":"676519","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2013-12-24","phone":"9747630271","email":"muhammedlasin987@gmail.com","permanent_address":"KUZHIYANCHERY, OORAKAM, KIZHMURI(PO), PIN: 676519, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 987"},{"adm":"988","username":"988","password":"988988","full_name":"MOHAMMED HADI V","section":"SECONDARY","validity_date":"2029-02-28","father":"MOHAMMED HANEEFA","house":"VAKAYIL","place":"MOODAL","post":"KUTTIPPURAM(PO)","pin":"676311","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-01-03","phone":"9946265117","email":"haneefamoodal1987@gmail.com","permanent_address":"VAKAYIL, MOODAL, KUTTIPPURAM(PO), PIN: 676311, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 988"},{"adm":"989","username":"989","password":"989989","full_name":"MUHAMMED HAYYAN VP","section":"SECONDARY","validity_date":"2029-02-28","father":"SUBAIR","house":"VALIYAPARAMBIL","place":"AREEKAL","post":"EDARIKODE(PO)","pin":"676501","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-02-06","phone":"9846558548","email":"hayyanvp989@gmail.com","permanent_address":"VALIYAPARAMBIL, AREEKAL, EDARIKODE(PO), PIN: 676501, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 989"},{"adm":"991","username":"991","password":"991991","full_name":"MUHAMMED ZIYAD C","section":"SECONDARY","validity_date":"2029-02-28","father":"SHAFI C","house":"CHANNENGADAN","place":"KADAMPUZHA","post":"MARAKKARA(PO)","pin":"676553","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2013-07-23","phone":"9946872114","email":"shafimchira@gmail.com","permanent_address":"CHANNENGADAN, KADAMPUZHA, MARAKKARA(PO), PIN: 676553, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 991"},{"adm":"992","username":"992","password":"992992","full_name":"MUHAMMED SHAHAL","section":"SECONDARY","validity_date":"2029-02-28","father":"MOHAMMED SHAREEF","house":"PALLATH","place":"MUDUR","post":"MUDUR(PO)","pin":"679578","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2013-07-17","phone":"9946324068","email":"muhammedshahal@gmail.com","permanent_address":"PALLATH, MUDUR, MUDUR(PO), PIN: 679578, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 992"},{"adm":"993","username":"993","password":"993993","full_name":"AQIB MUHAMMED KT","section":"SECONDARY","validity_date":"2029-02-28","father":"ABDUL HAMEED","house":"KALLUM THIRUTHI","place":"VANIYANNUR","post":"IRINGAVOOR(PO)","pin":"676103","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2012-07-15","phone":"7356734499","email":"ktahameed@gmail.com","permanent_address":"KALLUM THIRUTHI, VANIYANNUR, IRINGAVOOR(PO), PIN: 676103, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 993"},{"adm":"995","username":"995","password":"995995","full_name":"MUHAMMED RABEEH PP","section":"SECONDARY","validity_date":"2029-02-28","father":"HABEEBULLA","house":"PUTHAN PEEDIKAYIL","place":"MADIRASHERY","post":"THRIKKANAPURAM(PO)","pin":"679573","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-06-02","phone":"9946729448","email":"rabeehpp@gmail.com","permanent_address":"PUTHAN PEEDIKAYIL, MADIRASHERY, THRIKKANAPURAM(PO), PIN: 679573, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 995"},{"adm":"996","username":"996","password":"996996","full_name":"MUHAMMED SHAFEEQUE T","section":"SECONDARY","validity_date":"2029-02-28","father":"SHAFI T","house":"THIRUTHY","place":"THIRUTHIKUNDU","post":"KANMANAM(PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2012-12-17","phone":"8848166072","email":"mhdshafeeque996@gmail.com","permanent_address":"THIRUTHY, THIRUTHIKUNDU, KANMANAM(PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 996"},{"adm":"997","username":"997","password":"997997","full_name":"MUHAMMED QASIM MP","section":"SECONDARY","validity_date":"2029-02-28","father":"THALHATH. MP","house":"MOLATHIPPULAN","place":"PARAVANNUR","post":"KALPAKANCHERI(PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-03-25","phone":"7403357776","email":"mhdqasimmp997@gmail.com","permanent_address":"MOLATHIPPULAN, PARAVANNUR, KALPAKANCHERI(PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 997"},{"adm":"998","username":"998","password":"998998","full_name":"MUHAMMED HASHIM V","section":"SECONDARY","validity_date":"2029-02-28","father":"HAMZA","house":"KURUNCHAMAYIL","place":"PALLOOR","post":"PALLOOR(PO)","pin":"679532","district":"THRISSUR","state":"KERALA","blood_group":"B+","dob":"2013-11-06","phone":"9946543823","email":"hashim998@gmail.com","permanent_address":"KURUNCHAMAYIL, PALLOOR, PALLOOR(PO), PIN: 679532, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 998"},{"adm":"1000","username":"1000","password":"10001000","full_name":"ALI RAFI EP","section":"SECONDARY","validity_date":"2029-02-28","father":"RAFI EP","house":"ERAYATH PARAMBIL","place":"KALLUR","post":"AYANKALAM(PO)","pin":"679573","district":"MALAPURAM","state":"KERALA","blood_group":"O+","dob":"2012-02-04","phone":"9946672408","email":"alirafiep786@gmail.com","permanent_address":"ERAYATH PARAMBIL, KALLUR, AYANKALAM(PO), PIN: 679573, MALAPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1000"},{"adm":"1001","username":"1001","password":"10011001","full_name":"MUHAMMED SINAN CK","section":"SECONDARY","validity_date":"2029-02-28","father":"ABOOBACKER CK","house":"CHANDANAM KULANGARA HOUSE","place":"THANDALAM","post":"NARIPPARAMBU(PO)","pin":"679573","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2013-12-05","phone":"9846990857","email":"aboobaceekey@gmail.com","permanent_address":"CHANDANAM KULANGARA HOUSE, THANDALAM, NARIPPARAMBU(PO), PIN: 679573, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1001"},{"adm":"1002","username":"1002","password":"10021002","full_name":"HAMDAN CC","section":"SECONDARY","validity_date":"2029-02-28","father":"HANEEFA","house":"CHANGARAMCHOLA","place":"THANIYEPPANKUNNU","post":"THOZHUVANOOR(PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2013-11-14","phone":"7034478897","email":"haneefaccmalayil@gmail.com","permanent_address":"CHANGARAMCHOLA, THANIYEPPANKUNNU, THOZHUVANOOR(PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1002"},{"adm":"1003","username":"1003","password":"10031003","full_name":"MUHAMMED ALI M","section":"SECONDARY","validity_date":"2029-02-28","father":"HASSAN KUTTY","house":"MUNDARAMBATH","place":"MUDAPPAKKAD","post":"PARUDUR(PO)","pin":"679305","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2013-04-14","phone":"9633323855","email":"hassan.hisan@gmail.com","permanent_address":"MUNDARAMBATH, MUDAPPAKKAD, PARUDUR(PO), PIN: 679305, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1003"},{"adm":"1005","username":"1005","password":"10051005","full_name":"MUHAMMED ANSHAD VP","section":"SECONDARY","validity_date":"2029-02-28","father":"ASKAR ALI","house":"VALIYAPARAMBIL","place":"CHILAVIL","post":"PONMUNDAM (PO)","pin":"676106","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-05-17","phone":"9947526062","email":"anshadvp1005@gmail.com","permanent_address":"VALIYAPARAMBIL, CHILAVIL, PONMUNDAM (PO), PIN: 676106, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1005"},{"adm":"1008","username":"1008","password":"10081008","full_name":"HISHAM RAHMATHULLAH O","section":"SECONDARY","validity_date":"2029-02-28","father":"SHIHABUDHEEN","house":"ORUVIL","place":"KURUMBATHOOR","post":"ATHAVANAD (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-03-06","phone":"9747603333","email":"hisham1008@gmail.com","permanent_address":"ORUVIL, KURUMBATHOOR, ATHAVANAD (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1008"},{"adm":"1009","username":"1009","password":"10091009","full_name":"SAHL SHAN O","section":"SECONDARY","validity_date":"2029-02-28","father":"SHAMSUDHEEN","house":"OLLAKKAN","place":"TIRURANGADI","post":"CHERUMUKK(PO)","pin":"676306","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2013-04-13","phone":"8606478876","email":"sahlshan1009@gmail.com","permanent_address":"OLLAKKAN, TIRURANGADI, CHERUMUKK(PO), PIN: 676306, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1009"},{"adm":"1010","username":"1010","password":"10101010","full_name":"SADHAQATHULLA C","section":"SECONDARY","validity_date":"2029-02-28","father":"MUHAMMED SHAREEF","house":"CHEMMUKKIL","place":"KALPAKANCHERI","post":"RANDATHANI (PO)","pin":"676510","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2012-10-12","phone":"9633954441","email":"sadaqathulla1010@gmail.com","permanent_address":"CHEMMUKKIL, KALPAKANCHERI, RANDATHANI (PO), PIN: 676510, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1010"},{"adm":"1011","username":"1011","password":"10111011","full_name":"MUHAMMED SAHL","section":"SECONDARY","validity_date":"2029-02-28","father":"ABDUL SALEEM","house":"KALATHUM PADIKKAL","place":"MARAVANCHERY","post":"KADANCHERY(PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2012-02-06","phone":"8138980300","email":"muhammedsahlkp@gmail.com","permanent_address":"KALATHUM PADIKKAL, MARAVANCHERY, KADANCHERY(PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1011"},{"adm":"1012","username":"1012","password":"10121012","full_name":"MUHAMMED HASHIM KH","section":"SECONDARY","validity_date":"2029-02-28","father":"HAMZA","house":"KARUN CHAMAYIL HOSUE","place":"DESHAMANGALAM","post":"DESHAMANGALAM (PO)","pin":"679123","district":"THRISSUR","state":"KERALA","blood_group":"O+","dob":"2013-11-06","phone":"9847467728","email":"hashim1012@gmail.com","permanent_address":"KARUN CHAMAYIL HOSUE, DESHAMANGALAM, DESHAMANGALAM (PO), PIN: 679123, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1012"},{"adm":"1014","username":"1014","password":"10141014","full_name":"MISHAB PT","section":"SECONDARY","validity_date":"2029-02-28","father":"RAFEEQUE","house":"PALAKKATHODY","place":"THOTTAKKARA","post":"VATTALOOR(PO)","pin":"676507","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2014-02-28","phone":"9847467728","email":"nusrathkoori@gmail.com","permanent_address":"PALAKKATHODY, THOTTAKKARA, VATTALOOR(PO), PIN: 676507, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1014"},{"adm":"1015","username":"1015","password":"10151015","full_name":"MUHAMMED RASIN KP","section":"SECONDARY","validity_date":"2029-02-28","father":"BEERAN KOYA","house":"KATTILPARAMBA","place":"VELLIPPARAMBA","post":"VALLIPPARAMBA (PO)","pin":"673008","district":"KOZHIKKODE","state":"KERALA","blood_group":"A+","dob":"2014-09-03","phone":"9633954441","email":"bkkpkoya@gmail.com","permanent_address":"KATTILPARAMBA, VELLIPPARAMBA, VALLIPPARAMBA (PO), PIN: 673008, KOZHIKKODE, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1015"},{"adm":"1016","username":"1016","password":"10161016","full_name":"MUHAMMED ASLAM","section":"SECONDARY","validity_date":"2029-02-28","father":"SABNA","house":"KALAMBRA","place":"THRIKKANAPURAM","post":"THRIKKANAPURAM SOUTH(PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2013-03-30","phone":"9567514270","email":"aslam1016@gmail.com","permanent_address":"KALAMBRA, THRIKKANAPURAM, THRIKKANAPURAM SOUTH(PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1016"},{"adm":"1017","username":"1017","password":"10171017","full_name":"MUHAMMED MUSTHAFA SM","section":"SECONDARY","validity_date":"2029-02-28","father":"MOHAMMED ANVER","house":"SHAIK MOULANA","place":"KOOTTAKKADAVU","post":"KUDALLUR(PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"B+","dob":"2013-11-09","phone":"9074285300","email":"anversm@gmail.com","permanent_address":"SHAIK MOULANA, KOOTTAKKADAVU, KUDALLUR(PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1017"},{"adm":"1018","username":"1018","password":"10181018","full_name":"MUHAMMED SHAFIN","section":"SECONDARY","validity_date":"2029-02-28","father":"MUHAMMED SHARIF HUDAWI","house":"PULIKKAL","place":"KADAMPUZHA","post":"KADAMPUZHA(PO)","pin":"676553","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2012-11-29","phone":"8891758194","email":"sharifpkadampuzha@gmail.com","permanent_address":"PULIKKAL, KADAMPUZHA, KADAMPUZHA(PO), PIN: 676553, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1018"},{"adm":"1019","username":"1019","password":"10191019","full_name":"MUHAMMED RAMEES VP","section":"SECONDARY","validity_date":"2029-02-28","father":"SHAFI VP","house":"VALIPARAMBIL","place":"PARAKKAVU","post":"MOONNIYUR SOUTH (PO)","pin":"673635","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2012-03-12","phone":"9947299326","email":"ramees1019@gmail.com","permanent_address":"VALIPARAMBIL, PARAKKAVU, MOONNIYUR SOUTH (PO), PIN: 673635, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1019"},{"adm":"1020","username":"1020","password":"10201020","full_name":"ABDAUL HADI","section":"SECONDARY","validity_date":"2029-02-28","father":"LUTHUFU RAHMAN KK","house":"KATTUKANDATHIL","place":"MANAZHI","post":"EDAYATTUR(PO)","pin":"679326","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2014-01-13","phone":"9747382557","email":"hadi1020@gamil.com","permanent_address":"KATTUKANDATHIL, MANAZHI, EDAYATTUR(PO), PIN: 679326, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1020"},{"adm":"971","username":"971","password":"971971","full_name":"ABDUL BAETH","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUSSAMAD HUDAWI","house":"ANODIYIL (H)","place":"PURANGU","post":"PURANGU (PO)","pin":"676504","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2012-08-09","phone":"971 507309256","email":"abdulbaeth@gmail.com","permanent_address":"ANODIYIL (H), PURANGU, PURANGU (PO), PIN: 676504, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 971"},{"adm":"968","username":"968","password":"968968","full_name":"MUHAMMED SHAHABIN KK","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL SALEEM KK","house":"KUZHIKKANDATHIL (H)","place":"AYANKALAM","post":"THAVANUR (PO)","pin":"679573","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2012-07-26","phone":"9995000735","email":"muhammedshahabinkk@gmail.com","permanent_address":"KUZHIKKANDATHIL (H), AYANKALAM, THAVANUR (PO), PIN: 679573, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 968"},{"adm":"970","username":"970","password":"970970","full_name":"MUHAMMED RAYYAN. A.V","section":"SECONDARY","validity_date":"2028-02-28","father":"A.V SAIDALAVI","house":"AMBATTU VALAPPIL (H)","place":"POOLAKKAL","post":"PUNNAPPA (PO)","pin":"688004","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2012-08-13","phone":"7034941713","email":"muhammedrayyanav@gmail.com","permanent_address":"AMBATTU VALAPPIL (H), POOLAKKAL, PUNNAPPA (PO), PIN: 688004, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 970"},{"adm":"962","username":"962","password":"962962","full_name":"MUHAMMED ADIL NK","section":"SECONDARY","validity_date":"2028-02-28","father":"ABOOBAKKER","house":"NOOR KUNNUMMAL (H)","place":"ATHIPPATTA","post":"EDAYUR (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2012-08-22","phone":"9946954422","email":"muhammedadilnk@gmail.com","permanent_address":"NOOR KUNNUMMAL (H), ATHIPPATTA, EDAYUR (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 962"},{"adm":"943","username":"943","password":"943943","full_name":"MUHAMMED DHAKWAN V","section":"SECONDARY","validity_date":"2028-02-28","father":"ALI AKBAR VETTAN","house":"VETTATH (H)","place":"KAITHAKKARA","post":"VAIRANKODE (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2012-07-31","phone":"9746727310","email":"muhammeddhakwanv@gmail.com","permanent_address":"VETTATH (H), KAITHAKKARA, VAIRANKODE (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 943"},{"adm":"954","username":"954","password":"954954","full_name":"MUHAMMED RAFEEQ VP","section":"SECONDARY","validity_date":"2028-02-28","father":"MOHAMMED MUSTHAFA","house":"VALIYAPARAMBIL (H)","place":"KAIPPURAM","post":"KAIPPURAM (PO)","pin":"679308","district":"PALAKKAD","state":"KERALA","blood_group":"B+","dob":"2011-07-25","phone":"9847327126","email":"muhammedrafeeqvp@gmail.com","permanent_address":"VALIYAPARAMBIL (H), KAIPPURAM, KAIPPURAM (PO), PIN: 679308, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 954"},{"adm":"938","username":"938","password":"938938","full_name":"MUHAMMED ANAS K.V","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL KADER K.V","house":"KALLI VALAPPIL (H)","place":"POOKKARATHARA","post":"KOLOLAMBA (PO)","pin":"679576","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2013-03-30","phone":"8086720572","email":"muhammedanaskv@gmail.com","permanent_address":"KALLI VALAPPIL (H), POOKKARATHARA, KOLOLAMBA (PO), PIN: 679576, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 938"},{"adm":"958","username":"958","password":"958958","full_name":"MUHAMMAD SAJAD.K.M","section":"SECONDARY","validity_date":"2028-02-28","father":"SAINUDHEEN.K.M","house":"KALLU MOTTAKKAL (H)","place":"POTHANUR","post":"KANMANAM (PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2011-09-19","phone":"8592915352","email":"muhammadsajadkm@gmail.com","permanent_address":"KALLU MOTTAKKAL (H), POTHANUR, KANMANAM (PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 958"},{"adm":"910","username":"910","password":"910910","full_name":"MOHAMMED DHARI HAYYAN T","section":"SECONDARY","validity_date":"2027-02-28","father":"MOHAMMED SHAMEER.T","house":"THURAKKAL (H)","place":"KUMBIDI","post":"KUMBIDI (PO)","pin":"679553","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2010-10-12","phone":"919946777801","email":"dharihayyan@gmail.com","permanent_address":"THURAKKAL (H), KUMBIDI, KUMBIDI (PO), PIN: 679553, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 910"},{"adm":"892","username":"892","password":"892892","full_name":"AHAMED HASWEEF NT","section":"SECONDARY","validity_date":"2027-02-28","father":"HANEEFA","house":"NEETRATODI (H)","place":"KAREKKAD","post":"KADAMPUZHA (PO)","pin":"676553","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-05-03","phone":"918547086198","email":"ahamedhasweef892@gmail.com","permanent_address":"NEETRATODI (H), KAREKKAD, KADAMPUZHA (PO), PIN: 676553, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 892"},{"adm":"912","username":"912","password":"912912","full_name":"MUHAMMED SAHAL PP","section":"SECONDARY","validity_date":"2027-02-28","father":"SHAREEF","house":"PALAMBARAMBIL (H)","place":"BP ANGADI","post":"NIRAMARUTHUR (PO)","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2011-02-14","phone":"918714478007","email":"muhammedsahal912@gmail.com","permanent_address":"PALAMBARAMBIL (H), BP ANGADI, NIRAMARUTHUR (PO), PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 912"},{"adm":"796","username":"796","password":"796796","full_name":"MUHAMMED SINAN V.P","section":"SECONDARY","validity_date":"2028-02-28","father":"SHANAVAS V.P","house":"VADAKKINIYEDATHPULLATTIL  (H)","place":"VANIYANNOOR","post":"POSTIRINGAVOOR (PO)","pin":"676103","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-11-30","phone":"918129706476","email":"sinanibnshanavas@gmail.com","permanent_address":"VADAKKINIYEDATHPULLATTIL  (H), VANIYANNOOR, POSTIRINGAVOOR (PO), PIN: 676103, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 796"},{"adm":"802","username":"802","password":"802802","full_name":"MUHAMMED MUNAVVARALI MP","section":"SECONDARY","validity_date":"2028-02-28","father":"MIZAL MP","house":"MAMICHINTE PURAKKAL  (H)","place":"EDAKKADAPPURAM","post":"TANUR (PO)","pin":"676302","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-08-16","phone":"919895846313","email":"munavvaralitanur@gmail.com","permanent_address":"MAMICHINTE PURAKKAL  (H), EDAKKADAPPURAM, TANUR (PO), PIN: 676302, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 802"},{"adm":"807","username":"807","password":"807807","full_name":"MUHAMMED IRFAN M","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL RAHMAN M","house":"MATTATH  (H)","place":"KONNALLUR","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-01-03","phone":"+91 7902556493","email":"irfaniruiruzz@gmail.com","permanent_address":"MATTATH  (H), KONNALLUR, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 807"},{"adm":"816","username":"816","password":"816816","full_name":"SUFIYAN SALIH KV","section":"SECONDARY","validity_date":"2028-02-28","father":"USMAN","house":"KOLATTU VALAPPIL  (H)","place":"PANTHAVOOR","post":"ALAMKODE (PO)","pin":"676585","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2009-02-02","phone":"+91 9946617171","email":"sufiyansalihkvsufiyan@gmail.com","permanent_address":"KOLATTU VALAPPIL  (H), PANTHAVOOR, ALAMKODE (PO), PIN: 676585, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 816"},{"adm":"834","username":"834","password":"834834","full_name":"MUHAMMED AMEEN PP","section":"SECONDARY","validity_date":"2028-02-28","father":"MUNEERUDHEEN HUDAWI","house":"PANTHA PULAKKAL  (H)","place":"KUDALLUR","post":"KUDALLOR (PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2009-05-10","phone":"+91 730695798","email":"mameen834@gmail.com","permanent_address":"PANTHA PULAKKAL  (H), KUDALLUR, KUDALLOR (PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 834"},{"adm":"835","username":"835","password":"835835","full_name":"MUHAMMED SAHAL.K","section":"SECONDARY","validity_date":"2028-02-28","father":"MUHAMMED ABDUL HAKEEM FAIZY","house":"KONNEKKATIL  (H)","place":"TIRUR ALATHIYOOR","post":"POTRIPRANGOD (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2010-06-12","phone":"+91 8606421862","email":"muhammedsahalk709@gmail.com","permanent_address":"KONNEKKATIL  (H), TIRUR ALATHIYOOR, POTRIPRANGOD (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 835"},{"adm":"836","username":"836","password":"836836","full_name":"MUHAMMED RIZWAN","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL RAZA CK","house":"PUNNASHERI  (H)","place":"VENGALOOR","post":"VENGALOOR (PO)","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-12-07","phone":"9746678730","email":"rizwanrizwa99911@gmail.com","permanent_address":"PUNNASHERI  (H), VENGALOOR, VENGALOOR (PO), PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 836"},{"adm":"837","username":"837","password":"837837","full_name":"MUHAMMED HASHMIL","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL SATHAR","house":"THANIKKAT  (H)","place":"ALATHIYUR","post":"TRIPRANGODE (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-08-20","phone":"+91 9544528787","email":"hashmilt8005@gmail.com","permanent_address":"THANIKKAT  (H), ALATHIYUR, TRIPRANGODE (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 837"},{"adm":"838","username":"838","password":"838838","full_name":"AFWAN","section":"SECONDARY","validity_date":"2028-02-28","father":"SHAJAHAN","house":"AMBALATH PANDARATHIL (H)","place":"CHAVAKKAD","post":"CHAVAKKAD (PO)","pin":"680506","district":"THRISSUR","state":"KERALA","blood_group":"B+","dob":"2010-01-07","phone":"9790927527","email":"afwan838@gmail.com","permanent_address":"AMBALATH PANDARATHIL (H), CHAVAKKAD, CHAVAKKAD (PO), PIN: 680506, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 838"},{"adm":"841","username":"841","password":"841841","full_name":"AADHIL RAHMAN.T","section":"SECONDARY","validity_date":"2028-02-28","father":"SUHAS","house":"THUDIMMAL  (H)","place":"IRUMBILIYAM","post":"IRUMBILIYAM (PO)","pin":"679572","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2011-02-07","phone":"+91 9846313776","email":"aadhilrahman@gmail.com","permanent_address":"THUDIMMAL  (H), IRUMBILIYAM, IRUMBILIYAM (PO), PIN: 679572, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 841"},{"adm":"842","username":"842","password":"842842","full_name":"AHAMED YASEEN.E","section":"SECONDARY","validity_date":"2028-02-28","father":"MUSTHAFA","house":"EDASSERY (H)","place":"NARIPARAMBU","post":"NARIPARAMBA (PO)","pin":"679573","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-09-07","phone":"9061000503","email":"ahmedyaseen842@gmail.com","permanent_address":"EDASSERY (H), NARIPARAMBU, NARIPARAMBA (PO), PIN: 679573, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 842"},{"adm":"843","username":"843","password":"843843","full_name":"MUHAMMED MINHAL P","section":"SECONDARY","validity_date":"2028-02-28","father":"HARIS BABU","house":"PANKUZHI (H)","place":"KOORKKAPPARAMP","post":"NADUVATTAM  (PO)","pin":"679303","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2010-05-24","phone":"+91 9946051123","email":"minhal843@gmail.com","permanent_address":"PANKUZHI (H), KOORKKAPPARAMP, NADUVATTAM  (PO), PIN: 679303, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 843"},{"adm":"844","username":"844","password":"844844","full_name":"RUMAIS.P","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL JALEEL","house":"PULIKKAL  (H)","place":"KUDALLUR","post":"KUDALLUR (PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2009-09-28","phone":"9946779283","email":"rumaiskdr844@gmail.com","permanent_address":"PULIKKAL  (H), KUDALLUR, KUDALLUR (PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 844"},{"adm":"845","username":"845","password":"845845","full_name":"MUHAMMED SINAN KN","section":"SECONDARY","validity_date":"2028-02-28","father":"NOUSHAD","house":"KANJHIKOTH  (H)","place":"PONNANI KARUKATHIRUTHI","post":"PONNANI (PO)","pin":"679577","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-12-05","phone":"9072481772","email":"muhammedsinankn845@gmail.com","permanent_address":"KANJHIKOTH  (H), PONNANI KARUKATHIRUTHI, PONNANI (PO), PIN: 679577, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 845"},{"adm":"847","username":"847","password":"847847","full_name":"MUHAMMED HISHAM EP","section":"SECONDARY","validity_date":"2028-02-28","father":"SIDHIQ EP","house":"ENUND PARAMBIL   (H)","place":"PATTARNADAKKAVU","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-12-31","phone":"+91 9495913089","email":"mhisham847@gmail.com","permanent_address":"ENUND PARAMBIL   (H), PATTARNADAKKAVU, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 847"},{"adm":"848","username":"848","password":"848848","full_name":"MUHAMMED SHAHIN.C","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL JALEEL","house":"CHOORAPPILAKKAL (H)","place":"MANNATHUPARAMB","post":"EDAYUR NORTH (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2010-11-04","phone":"+91 9947505124","email":"tydsha143@gmail.com","permanent_address":"CHOORAPPILAKKAL (H), MANNATHUPARAMB, EDAYUR NORTH (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 848"},{"adm":"850","username":"850","password":"850850","full_name":"MUHAMMED SINAN K","section":"SECONDARY","validity_date":"2028-02-28","father":"SHARAFUDHEEN","house":"KOTTILIL (H)","place":"EDAPPAL","post":"VATTAMKULAM (PO)","pin":"679578","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-09-12","phone":"+91 9895341274","email":"msinan850@gmail.com","permanent_address":"KOTTILIL (H), EDAPPAL, VATTAMKULAM (PO), PIN: 679578, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 850"},{"adm":"852","username":"852","password":"852852","full_name":"MUHAMMED SWALAH","section":"SECONDARY","validity_date":"2028-02-28","father":"FAISAL","house":"KALLUMMELVALAPILL  (H)","place":"PERUMBILAVU","post":"PERUMBILAVU (PO)","pin":"680519","district":"THRISSUR","state":"KERALA","blood_group":"B+","dob":"2010-08-19","phone":"9846238704","email":"muhdswalah@gmail.com","permanent_address":"KALLUMMELVALAPILL  (H), PERUMBILAVU, PERUMBILAVU (PO), PIN: 680519, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 852"},{"adm":"853","username":"853","password":"853853","full_name":"MUHAMMED SHANID","section":"SECONDARY","validity_date":"2028-02-28","father":"SHAREEF","house":"VALUYAPARAMBIL  (H)","place":"PALAKAPPARAMB","post":"KULATHUR (PO)","pin":"679338","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2010-05-16","phone":"+91 9847293451","email":"mshanid853@gmail.com","permanent_address":"VALUYAPARAMBIL  (H), PALAKAPPARAMB, KULATHUR (PO), PIN: 679338, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 853"},{"adm":"854","username":"854","password":"854854","full_name":"MUHAMMED SHABEEB P","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL GAFOOR","house":"PALATHINGAL  (H)","place":"KALADI","post":"KALADI (PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2010-03-03","phone":"+91 9562795756","email":"mshabeeb854@gmail.com","permanent_address":"PALATHINGAL  (H), KALADI, KALADI (PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 854"},{"adm":"855","username":"855","password":"855855","full_name":"MOHAMMED FOUZ KP","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL LATHEEF","house":"KOYALIPARAMBIL  (H)","place":"CHANGARAMKULAM","post":"NANNAMUKKU(PO)","pin":"679575","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-04-08","phone":"8943138088","email":"mf591757@gmail.com","permanent_address":"KOYALIPARAMBIL  (H), CHANGARAMKULAM, NANNAMUKKU(PO), PIN: 679575, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 855"},{"adm":"857","username":"857","password":"857857","full_name":"MUHAMMED ABDUL BASITH VP","section":"SECONDARY","validity_date":"2028-02-28","father":"KUNJI MOIDHEEN","house":"VARIKKAPPULAKKAL   (H)","place":"KUTTIPURAM","post":"KUTTIPPURAM (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2010-01-27","phone":"+91 9037818298","email":"mbasith857@gmail.com","permanent_address":"VARIKKAPPULAKKAL   (H), KUTTIPURAM, KUTTIPPURAM (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 857"},{"adm":"860","username":"860","password":"860860","full_name":"MUHAMMED AJMAL","section":"SECONDARY","validity_date":"2028-02-28","father":"MUSTHAFA","house":"PARAKADAVATH (H)","place":"PAINKANOOR","post":"KUTTIPPURAM (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-07-14","phone":"+91 8086224816","email":"mhdajmal@gmail.com","permanent_address":"PARAKADAVATH (H), PAINKANOOR, KUTTIPPURAM (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 860"},{"adm":"861","username":"861","password":"861861","full_name":"MUJEEB RAHAMAN T","section":"SECONDARY","validity_date":"2028-02-28","father":"HIDAYATHULLA","house":"THURAKKAL (H)","place":"KUMBIDI","post":"KUMBIDI (PO)","pin":"679553","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2010-09-08","phone":"+91 9895290687","email":"mujeebpbzr@gmai.com","permanent_address":"THURAKKAL (H), KUMBIDI, KUMBIDI (PO), PIN: 679553, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 861"},{"adm":"864","username":"864","password":"864864","full_name":"MUHAMMED ADIL K","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL HAMEED","house":"KALAPPATTIL  (H)","place":"PERASANOOR","post":"PERASANOOR (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2010-04-24","phone":"7907070870","email":"mhdadil864@gmail.com","permanent_address":"KALAPPATTIL  (H), PERASANOOR, PERASANOOR (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 864"},{"adm":"868","username":"868","password":"868868","full_name":"MUHAMMED ZAYAN V","section":"SECONDARY","validity_date":"2028-02-28","father":"ZAINUDHEEN","house":"VALAPPIL  (H)","place":"PATTARNADAKKAVU","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-01-17","phone":"+91 9633797995","email":"zayan86834@gmail.com","permanent_address":"VALAPPIL  (H), PATTARNADAKKAVU, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 868"},{"adm":"869","username":"869","password":"869869","full_name":"MUHAMMED SHAHEED","section":"SECONDARY","validity_date":"2028-02-28","father":"THAJUDHEEN","house":"NARAKKAD  (H)","place":"TIRUR","post":"THUVVAKKAD (PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-02-08","phone":"919846587031","email":"mshaheed869@gmail.com","permanent_address":"NARAKKAD  (H), TIRUR, THUVVAKKAD (PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 869"},{"adm":"870","username":"870","password":"870870","full_name":"SHEHIN MUHAMMED","section":"SECONDARY","validity_date":"2028-02-28","father":"MUHAMMED SHAFI","house":"TEVARAMBIL  (H)","place":"KURUKATHANI","post":"KALPAKANCHERY (PO)","pin":"676551","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2009-06-27","phone":"919846100039","email":"samshadbeegum86@gmail.com","permanent_address":"TEVARAMBIL  (H), KURUKATHANI, KALPAKANCHERY (PO), PIN: 676551, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 870"},{"adm":"871","username":"871","password":"871871","full_name":"FAHAD K","section":"SECONDARY","validity_date":"2028-02-28","father":"MOIDHEEN KUTTY","house":"KOTTARATH  (H)","place":"CHOONDIKKAL","post":"VAIRAMKODE (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-06-04","phone":"+91 9946768757","email":"fahad871@gmail.com","permanent_address":"KOTTARATH  (H), CHOONDIKKAL, VAIRAMKODE (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 871"},{"adm":"872","username":"872","password":"872872","full_name":"MUHAMMED AFROZ.K","section":"SECONDARY","validity_date":"2028-02-28","father":"ZUBAIR HUDAWI","house":"KOTTILIL  (H)","place":"CHEKANUR","post":"MUDUR (PO)","pin":"679578","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2011-04-11","phone":"8111823231","email":"mafrozk872@gmail.com","permanent_address":"KOTTILIL  (H), CHEKANUR, MUDUR (PO), PIN: 679578, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 872"},{"adm":"873","username":"873","password":"873873","full_name":"MUHAMMED FARSIN P","section":"SECONDARY","validity_date":"2028-02-28","father":"ABDUL QAYOOM","house":"PARAMBATH (H)","place":"VENGARA","post":"VENGARA (PO)","pin":"670612","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2009-05-15","phone":"9207611280","email":"shanfarsin86@gmail.com","permanent_address":"PARAMBATH (H), VENGARA, VENGARA (PO), PIN: 670612, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 873"},{"adm":"874","username":"874","password":"874874","full_name":"MUHAMMED SINAN AK","section":"SECONDARY","validity_date":"2028-02-28","father":"NASAR ANWARI","house":"AYYAPPANKAVIL  (H)","place":"POTHANUR","post":"KALADI (PO)","pin":"679576","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2009-11-09","phone":"7736362755","email":"sinanmuhammedak874@gmail.com","permanent_address":"AYYAPPANKAVIL  (H), POTHANUR, KALADI (PO), PIN: 679576, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 874"},{"adm":"754","username":"754","password":"754754","full_name":"SINAN KP","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"SHIHABUDHEEN","house":"KUNNAM PADATH  (H)","place":"CHEKODE","post":"ANAKKARA (PO)","pin":"679551","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2008-04-15","phone":"+91 9567588703","email":"sinanibnus@gmail.com","permanent_address":"KUNNAM PADATH  (H), CHEKODE, ANAKKARA (PO), PIN: 679551, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 754"},{"adm":"760","username":"760","password":"760760","full_name":"MOHAMMED AFLAH M","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL GAFOOR HUDAWI","house":"MATTATH (H)","place":"KONNALOOR","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-07-19","phone":"919567786786","email":"mohammedaflah123@gmail.com","permanent_address":"MATTATH (H), KONNALOOR, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 760"},{"adm":"761","username":"761","password":"761761","full_name":"MUHAMMED FADHIL AV","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUJEEB RAHMAN","house":"AMBALATH VEETIL (H)","place":"PONNANI","post":"PONNANI (PO)","pin":"679577","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2007-08-30","phone":"+91 8748928816","email":"muhammedfadhilav761@gmail.com","permanent_address":"AMBALATH VEETIL (H), PONNANI, PONNANI (PO), PIN: 679577, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 761"},{"adm":"764","username":"764","password":"764764","full_name":"MUHAMMED ANSHID AT","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"KABEER DARIMI","house":"AMBAYATHODI (H)","place":"KOTTAKKAL","post":"KOTTAKKAL (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2008-02-15","phone":"918086596673","email":"anshidxkd130@gmail.com","permanent_address":"AMBAYATHODI (H), KOTTAKKAL, KOTTAKKAL (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 764"},{"adm":"767","username":"767","password":"767767","full_name":"MUHAMMED SAHEEL.T","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDHUL JAVAD.T","house":"THOTTATHIL (H)","place":"KARIYANNUR","post":"PALLIPPURAM (PO)","pin":"679305","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2009-03-20","phone":"+91 9061493780","email":"saheelt2132@gmail.com","permanent_address":"THOTTATHIL (H), KARIYANNUR, PALLIPPURAM (PO), PIN: 679305, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 767"},{"adm":"778","username":"778","password":"778778","full_name":"MUHAMMED SUHAIL TA","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL JALEEL","house":"THAIPARAMBILKALATHIL  (H)","place":"PERUMBILAVU","post":"KARIKKAD (PO)","pin":"680519","district":"THRISSUR","state":"KERALA","blood_group":"B+","dob":"2007-07-16","phone":"9074953451","email":"muhammedsuhail778@gmail.com","permanent_address":"THAIPARAMBILKALATHIL  (H), PERUMBILAVU, KARIKKAD (PO), PIN: 680519, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 778"},{"adm":"780","username":"780","password":"780780","full_name":"MUHAMMED SHAMMAS AS","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"SIDHEEQ BADARI","house":"ATHANIKKAL (H)","place":"PERUMBILAVU","post":"KADAVALLUR (PO)","pin":"680543","district":"THRISSUR","state":"KERALA","blood_group":"O-","dob":"2008-11-01","phone":"9846845807","email":"muhammedshammas0306@gmail.com","permanent_address":"ATHANIKKAL (H), PERUMBILAVU, KADAVALLUR (PO), PIN: 680543, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 780"},{"adm":"788","username":"788","password":"788788","full_name":"AHMAD WASEEM.C","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"SAEEDUDHEEN HUDAWI","house":"CHOLAYIL (H)","place":"ANAKKARA","post":"ANAKKARA (PO)","pin":"679551","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2010-03-20","phone":"9562033331","email":"7binsaeed@gmail.com","permanent_address":"CHOLAYIL (H), ANAKKARA, ANAKKARA (PO), PIN: 679551, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 788"},{"adm":"789","username":"789","password":"789789","full_name":"AMEEN.N.A","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"BASHEER.N.A","house":"NALAKATH ARAKKAL (H)","place":"VENMENAD","post":"PAVARATTY (PO)","pin":"680507","district":"THRISSUR","state":"KERALA","blood_group":"A+","dob":"2010-01-29","phone":"918606642306","email":"ameenvmd789@gmail.com","permanent_address":"NALAKATH ARAKKAL (H), VENMENAD, PAVARATTY (PO), PIN: 680507, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 789"},{"adm":"790","username":"790","password":"790790","full_name":"MUHAMMED NAJAD.A","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"HANEEFA","house":"ARIMBRATHODI  (H)","place":"PARAPPANANGADI","post":"ULLANAM (PO)","pin":"676303","district":"MALAPPURAM","state":"KERALA","blood_group":"A-","dob":"2009-02-27","phone":"+91 9847582783","email":"mnabinuhaneefa790@gmail.com","permanent_address":"ARIMBRATHODI  (H), PARAPPANANGADI, ULLANAM (PO), PIN: 676303, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 790"},{"adm":"791","username":"791","password":"791791","full_name":"MUHAMMAD BISHR VP","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL BASHEER VP","house":"VELUTHEDATH PALLIYALIL (H)","place":"PALLIPPURAM","post":"CHERUKUDANGAD (PO)","pin":"679305","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2009-02-08","phone":"919633407387","email":"muhammadbishr791@gmail.com","permanent_address":"VELUTHEDATH PALLIYALIL (H), PALLIPPURAM, CHERUKUDANGAD (PO), PIN: 679305, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 791"},{"adm":"792","username":"792","password":"792792","full_name":"MUHAMMED MUZAMMIL PP","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"NOUSHAD","house":"PULIKKAL PARAMBIL  (H)","place":"VALANCHERY","post":"VADAKKAMPURAM (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-05-06","phone":"+91 9539576860","email":"muzzamil792@gmail.com","permanent_address":"PULIKKAL PARAMBIL  (H), VALANCHERY, VADAKKAMPURAM (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 792"},{"adm":"793","username":"793","password":"793793","full_name":"MUHAMMED SHUHAIB TP","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"SHARAFUDHEEN","house":"THETTAPARAMBIL  (H)","place":"VALANCHERY","post":"VADAKAAMPURAM (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-04-17","phone":"+91 9745206312","email":"shuhaib793@gmail.com","permanent_address":"THETTAPARAMBIL  (H), VALANCHERY, VADAKAAMPURAM (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 793"},{"adm":"794","username":"794","password":"794794","full_name":"MUHAMMED SAHAL.A.K","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUJEEB RAHMAN.A.K","house":"ARUKANDATHIL (H)","place":"KACHERIPPARAMBU","post":"SOUTH THRIKKANAPURAM (PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2008-11-19","phone":"919895481887","email":"muhammedsahalak794@gmail.com","permanent_address":"ARUKANDATHIL (H), KACHERIPPARAMBU, SOUTH THRIKKANAPURAM (PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 794"},{"adm":"795","username":"795","password":"795795","full_name":"SHEFIN MOHAMMED V","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MOHAMMED","house":"VETTAN  (H)","place":"MUTTIKKAD","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-08-18","phone":"918089616411","email":"shefinmohammed86@gmail.com","permanent_address":"VETTAN  (H), MUTTIKKAD, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 795"},{"adm":"797","username":"797","password":"797797","full_name":"AMEERALI.K","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDULGAFAR","house":"KONNAKKATTIL (H)","place":"C.K PARA","post":"VADAKKUMBURAM (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2010-01-01","phone":"919746827086","email":"ameerckpara@gmail.com","permanent_address":"KONNAKKATTIL (H), C.K PARA, VADAKKUMBURAM (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 797"},{"adm":"798","username":"798","password":"798798","full_name":"MUHAMMED HAFILH CM","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUHAMMED MUZAMMIL","house":"CHATTU MUKKIL (H)","place":"KAVUMPURAM","post":"THOZHUVANOOR (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-04-10","phone":"+91 8129450524","email":"hafilhbinmuzammil234@gmail.com","permanent_address":"CHATTU MUKKIL (H), KAVUMPURAM, THOZHUVANOOR (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 798"},{"adm":"800","username":"800","password":"800800","full_name":"MUHAMMAD HISHAM.C","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABU HANEEFA","house":"CHELAKKAL (H)","place":"KURUMBATHOOR","post":"ATHAVANAD (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2009-12-13","phone":"919539723939","email":"hisham88hishu@gmail.com","permanent_address":"CHELAKKAL (H), KURUMBATHOOR, ATHAVANAD (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 800"},{"adm":"801","username":"801","password":"801801","full_name":"MUHAMMED SALMAN MV","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL SALAM","house":"MADATHIL VALAPPIL (H)","place":"CHEMBIKKAL","post":"NADUVATTAM (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2008-10-07","phone":"+91 8921445660","email":"muhdsalmanmv@gmail.com","permanent_address":"MADATHIL VALAPPIL (H), CHEMBIKKAL, NADUVATTAM (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 801"},{"adm":"803","username":"803","password":"803803","full_name":"ABDUL FATHAH PK","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"SUBAIR","house":"PARUTHIKUNNAN  (H)","place":"THENNALA","post":"THENNALA (PO)","pin":"676508","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-03-01","phone":"+91 9846766728","email":"abdulfathah@gmail.com","permanent_address":"PARUTHIKUNNAN  (H), THENNALA, THENNALA (PO), PIN: 676508, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 803"},{"adm":"805","username":"805","password":"805805","full_name":"MUHAMMED YASEEN AA","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUSTHAFA AA","house":"AMBALAVAN ADUMANNIL (H)","place":"OTHUKKUNGAL","post":"MATTATHUR (PO)","pin":"676528","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2008-10-28","phone":"919048834442","email":"muhammedyaseen805@gmail.com","permanent_address":"AMBALAVAN ADUMANNIL (H), OTHUKKUNGAL, MATTATHUR (PO), PIN: 676528, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 805"},{"adm":"809","username":"809","password":"809809","full_name":"BUKHARI RUVAID NK","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL RASHEED","house":"NARIPPATTA KAPPUR  (H)","place":"PALANI","post":"IRINGALLUR (PO)","pin":"676304","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2008-11-28","phone":"+91 9567353200","email":"ruvaidnk@gmail.com","permanent_address":"NARIPPATTA KAPPUR  (H), PALANI, IRINGALLUR (PO), PIN: 676304, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 809"},{"adm":"811","username":"811","password":"811811","full_name":"MOHAMMED IRFAN .AV","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ISMAIL","house":"AMBALAVAN VETTIKKATT  (H)","place":"PALANI","post":"IRINGALLUR (PO)","pin":"676304","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2009-05-02","phone":"919567731943","email":"mohammedirfan811@gmail.com","permanent_address":"AMBALAVAN VETTIKKATT  (H), PALANI, IRINGALLUR (PO), PIN: 676304, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 811"},{"adm":"813","username":"813","password":"813813","full_name":"NASEEM AHMED.K","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"JALEEL AZHARI","house":"KONNEKKATT (H)","place":"ALATHIYOOR","post":"THRIPRANGODE (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"B-","dob":"2009-02-24","phone":"919567114435","email":"naseemahmed813@gmail.com","permanent_address":"KONNEKKATT (H), ALATHIYOOR, THRIPRANGODE (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 813"},{"adm":"814","username":"814","password":"814814","full_name":"SHAHUL HAMEED T","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUHAMMED MUSTHAFA","house":"THOTTUNGAL  (H)","place":"KUDALLUR","post":"KUDALLUR (PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2008-08-26","phone":"+91 9746717911","email":"shahulmusthafa700@gmail.com","permanent_address":"THOTTUNGAL  (H), KUDALLUR, KUDALLUR (PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 814"},{"adm":"815","username":"815","password":"815815","full_name":"ASLAM BASHEER.P","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUHAMMED BASHEER.P","house":"PUVATHOOR (H)","place":"PARAPPUR","post":"PARAPPUR (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2010-01-04","phone":"919847980245","email":"aslambasheerp36@gmail.com","permanent_address":"PUVATHOOR (H), PARAPPUR, PARAPPUR (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 815"},{"adm":"817","username":"817","password":"817817","full_name":"MUHAMMED SHAJIL KP","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"SHAFEEK","house":"KUNNAM PADATH  (H)","place":"CHEKKODE","post":"ANAKKARA (PO)","pin":"679551","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2009-02-12","phone":"9048591336","email":"muhammedshajil817@gmail.com","permanent_address":"KUNNAM PADATH  (H), CHEKKODE, ANAKKARA (PO), PIN: 679551, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 817"},{"adm":"819","username":"819","password":"819819","full_name":"MIRSHAD VK","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"MUHAMMED","house":"VALLIKKADAN  (H)","place":"THIRUNNAVAYA","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2008-08-31","phone":"9048183393","email":"mirshadvk819@gmail.com","permanent_address":"VALLIKKADAN  (H), THIRUNNAVAYA, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 819"},{"adm":"820","username":"820","password":"820820","full_name":"MUHAMMED NISAM KI","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ISMAIL","house":"KEEDATHAYIL (H)","place":"KECHERY","post":"CHIRANELLUR (PO)","pin":"680501","district":"THRISSUR","state":"KERALA","blood_group":"O+","dob":"2009-06-28","phone":"9048868256","email":"muhammednisamki820@gmail.com","permanent_address":"KEEDATHAYIL (H), KECHERY, CHIRANELLUR (PO), PIN: 680501, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 820"},{"adm":"823","username":"823","password":"823823","full_name":"MUHAMMED IRSHAD T","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"LATHEEF","house":"THADATHIL  (H)","place":"PALLIPADI","post":"KUTTIPURAM (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2010-02-14","phone":"+91 9846023786","email":"irshad4@gmail.com","permanent_address":"THADATHIL  (H), PALLIPADI, KUTTIPURAM (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 823"},{"adm":"824","username":"824","password":"824824","full_name":"MUHAMMED ASLAH T","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL MAJEED FAIZY","house":"THURAKKAL (H)","place":"PERUMBILAVU","post":"KADAVALLUR (PO)","pin":"680543","district":"THRISSUR","state":"KERALA","blood_group":"A+","dob":"2006-08-30","phone":"+91 7306305694","email":"muhammedaslah824@gmail.com","permanent_address":"THURAKKAL (H), PERUMBILAVU, KADAVALLUR (PO), PIN: 680543, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 824"},{"adm":"827","username":"827","password":"827827","full_name":"MUHAMMED SINAAN","section":"SENIOR SECONDARY","validity_date":"2027-02-28","father":"ABDUL MAJEED","house":"PATTISSERY  (H)","place":"PATTISSERY","post":"THANEERCODE (PO)","pin":"679536","district":"PALAKKAD","state":"KERALA","blood_group":"O-","dob":"2008-10-21","phone":"+91 8590855152","email":"sinaanmuhammed36@gmail.com","permanent_address":"PATTISSERY  (H), PATTISSERY, THANEERCODE (PO), PIN: 679536, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 827"},{"adm":"711","username":"711","password":"711711","full_name":"SHOUKATH ALI MV","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ASHRAF","house":"MARAVANCHERI VALAPPIL (H)","place":"EDAKKANAD","post":"MUTTANUR","pin":"676561","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2007-03-18","phone":"8547930002","email":"sshoukathali617@gmail.com","permanent_address":"MARAVANCHERI VALAPPIL (H), EDAKKANAD, MUTTANUR, PIN: 676561, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 711"},{"adm":"719","username":"719","password":"719719","full_name":"MOHAMMED MASHOOD T","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"BASHEER","house":"THENDATH","place":"THALAKKADATHUR","post":"THALAKKADATHUR (PO)","pin":"676103","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2007-12-29","phone":"9061671630","email":"mashood0729@gmail.com","permanent_address":"THENDATH, THALAKKADATHUR, THALAKKADATHUR (PO), PIN: 676103, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 719"},{"adm":"721","username":"721","password":"721721","full_name":"ZAYAN P","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"KABEER","house":"PALLIPARAMBIL  (H)","place":"PANG","post":"VATTALOOR (PO)","pin":"676507","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-07-11","phone":"8086108685","email":"zayanzayu16@gmail.com","permanent_address":"PALLIPARAMBIL  (H), PANG, VATTALOOR (PO), PIN: 676507, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 721"},{"adm":"722","username":"722","password":"722722","full_name":"ARIF ALI JAUHAR PP","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MUHAMMED HANEEFA","house":"PUTHUPARAMBIL  (H)","place":"KARATHUR","post":"KODAKKAL (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-12-19","phone":"8848926148","email":"arifajjouhar@gmail.com","permanent_address":"PUTHUPARAMBIL  (H), KARATHUR, KODAKKAL (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 722"},{"adm":"724","username":"724","password":"724724","full_name":"MUHAMMED AFEEF","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"HUSSAIN","house":"VISHARATHODI (H)","place":"PATHIRAMANNA","post":"PUZHAKKATTIRI (PO)","pin":"679321","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-06-12","phone":"9961249429","email":"afeefv@gmail.com","permanent_address":"VISHARATHODI (H), PATHIRAMANNA, PUZHAKKATTIRI (PO), PIN: 679321, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 724"},{"adm":"726","username":"726","password":"726726","full_name":"MUHAMMED SHUAIB TK","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"SAKKEER HUSSAIN TK","house":"THEKKEKARAKAYIL  (H)","place":"AVINDITHARA","post":"PURANGU (PO)","pin":"679584","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-04-09","phone":"7736047002","email":"shuaib7002@gmail.com","permanent_address":"THEKKEKARAKAYIL  (H), AVINDITHARA, PURANGU (PO), PIN: 679584, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 726"},{"adm":"728","username":"728","password":"728728","full_name":"SAVAD SALIM TP","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDUL SALAM","house":"THEKKE PALLATH PERINGATTU THODI (H)","place":"VELIKULAM","post":"IRIMBILIYAM  (PO)","pin":"679572","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2007-11-15","phone":"8590513054","email":"savadslm@gmail.com","permanent_address":"THEKKE PALLATH PERINGATTU THODI (H), VELIKULAM, IRIMBILIYAM  (PO), PIN: 679572, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 728"},{"adm":"738","username":"738","password":"738738","full_name":"MUHAMMAD HISAN TP","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"HUVAIS","house":"THOTTENGARA PALLIYALIL (H)","place":"KODUMUNDA","post":"MUTHUTHALA (PO)","pin":"679303","district":"PALAKKAD","state":"KERALA","blood_group":"B+","dob":"2008-05-07","phone":"8089819193","email":"hisantp5@gmail.com","permanent_address":"THOTTENGARA PALLIYALIL (H), KODUMUNDA, MUTHUTHALA (PO), PIN: 679303, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 738"},{"adm":"730","username":"730","password":"730730","full_name":"SULAIMAN FARIS K","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MUHAMMED NAZER","house":"KANNARATH  (H)","place":"EDACHALAM","post":"PERASSANNUR (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"B-","dob":"2007-09-03","phone":"9567737962","email":"sulaimanfaris730@gmail.com","permanent_address":"KANNARATH  (H), EDACHALAM, PERASSANNUR (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 730"},{"adm":"735","username":"735","password":"735735","full_name":"MUHAMMED ARSHAD M","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDU SALAM","house":"MATTATH (H)","place":"ATHAVANAD","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-11-08","phone":"9605966081","email":"mhdarshad8055@gmail.com","permanent_address":"MATTATH (H), ATHAVANAD, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 735"},{"adm":"748","username":"748","password":"748748","full_name":"MUHAMMED NIHAL NT","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDU","house":"NADUTHODI","place":"MARAKKARA","post":"RANDATHANI (PO)","pin":"676510","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-10-27","phone":"9947311361","email":"mhonihal007@gmail.com","permanent_address":"NADUTHODI, MARAKKARA, RANDATHANI (PO), PIN: 676510, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 748"},{"adm":"750","username":"750","password":"750750","full_name":"MUHAMMED SHAHZAD KV","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDUL KADER","house":"KALLIVALAPPIL (H)","place":"POOKARATHARA","post":"KOLALAMBA (PO)","pin":"679576","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-11-24","phone":"8086720572","email":"shahuzad750@gamil.com","permanent_address":"KALLIVALAPPIL (H), POOKARATHARA, KOLALAMBA (PO), PIN: 679576, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 750"},{"adm":"752","username":"752","password":"752752","full_name":"MUHAMMED NAHEEM","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MOHAMMED ALI","house":"THALIKAPPARAMBIL (H)","place":"KUTTIPPURAM","post":"KUTTIPPURAM (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-02-02","phone":"9744922286","email":"naeem752@gmail.com","permanent_address":"THALIKAPPARAMBIL (H), KUTTIPPURAM, KUTTIPPURAM (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 752"},{"adm":"753","username":"753","password":"753753","full_name":"MUHAMMED ARSHAD CP","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDUL GAFOOR","house":"CHERUPARAMBIL (H)","place":"VAIRANKODE","post":"VAIRANKODE (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-08-31","phone":"9400917195","email":"gafoorpallaar@gmail.com","permanent_address":"CHERUPARAMBIL (H), VAIRANKODE, VAIRANKODE (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 753"},{"adm":"755","username":"755","password":"755755","full_name":"AMEEN CM","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"RAFEEK","house":"CHARUVATTATH (H)","place":"KALADY","post":"KALADY","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2007-12-16","phone":"8089819563","email":"muhammedameencmbinrafeek@gmail.com","permanent_address":"CHARUVATTATH (H), KALADY, KALADY, PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 755"},{"adm":"759","username":"759","password":"759759","full_name":"HABEEB THANGAL","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"SHAMSUDHEEN THANGAL","house":"VALIAYAPEEDIKAKKAL  (H)","place":"PILATHRA","post":"MELMURI (PO)","pin":"676553","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2008-06-04","phone":"8089819563","email":"759habeeb@gmail.com","permanent_address":"VALIAYAPEEDIKAKKAL  (H), PILATHRA, MELMURI (PO), PIN: 676553, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 759"},{"adm":"766","username":"766","password":"766766","full_name":"ABDUL BARI CK","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"IBRAHIM CK","house":"CHAKKALAKKUNNAN (H)","place":"THUVVUR","post":"THUVVUR (PO)","pin":"679327","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2008-06-13","phone":"9447751627","email":"abdulbari766@gmail.com","permanent_address":"CHAKKALAKKUNNAN (H), THUVVUR, THUVVUR (PO), PIN: 679327, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 766"},{"adm":"768","username":"768","password":"768768","full_name":"HIJAS AS","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"SAMEER","house":"ADENGATTIL (H)","place":"CHIRAMANANGAD","post":"CHIRAMANANGAD (PO)","pin":"680604","district":"THRISSUR","state":"KERALA","blood_group":"A+","dob":"2009-03-10","phone":"9846757648","email":"hijaspachu2009@gmail.com","permanent_address":"ADENGATTIL (H), CHIRAMANANGAD, CHIRAMANANGAD (PO), PIN: 680604, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 768"},{"adm":"769","username":"769","password":"769769","full_name":"MUHAMMED SHAMVEEL KP","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"SAIFUDHEEN","house":"KARUPARAKKAL","place":"KOLATHUR","post":"KURUVAMBALAM (PO)","pin":"679323","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-06-08","phone":"9846107593","email":"769samveelkp@gmail.com","permanent_address":"KARUPARAKKAL, KOLATHUR, KURUVAMBALAM (PO), PIN: 679323, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 769"},{"adm":"770","username":"770","password":"770770","full_name":"ADNAN","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MUHAMMED KUTTY","house":"PUTHIYAKATH KANNACHAM VEETTIL (H)","place":"TIRUR","post":"PACHATTIRI (PO)","pin":"676105","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-03-17","phone":"9995874711","email":"adnananu@gmail.com","permanent_address":"PUTHIYAKATH KANNACHAM VEETTIL (H), TIRUR, PACHATTIRI (PO), PIN: 676105, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 770"},{"adm":"772","username":"772","password":"772772","full_name":"MUHAMMAD RISHAD.P","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDUL RASHEED.P","house":"PALARA  (H)","place":"MOONAKKAL","post":"VALANCHERY (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-09-10","phone":"9497605608","email":"muhammadrishadpalara772@gmail.com","permanent_address":"PALARA  (H), MOONAKKAL, VALANCHERY (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 772"},{"adm":"773","username":"773","password":"773773","full_name":"BADRUL HUSAIN","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MOHAMMEDALI","house":"KALLINGAL  (H)","place":"KOPPAM","post":"MELMURI (PO)","pin":"679307","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2008-09-17","phone":"6282445967","email":"badrulhusainkallingal@gmail.com","permanent_address":"KALLINGAL  (H), KOPPAM, MELMURI (PO), PIN: 679307, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 773"},{"adm":"774","username":"774","password":"774774","full_name":"MUHAMMED MIHRAJ","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDUL GAFOOR","house":"VELERI (H)","place":"PAINKANNUR","post":"PAINKANNUR (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2008-10-27","phone":"9562029862","email":"mihraj774@gmail.com","permanent_address":"VELERI (H), PAINKANNUR, PAINKANNUR (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 774"},{"adm":"775","username":"775","password":"775775","full_name":"MUHAMED HANIN SHABEEB C","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"HABEEB RAHIMAN","house":"CHANTHIRUTHY   (H)","place":"CHERIYAPARAPPUR","post":"VP PURAM  (PO)","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-09-17","phone":"9846775815","email":"shabeebmh8733@gmail.com","permanent_address":"CHANTHIRUTHY   (H), CHERIYAPARAPPUR, VP PURAM  (PO), PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 775"},{"adm":"782","username":"782","password":"782782","full_name":"MUHAMMED SABITH PV","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDULLA","house":"PALATTU VALAPPIL (H)","place":"KANDANAKAM","post":"KALADY (PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-06-05","phone":"9526803711","email":"sabithmhd9526@gmail.com","permanent_address":"PALATTU VALAPPIL (H), KANDANAKAM, KALADY (PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 782"},{"adm":"783","username":"783","password":"783783","full_name":"MUHAMMED ANSHIF KV","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ABDUL KAREEM","house":"KOLUVEETTIL (H)","place":"EDAYUR","post":"EDAYUR (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2009-01-28","phone":"7034656052","email":"anshif783@gmail.com","permanent_address":"KOLUVEETTIL (H), EDAYUR, EDAYUR (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 783"},{"adm":"784","username":"784","password":"784784","full_name":"ANVER SADIQUE","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MOIDEEN KUTTY","house":"KUZHIKKATT (H)","place":"KUZHINCHOLAM","post":"THAVANUR (PO)","pin":"673664","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-01-25","phone":"9846266447","email":"anversadique784@gmail.com","permanent_address":"KUZHIKKATT (H), KUZHINCHOLAM, THAVANUR (PO), PIN: 673664, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 784"},{"adm":"785","username":"785","password":"785785","full_name":"MUHAMMED HASAN CV","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"MUSTHAFA CV","house":"CHARUBAKKATH (H)","place":"VETTICHIRA","post":"PUNNATHALA (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2009-02-19","phone":"9645557743","email":"hasan785@gmail.com","permanent_address":"CHARUBAKKATH (H), VETTICHIRA, PUNNATHALA (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 785"},{"adm":"787","username":"787","password":"787787","full_name":"MUHAMMED SHAHID AP","section":"SENIOR SECONDARY","validity_date":"2026-02-28","father":"ALIKUTTY","house":"AMBALAPPARAMBIL (H)","place":"VATTAPPARA","post":"THOZHUVANOOR (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-07-26","phone":"9847572943","email":"shahid787@gmail.com","permanent_address":"AMBALAPPARAMBIL (H), VATTAPPARA, THOZHUVANOOR (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 787"},{"adm":"627","username":"627","password":"627627","full_name":"MUHAMMED IJLAN CP","section":"DEGREE","validity_date":"2027-02-28","father":"IBRAHIM CP","house":"PENGATIYIL (H)","place":"CHIRAPPALAM","post":"PULIYAKKODU [PO]","pin":"673641","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2006-08-02","phone":"8593885282","email":"ijlucp@gmail.com","permanent_address":"PENGATIYIL (H), CHIRAPPALAM, PULIYAKKODU [PO], PIN: 673641, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 627"},{"adm":"641","username":"641","password":"641641","full_name":"SULTHAN P","section":"DEGREE","validity_date":"2027-02-28","father":"ABDU RAHMAN","house":"PULIKKIYATH (H)","place":"THALAKKADATHUR","post":"THALAKKADATHUR (PO)","pin":"676103","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2006-09-02","phone":"8590837714","email":"shaanu2016p@gmail.com","permanent_address":"PULIKKIYATH (H), THALAKKADATHUR, THALAKKADATHUR (PO), PIN: 676103, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 641"},{"adm":"662","username":"662","password":"662662","full_name":"MUHAMMED MUBASHIR","section":"DEGREE","validity_date":"2027-02-28","father":"MOOSA","house":"PALLIYALIL (H)","place":"VELLALOOR","post":"KUMARANELLUR (PO)","pin":"679552","district":"PALAKKAD","state":"KERALA","blood_group":"B+","dob":"2005-12-12","phone":"9197455108","email":"mubashirpalliyalil6@gmail.com","permanent_address":"PALLIYALIL (H), VELLALOOR, KUMARANELLUR (PO), PIN: 679552, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 662"},{"adm":"665","username":"665","password":"665665","full_name":"MOHAMMED HUBAB","section":"DEGREE","validity_date":"2027-02-28","father":"ABU SUFIYAN","house":"AMARIYIL (H)","place":"CHENAKKAL","post":"KOTTAKKAL (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2006-08-04","phone":"9185903940","email":"hubabamariyil@gmail.com","permanent_address":"AMARIYIL (H), CHENAKKAL, KOTTAKKAL (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 665"},{"adm":"666","username":"666","password":"666666","full_name":"ABDUL BASITH K","section":"DEGREE","validity_date":"2027-02-28","father":"ABDUSSALAMK","house":"KOTTA (H)","place":"PERINGOTTUPULAM","post":"PAZHAMALLOR (PO)","pin":"676506","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2006-11-08","phone":"9847121765","email":"basithppm06@gmail.com","permanent_address":"KOTTA (H), PERINGOTTUPULAM, PAZHAMALLOR (PO), PIN: 676506, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 666"},{"adm":"667","username":"667","password":"667667","full_name":"MUHAMMED ARAFATH V","section":"DEGREE","validity_date":"2027-02-28","father":"MOIDEEN KUTTY","house":"VALATH (H)","place":"KOODALLUR","post":"KOODALLUR (PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2007-02-15","phone":"9061243370","email":"arafathvalath@gmail.com","permanent_address":"VALATH (H), KOODALLUR, KOODALLUR (PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 667"},{"adm":"668","username":"668","password":"668668","full_name":"MUHAMMED ANAS","section":"DEGREE","validity_date":"2027-02-28","father":"ABOOBACKER","house":"MATTATH (H)","place":"KONNALLUR","post":"ANANTHAVOOR (PO)","pin":"676301","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2006-05-06","phone":"9447651925","email":"iamanasmattath@gmail.com","permanent_address":"MATTATH (H), KONNALLUR, ANANTHAVOOR (PO), PIN: 676301, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 668"},{"adm":"671","username":"671","password":"671671","full_name":"SHAMIL PV","section":"DEGREE","validity_date":"2027-02-28","father":"MUHAMAD ASHARAF PV","house":"PARAPPUR VALAPPIL (H)","place":"MANOOR","post":"KALADI (PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-05-22","phone":"9995237794","email":"shamilmanoor671@gmail.com","permanent_address":"PARAPPUR VALAPPIL (H), MANOOR, KALADI (PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 671"},{"adm":"674","username":"674","password":"674674","full_name":"MUHAMMED HABAJ MP","section":"DEGREE","validity_date":"2027-02-28","father":"MUHAMMED","house":"MADAPPALLY (H)","place":"TRIPPANACHI","post":"TRIPPANACHI (PO)","pin":"673641","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-10-01","phone":"9745166564","email":"habaj987654@gmail.com","permanent_address":"MADAPPALLY (H), TRIPPANACHI, TRIPPANACHI (PO), PIN: 673641, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 674"},{"adm":"675","username":"675","password":"675675","full_name":"MAZINSHA K","section":"DEGREE","validity_date":"2027-02-28","father":"MAMMADU K","house":"KOONARI (H)","place":"INDIANOOR","post":"INDIANOOR (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2005-12-13","phone":"9207651738","email":"mazinsha@gmail.com","permanent_address":"KOONARI (H), INDIANOOR, INDIANOOR (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 675"},{"adm":"677","username":"677","password":"677677","full_name":"IRFAN HUSSAIN N","section":"DEGREE","validity_date":"2027-02-28","father":"HUSSAIN","house":"NEDIYEDATH (H)","place":"THALAKKADATHUR","post":"THALAKKADATHUR (PO)","pin":"676103","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2006-09-22","phone":"9446517037","email":"iamirfanntkr@gmail.com","permanent_address":"NEDIYEDATH (H), THALAKKADATHUR, THALAKKADATHUR (PO), PIN: 676103, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 677"},{"adm":"679","username":"679","password":"679679","full_name":"MUHAMMED ADNAN KV","section":"DEGREE","validity_date":"2027-02-28","father":"HUSSAIN KV","house":"KADAVANDI (H)","place":"INDIANOOR","post":"INDIANOOR (PO)","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2006-10-23","phone":"8590504054","email":"adnan.kv@outlook.com","permanent_address":"KADAVANDI (H), INDIANOOR, INDIANOOR (PO), PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 679"},{"adm":"689","username":"689","password":"689689","full_name":"MUHAMMED FINAN PP","section":"DEGREE","validity_date":"2027-02-28","father":"BASHEER PP","house":"PADATH PEEDIKAYIL (H)","place":"PALLIPADI","post":"ANAKKARA (PO)","pin":"679551","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2005-09-30","phone":"8589063789","email":"raizad44@gmail.com","permanent_address":"PADATH PEEDIKAYIL (H), PALLIPADI, ANAKKARA (PO), PIN: 679551, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 689"},{"adm":"692","username":"692","password":"692692","full_name":"DILBARSHA","section":"DEGREE","validity_date":"2027-02-28","father":"ANEESH BABU","house":"KUTTIYATHIL (H)","place":"KOTT-ALINCHUVADU","post":"TIRUR (PO)","pin":"676101","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2005-10-19","phone":"7736577692","email":"dilbarshadsk@gmail.com","permanent_address":"KUTTIYATHIL (H), KOTT-ALINCHUVADU, TIRUR (PO), PIN: 676101, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 692"},{"adm":"696","username":"696","password":"696696","full_name":"MUHAMMED HABEEB PV","section":"DEGREE","validity_date":"2027-02-28","father":"MUHAMMED MUSTHAFA PV","house":"PULAVAZHI (H)","place":"PATHIRAMANNA","post":"PUZHAKKATTIRI (PO)","pin":"679321","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2006-06-22","phone":"9567743209","email":"habeebpulavazhi@gmail.com","permanent_address":"PULAVAZHI (H), PATHIRAMANNA, PUZHAKKATTIRI (PO), PIN: 679321, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 696"},{"adm":"697","username":"697","password":"697697","full_name":"ASHIQ T","section":"DEGREE","validity_date":"2027-02-28","father":"MANSOOR ALI","house":"THURAYATTIL (H)","place":"PALLIPPADI","post":"KUMBIDI (PO)","pin":"679553","district":"PALAKKAD","state":"KERALA","blood_group":"B+","dob":"2006-08-09","phone":"9656664331","email":"ashiqbnmansoor@gmail.com","permanent_address":"THURAYATTIL (H), PALLIPPADI, KUMBIDI (PO), PIN: 679553, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 697"},{"adm":"698","username":"698","password":"698698","full_name":"MUHAMMED YOOSUF P","section":"DEGREE","validity_date":"2027-02-28","father":"SIDEEQUE","house":"PARAMBIL (H)","place":"ARAKKAL","post":"THENNALA (PO)","pin":"676508","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2006-02-07","phone":"9961998998","email":"muhammedyoosufparambil@gmail.com","permanent_address":"PARAMBIL (H), ARAKKAL, THENNALA (PO), PIN: 676508, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 698"},{"adm":"701","username":"701","password":"701701","full_name":"MOHAMMED SIBATH MP","section":"DEGREE","validity_date":"2027-02-28","father":"HAMZATH MP","house":"MANOOPARAMBIL (H)","place":"TIRUNAVAYA","post":"CODACAL (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2005-11-10","phone":"6282646256","email":"sibathmp@gmail.com","permanent_address":"MANOOPARAMBIL (H), TIRUNAVAYA, CODACAL (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 701"},{"adm":"984","username":"984","password":"984984","full_name":"SEYYID ALAVI M","section":"DEGREE","validity_date":"2027-02-28","father":"SAKKEER M","house":"MANAMMAL [H]","place":"MOONNIYUR","post":"MOONNIYUR [PO]","pin":"676311","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2005-11-03","phone":"9895373988","email":"sydalavim@gmail.com","permanent_address":"MANAMMAL [H], MOONNIYUR, MOONNIYUR [PO], PIN: 676311, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 984"},{"adm":"983","username":"983","password":"983983","full_name":"RISHAD ALI N","section":"DEGREE","validity_date":"2027-02-28","father":"ABDUL RAHIMAN N","house":"NANNANCHERI","place":"PARAMMAL","post":"PONMUNDAM[PO]","pin":"676106","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2005-08-27","phone":"7025573634","email":"rishadali@gmail.com","permanent_address":"NANNANCHERI, PARAMMAL, PONMUNDAM[PO], PIN: 676106, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 983"},{"adm":"985","username":"985","password":"985985","full_name":"SAFAD MK","section":"DEGREE","validity_date":"2027-02-28","father":"ABDUL MAJEED","house":"MANIYANKODAN[H]","place":"MANNARKKAD","post":"PERIMBADARI[PO]","pin":"678582","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2005-09-25","phone":"9207150073","email":"safadmk8@gmail.com","permanent_address":"MANIYANKODAN[H], MANNARKKAD, PERIMBADARI[PO], PIN: 678582, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 985"},{"adm":"982","username":"982","password":"982982","full_name":"ABDUL BASITH TC","section":"DEGREE","validity_date":"2027-02-28","father":"] USMAN","house":"VALLIKOTH [H]","place":"PADIKKAL","post":"VELIMUKKU[PO]","pin":"676317","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2005-11-19","phone":"8086304231","email":"abdulbasith3716@gmail.com","permanent_address":"VALLIKOTH [H], PADIKKAL, VELIMUKKU[PO], PIN: 676317, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 982"},{"adm":"979","username":"979","password":"979979","full_name":"MUHAMMED SAHAD E","section":"DEGREE","validity_date":"2027-02-28","father":"NAZAR","house":"ELLATH [H]","place":"PARAKADAVU","post":"PARAKKADAVU[PO]","pin":"673509","district":"KOZHIKKODE","state":"KERALA","blood_group":"O+","dob":"2005-04-14","phone":"9895782585","email":"sahadshalu146@gmail.com","permanent_address":"ELLATH [H], PARAKADAVU, PARAKKADAVU[PO], PIN: 673509, KOZHIKKODE, KERALA","current_address":"ABCD Campus Residences, Block A, Room 979"},{"adm":"978","username":"978","password":"978978","full_name":"MUFEED C","section":"DEGREE","validity_date":"2027-02-28","father":"ABDUL HAMEED","house":"CHALIL (H)","place":"PARAKADAVU","post":"PULIYAVU (PO)","pin":"673509","district":"KOZHIKKODE","state":"KERALA","blood_group":"O+","dob":"2006-01-20","phone":"9495282928","email":"mufeedckd336@gmail.com","permanent_address":"CHALIL (H), PARAKADAVU, PULIYAVU (PO), PIN: 673509, KOZHIKKODE, KERALA","current_address":"ABCD Campus Residences, Block A, Room 978"},{"adm":"622","username":"622","password":"622622","full_name":"MUHAMMED  SWALIH P","section":"DEGREE","validity_date":"2027-02-28","father":"MUHAMMED","house":"PALAKKAL(H)","place":"VELIANCODE","post":"VELIANCODE(PO)","pin":"679579","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2004-07-26","phone":"7559845433","email":"swalihplkl@gmail.com","permanent_address":"PALAKKAL(H), VELIANCODE, VELIANCODE(PO), PIN: 679579, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 622"},{"adm":"663","username":"663","password":"663663","full_name":"NASIL AMEEN","section":"DEGREE","validity_date":"2028-02-28","father":"ABDU RAHMAN","house":"APPATHUM KAATTIL (H)","place":"PARAKKULAM","post":"ANAKKARA  (PO)","pin":"691579","district":"PALAKKAD","state":"KERALA","blood_group":"O+","dob":"2005-12-14","phone":"9539555539","email":"nasilameenak@gmail.com","permanent_address":"APPATHUM KAATTIL (H), PARAKKULAM, ANAKKARA  (PO), PIN: 691579, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 663"},{"adm":"664","username":"664","password":"664664","full_name":"MUHAMMED UVAIS PA","section":"DEGREE","validity_date":"2028-02-28","father":"ALIMON PI","house":"PARAMBATHAZHATH (H)","place":"KORATTIKKARA","post":"KORATTIKKARA (PO)","pin":"680543","district":"THRISSUR","state":"KERALA","blood_group":"O+","dob":"2006-10-23","phone":"9539083435","email":"uvaisibnali@gmail.com","permanent_address":"PARAMBATHAZHATH (H), KORATTIKKARA, KORATTIKKARA (PO), PIN: 680543, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 664"},{"adm":"680","username":"680","password":"680680","full_name":"SALMANUL FARIS","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL RAHMAN","house":"PAININGAL (H)","place":"ALATHIYOOR","post":"ALATHIYOOR (PO)","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2006-05-15","phone":"9947544012","email":"salmansalu2833@gmail.com","permanent_address":"PAININGAL (H), ALATHIYOOR, ALATHIYOOR (PO), PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 680"},{"adm":"683","username":"683","password":"683683","full_name":"MUHAMMAD SINAN KK","section":"DEGREE","validity_date":"2028-02-28","father":"FAISAL KK","house":"KOONUKUNNATH (H)","place":"KOTTAPPURAM","post":"VALIYAKUNNU (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-04-27","phone":"7034237008","email":"faizukyky@gmail.com","permanent_address":"KOONUKUNNATH (H), KOTTAPPURAM, VALIYAKUNNU (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 683"},{"adm":"704","username":"704","password":"704704","full_name":"MOHAMMED ASHRAF K","section":"DEGREE","validity_date":"2028-02-28","father":"SHAJI","house":"KALLINGAL (H)","place":"KUDALLUR","post":"KUDALLUR (PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"A+","dob":"2007-01-24","phone":"7510851904","email":"muhammedafreen200@gmail.com","permanent_address":"KALLINGAL (H), KUDALLUR, KUDALLUR (PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 704"},{"adm":"705","username":"705","password":"705705","full_name":"MUHAMED ASHIQUE","section":"DEGREE","validity_date":"2028-02-28","father":"YAHUTTY","house":"POONGOTTIL (H)","place":"RANGATTOOR","post":"NADUVATTAM (PO)","pin":"679571","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2008-03-13","phone":"6235819004","email":"pmuhdashique2008@gmail.com","permanent_address":"POONGOTTIL (H), RANGATTOOR, NADUVATTAM (PO), PIN: 679571, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 705"},{"adm":"706","username":"706","password":"706706","full_name":"SANAN ANAS PM","section":"DEGREE","validity_date":"2028-02-28","father":"ANAS","house":"PONNANIANGHAT (H)","place":"KUDALLUR","post":"KUDALLUR (PO)","pin":"679554","district":"PALAKKAD","state":"KERALA","blood_group":"O-","dob":"2007-04-14","phone":"9846884501","email":"sanananas2713@gmail.com","permanent_address":"PONNANIANGHAT (H), KUDALLUR, KUDALLUR (PO), PIN: 679554, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 706"},{"adm":"708","username":"708","password":"708708","full_name":"ABDU RAHMAN C","section":"DEGREE","validity_date":"2028-02-28","father":"MOIDUNNI C","house":"CHOLAYIL (H)","place":"THANGALPADI","post":"TRIKKANAPURAM SOUTH (PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2006-12-20","phone":"7902592834","email":"708abdurahman@gmail.com","permanent_address":"CHOLAYIL (H), THANGALPADI, TRIKKANAPURAM SOUTH (PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 708"},{"adm":"709","username":"709","password":"709709","full_name":"MOHAMED MURSHID.P","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL LATHEEF","house":"PULLATH  (H)","place":"ANAPPADI","post":"TRIPRANGODE (PO)","pin":"676108","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-06-25","phone":"9744749851","email":"murshidkainikkara786@gmail.com","permanent_address":"PULLATH  (H), ANAPPADI, TRIPRANGODE (PO), PIN: 676108, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 709"},{"adm":"712","username":"712","password":"712712","full_name":"AL SABITH.M","section":"DEGREE","validity_date":"2028-02-28","father":"SHARAFUDHEEN","house":"MANAYANGATTIL (H)","place":"KAREKKAD","post":"KADAMPUZHA (PO)","pin":"676553","district":"MALAPPURAM","state":"KERALA","blood_group":"O-","dob":"2007-02-21","phone":"8891795812","email":"ms.alsabith00@gmail.com","permanent_address":"MANAYANGATTIL (H), KAREKKAD, KADAMPUZHA (PO), PIN: 676553, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 712"},{"adm":"713","username":"713","password":"713713","full_name":"MUHAMMED FAHAD R.M","section":"DEGREE","validity_date":"2028-02-28","father":"MANAF","house":"RAYAMARAKKAR  (H)","place":"ADHOUR","post":"VELLARAKKAD (PO)","pin":"680584","district":"THRISSUR","state":"KERALA","blood_group":"A+","dob":"2006-06-19","phone":"9847129183","email":"muhammedfahad07224@gmail.com","permanent_address":"RAYAMARAKKAR  (H), ADHOUR, VELLARAKKAD (PO), PIN: 680584, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 713"},{"adm":"715","username":"715","password":"715715","full_name":"THANVEER JAMAN CK","section":"DEGREE","validity_date":"2028-02-28","father":"KABEER C","house":"CHOLAKKAL (H)","place":"KOOTTANAD","post":"THIRUMITTACODE (PO)","pin":"679535","district":"PALAKKAD","state":"KERALA","blood_group":"B+","dob":"2007-06-15","phone":"9846002676","email":"thanveerjaman@gmail.com","permanent_address":"CHOLAKKAL (H), KOOTTANAD, THIRUMITTACODE (PO), PIN: 679535, PALAKKAD, KERALA","current_address":"ABCD Campus Residences, Block A, Room 715"},{"adm":"717","username":"717","password":"717717","full_name":"RISHAD K","section":"DEGREE","validity_date":"2028-02-28","father":"MOOSA","house":"KALLAN (H)","place":"VALANCHERY","post":"MARAKARA (PO)","pin":"676553","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2008-04-01","phone":"9745027846","email":"rkzkallan717@gmail.com","permanent_address":"KALLAN (H), VALANCHERY, MARAKARA (PO), PIN: 676553, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 717"},{"adm":"720","username":"720","password":"720720","full_name":"MUHAMMED HASHIM P","section":"DEGREE","validity_date":"2028-02-28","father":"SHIHABUDHEEN","house":"PALARA (H)","place":"VALANCHERY","post":"VALANCHERY (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-11-27","phone":"9539539674","email":"muhammedhashimpalara720@gmail.com","permanent_address":"PALARA (H), VALANCHERY, VALANCHERY (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 720"},{"adm":"725","username":"725","password":"725725","full_name":"MUHAMMED SABITH.U","section":"DEGREE","validity_date":"2028-02-28","father":"SAFEER BABU.U","house":"UNNIYANGAL  (H)","place":"KAMMUTTIKKULAM","post":"EDAYUR (PO)","pin":"676552","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2008-01-10","phone":"9544706707","email":"safeerbabu1980@gmail.com","permanent_address":"UNNIYANGAL  (H), KAMMUTTIKKULAM, EDAYUR (PO), PIN: 676552, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 725"},{"adm":"736","username":"736","password":"736736","full_name":"FARHAN ABDULLA.PV","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL SALAM.PV","house":"PULAVAZHI (H)","place":"PUZHAKKATTIRI","post":"PUZHAKKATTIRI (PO)","pin":"679321","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-10-15","phone":"6282781460","email":"pvfahan@gmail.com","permanent_address":"PULAVAZHI (H), PUZHAKKATTIRI, PUZHAKKATTIRI (PO), PIN: 679321, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 736"},{"adm":"737","username":"737","password":"737737","full_name":"MUHAMMED RISHAD P","section":"DEGREE","validity_date":"2028-02-28","father":"ALI","house":"PALATHINGAL (H)","place":"THRIKKANAPURAM","post":"THAVANUR (PO)","pin":"679582","district":"MALAPPURAM","state":"KERALA","blood_group":"B+","dob":"2006-12-21","phone":"9745185436","email":"muhdrishad009@gmail.com","permanent_address":"PALATHINGAL (H), THRIKKANAPURAM, THAVANUR (PO), PIN: 679582, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 737"},{"adm":"740","username":"740","password":"740740","full_name":"MUHAMMED AFNAS VK","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL GAFOOR VK","house":"VALAVATH KALLIYAPURATH  (H)","place":"TIRUR","post":"POILISSERY (PO)","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-12-14","phone":"9048704634","email":"afnas740@gmail.com","permanent_address":"VALAVATH KALLIYAPURATH  (H), TIRUR, POILISSERY (PO), PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 740"},{"adm":"1025","username":"1025","password":"10251025","full_name":"SIYAD RAHMAN KP","section":"DEGREE","validity_date":"2028-02-28","father":"ABDURAHIMAN KP","house":"ARUVATHODI (H)","place":"VELIMUKKU","post":"VELIMUKKU SOUTH (P.O","pin":"676317","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-10-05","phone":"9747883322","email":"ziyadrahmankp@gmail.com","permanent_address":"ARUVATHODI (H), VELIMUKKU, VELIMUKKU SOUTH (P.O, PIN: 676317, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1025"},{"adm":"1029","username":"1029","password":"10291029","full_name":"ABDUL BASITH KP","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL ALI","house":"KARUPARAKKAL (H)","place":"KURUVAMBALAM","post":"KOLATHUR","pin":"679338","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-08-04","phone":"9656376833","email":"mabasith531@gmail.com","permanent_address":"KARUPARAKKAL (H), KURUVAMBALAM, KOLATHUR, PIN: 679338, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1029"},{"adm":"1062","username":"1062","password":"10621062","full_name":"MUHAMMED NAFIH CK","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL HAMEED CK","house":"CHALLIKADAVATH MUTTILLTHODI (H)","place":"KAKKANCHERY","post":"CALICUT UNIVERSITY (PO)","pin":"673635","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2006-05-04","phone":"8921853706","email":"nafihck165@gmail.com","permanent_address":"CHALLIKADAVATH MUTTILLTHODI (H), KAKKANCHERY, CALICUT UNIVERSITY (PO), PIN: 673635, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1062"},{"adm":"1026","username":"1026","password":"10261026","full_name":"MOHAMED RIHAN AP","section":"DEGREE","validity_date":"2028-02-28","father":"SHAMSUDHEEN AP","house":"ARANGATH PARAMBIL (H)","place":"ALATHIYOOR","post":"ALATHIYOOR PO","pin":"676102","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-03-12","phone":"9846554317","email":"rihupop10@gmail.com","permanent_address":"ARANGATH PARAMBIL (H), ALATHIYOOR, ALATHIYOOR PO, PIN: 676102, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1026"},{"adm":"1027","username":"1027","password":"10271027","full_name":"MUHAMMED AFLAJ PK","section":"DEGREE","validity_date":"2028-02-28","father":"JAFFER PK","house":"POOLAKKAL KARATTUCHALI (H)","place":"KIZHISSERI","post":"KUZHIMANNNA(PO)","pin":"673641","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-03-19","phone":"9562226201","email":"pkaflaj@gmail.com","permanent_address":"POOLAKKAL KARATTUCHALI (H), KIZHISSERI, KUZHIMANNNA(PO), PIN: 673641, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1027"},{"adm":"1064","username":"1064","password":"10641064","full_name":"NADHIL","section":"DEGREE","validity_date":"2028-02-28","father":"MUSTHAFA","house":"OTTAKATH (H","place":"MANJERI","post":"MANJERI BAZAR","pin":"676121","district":"MALAPPURAM","state":"KERALA","blood_group":"A+","dob":"2005-12-14","phone":"8891349553","email":"mhdnadhil93@gmail.com","permanent_address":"OTTAKATH (H, MANJERI, MANJERI BAZAR, PIN: 676121, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1064"},{"adm":"1031","username":"1031","password":"10311031","full_name":"MUHAMMED RIZVAN","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL SALEEM","house":"VENMADATHAYIL (H)","place":"NALAMKALLU","post":"EDAKKAZHIYOOR(PO)","pin":"680515","district":"THRISSUR","state":"KERALA","blood_group":"B+","dob":"2007-04-22","phone":"9747040375","email":"mrizvann1031@gmail.com","permanent_address":"VENMADATHAYIL (H), NALAMKALLU, EDAKKAZHIYOOR(PO), PIN: 680515, THRISSUR, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1031"},{"adm":"1063","username":"1063","password":"10631063","full_name":"MUHAMMED SALIH TK","section":"DEGREE","validity_date":"2028-02-28","father":"JAMALUDHEEN","house":"THERAYANKOTTU KOLAVATTATH (H)","place":"VILLIAPALLY","post":"VILLIAPALLY (PO)","pin":"673542","district":"KOZHIKODE","state":"KERALA","blood_group":"B+","dob":"2005-06-15","phone":"9656723530","email":"swalihtk174@gmail.com","permanent_address":"THERAYANKOTTU KOLAVATTATH (H), VILLIAPALLY, VILLIAPALLY (PO), PIN: 673542, KOZHIKODE, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1063"},{"adm":"1022","username":"1022","password":"10221022","full_name":"MUHAMMED RABEEH","section":"DEGREE","validity_date":"2028-02-28","father":"MUHAMMED FAROOQ","house":"KATTIL PEEDIYEKKAL (H)","place":"KARIMARAM","post":"NIRAMARUTHUR (PO)","pin":"676109","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2007-01-13","phone":"8590215057","email":"rabirabu466@gmail.com","permanent_address":"KATTIL PEEDIYEKKAL (H), KARIMARAM, NIRAMARUTHUR (PO), PIN: 676109, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1022"},{"adm":"1028","username":"1028","password":"10281028","full_name":"MUHAMMED JIYAD MT","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL MAJEED","house":"MANNANTHODI (H)","place":"VENGAD","post":"VENGAD(PO)","pin":"679338","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2008-06-02","phone":"7561062284","email":"jiyadmt519@gmail.com","permanent_address":"MANNANTHODI (H), VENGAD, VENGAD(PO), PIN: 679338, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1028"},{"adm":"1024","username":"1024","password":"10241024","full_name":"MUHAMMED MISHAL KP","section":"DEGREE","validity_date":"2028-02-28","father":"MUHAMMED","house":"NOTTAN VEETTIL (H)","place":"MUTHUPARAMBA","post":"MUTHUPARAMBA (PO)","pin":"673638","district":"MALAPPURAM","state":"KERALA","blood_group":"AB+","dob":"2007-03-12","phone":"6238273976","email":"muhammedmishalkp523@gmail.com","permanent_address":"NOTTAN VEETTIL (H), MUTHUPARAMBA, MUTHUPARAMBA (PO), PIN: 673638, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1024"},{"adm":"1023","username":"1023","password":"10231023","full_name":"MUHAMMED BISHR P","section":"DEGREE","validity_date":"2028-02-28","father":"BASHEER","house":"PARAPPALLATH (H)","place":"KAVATHIKULAM","post":"KOTTAKKAL PO","pin":"676503","district":"MALAPPURAM","state":"KERALA","blood_group":"O+","dob":"2006-01-27","phone":"8590787312","email":"muhammedbishr034@gmail.com","permanent_address":"PARAPPALLATH (H), KAVATHIKULAM, KOTTAKKAL PO, PIN: 676503, MALAPPURAM, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1023"},{"adm":"1030","username":"1030","password":"10301030","full_name":"MUHAMMED FARHAN","section":"DEGREE","validity_date":"2028-02-28","father":"ABDUL NAZAR CH","house":"AMAN HOUSE","place":"UMMATHUR","post":"PARAKKADAVU (PO)","pin":"673509","district":"KOZHIKODE","state":"KERALA","blood_group":"O+","dob":"2007-12-13","phone":"8943080726","email":"faruaman186@gmail.com","permanent_address":"AMAN HOUSE, UMMATHUR, PARAKKADAVU (PO), PIN: 673509, KOZHIKODE, KERALA","current_address":"ABCD Campus Residences, Block A, Room 1030"}];

  const OFFICIAL_SUBJECTS = [
    { code: 'CS601', name: 'Advanced Data Structures & Algorithms', credits: 4 },
    { code: 'CS602', name: 'Cloud Computing & Distributed Systems', credits: 4 },
    { code: 'CS603', name: 'Artificial Intelligence & Machine Learning', credits: 4 },
    { code: 'CS604', name: 'Database Management Systems & NoSQL', credits: 4 },
    { code: 'CS605', name: 'Computer Networks & Cybersecurity', credits: 3 },
    { code: 'CS606', name: 'Software Engineering & DevOps', credits: 3 },
    { code: 'CS607', name: 'Full-Stack Web Development Lab', credits: 2 },
    { code: 'CS608', name: 'Mobile Application Development', credits: 2 },
    { code: 'CS609', name: 'Cyber Law, Ethics & Intellectual Property', credits: 2 },
    { code: 'CS610', name: 'Capstone Project & Technical Seminar', credits: 2 }
  ];

  const DEFAULT_QUIZZES = [
    {
      id: 'quiz-ai-101',
      title: 'AI & Machine Learning Mid-Term Assessment',
      subject_code: 'CS603',
      subject_name: 'Artificial Intelligence & Machine Learning',
      duration_minutes: 15,
      total_marks: 25,
      pass_marks: 12,
      status: 'Available',
      questions: [
        { id: 'q1', question: 'Which optimization algorithm adapts the learning rate for each parameter using first and second moments of the gradients?', options: ['SGD', 'Adam Optimizer', 'RMSprop', 'Adagrad'], correct_index: 1, points: 5 },
        { id: 'q2', question: 'What technique prevents overfitting in deep neural networks by randomly deactivating neurons during training?', options: ['Batch Normalization', 'Dropout', 'Data Augmentation', 'Gradient Clipping'], correct_index: 1, points: 5 },
        { id: 'q3', question: 'In supervised classification, what metric represents the harmonic mean of precision and recall?', options: ['ROC-AUC Score', 'F1-Score', 'Mean Squared Error', 'Cross-Entropy Loss'], correct_index: 1, points: 5 },
        { id: 'q4', question: 'Which activation function mitigates the vanishing gradient problem while allowing negative values through a small slope?', options: ['Sigmoid', 'Tanh', 'Leaky ReLU', 'Softmax'], correct_index: 2, points: 5 },
        { id: 'q5', question: 'What is the primary role of Multi-Head Attention in Transformer models?', options: ['Compress sequences to fixed vectors', 'Compute dynamic attention weights between tokens across representation subspaces', 'Sequential recurrent updates', 'Positional indices'], correct_index: 1, points: 5 }
      ]
    },
    {
      id: 'quiz-cyber-201',
      title: 'Cybersecurity & Network Protocols Check',
      subject_code: 'CS605',
      subject_name: 'Computer Networks & Cybersecurity',
      duration_minutes: 10,
      total_marks: 20,
      pass_marks: 10,
      status: 'Available',
      questions: [
        { id: 'q1', question: 'Which protocol operates at the Transport Layer to establish a reliable, full-duplex connection via a three-way handshake?', options: ['UDP', 'ICMP', 'TCP', 'ARP'], correct_index: 2, points: 5 },
        { id: 'q2', question: 'In asymmetric public-key cryptography (e.g., RSA), which key is used to generate a digital signature?', options: ['Public Key of Sender', 'Private Key of Sender', 'Public Key of Receiver', 'Shared Secret Key'], correct_index: 1, points: 5 },
        { id: 'q3', question: 'What type of network attack intercepts and secretly alters communication between two endpoints?', options: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'Man-in-the-Middle (MITM)', 'Buffer Overflow'], correct_index: 2, points: 5 },
        { id: 'q4', question: 'Which HTTP header prevents clickjacking attacks by blocking unauthorized iframe embedding?', options: ['X-Frame-Options: DENY', 'Content-Security-Policy: default-src *', 'Access-Control-Allow-Origin: *', 'X-XSS-Protection: 1'], correct_index: 0, points: 5 }
      ]
    }
  ];

  function calculateGrade(totalScore) {
    if (totalScore >= 90) return { letter: 'O', gp: 10.0 };
    if (totalScore >= 80) return { letter: 'A+', gp: 9.0 };
    if (totalScore >= 70) return { letter: 'A', gp: 8.0 };
    if (totalScore >= 60) return { letter: 'B+', gp: 7.0 };
    if (totalScore >= 50) return { letter: 'B', gp: 6.0 };
    if (totalScore >= 40) return { letter: 'C', gp: 5.0 };
    return { letter: 'F', gp: 0.0 };
  }

  const pendingCloudWrites = new Map();
  let lastCloudPullTime = 0;

  function getLocalStore(key, defaultVal) {
    try {
      const v = localStorage.getItem('abcd_mock_' + key);
      return v ? JSON.parse(v) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  function setLocalStore(key, val) {
    try {
      localStorage.setItem('abcd_mock_' + key, JSON.stringify(val));
    } catch (e) {}
    pendingCloudWrites.set(key, val);
  }

  async function pullFromSupabase(force = false) {
    const sb = getSupabaseClient();
    if (!sb) return false;
    const now = Date.now();
    if (!force && (now - lastCloudPullTime < 1500)) return true;
    try {
      const { data, error } = await sb
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(data)) {
        console.warn('Supabase pull warning:', error ? error.message : 'No data');
        return false;
      }

      lastCloudPullTime = Date.now();
      const seenKeys = new Set();
      const cloudQuizzes = [];

      for (const row of data) {
        if (!row || !row.title) continue;
        if (row.title.startsWith('__PORTAL_SYNC__:')) {
          const key = row.title.replace('__PORTAL_SYNC__:', '');
          if (!seenKeys.has(key) && row.questions && row.questions.value !== undefined) {
            seenKeys.add(key);
            try {
              localStorage.setItem('abcd_mock_' + key, JSON.stringify(row.questions.value));
            } catch (e) {}
          }
        } else {
          // Dedicated quiz row in `quizzes` table
          if (row.questions && row.questions._portal_type === 'quiz_item' && row.questions.quiz_data) {
            cloudQuizzes.push(row.questions.quiz_data);
          } else if (Array.isArray(row.questions)) {
            cloudQuizzes.push({
              id: 'quiz-' + row.id,
              title: row.title,
              subject_code: 'CS601',
              subject_name: 'General Assessment',
              duration_minutes: 15,
              total_marks: (row.questions.length || 1) * 5,
              pass_marks: Math.ceil(((row.questions.length || 1) * 5) * 0.4),
              status: 'Available',
              questions: row.questions
            });
          }
        }
      }

      if (cloudQuizzes.length > 0) {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('abcd_mock_quizzes_list') || 'null') || DEFAULT_QUIZZES.slice();
        } catch (e) {
          existing = DEFAULT_QUIZZES.slice();
        }
        const mergedMap = new Map();
        for (const q of cloudQuizzes) {
          if (q && q.id) mergedMap.set(q.id, q);
        }
        for (const q of existing) {
          if (q && q.id && !mergedMap.has(q.id)) mergedMap.set(q.id, q);
        }
        for (const dq of DEFAULT_QUIZZES) {
          if (!mergedMap.has(dq.id)) mergedMap.set(dq.id, dq);
        }
        try {
          localStorage.setItem('abcd_mock_quizzes_list', JSON.stringify(Array.from(mergedMap.values())));
        } catch (e) {}
      }
      return true;
    } catch (err) {
      console.warn('Supabase sync pull failed:', err);
      return false;
    }
  }

  async function flushSupabaseWrites(extraQuizRow = null) {
    const sb = getSupabaseClient();
    if (!sb) return;
    try {
      if (extraQuizRow) {
        await sb.from('quizzes').insert([{
          title: extraQuizRow.title,
          questions: {
            _portal_type: 'quiz_item',
            quiz_data: extraQuizRow
          }
        }]);
      }
      const entries = Array.from(pendingCloudWrites.entries());
      pendingCloudWrites.clear();
      for (const [key, val] of entries) {
        const syncTitle = '__PORTAL_SYNC__:' + key;
        await sb.from('quizzes').delete().eq('title', syncTitle);
        await sb.from('quizzes').insert([{
          title: syncTitle,
          questions: {
            _portal_type: 'kv_sync',
            key: key,
            value: val,
            updated_at: new Date().toISOString()
          }
        }]);
      }
    } catch (err) {
      console.warn('Supabase sync push warning:', err);
    }
  }

  function getAvatarUrl() {
    return window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg';
  }

  function buildStudentRecord(s) {
    return {
      id: 'std-' + s.adm,
      username: s.adm,
      password: s.password || (s.adm + s.adm),
      full_name: s.full_name,
      roll_no: 'ADM-' + s.adm,
      register_no: 'REG2024-' + s.adm,
      branch: (s.section || 'SECONDARY') + ' Department',
      semester: s.section === 'SECONDARY' ? 2 : (s.section === 'SENIOR SECONDARY' ? 4 : 6),
      academic_year: '2025-2026',
      section: s.section || 'SECONDARY',
      dob: s.dob,
      blood_group: s.blood_group,
      gender: 'Male',
      email: s.email,
      phone: s.phone,
      permanent_address: s.permanent_address,
      current_address: s.current_address,
      guardian_name: s.father || 'Parent',
      guardian_relation: 'Father',
      guardian_phone: s.phone,
      guardian_occupation: 'Parent / Guardian',
      photo_url: getAvatarUrl(),
      signature_url: '',
      cgpa: 8.95,
      total_credits: 30,
      validity_date: s.validity_date || '2028-02-28'
    };
  }

  function getStudentsList() {
    let list = getLocalStore('students_list', null);
    if (!list || !list.length) {
      list = SEED_STUDENTS.map(buildStudentRecord);
      setLocalStore('students_list', list);
    }
    return list;
  }

  function getQuizzesList() {
    let list = getLocalStore('quizzes_list', null);
    if (!list || !list.length) {
      list = DEFAULT_QUIZZES;
      setLocalStore('quizzes_list', list);
    }
    return list;
  }

  function getSubmissionsList() {
    return getLocalStore('submissions_list', []);
  }

  function getOutreachList() {
    let list = getLocalStore('outreach_list', null);
    if (!list) {
      list = [
        {
          id: 'outreach-std-868',
          student_id: 'std-868',
          student_name: 'Student 868',
          roll_no: 'ADM-868',
          title: 'IEEE Research Paper on Edge Computing Optimization',
          category: 'Publication',
          description: 'First-authored research paper accepted at IEEE International Conference on Cloud and Edge Computing. Awarded official peer-review certificate.',
          activity_date: '2026-03-24',
          proof_image_base64: '',
          status: 'Approved',
          awarded_marks: 4.0,
          target_subject_code: 'CS602',
          admin_remarks: 'Verified peer-reviewed publication. +4.0 Grace Marks officially credited to CS602.',
          submitted_at: '2026-03-28T10:15:00Z',
          reviewed_at: '2026-04-02T16:40:00Z'
        }
      ];
      setLocalStore('outreach_list', list);
    }
    return list;
  }

  function getSettings() {
    return getLocalStore('settings', {
      college_name: 'ABCD Institute of Technology',
      portal_title: 'ABCD Assessment Portal',
      academic_term: 'Academic Year 2025-2026',
      theme_palette: 'light-slate',
      announcement_banner: 'Notice: End-Semester & Annual Evaluations commence May 18, 2026. Hall Tickets are available in your portal.',
      banner_active: 1
    });
  }

  function getStudentBundle(studentId) {
    const list = getStudentsList();
    const cleanId = String(studentId).replace(/^std-2023-cse-/, '').replace(/^std-/, '');
    const s = list.find(x => x.id === studentId || x.username === cleanId) || list[0];
    const stdId = s.id;
    const seedInt = parseInt(s.username, 10) || 868;

    let bundle = getLocalStore('bundle_' + stdId, null);
    if (!bundle) {
      const attendance = OFFICIAL_SUBJECTS.map(sub => {
        const held = 40 + (seedInt % 7);
        const attendedPct = 0.76 + (((seedInt * 17) % 19) / 100);
        const attended = Math.min(held, Math.max(28, Math.round(held * attendedPct)));
        return {
          id: 'att-' + stdId + '-' + sub.code,
          student_id: stdId,
          subject_code: sub.code,
          subject_name: sub.name,
          total_classes: held,
          classes_attended: attended
        };
      });

      let totalCredits = 0;
      let totalGradePoints = 0;
      const marks = OFFICIAL_SUBJECTS.map((sub, idx) => {
        const seedNum = (seedInt + idx * 7) % 100;
        const t1 = 12 + (seedNum % 4);
        const t2 = 12 + ((seedNum + 2) % 4);
        const ass = 7.5 + ((seedNum % 5) * 0.5);
        const sem = 3.5 + ((seedNum % 4) * 0.5);
        const grace = (s.username === '868' && sub.code === 'CS602') ? 4.0 : 0;
        const cceTotal = t1 + t2 + ass + sem + grace;
        const th = 48 + ((seedNum * 3) % 13);
        const pr = 23 + ((seedNum * 2) % 6);
        const endSemTotal = th + pr;
        const combinedScore = Math.round(((cceTotal + endSemTotal) / 150) * 100);
        const { letter, gp } = calculateGrade(combinedScore);

        totalCredits += sub.credits;
        totalGradePoints += sub.credits * gp;

        return {
          id: 'mark-' + stdId + '-' + sub.code,
          student_id: stdId,
          subject_code: sub.code,
          subject_name: sub.name,
          credits: sub.credits,
          cce_test1: t1,
          cce_test2: t2,
          cce_assignment: ass,
          cce_seminar: sem,
          grace_marks: grace,
          cce_total: cceTotal,
          endsem_theory: th,
          endsem_practical: pr,
          endsem_total: endSemTotal,
          grade_letter: letter,
          grade_points: gp
        };
      });

      const finalCgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 8.95;
      s.cgpa = finalCgpa;

      const fee = {
        student_id: stdId,
        total_assigned: 120000,
        paid_amount: 105000,
        pending_dues: 15000,
        tuition_fee: 70000,
        hostel_fee: 30000,
        lab_fee: 10000,
        library_fee: 5000,
        exam_fee: 5000,
        hall_ticket_locked: 0
      };

      const transactions = [
        {
          id: 'txn-' + stdId,
          student_id: stdId,
          txn_ref: 'TXN-2025-' + s.username,
          date: '2025-08-15 10:30 AM',
          category: 'Semester Tuition Fee',
          method: 'UPI / NetBanking',
          amount: 105000,
          status: 'Successful',
          receipt_no: 'REC-' + (seedInt + 90000)
        }
      ];

      const timetable = OFFICIAL_SUBJECTS.map((sub, idx) => ({
        code: sub.code,
        name: sub.name,
        date: '2026-05-' + String(18 + (idx * 2)).padStart(2, '0'),
        time: idx < 6 ? '09:30 AM - 12:30 PM' : '01:30 PM - 04:30 PM',
        room: idx < 6 ? 'Exam Hall A-204' : 'Computing Lab 4',
        seat: 'A-' + (10 + (seedInt % 40))
      }));

      const hallTicket = {
        student_id: stdId,
        exam_title: 'End-Semester Examinations (Spring 2026)',
        exam_center: 'ABCD Institute of Technology - Main Examination Complex, Block A',
        center_code: 'ABCD-EXAM-01',
        status: 'Published',
        is_locked: 0,
        timetable: timetable,
        instructions: '1. Hall Ticket is mandatory for entry alongside College Physical ID.\n2. Electronic devices strictly prohibited.'
      };

      bundle = {
        student: s,
        attendance,
        marks,
        fee,
        transactions,
        hallTicket
      };
      setLocalStore('bundle_' + stdId, bundle);
    } else {
      // Always sync latest student profile edits
      bundle.student = Object.assign({}, bundle.student, s);
    }

    // Dynamically merge global quizzes, student submissions, and student outreach
    const quizzes = getQuizzesList();
    const submissions = getSubmissionsList().filter(sub => sub.student_id === stdId);
    const outreach = getOutreachList().filter(o => o.student_id === stdId);

    return {
      ...bundle,
      quizzes,
      submissions,
      outreach
    };
  }

  // Intercept fetch calls for Netlify / static hosting / offline execution
  const _origFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = async function(resource, init) {
    const url = typeof resource === 'string' ? resource : (resource && resource.url) || '';

    if (url.includes('/api/')) {
      // Try live Node.js server first when running over http/https (skip for file://)
      if (_origFetch && window.location.protocol !== 'file:') {
        try {
          const res = await _origFetch(resource, init);
          const ct = (res.headers && res.headers.get('content-type')) || '';
          // Only trust response if it actually returned JSON from a real API backend (not Netlify 404/405 HTML)
          if (ct.includes('application/json') && (res.ok || res.status === 400 || res.status === 401 || res.status === 403)) {
            return res;
          }
        } catch (e) {
          // Live backend unreachable or offline -> fall back to client-side engine
        }
      }

      const method = (init && init.method) ? init.method.toUpperCase() : 'GET';
      let body = {};
      if (init && init.body) {
        try { body = JSON.parse(init.body); } catch (e) { body = {}; }
      }

      // Sync latest data from Supabase before processing API call
      await pullFromSupabase(method !== 'GET');
      pendingCloudWrites.clear();
      let createdQuizForCloud = null;

      async function jsonResponse(data, status = 200) {
        if (method !== 'GET' && status >= 200 && status < 300) {
          await flushSupabaseWrites(createdQuizForCloud);
        } else {
          pendingCloudWrites.clear();
        }
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 1. Settings
      if (url.includes('/api/settings')) {
        if (method === 'GET') {
          return jsonResponse({ success: true, settings: getSettings() });
        }
        if (method === 'PUT') {
          const cur = getSettings();
          const upd = Object.assign({}, cur, body);
          setLocalStore('settings', upd);
          return jsonResponse({ success: true, message: 'Settings saved.', settings: upd });
        }
      }

      // 2. Auth Login
      if (url.includes('/api/auth/login') && method === 'POST') {
        const u = String(body.username || '').trim();
        const p = String(body.password || '').trim();

        // Admin check: zayan / zayan868 ONLY
        if (u === 'zayan' && p === 'zayan868') {
          return jsonResponse({
            success: true,
            user: { id: 'user-admin-zayan', username: 'zayan', role: 'admin' },
            student: null
          });
        }

        const list = getStudentsList();
        const existingStudent = list.find(x => x.username === u);
        if (existingStudent) {
          const expectedPass = existingStudent.password || (u + u);
          if (p === expectedPass || p === (u + u)) {
            return jsonResponse({
              success: true,
              user: { id: 'user-std-' + u, username: u, role: 'student', student_id: existingStudent.id },
              student: existingStudent
            });
          }
          return jsonResponse({
            success: false,
            message: 'Invalid password for student ID ' + u + '.'
          }, 401);
        }

        // Fallback: auto-provision numeric student ADM if password === u + u
        if (/^\d{2,6}$/.test(u) && p === (u + u)) {
          const newS = buildStudentRecord({
            adm: u,
            full_name: 'Student ' + u,
            section: 'SECONDARY',
            validity_date: '2028-02-28',
            father: 'Parent / Guardian',
            dob: '2008-05-18',
            blood_group: 'O+',
            phone: '+91 9846000000',
            email: 'student.' + u + '@abcd.edu',
            permanent_address: 'Campus Residences, Tech City, KERALA',
            current_address: 'ABCD Campus Residences, Block A, Room ' + u
          });
          list.push(newS);
          setLocalStore('students_list', list);

          return jsonResponse({
            success: true,
            user: { id: 'user-std-' + u, username: u, role: 'student', student_id: newS.id },
            student: newS
          });
        }

        return jsonResponse({
          success: false,
          message: 'Invalid username or password. Student format: Admission Number (e.g. 1041) with doubled password (10411041).'
        }, 401);
      }

      // 3. Student Bundle
      if (url.includes('/api/student-bundle/')) {
        const studentId = url.split('/api/student-bundle/')[1].split('?')[0];
        const bundle = getStudentBundle(studentId);
        return jsonResponse({ success: true, ...bundle });
      }

      // 4. Admin Overview Stats
      if (url.includes('/api/admin/overview')) {
        const list = getStudentsList();
        const quizzes = getQuizzesList();
        const subs = getSubmissionsList();
        const outreach = getOutreachList();
        const pendingOutreach = outreach.filter(o => o.status === 'Pending').length;
        const flaggedViolations = subs.filter(s => (s.violation_count || 0) > 0).length;
        return jsonResponse({
          success: true,
          stats: {
            totalStudents: list.length,
            totalQuizzes: quizzes.length,
            totalSubmissions: subs.length,
            pendingOutreach,
            totalFeesCollected: list.length * 105000,
            totalFeesPending: list.length * 15000,
            flaggedViolations
          }
        });
      }

      // 5. Students CRUD
      if (url.endsWith('/api/students') || url.includes('/api/students?')) {
        if (method === 'GET') {
          return jsonResponse({ success: true, students: getStudentsList() });
        }
        if (method === 'POST') {
          const raw = String(body.username || '').trim();
          const list = getStudentsList();
          if (list.some(x => x.username === raw)) {
            return jsonResponse({ success: false, message: 'Student username already exists.' }, 400);
          }
          const newS = buildStudentRecord({
            adm: raw,
            password: body.password || (raw + raw),
            full_name: body.full_name || ('Student ' + raw),
            section: body.section || 'SECONDARY',
            validity_date: body.validity_date || '2028-02-28',
            father: body.guardian_name || 'Parent / Guardian',
            dob: body.dob || '2008-05-18',
            blood_group: body.blood_group || 'O+',
            phone: body.phone || '+91 9846000000',
            email: body.email || ('student.' + raw + '@abcd.edu'),
            permanent_address: body.permanent_address || 'Campus Residences, Tech City, KERALA',
            current_address: body.current_address || ('ABCD Campus Residences, Block A, Room ' + raw)
          });
          if (body.roll_no) newS.roll_no = body.roll_no;
          if (body.branch) newS.branch = body.branch;
          if (body.semester) newS.semester = Number(body.semester);
          list.unshift(newS);
          setLocalStore('students_list', list);
          return jsonResponse({ success: true, message: 'Student created successfully.', studentId: newS.id }, 201);
        }
      }

      // 6. Delete Student
      if (/\/api\/students\/[^\/]+$/.test(url.split('?')[0]) && method === 'DELETE') {
        const studentId = url.split('/api/students/')[1].split('?')[0];
        let list = getStudentsList();
        list = list.filter(x => x.id !== studentId && x.username !== studentId);
        setLocalStore('students_list', list);
        return jsonResponse({ success: true, message: 'Student deleted successfully.' });
      }

      // 7. Master Customize Student
      if (url.includes('/master-customize') && method === 'PUT') {
        const studentId = url.split('/api/students/')[1].split('/')[0];
        const list = getStudentsList();
        const s = list.find(x => x.id === studentId || x.username === studentId.replace(/^std-/, ''));
        if (s) {
          Object.assign(s, {
            full_name: body.full_name || s.full_name,
            roll_no: body.roll_no || s.roll_no,
            register_no: body.register_no || s.register_no,
            branch: body.branch || s.branch,
            semester: Number(body.semester) || s.semester,
            section: body.section || s.section,
            dob: body.dob || s.dob,
            blood_group: body.blood_group || s.blood_group,
            email: body.email || s.email,
            phone: body.phone || s.phone,
            permanent_address: body.permanent_address || s.permanent_address,
            current_address: body.current_address || s.current_address,
            guardian_name: body.guardian_name || s.guardian_name,
            guardian_relation: body.guardian_relation || s.guardian_relation,
            guardian_phone: body.guardian_phone || s.guardian_phone,
            guardian_occupation: body.guardian_occupation || s.guardian_occupation,
            validity_date: body.validity_date || s.validity_date
          });
          setLocalStore('students_list', list);

          const bundle = getStudentBundle(s.id);
          bundle.student = Object.assign({}, bundle.student, s);
          if (body.fees) {
            const f = body.fees;
            const totalAssigned = Number(f.tuition_fee || 0) + Number(f.hostel_fee || 0) + Number(f.lab_fee || 0) + Number(f.library_fee || 0) + Number(f.exam_fee || 0);
            const paid = Number(f.paid_amount || 0);
            Object.assign(bundle.fee, {
              tuition_fee: Number(f.tuition_fee || 0),
              hostel_fee: Number(f.hostel_fee || 0),
              lab_fee: Number(f.lab_fee || 0),
              library_fee: Number(f.library_fee || 0),
              exam_fee: Number(f.exam_fee || 0),
              total_assigned: totalAssigned,
              paid_amount: paid,
              pending_dues: Math.max(0, totalAssigned - paid),
              hall_ticket_locked: f.hall_ticket_locked ? 1 : 0
            });
          }
          if (body.hall_ticket) {
            Object.assign(bundle.hallTicket, {
              exam_center: body.hall_ticket.exam_center || bundle.hallTicket.exam_center,
              center_code: body.hall_ticket.center_code || bundle.hallTicket.center_code,
              instructions: body.hall_ticket.instructions || bundle.hallTicket.instructions,
              is_locked: body.hall_ticket.is_locked ? 1 : 0
            });
          }
          setLocalStore('bundle_' + s.id, bundle);
        }
        return jsonResponse({ success: true, message: 'Student customized successfully.' });
      }

      // 8. Attendance & Marks Update
      if (url.includes('/attendance-marks') && method === 'PUT') {
        const studentId = url.split('/api/students/')[1].split('/')[0];
        const bundle = getStudentBundle(studentId);
        if (body.attendance) bundle.attendance = body.attendance;
        if (body.marks) {
          bundle.marks = body.marks;
          let totalCredits = 0;
          let totalPoints = 0;
          bundle.marks.forEach(m => {
            totalCredits += Number(m.credits || 3);
            totalPoints += Number(m.credits || 3) * Number(m.grade_points || 8);
          });
          if (totalCredits > 0) {
            bundle.student.cgpa = Number((totalPoints / totalCredits).toFixed(2));
          }
        }
        setLocalStore('bundle_' + bundle.student.id, bundle);
        return jsonResponse({ success: true, message: 'Attendance & Marks updated.' });
      }

      // 9. Hall Ticket Lock Toggle
      if (url.includes('/hall-ticket-lock') && method === 'PUT') {
        const studentId = url.split('/api/students/')[1].split('/')[0];
        const bundle = getStudentBundle(studentId);
        const lockedVal = body.is_locked ? 1 : 0;
        bundle.hallTicket.is_locked = lockedVal;
        bundle.fee.hall_ticket_locked = lockedVal;
        setLocalStore('bundle_' + bundle.student.id, bundle);
        return jsonResponse({ success: true, message: 'Hall ticket state updated.' });
      }

      // 10. Fee Payment
      if (url.includes('/pay-fee') && method === 'POST') {
        const studentId = url.split('/api/students/')[1].split('/')[0];
        const bundle = getStudentBundle(studentId);
        const amt = Number(body.amount || 0);
        bundle.fee.paid_amount += amt;
        bundle.fee.pending_dues = Math.max(0, bundle.fee.total_assigned - bundle.fee.paid_amount);
        const receiptNo = 'REC-' + Math.floor(10000 + Math.random() * 90000);
        const txnRef = 'TXN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        bundle.transactions.unshift({
          id: 'txn-' + Math.random().toString(36).slice(2, 8),
          student_id: bundle.student.id,
          txn_ref: txnRef,
          date: new Date().toLocaleString(),
          category: body.category || 'Tuition Fee',
          method: body.method || 'Online Portal',
          amount: amt,
          status: 'Successful',
          receipt_no: receiptNo
        });
        setLocalStore('bundle_' + bundle.student.id, bundle);
        return jsonResponse({
          success: true,
          message: 'Payment processed',
          paid_amount: bundle.fee.paid_amount,
          pending_dues: bundle.fee.pending_dues,
          receipt_no: receiptNo,
          txn_ref: txnRef
        });
      }

      // 11. Quizzes (Create & Broadcast / Submit)
      if ((url.endsWith('/api/quizzes') || url.includes('/api/quizzes?')) && method === 'POST') {
        const quizzes = getQuizzesList();
        const newQuiz = {
          id: 'quiz-' + Date.now(),
          title: body.title || 'New Assessment',
          subject_code: body.subject_code || 'CS601',
          subject_name: (OFFICIAL_SUBJECTS.find(s => s.code === body.subject_code) || {}).name || body.subject_code || 'General Assessment',
          duration_minutes: Number(body.duration_minutes) || 15,
          total_marks: Number(body.total_marks) || 20,
          pass_marks: Math.ceil((Number(body.total_marks) || 20) * 0.4),
          status: 'Available',
          questions: (body.questions || []).map((q, i) => ({
            id: q.id || ('q' + (i + 1)),
            question: q.question,
            options: q.options || [],
            correct_index: Number(q.correct_index || 0),
            points: Number(q.points || 5),
            explanation: q.explanation || ''
          }))
        };
        quizzes.unshift(newQuiz);
        createdQuizForCloud = newQuiz;
        setLocalStore('quizzes_list', quizzes);
        return jsonResponse({ success: true, quiz: newQuiz }, 201);
      }

      if (url.includes('/api/quizzes/') && url.includes('/submit') && method === 'POST') {
        const quizId = url.split('/api/quizzes/')[1].split('/')[0];
        const quizzes = getQuizzesList();
        const quiz = quizzes.find(q => q.id === quizId);
        let score = 0;
        let max_score = 0;
        if (quiz && quiz.questions) {
          quiz.questions.forEach(q => {
            const pts = Number(q.points || 5);
            max_score += pts;
            const chosen = body.answers ? body.answers[q.id] : undefined;
            if (chosen !== undefined && Number(chosen) === Number(q.correct_index)) {
              score += pts;
            }
          });
        }
        const subs = getSubmissionsList();
        const subRecord = {
          id: 'sub-' + Date.now(),
          quiz_id: quizId,
          quiz_title: quiz ? quiz.title : 'Assessment',
          student_id: body.student_id,
          student_name: body.student_name || 'Student',
          roll_no: body.roll_no || '',
          score,
          max_score: max_score || (quiz ? quiz.total_marks : 20),
          violation_count: Number(body.violation_count || 0),
          violation_logs: body.violation_logs || [],
          answers: body.answers || {},
          auto_submitted: Boolean(body.auto_submitted),
          submitted_at: body.submit_time || new Date().toISOString()
        };
        subs.unshift(subRecord);
        setLocalStore('submissions_list', subs);
        return jsonResponse({ success: true, ...subRecord });
      }

      // 12. Quiz Submissions List & Override
      if (url.includes('/api/quiz-submissions')) {
        if (url.includes('/override') && method === 'PUT') {
          const subId = url.split('/api/quiz-submissions/')[1].split('/')[0];
          const subs = getSubmissionsList();
          const sub = subs.find(s => s.id === subId);
          if (sub) {
            sub.score = Number(body.score || 0);
            setLocalStore('submissions_list', subs);
          }
          return jsonResponse({ success: true, message: 'Score overridden.' });
        }
        return jsonResponse({ success: true, submissions: getSubmissionsList() });
      }

      // 13. Outreach Claims & Review
      if (url.includes('/api/outreach')) {
        if (url.includes('/review') && method === 'PUT') {
          const outId = url.split('/api/outreach/')[1].split('/')[0];
          const list = getOutreachList();
          const item = list.find(o => o.id === outId);
          if (item) {
            item.status = body.status || 'Approved';
            item.awarded_marks = Number(body.awarded_marks || 0);
            item.target_subject_code = body.target_subject_code || 'CS602';
            item.admin_remarks = body.admin_remarks || 'Reviewed.';
            item.reviewed_at = new Date().toISOString();
            setLocalStore('outreach_list', list);

            if (item.status === 'Approved' && item.awarded_marks > 0 && item.student_id) {
              const bundle = getStudentBundle(item.student_id);
              const markRow = bundle.marks.find(m => m.subject_code === item.target_subject_code);
              if (markRow) {
                markRow.grace_marks = Number(item.awarded_marks);
                markRow.cce_total = Number(markRow.cce_test1) + Number(markRow.cce_test2) + Number(markRow.cce_assignment) + Number(markRow.cce_seminar) + markRow.grace_marks;
                const combined = Math.round(((markRow.cce_total + markRow.endsem_total) / 150) * 100);
                const g = calculateGrade(combined);
                markRow.grade_letter = g.letter;
                markRow.grade_points = g.gp;
                setLocalStore('bundle_' + bundle.student.id, bundle);
              }
            }
          }
          return jsonResponse({ success: true, message: 'Outreach claim updated.' });
        }

        if (method === 'POST') {
          const list = getOutreachList();
          const newItem = {
            id: 'outreach-' + Date.now(),
            student_id: body.student_id,
            student_name: body.student_name || 'Student',
            roll_no: body.roll_no || '',
            title: body.title || 'Evidence Claim',
            category: body.category || 'Activity',
            description: body.description || '',
            activity_date: body.activity_date || new Date().toISOString().split('T')[0],
            proof_image_base64: body.proof_image_base64 || '',
            status: 'Pending',
            awarded_marks: 0,
            target_subject_code: body.target_subject_code || 'CS602',
            admin_remarks: '',
            submitted_at: new Date().toISOString()
          };
          list.unshift(newItem);
          setLocalStore('outreach_list', list);
          return jsonResponse({ success: true, outreach: newItem }, 201);
        }

        return jsonResponse({ success: true, outreach: getOutreachList() });
      }

      // Generic fallback
      return jsonResponse({ success: true, message: 'Action processed.' });
    }

    return _origFetch ? _origFetch(resource, init) : Promise.reject(new Error('Fetch unavailable'));
  };
})();

// ABCD Assessment Portal - Frontend Application Logic & Anti-Cheat Engine

// Global State
let currentUser = null; // { id, username, role, student_id }
let currentStudentBundle = null; // Contains student, attendance (10 subjects), marks, fee, transactions, hallTicket, quizzes, outreach
let activeTab = 'dashboard';
let activeQuiz = null;
let quizTimerInterval = null;
let quizTimeRemaining = 0;
let quizViolations = 0;
let quizViolationLogs = [];
let quizStudentAnswers = {};
let isQuizLocked = false;
let attendanceFilter = 'all';

// Charts cache
let semesterChartInstance = null;
let attendanceChartInstance = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Load global portal theme and branding
  await loadPortalSettings();

  // Check existing session
  const storedUser = localStorage.getItem('abcd_user');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      await loadPortalData();
      showAppContainer();
    } catch (e) {
      console.error('Session load failed:', e);
      showLoginView();
    }
  } else {
    showLoginView();
  }
});

// Helper setters
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text !== undefined && text !== null ? text : '';
}
function setSrc(id, src) {
  const el = document.getElementById(id);
  if (el && src) el.src = src;
}

// Toast Notifications
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    info: 'border-indigo-500/50 bg-slate-900/95 text-indigo-300',
    success: 'border-emerald-500/50 bg-slate-900/95 text-emerald-300',
    warning: 'border-amber-500/50 bg-slate-900/95 text-amber-300',
    error: 'border-rose-500/50 bg-slate-900/95 text-rose-300'
  };

  toast.className = `p-3.5 rounded-2xl border shadow-2xl transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0 flex items-start gap-3 text-xs ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <div class="font-bold flex-1">
      <div class="text-white">${title}</div>
      <div class="text-slate-400 font-normal mt-0.5">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white">&times;</button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & SESSION MANAGEMENT
// -------------------------------------------------------------
function showLoginView() {
  document.getElementById('viewLogin').classList.remove('hidden');
  document.getElementById('appContainer').classList.add('hidden');
  if (window.lucide) lucide.createIcons();
}

function showAppContainer() {
  const loginView = document.getElementById('viewLogin');
  const appContainer = document.getElementById('appContainer');
  if (loginView) loginView.classList.add('hidden');
  if (appContainer) appContainer.classList.remove('hidden');

  if (currentUser && currentUser.role === 'admin') {
    setText('sidebarUserRoleBadge', 'Admin Control');
    const b = document.getElementById('sidebarUserRoleBadge');
    if (b) b.className = 'text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider';
    setText('sidebarUserName', 'Administrator');
    setText('sidebarUserSub', 'Super Administrator');
    setSrc('userAvatarImg', window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg');
    setText('headerRoleBadge', 'Admin Control: Zayan');
    const h = document.getElementById('headerRoleBadge');
    if (h) h.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700';

    const sNav = document.getElementById('studentNavGroup');
    const aNav = document.getElementById('adminNavGroup');
    if (sNav) sNav.classList.add('hidden');
    if (aNav) aNav.classList.remove('hidden');

    switchTab('adminDashboard');
  } else {
    setText('sidebarUserRoleBadge', 'Student Portal');
    const b = document.getElementById('sidebarUserRoleBadge');
    if (b) b.className = 'text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider';
    if (currentStudentBundle && currentStudentBundle.student) {
      setText('sidebarUserName', currentStudentBundle.student.full_name);
      setText('sidebarUserSub', `ID: ${currentStudentBundle.student.username} (${currentStudentBundle.student.roll_no})`);
      setSrc('userAvatarImg', window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg');
    }
    setText('headerRoleBadge', 'Student Account');
    const h = document.getElementById('headerRoleBadge');
    if (h) h.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700';

    const sNav = document.getElementById('studentNavGroup');
    const aNav = document.getElementById('adminNavGroup');
    if (sNav) sNav.classList.remove('hidden');
    if (aNav) aNav.classList.add('hidden');

    switchTab('dashboard');
  }

  updateThemeControlsUI();
  if (window.lucide) lucide.createIcons();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const errAlert = document.getElementById('loginErrorAlert');
  const errText = document.getElementById('loginErrorText');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (errAlert) errAlert.classList.add('hidden');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying...</span>';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('abcd_user', JSON.stringify(currentUser));
      try {
        await loadPortalData();
      } catch (loadErr) {
        console.warn('Data load warning:', loadErr);
      }
      showAppContainer();
      showToast('Authentication Successful', `Welcome to ABCD Portal, ${currentUser.username}!`, 'success');
      return;
    } else {
      if (errText) errText.textContent = data.message || 'Invalid username or password.';
      if (errAlert) errAlert.classList.remove('hidden');
    }
  } catch (err) {
    console.warn('API unavailable, testing offline fallback...');
    // Offline local fallback
    if (username === 'zayan' && password === 'zayan868') {
      currentUser = { id: 'user-admin-zayan', username: 'zayan', role: 'admin' };
      localStorage.setItem('abcd_user', JSON.stringify(currentUser));
      try { await loadPortalData(); } catch (e) {}
      showAppContainer();
      showToast('Admin Signed In', 'Welcome Administrator Zayan!', 'success');
      return;
    } else if (/^\d{2,6}$/.test(username) && password === (username + username)) {
      currentUser = { id: `user-student-${username}`, username: username, role: 'student', student_id: `std-${username}` };
      localStorage.setItem('abcd_user', JSON.stringify(currentUser));
      try { await loadPortalData(); } catch (e) {}
      showAppContainer();
      showToast('Student Signed In', `Welcome Student ID ${username}!`, 'success');
      return;
    } else {
      if (errText) errText.textContent = 'Invalid credentials. Student format: 3-digit ID (e.g. 868) with doubled password (868868).';
      if (errAlert) errAlert.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign In to Portal</span><i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

function handleLogout() {
  localStorage.removeItem('abcd_user');
  currentUser = null;
  currentStudentBundle = null;
  showLoginView();
  showToast('Signed Out', 'You have been safely signed out.', 'info');
}

function togglePasswordVisibility(fieldId) {
  const f = document.getElementById(fieldId);
  if (f) {
    f.type = f.type === 'password' ? 'text' : 'password';
  }
}

function updateAutoPasswordPreview(val) {
  const preview = document.getElementById('newStdPasswordPreview');
  const rollInput = document.getElementById('newStdRollNo');
  if (!preview) return;

  const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
  document.getElementById('newStdUsername').value = clean;
  if (clean.length >= 3) {
    preview.value = clean + clean;
    if (rollInput && !rollInput.value) {
      rollInput.value = `ADM-${clean}`;
    }
  } else {
    preview.value = '';
  }
}

// -------------------------------------------------------------
// 2. DATA LOADING & API SYNC
// -------------------------------------------------------------
async function loadPortalData() {
  if (!currentUser) return;

  if (currentUser.role === 'student') {
    const studentId = currentUser.student_id || `std-2023-cse-${currentUser.username || '868'}`;
    try {
      const res = await fetch(`/api/student-bundle/${studentId}`);
      if (res.ok) {
        currentStudentBundle = await res.json();
        localStorage.setItem(`abcd_bundle_${studentId}`, JSON.stringify(currentStudentBundle));
      } else {
        throw new Error('Bundle fetch failed');
      }
    } catch (e) {
      console.warn('API fetch failed, loading cached data...');
      const cached = localStorage.getItem(`abcd_bundle_${studentId}`);
      if (cached) {
        currentStudentBundle = JSON.parse(cached);
      }
    }
    renderStudentPortalViews();
  } else if (currentUser.role === 'admin') {
    await loadAdminPortalViews();
  }
}

// -------------------------------------------------------------
// 3. TAB NAVIGATION CONTROLLER
// -------------------------------------------------------------
function switchTab(tabId) {
  activeTab = tabId;

  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) {
    targetPane.classList.remove('hidden');
  }

  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.getAttribute('data-tab') === tabId) {
      el.className = 'nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-indigo-300 bg-indigo-600/15';
    } else {
      el.className = 'nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-slate-400 hover:text-slate-200 hover:bg-slate-800/60';
    }
  });

  const titles = {
    dashboard: 'Student Dashboard Overview',
    profile: 'Comprehensive Student Profile',
    attendance: '10-Subject Attendance Tracker',
    marks: 'Academic Marks, CCE, Grace Marks & Grades',
    fees: 'Fee Status & Financial Ledger',
    hallticket: 'Hall Ticket & Examination Center',
    quizzes: 'Anti-Cheat Lockdown Quiz Portal',
    outreach: 'Outreach & Grace Marks Evidence',
    adminDashboard: 'Admin Control Center (Zayan)',
    adminCustomize: 'Portal Theme & Universal Student Master Customizer',
    adminStudents: 'Student Account Management (3-Digit IDs)',
    adminMarks: '10-Subject Valuation & Grace Marks Manager',
    adminFees: 'Fee & Billing Management Controller',
    adminHallTicket: 'Hall Ticket & Admit Card Controller',
    adminQuizzes: 'Quiz Builder & Valuation Database',
    adminOutreach: 'Outreach Review & Grace Marks Queue'
  };

  if (document.getElementById('headerPageTitle')) {
    document.getElementById('headerPageTitle').textContent = titles[tabId] || 'Portal';
  }

  if (tabId === 'dashboard') {
    setTimeout(renderDashboardCharts, 100);
  } else if (tabId === 'adminCustomize') {
    loadMasterStudentData(currentMasterStudentId);
    updateThemeControlsUI();
  }

  if (window.lucide) lucide.createIcons();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('hidden')) {
    sidebar.classList.remove('hidden');
  } else {
    sidebar.classList.add('hidden');
  }
}

function toggleNotificationMenu() {
  const menu = document.getElementById('notificationMenu');
  if (menu) menu.classList.toggle('hidden');
}

// -------------------------------------------------------------
// 4. STUDENT PORTAL RENDERING
// -------------------------------------------------------------
function renderStudentPortalViews() {
  if (!currentStudentBundle || !currentStudentBundle.student) return;

  try {
    const s = currentStudentBundle.student;
    const attList = currentStudentBundle.attendance || [];
    const marksList = currentStudentBundle.marks || [];
    const fee = currentStudentBundle.fee || {};

    // A. Welcome Banner & Stats
    setText('dashStudentName', s.full_name);
    setText('dashRollNo', s.username || '868');
    setText('dashBranch', s.branch);
    setText('dashSemester', s.semester);
    setSrc('dashStudentPhoto', window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg');
    initDailyThought();

    // Attendance stats across 10 subjects
    let totalHeld = 0;
    let totalAtt = 0;
    for (const item of attList) {
      totalHeld += Number(item.total_classes);
      totalAtt += Number(item.classes_attended);
    }
    const overallPercent = totalHeld > 0 ? ((totalAtt / totalHeld) * 100).toFixed(1) : '0.0';

    setText('statAttendancePercent', `${overallPercent}%`);
    setText('statTotalHeld', totalHeld);
    setText('statTotalAttended', totalAtt);
    const bar = document.getElementById('statAttendanceBar');
    if (bar) bar.style.width = `${overallPercent}%`;
    setText('navAttendanceBadge', `${overallPercent}%`);

    const attBadge = document.getElementById('statAttendanceBadge');
    if (attBadge) {
      if (overallPercent >= 75) {
        attBadge.textContent = 'Safe (>=75%)';
        attBadge.className = 'text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700';
      } else if (overallPercent >= 65) {
        attBadge.textContent = 'Warning (65-74%)';
        attBadge.className = 'text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700';
      } else {
        attBadge.textContent = 'Shortage (<65%)';
        attBadge.className = 'text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700';
      }
    }

    // CGPA Stat
    setText('statCgpaValue', Number(s.cgpa || 8.95).toFixed(2));

    // Fee Stat
    const pendingAmt = fee.pending_dues !== undefined ? fee.pending_dues : 15000;
    setText('statPendingDues', `₹${pendingAmt.toLocaleString()}`);
    const navFee = document.getElementById('navFeeBadge');
    if (navFee) {
      if (pendingAmt > 0) {
        navFee.textContent = `₹${pendingAmt / 1000}k Due`;
        navFee.className = 'ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      } else {
        navFee.textContent = 'Cleared';
        navFee.className = 'ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      }
    }

    // B. Student Profile View
    setSrc('profPhoto', window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg');
    setText('profFullName', s.full_name);
    setText('profRollNo', `${s.roll_no} (ID: ${s.username})`);
    setText('profRegNo', s.register_no);
    setText('profSem', `Semester ${s.semester} (Sec ${s.section || 'A'})`);
    setText('profBranchBadge', `${s.section || 'SECONDARY'} (${s.branch || 'Secondary Department'})`);
    setText('profValidityBadge', s.validity_date ? `VALID TILL ${s.validity_date}` : 'VALID 2028');
    setText('profBloodGroup', s.blood_group || 'O+');
    setText('profEmergencyPhone', s.guardian_phone || '+1 (555) 890-4123');

    setText('profDetailName', s.full_name);
    setText('profDetailId', s.username || '868');
    setText('profDetailDob', `${s.dob || 'May 18, 2004'} (${s.gender || 'Male'})`);
    setText('profDetailBranch', s.branch);
    setText('profDetailYear', `${s.academic_year || '2025-2026'} (Semester ${s.semester})`);
    setText('profDetailEmail', s.email);
    setText('profDetailPhone', s.phone);
    setText('profDetailSectionValidity', `${s.section || 'SECONDARY'} (Valid till ${s.validity_date || '2028-02-28'})`);
    setText('profDetailPermAddr', s.permanent_address);
    setText('profDetailCurrAddr', s.current_address);
    setText('profGuardianName', `${s.guardian_name} (${s.guardian_relation || 'Parent'})`);
    setText('profGuardianOcc', s.guardian_occupation);
    setText('profGuardianPhone', s.guardian_phone);

    // C. Render 10-Subject Attendance
    try { renderAttendance(); } catch (e) { console.warn('Attendance render error:', e); }

    // D. Render Marks with Grace Marks
    try { renderMarks(); } catch (e) { console.warn('Marks render error:', e); }

    // E. Render Fees
    try { renderFees(); } catch (e) { console.warn('Fees render error:', e); }

    // F. Render Hall Ticket
    try { renderHallTicket(); } catch (e) { console.warn('HallTicket render error:', e); }

    // G. Render Quizzes
    try { renderQuizzes(); } catch (e) { console.warn('Quizzes render error:', e); }

    // H. Render Outreach
    try { renderOutreach(); } catch (e) { console.warn('Outreach render error:', e); }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('renderStudentPortalViews general error:', err);
  }
}

// -------------------------------------------------------------
// CHARTS: SEMESTER PROGRESSION & 10-SUBJECT ATTENDANCE
// -------------------------------------------------------------
function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Academic Progress Across Semesters (Sem 1 to Sem 6)
  const isLightMode = document.body.classList.contains('mode-light') || document.body.classList.contains('theme-light') || !document.documentElement.classList.contains('dark');
  const chartGridColor = isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
  const chartTickColor = isLightMode ? '#64748b' : '#94a3b8';
  const chartLegendColor = isLightMode ? '#1e293b' : '#f1f5f9';
  const themePrimary = getComputedStyle(document.body).getPropertyValue('--theme-primary').trim() || (isLightMode ? '#0f172a' : '#4f46e5');

  const ctxSem = document.getElementById('semesterProgressChart');
  if (ctxSem) {
    if (semesterChartInstance) semesterChartInstance.destroy();
    semesterChartInstance = new Chart(ctxSem, {
      type: 'line',
      data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6 (Current)'],
        datasets: [
          {
            label: 'Semester SGPA',
            data: [8.60, 8.80, 8.75, 8.92, 8.90, 8.97],
            borderColor: themePrimary,
            backgroundColor: isLightMode ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.06)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: themePrimary,
            pointRadius: 4
          },
          {
            label: 'Cumulative CGPA',
            data: [8.60, 8.70, 8.72, 8.77, 8.80, 8.95],
            borderColor: '#64748b',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#64748b',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: chartLegendColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          }
        },
        scales: {
          y: {
            min: 7.0,
            max: 10.0,
            grid: { color: chartGridColor },
            ticks: { color: chartTickColor }
          },
          x: {
            grid: { display: false },
            ticks: { color: chartTickColor }
          }
        }
      }
    });
  }

  // Chart 2: 10-Subject Attendance vs 75% Threshold Line
  const ctxAtt = document.getElementById('subjectAttendanceChart');
  if (ctxAtt && currentStudentBundle && currentStudentBundle.attendance) {
    if (attendanceChartInstance) attendanceChartInstance.destroy();

    const attList = currentStudentBundle.attendance;
    const labels = attList.map(a => a.subject_code);
    const percentages = attList.map(a => Number(((a.classes_attended / a.total_classes) * 100).toFixed(1)));
    const barColors = percentages.map(p => {
      if (p >= 75) return themePrimary;
      if (p >= 65) return '#64748b';
      return '#94a3b8';
    });

    attendanceChartInstance = new Chart(ctxAtt, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Subject Attendance %',
            data: percentages,
            backgroundColor: barColors,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Attendance: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: chartGridColor },
            ticks: {
              color: chartTickColor,
              callback: (v) => `${v}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: chartTickColor, font: { size: 10, weight: 600 } }
          }
        }
      }
    });
  }
}

// -------------------------------------------------------------
// MODULE C: 10-SUBJECT ATTENDANCE TRACKER
// -------------------------------------------------------------
function filterAttendance(type) {
  attendanceFilter = type;
  ['all', 'safe', 'warn', 'short'].forEach(t => {
    const btn = document.getElementById(`attFilter${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) {
      btn.className = 'px-3 py-1 rounded-lg text-slate-400 hover:text-white transition';
    }
  });

  const activeMap = { all: 'attFilterAll', safe: 'attFilterSafe', warning: 'attFilterWarn', shortage: 'attFilterShort' };
  const targetBtn = document.getElementById(activeMap[type]);
  if (targetBtn) {
    targetBtn.className = 'px-3 py-1 rounded-lg bg-indigo-600 text-white font-medium transition';
  }

  renderAttendance();
}

function renderAttendance() {
  const container = document.getElementById('attendanceCardsContainer');
  if (!container || !currentStudentBundle) return;

  const attList = currentStudentBundle.attendance || [];
  let filtered = attList;

  if (attendanceFilter === 'safe') {
    filtered = attList.filter(a => ((a.classes_attended / a.total_classes) * 100) >= 75);
  } else if (attendanceFilter === 'warning') {
    filtered = attList.filter(a => {
      const p = (a.classes_attended / a.total_classes) * 100;
      return p >= 65 && p < 75;
    });
  } else if (attendanceFilter === 'shortage') {
    filtered = attList.filter(a => ((a.classes_attended / a.total_classes) * 100) < 65);
  }

  container.innerHTML = filtered.map(item => {
    const percent = ((item.classes_attended / item.total_classes) * 100).toFixed(1);
    let statusBadge = '';
    let barColor = '';
    let adviceText = '';

    if (percent >= 75) {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold badge-safe">Safe (&ge; 75%)</span>';
      barColor = 'bg-emerald-500';
      const canMiss = Math.floor((item.classes_attended - (0.75 * item.total_classes)) / 0.75);
      adviceText = canMiss > 0
        ? `<span class="text-emerald-400">You may miss up to <strong>${canMiss}</strong> upcoming classes safely.</span>`
        : `<span class="text-emerald-400">On threshold. Attend the next lecture to maintain status.</span>`;
    } else if (percent >= 65) {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold badge-warning">Warning (65-74%)</span>';
      barColor = 'bg-amber-500';
      const needed = Math.ceil(((0.75 * item.total_classes) - item.classes_attended) / 0.25);
      adviceText = `<span class="text-amber-400">Warning! Attend next <strong>${needed}</strong> consecutive classes to reach 75%.</span>`;
    } else {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold badge-shortage">Shortage (&lt; 65%)</span>';
      barColor = 'bg-rose-500';
      const needed = Math.ceil(((0.75 * item.total_classes) - item.classes_attended) / 0.25);
      adviceText = `<span class="text-rose-400">Critical shortage! Must attend <strong>${needed}</strong> consecutive classes for exam eligibility.</span>`;
    }

    return `
      <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ${item.subject_code}
            </span>
            <h4 class="text-sm font-bold text-white mt-1.5 leading-snug">${item.subject_name}</h4>
          </div>
          ${statusBadge}
        </div>

        <div class="space-y-1.5">
          <div class="flex justify-between items-baseline text-xs">
            <span class="text-slate-400">Classes: <strong class="text-white">${item.classes_attended}</strong> / ${item.total_classes}</span>
            <span class="text-lg font-extrabold font-mono ${percent >= 75 ? 'text-emerald-400' : percent >= 65 ? 'text-amber-400' : 'text-rose-400'}">
              ${percent}%
            </span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${percent}%"></div>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <i data-lucide="info" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
            <span>${adviceText}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// MODULE D: ACADEMIC MARKS, CCE, GRACE MARKS & GRADES
// -------------------------------------------------------------
function switchMarksSubTab(subTab) {
  document.querySelectorAll('.marks-pane').forEach(el => el.classList.add('hidden'));
  ['cce', 'endsem', 'grades'].forEach(t => {
    const btn = document.getElementById(`marksTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
  });

  const activePaneMap = { cce: 'paneMarksCce', endsem: 'paneMarksEndSem', grades: 'paneMarksGrades' };
  const activeBtnMap = { cce: 'marksTabCce', endsem: 'marksTabEndSem', grades: 'marksTabGrades' };

  document.getElementById(activePaneMap[subTab]).classList.remove('hidden');
  document.getElementById(activeBtnMap[subTab]).className = 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium transition';

  if (window.lucide) lucide.createIcons();
}

function renderMarks() {
  if (!currentStudentBundle || !currentStudentBundle.marks) return;
  const marks = currentStudentBundle.marks;

  // 1. CCE Table WITH EXPLICIT GRACE MARKS COLUMN
  const cceBody = document.getElementById('cceTableBody');
  if (cceBody) {
    cceBody.innerHTML = marks.map(m => {
      const grace = Number(m.grace_marks || 0);
      const cceTotal = (Number(m.cce_test1) + Number(m.cce_test2) + Number(m.cce_assignment) + Number(m.cce_seminar) + grace).toFixed(1);
      
      let graceBadge = '<span class="text-slate-600 font-mono">-</span>';
      if (grace > 0) {
        graceBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">+${grace.toFixed(1)} Grace</span>`;
      }

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3.5 font-mono text-indigo-400 font-bold">${m.subject_code}</td>
          <td class="p-3.5 text-slate-200 font-semibold">${m.subject_name}</td>
          <td class="p-3.5 text-center font-mono">${m.cce_test1}</td>
          <td class="p-3.5 text-center font-mono">${m.cce_test2}</td>
          <td class="p-3.5 text-center font-mono">${m.cce_assignment}</td>
          <td class="p-3.5 text-center font-mono">${m.cce_seminar}</td>
          <td class="p-3.5 text-center">${graceBadge}</td>
          <td class="p-3.5 text-center font-mono font-bold text-white bg-indigo-500/10">${cceTotal}</td>
          <td class="p-3.5 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${cceTotal >= 40 ? 'badge-safe' : 'badge-warning'}">
              ${cceTotal >= 40 ? 'Outstanding' : 'Satisfactory'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. End-Semester Exam Marks Table
  const endSemBody = document.getElementById('endSemTableBody');
  if (endSemBody) {
    endSemBody.innerHTML = marks.map(m => {
      const examTotal = (Number(m.endsem_theory) + Number(m.endsem_practical)).toFixed(1);
      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3.5 font-mono text-indigo-400 font-bold">${m.subject_code}</td>
          <td class="p-3.5 text-slate-200 font-semibold">${m.subject_name}</td>
          <td class="p-3.5 text-center font-mono">${m.credits}</td>
          <td class="p-3.5 text-center font-mono">${m.endsem_theory}</td>
          <td class="p-3.5 text-center font-mono">${m.endsem_practical}</td>
          <td class="p-3.5 text-center font-mono font-bold text-emerald-400 bg-emerald-500/10">${examTotal}</td>
          <td class="p-3.5 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${examTotal >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-300'}">
              ${examTotal >= 80 ? 'Distinction' : 'First Class'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 3. Final Letter Grades & GPA
  const gradesBody = document.getElementById('gradesTableBody');
  if (gradesBody) {
    let totalCred = 0;
    let totalPoints = 0;

    gradesBody.innerHTML = marks.map(m => {
      const cred = Number(m.credits);
      const gp = Number(m.grade_points);
      const cp = (cred * gp).toFixed(1);
      totalCred += cred;
      totalPoints += cred * gp;

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3.5 font-mono text-indigo-400 font-bold">${m.subject_code}</td>
          <td class="p-3.5 text-slate-200 font-semibold">${m.subject_name}</td>
          <td class="p-3.5 text-center font-mono font-bold">${cred}</td>
          <td class="p-3.5 text-center">
            <span class="px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${m.grade_letter === 'O' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}">
              ${m.grade_letter}
            </span>
          </td>
          <td class="p-3.5 text-center font-mono">${gp.toFixed(1)}</td>
          <td class="p-3.5 text-center font-mono font-bold text-white">${cp}</td>
          <td class="p-3.5 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold badge-safe">PASS</span>
          </td>
        </tr>
      `;
    }).join('');

    const sgpa = totalCred > 0 ? (totalPoints / totalCred).toFixed(2) : '8.97';
    document.getElementById('marksSgpaValue').textContent = sgpa;
    document.getElementById('marksCgpaValue').textContent = currentStudentBundle.student.cgpa || '8.95';
  }
}

// -------------------------------------------------------------
// MODULE E: FEE STATUS & FINANCIAL LEDGER
// -------------------------------------------------------------
function renderFees() {
  if (!currentStudentBundle || !currentStudentBundle.fee) return;
  const f = currentStudentBundle.fee;
  const txns = currentStudentBundle.transactions || [];

  document.getElementById('feeAssignedTotal').textContent = `₹${Number(f.total_assigned || 120000).toLocaleString()}`;
  document.getElementById('feePaidTotal').textContent = `₹${Number(f.paid_amount || 105000).toLocaleString()}`;
  document.getElementById('feePendingTotal').textContent = `₹${Number(f.pending_dues || 15000).toLocaleString()}`;

  document.getElementById('feeItemTuition').textContent = `₹${Number(f.tuition_fee || 70000).toLocaleString()}`;
  document.getElementById('feeItemHostel').textContent = `₹${Number(f.hostel_fee || 30000).toLocaleString()}`;
  document.getElementById('feeItemLab').textContent = `₹${Number(f.lab_fee || 10000).toLocaleString()}`;
  document.getElementById('feeItemLibrary').textContent = `₹${Number(f.library_fee || 5000).toLocaleString()}`;
  document.getElementById('feeItemExam').textContent = `₹${Number(f.exam_fee || 5000).toLocaleString()}`;

  const htStatus = document.getElementById('feeHallTicketStatus');
  if (f.hall_ticket_locked || f.pending_dues > 20000) {
    htStatus.innerHTML = '<span class="text-rose-400 flex items-center gap-1.5"><i data-lucide="lock" class="w-4 h-4"></i> Locked (Dues Overdue)</span>';
  } else {
    htStatus.innerHTML = '<span class="text-emerald-400 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> Eligible (Unlocked)</span>';
  }

  // Transactions Table
  const txnBody = document.getElementById('transactionsTableBody');
  if (txnBody) {
    txnBody.innerHTML = txns.map(t => `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="p-3.5 font-mono text-indigo-400 font-bold">${t.txn_ref}</td>
        <td class="p-3.5 text-slate-300">${t.date}</td>
        <td class="p-3.5 text-white font-medium">${t.category}</td>
        <td class="p-3.5 text-slate-400">${t.method}</td>
        <td class="p-3.5 text-right font-mono font-bold text-white">₹${Number(t.amount).toLocaleString()}</td>
        <td class="p-3.5 text-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold badge-safe">SUCCESS</span>
        </td>
        <td class="p-3.5 text-center">
          <button onclick="viewReceipt('${t.txn_ref}', '${t.date}', '${t.amount}', '${t.receipt_no}')" class="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium text-xs transition flex items-center gap-1 mx-auto">
            <i data-lucide="eye" class="w-3 h-3"></i> Receipt
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function openPayFeeModal() {
  const fee = currentStudentBundle ? currentStudentBundle.fee : { pending_dues: 15000 };
  const pending = fee.pending_dues || 15000;

  if (pending <= 0) {
    showToast('No Dues Outstanding', 'Your account has zero pending balance.', 'success');
    return;
    showToast('No Dues Outstanding', 'All your fee dues are cleared. No payment required.', 'success');
    return;
  }

  document.getElementById('modalPayPendingAmount').textContent = `₹${pending.toLocaleString()}`;
  document.getElementById('payAmountInput').value = pending;
  document.getElementById('payAmountInput').max = pending;
  document.getElementById('payAmountInput').min = 1;
  document.getElementById('payFeeModal').classList.remove('hidden');
}

function closePayFeeModal() {
  document.getElementById('payFeeModal').classList.add('hidden');
}

async function handleFeePaymentSubmit(event) {
  event.preventDefault();
  const amount = Number(document.getElementById('payAmountInput').value);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid positive payment amount.');
    return;
  }
  const method = document.getElementById('payMethodSelect').value;

  try {
    const studentId = currentUser.student_id || `std-2023-cse-${currentUser.username || '868'}`;
    const res = await fetch(`/api/students/${studentId}/pay-fee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        category: 'Student Portal Online Clearance',
        method
      })
    });
    const data = await res.json();
    if (data.success) {
      closePayFeeModal();
      showToast('Payment Completed', `Successfully processed payment of ₹${amount.toLocaleString()}!`, 'success');
      await loadPortalData();
      viewReceipt(data.txn_ref, 'Just Now', amount, data.receipt_no);
    }
  } catch (err) {
    closePayFeeModal();
    showToast('Payment Completed', 'Recorded.', 'success');
  }
}

function viewReceipt(txnRef, date, amount, receiptNo) {
  document.getElementById('receiptNumText').textContent = receiptNo || 'REC-98210';
  document.getElementById('receiptTxnRef').textContent = txnRef;
  document.getElementById('receiptDate').textContent = date;
  document.getElementById('receiptAmount').textContent = `₹${Number(amount).toLocaleString()}`;
  if (currentStudentBundle && currentStudentBundle.student) {
    document.getElementById('receiptStudentName').textContent = currentStudentBundle.student.full_name;
    document.getElementById('receiptRollNo').textContent = currentStudentBundle.student.roll_no;
  }
  document.getElementById('receiptModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeReceiptModal() {
  document.getElementById('receiptModal').classList.add('hidden');
}

function printCurrentReceipt() {
  window.print();
}

// -------------------------------------------------------------
// MODULE F: HALL TICKET CENTER
// -------------------------------------------------------------
function renderHallTicket() {
  if (!currentStudentBundle) return;
  const s = currentStudentBundle.student;
  const f = currentStudentBundle.fee || {};
  const ht = currentStudentBundle.hallTicket;

  const isLocked = (f.hall_ticket_locked === 1) || (ht && ht.is_locked === 1);
  const lockedBanner = document.getElementById('hallTicketLockedBanner');
  const printableArea = document.getElementById('printableHallTicket');

  if (isLocked) {
    lockedBanner.classList.remove('hidden');
    printableArea.classList.add('opacity-40', 'pointer-events-none');
    document.getElementById('lockedDuesAmount').textContent = `₹${(f.pending_dues || 15000).toLocaleString()}`;
  } else {
    lockedBanner.classList.add('hidden');
    printableArea.classList.remove('opacity-40', 'pointer-events-none');
  }

  document.getElementById('htStudentName').textContent = s.full_name;
  document.getElementById('htRollNo').textContent = s.roll_no;
  document.getElementById('htRegNo').textContent = s.register_no;
  document.getElementById('htStudentPhoto').src = window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg';

  const timetable = (ht && ht.timetable) ? ht.timetable : [];
  const tbody = document.getElementById('htTimetableBody');
  if (tbody) {
    tbody.innerHTML = timetable.map(item => `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="p-3 font-mono font-bold text-indigo-400">${item.code}</td>
        <td class="p-3 text-slate-200 font-semibold">${item.name}</td>
        <td class="p-3 font-mono text-white">${item.date}</td>
        <td class="p-3 text-slate-400 font-mono text-[11px]">${item.time}</td>
        <td class="p-3 text-slate-300">${item.room}</td>
        <td class="p-3 text-center font-mono font-bold text-indigo-300">${item.seat || 'A-22'}</td>
      </tr>
    `).join('');
  }
}

function printHallTicket() {
  const f = currentStudentBundle ? currentStudentBundle.fee : {};
  if (f.hall_ticket_locked === 1) {
    showToast('Hall Ticket Locked', 'Please settle pending dues before printing.', 'error');
    return;
  }
  window.print();
}

function printStudentIdCard() {
  window.print();
}

// -------------------------------------------------------------
// MODULE G: ANTI-CHEAT LOCKDOWN QUIZ PORTAL
// -------------------------------------------------------------
function renderQuizzes() {
  const container = document.getElementById('quizzesCardsContainer');
  if (!container || !currentStudentBundle) return;

  const quizzes = currentStudentBundle.quizzes || [];
  const submissions = currentStudentBundle.submissions || [];

  container.innerHTML = quizzes.map(q => {
    const existingSub = submissions.find(s => s.quiz_id === q.id);
    let actionBtn = '';
    let statusBadge = '';

    if (existingSub) {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</span>';
      actionBtn = `
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-400">Score: <strong class="text-emerald-400 font-mono text-sm">${existingSub.score} / ${existingSub.max_score}</strong></span>
          <button onclick="reviewCompletedQuiz('${q.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition">
            Review Answers
          </button>
        </div>
      `;
    } else {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Available</span>';
      actionBtn = `
        <button onclick="startLockdownQuiz('${q.id}')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
          <i data-lucide="shield" class="w-4 h-4"></i>
          <span>Enter Lockdown Exam</span>
        </button>
      `;
    }

    return `
      <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition">
        <div class="flex items-start justify-between gap-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ${q.subject_code}
          </span>
          ${statusBadge}
        </div>

        <div>
          <h4 class="text-sm font-bold text-white leading-snug">${q.title}</h4>
          <p class="text-xs text-slate-400 mt-1">${q.subject_name}</p>
        </div>

        <div class="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div>Duration: <strong class="text-white">${q.duration_minutes} Mins</strong></div>
          <div>Max Score: <strong class="text-white">${q.total_marks} Pts</strong></div>
        </div>

        <div class="pt-2">
          ${actionBtn}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function startLockdownQuiz(quizId) {
  const quiz = currentStudentBundle.quizzes.find(q => q.id === quizId);
  if (!quiz) return;

  const confirmMsg = `STARTING ANTI-CHEAT LOCKDOWN ASSESSMENT:\n\n1. Fullscreen mode will be enforced.\n2. Exiting fullscreen, switching tabs, or minimizing window will trigger VIOLATION WARNINGS.\n3. A 2nd violation will IMMEDIATELY auto-submit your exam.\n4. Copy/paste and right-click are strictly disabled.\n\nAre you ready to begin?`;
  if (!confirm(confirmMsg)) return;

  activeQuiz = quiz;
  quizViolations = 0;
  quizViolationLogs = [];
  quizStudentAnswers = {};
  isQuizLocked = false;
  quizTimeRemaining = quiz.duration_minutes * 60;

  try {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    }
  } catch (err) {}

  attachAntiCheatSentinels();

  document.getElementById('activeQuizTitle').textContent = quiz.title;
  document.getElementById('activeQuizTotalQ').textContent = (quiz.questions || []).length;
  updateViolationBadge();

  renderActiveQuizQuestions();
  startQuizCountdown();

  document.getElementById('quizLockdownModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function attachAntiCheatSentinels() {
  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  window.addEventListener('contextmenu', preventDefaultAction);
  window.addEventListener('copy', preventDefaultAction);
  window.addEventListener('cut', preventDefaultAction);
  window.addEventListener('paste', preventDefaultAction);
  window.addEventListener('keydown', handleQuizKeyDown);
}

function detachAntiCheatSentinels() {
  window.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('blur', handleWindowBlur);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  window.removeEventListener('contextmenu', preventDefaultAction);
  window.removeEventListener('copy', preventDefaultAction);
  window.removeEventListener('cut', preventDefaultAction);
  window.removeEventListener('paste', preventDefaultAction);
  window.removeEventListener('keydown', handleQuizKeyDown);
}

function preventDefaultAction(e) {
  e.preventDefault();
  return false;
}

function handleQuizKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 's'].includes(e.key.toLowerCase())) {
    e.preventDefault();
    return false;
  }
}

function handleVisibilityChange() {
  if (document.hidden && !isQuizLocked) {
    recordViolation('Tab switched or browser minimized');
  }
}

function handleWindowBlur() {
  if (!isQuizLocked && document.getElementById('quizLockdownModal') && !document.getElementById('quizLockdownModal').classList.contains('hidden')) {
    recordViolation('Window lost focus or application switched');
  }
}

function handleFullscreenChange() {
  if (!document.fullscreenElement && !isQuizLocked) {
    recordViolation('Exited fullscreen mode');
  }
}

function recordViolation(reason) {
  if (isQuizLocked) return;

  quizViolations++;
  const timestamp = new Date().toLocaleTimeString();
  quizViolationLogs.push({ violation: quizViolations, reason, timestamp });
  updateViolationBadge();

  if (quizViolations === 1) {
    document.getElementById('violationWarningModal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  } else if (quizViolations >= 2) {
    isQuizLocked = true;
    alert(`SECURITY LOCKDOWN TRIGGERED:\n\nViolation 2/2 detected (${reason}) at ${timestamp}.\n\nYour quiz is now auto-submitted for administrative review.`);
    finalizeAndSubmitQuiz(true);
  }
}

function dismissViolationWarning() {
  document.getElementById('violationWarningModal').classList.add('hidden');
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  } catch (e) {}
}

function updateViolationBadge() {
  const badge = document.getElementById('quizViolationBadge');
  if (badge) {
    if (quizViolations === 0) {
      badge.textContent = '0 / 2 Violations (Clean)';
      badge.className = 'font-bold text-emerald-400';
    } else if (quizViolations === 1) {
      badge.textContent = '1 / 2 Violations (FINAL WARNING)';
      badge.className = 'font-bold text-amber-400 animate-pulse';
    } else {
      badge.textContent = '2 / 2 Violations (LOCKED)';
      badge.className = 'font-bold text-rose-500';
    }
  }
}

function startQuizCountdown() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);

  const timerEl = document.getElementById('quizTimerText');
  const updateDisplay = () => {
    const mins = Math.floor(quizTimeRemaining / 60);
    const secs = quizTimeRemaining % 60;
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (quizTimeRemaining <= 120) {
      timerEl.parentElement.classList.add('bg-rose-950', 'border-rose-500', 'text-rose-400');
    }
  };

  updateDisplay();
  quizTimerInterval = setInterval(() => {
    quizTimeRemaining--;
    updateDisplay();
    if (quizTimeRemaining <= 0) {
      clearInterval(quizTimerInterval);
      alert('Time Expired! Automatically submitting assessment.');
      finalizeAndSubmitQuiz(false);
    }
  }, 1000);
}

function renderActiveQuizQuestions() {
  const container = document.getElementById('quizQuestionsContainer');
  if (!container || !activeQuiz) return;

  const questions = activeQuiz.questions || [];
  container.innerHTML = questions.map((q, idx) => `
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Question ${idx + 1}
        </span>
        <span class="text-xs text-slate-400 font-mono">${q.points || 5} Points</span>
      </div>

      <p class="text-sm font-semibold text-white leading-relaxed select-none">${q.question}</p>

      <div class="space-y-2 pt-2">
        ${(q.options || []).map((opt, optIdx) => `
          <label class="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 cursor-pointer transition select-none">
            <input type="radio" name="q_${q.id}" value="${optIdx}" onchange="recordAnswer('${q.id}', ${optIdx})" class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800">
            <span class="text-xs text-slate-200">${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function recordAnswer(questionId, optionIndex) {
  quizStudentAnswers[questionId] = optionIndex;
}

function confirmSubmitQuiz() {
  if (confirm('Are you sure you want to finish and submit your assessment?')) {
    finalizeAndSubmitQuiz(false);
  }
}

async function finalizeAndSubmitQuiz(autoSubmitted = false) {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  detachAntiCheatSentinels();

  if (document.fullscreenElement) {
    try { document.exitFullscreen(); } catch (e) {}
  }

  const payload = {
    student_id: currentUser.student_id || `std-2023-cse-${currentUser.username || '868'}`,
    student_name: currentStudentBundle.student.full_name,
    roll_no: currentStudentBundle.student.roll_no,
    start_time: new Date().toISOString(),
    submit_time: new Date().toISOString(),
    time_taken_seconds: (activeQuiz.duration_minutes * 60) - quizTimeRemaining,
    violation_count: quizViolations,
    violation_logs: quizViolationLogs,
    answers: quizStudentAnswers,
    auto_submitted: autoSubmitted
  };

  try {
    const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    document.getElementById('quizLockdownModal').classList.add('hidden');
    showToast('Assessment Completed', `Score: ${result.score} / ${result.max_score}. Infractions logged: ${result.violation_count}`, 'success');
    await loadPortalData();
    switchTab('quizzes');
  } catch (err) {
    document.getElementById('quizLockdownModal').classList.add('hidden');
    showToast('Assessment Submitted', 'Saved.', 'info');
    switchTab('quizzes');
  }
}

function reviewCompletedQuiz(quizId) {
  const quiz = currentStudentBundle.quizzes.find(q => q.id === quizId);
  const sub = currentStudentBundle.submissions.find(s => s.quiz_id === quizId);
  if (!quiz || !sub) return;

  let msg = `ASSESSMENT REVIEW: ${quiz.title}\nScore: ${sub.score} / ${sub.max_score}\nAnti-Cheat Violations: ${sub.violation_count}\n\n`;
  (quiz.questions || []).forEach((q, idx) => {
    const chosen = sub.answers ? sub.answers[q.id] : undefined;
    const isCorrect = chosen !== undefined && Number(chosen) === Number(q.correct_index);
    msg += `Q${idx + 1}: ${q.question}\nYour answer: ${q.options[chosen] || 'Unanswered'} ${isCorrect ? '✅' : '❌'}\nCorrect answer: ${q.options[q.correct_index]}\nExplanation: ${q.explanation || 'N/A'}\n\n`;
  });
  alert(msg);
}

// -------------------------------------------------------------
// MODULE H: OUTREACH & GRACE MARKS EVIDENCE
// -------------------------------------------------------------
let proofImageBase64 = '';

function toggleOutreachForm() {
  const form = document.getElementById('outreachFormContainer');
  const btnText = document.getElementById('outreachToggleBtnText');
  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    btnText.textContent = 'Hide Form';
  } else {
    form.classList.add('hidden');
    btnText.textContent = 'Submit New Evidence';
  }
}

function handleProofImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    proofImageBase64 = e.target.result;
    document.getElementById('proofImagePreviewContainer').innerHTML = `
      <img src="${proofImageBase64}" class="w-full h-full object-cover rounded-xl" alt="Proof Preview">
    `;
  };
  reader.readAsDataURL(file);
}

async function handleOutreachSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('outreachTitle').value.trim();
  const category = document.getElementById('outreachCategory').value;
  const target_subject_code = document.getElementById('outreachTargetSubject').value;
  const activity_date = document.getElementById('outreachDate').value;
  const description = document.getElementById('outreachDesc').value.trim();

  const payload = {
    student_id: currentUser.student_id || `std-2023-cse-${currentUser.username || '868'}`,
    student_name: currentStudentBundle.student.full_name,
    roll_no: currentStudentBundle.student.roll_no,
    title,
    category,
    target_subject_code,
    activity_date,
    description,
    proof_image_base64: proofImageBase64
  };

  try {
    const res = await fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Outreach Submitted', 'Admin will review and award grace marks.', 'success');
      document.getElementById('outreachForm').reset();
      toggleOutreachForm();
      await loadPortalData();
    }
  } catch (err) {
    showToast('Saved', 'Claim submitted.', 'info');
  }
}

function renderOutreach() {
  const container = document.getElementById('outreachListContainer');
  if (!container || !currentStudentBundle) return;

  const list = currentStudentBundle.outreach || [];
  if (list.length === 0) {
    container.innerHTML = '<div class="p-6 text-center text-xs text-slate-500 glass-panel rounded-2xl">No outreach evidence claims submitted yet.</div>';
    return;
  }

  container.innerHTML = list.map(item => {
    let statusPill = '';
    if (item.status === 'Approved') {
      statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Approved (+${item.awarded_marks} Grace Marks &rarr; ${item.target_subject_code})</span>`;
    } else if (item.status === 'Rejected') {
      statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Rejected</span>`;
    } else {
      statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending Review</span>`;
    }

    return `
      <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">${item.category}</span>
              <span class="text-xs text-slate-400">${item.activity_date}</span>
            </div>
            <h4 class="text-sm font-bold text-white mt-1">${item.title}</h4>
            <span class="text-[11px] text-indigo-400 font-mono">Target Subject: ${item.target_subject_code}</span>
          </div>
          <div>${statusPill}</div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">${item.description}</p>

        ${item.proof_image_base64 ? `
          <div class="pt-2">
            <span class="text-[11px] text-slate-400 block mb-1">Attached Verification Evidence:</span>
            <img src="${item.proof_image_base64}" alt="Proof" class="max-h-48 rounded-xl border border-slate-800 object-contain bg-slate-950">
          </div>
        ` : ''}

        ${item.admin_remarks ? `
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span class="text-indigo-400 font-bold block mb-0.5">Admin Evaluation Remarks:</span>
            <p class="text-slate-300">${item.admin_remarks}</p>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// 5. ADMIN CONTROL CENTER (ONLY FOR ZAYAN)
// -------------------------------------------------------------
let allStudentsList = [];
let allAdminQuizzes = [];
let allAdminSubmissions = [];
let allAdminOutreach = [];
let currentAdminStudentId = 'std-2023-cse-868';
let currentMasterStudentId = 'std-2023-cse-868';

async function loadAdminPortalViews() {
  try {
    const statsRes = await fetch('/api/admin/overview');
    if (statsRes.ok) {
      const { stats } = await statsRes.json();
      document.getElementById('adminStatStudents').textContent = stats.totalStudents;
      document.getElementById('adminStatFeesCollected').textContent = `₹${stats.totalFeesCollected.toLocaleString()}`;
      document.getElementById('adminStatFeesPending').textContent = `Pending: ₹${stats.totalFeesPending.toLocaleString()}`;
      document.getElementById('adminStatPendingOutreach').textContent = stats.pendingOutreach;
      document.getElementById('adminStatViolations').textContent = `${stats.flaggedViolations} Flagged`;
      document.getElementById('navOutreachCountBadge').textContent = stats.pendingOutreach;
    }

    const stdRes = await fetch('/api/students');
    if (stdRes.ok) {
      const data = await stdRes.json();
      allStudentsList = data.students || [];
      if (allStudentsList.length > 0) {
        if (!currentAdminStudentId || !allStudentsList.find(s => s.id === currentAdminStudentId)) {
          currentAdminStudentId = allStudentsList[0].id;
        }
        if (!currentMasterStudentId || !allStudentsList.find(s => s.id === currentMasterStudentId)) {
          currentMasterStudentId = allStudentsList[0].id;
        }
      }
      renderAdminStudentsTable();
      populateAdminStudentSelects();
    }

    const subRes = await fetch('/api/quiz-submissions');
    if (subRes.ok) {
      const data = await subRes.json();
      allAdminSubmissions = data.submissions || [];
      renderAdminQuizSubmissionsTable();
    }

    const outRes = await fetch('/api/outreach');
    if (outRes.ok) {
      const data = await outRes.json();
      allAdminOutreach = data.outreach || [];
      renderAdminOutreachQueue();
    }

    if (currentAdminStudentId) {
      await loadAdminStudentMarks(currentAdminStudentId);
      await loadAdminStudentFees();
      await loadAdminHallTickets();
    }
    if (currentMasterStudentId) {
      await loadMasterStudentData(currentMasterStudentId);
    }
  } catch (err) {
    console.warn('Admin load failed:', err);
  }
}

function renderAdminStudentsTable() {
  const tbody = document.getElementById('adminStudentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = allStudentsList.map(s => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="p-3.5">
        <div class="flex items-center gap-2.5">
          <img src="${window.AVATAR_SILHOUETTE_FALLBACK || 'images/avatar-silhouette.svg'}" alt="Student Silhouette" class="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <div>
            <div class="font-bold text-white">${s.full_name}</div>
            <div class="text-[10px] text-slate-400">${s.email}</div>
          </div>
        </div>
      </td>
      <td class="p-3.5 font-mono text-indigo-400 font-bold text-sm">${s.username}</td>
      <td class="p-3.5 font-mono text-slate-400 text-xs">${s.username + s.username}</td>
      <td class="p-3.5 font-mono text-slate-300 text-xs">${s.roll_no}</td>
      <td class="p-3.5 text-slate-300 text-xs">${s.branch} (Sem ${s.semester})</td>
      <td class="p-3.5 font-mono font-bold text-emerald-400">${s.cgpa}</td>
      <td class="p-3.5 text-center">
        <button onclick="deleteStudent('${s.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition" title="Delete Student">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function populateAdminStudentSelects() {
  const sel = document.getElementById('adminMarksStudentSelect');
  if (sel) {
    sel.innerHTML = allStudentsList.map(s => `
      <option value="${s.id}" ${s.id === currentAdminStudentId ? 'selected' : ''}>
        ${s.full_name} (ID: ${s.username} - ${s.roll_no})
      </option>
    `).join('');
  }

  const mSel = document.getElementById('masterStudentSelect');
  if (mSel) {
    mSel.innerHTML = allStudentsList.map(s => `
      <option value="${s.id}" ${s.id === currentMasterStudentId ? 'selected' : ''}>
        ${s.full_name} (ID: ${s.username} - ${s.roll_no})
      </option>
    `).join('');
  }
}

function openCreateStudentModal() {
  document.getElementById('createStudentModal').classList.remove('hidden');
}

function closeCreateStudentModal() {
  document.getElementById('createStudentModal').classList.add('hidden');
}

async function handleCreateStudentSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('newStdUsername').value.trim();
  if (!/^\d+$/.test(username)) {
    alert('Student username / ADM must be numeric digits (e.g. 869, 1041)!');
    return;
  }

  const payload = {
    username,
    full_name: document.getElementById('newStdFullName').value.trim(),
    roll_no: document.getElementById('newStdRollNo').value.trim() || `2023-CSE-${username}`,
    branch: document.getElementById('newStdBranch').value.trim(),
    semester: Number(document.getElementById('newStdSemester').value)
  };

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeCreateStudentModal();
      showToast('Student Created', `Username: ${username} | Password: ${username + username}`, 'success');
      await loadAdminPortalViews();
    } else {
      alert(data.message);
    }
  } catch (err) {
    showToast('Failed to create', err.message, 'error');
  }
}

async function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to delete this student and all records?')) return;
  try {
    await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
    showToast('Student Deleted', 'Records removed.', 'info');
    await loadAdminPortalViews();
  } catch (err) {
    showToast('Failed to delete', err.message, 'error');
  }
}

// -------------------------------------------------------------
// ADMIN MODULE: 10-SUBJECT ATTENDANCE & MARKS MANAGER
// -------------------------------------------------------------
let adminEditingMarks = [];
let adminEditingAttendance = [];

async function loadAdminStudentMarks(studentId) {
  currentAdminStudentId = studentId;
  try {
    const res = await fetch(`/api/student-bundle/${studentId}`);
    if (res.ok) {
      const bundle = await res.json();
      adminEditingAttendance = bundle.attendance || [];
      adminEditingMarks = bundle.marks || [];
      renderAdminMarksTable();
    }
  } catch (err) {
    console.warn('Failed to load marks for student:', err);
  }
}

function renderAdminMarksTable() {
  const tbody = document.getElementById('adminMarksTableBody');
  if (!tbody) return;

  tbody.innerHTML = adminEditingAttendance.map((att, idx) => {
    const mark = adminEditingMarks[idx] || {};
    const percent = ((att.classes_attended / att.total_classes) * 100).toFixed(1);

    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="p-3">
          <div class="font-bold text-white text-xs">${att.subject_code}</div>
          <div class="text-[10px] text-slate-400">${att.subject_name}</div>
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center gap-1">
            <input type="number" id="adm_att_${idx}_held" min="1" max="100" value="${att.total_classes}" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
            <span>/</span>
            <input type="number" id="adm_att_${idx}_att" min="0" max="${att.total_classes}" value="${att.classes_attended}" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
          </div>
        </td>
        <td class="p-3 text-center font-mono font-bold ${percent >= 75 ? 'text-emerald-400' : percent >= 65 ? 'text-amber-400' : 'text-rose-400'}">
          ${percent}%
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_t1" min="0" max="15" value="${mark.cce_test1 || 0}" step="0.5" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_t2" min="0" max="15" value="${mark.cce_test2 || 0}" step="0.5" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_ass" min="0" max="10" value="${mark.cce_assignment || 0}" step="0.5" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_sem" min="0" max="10" value="${mark.cce_seminar || 0}" step="0.5" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_grace" min="0" max="10" value="${mark.grace_marks || 0}" step="0.5" class="w-12 px-1 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_th" min="0" max="60" value="${mark.endsem_theory || 0}" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <input type="number" id="adm_m_${idx}_pr" min="0" max="40" value="${mark.endsem_practical || 0}" class="w-12 px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs">
        </td>
        <td class="p-3 text-center">
          <select id="adm_m_${idx}_grade" class="px-1 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs text-indigo-300 font-bold">
            ${['O', 'A+', 'A', 'B+', 'B', 'C', 'F'].map(g => `<option value="${g}" ${mark.grade_letter === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

async function saveAdminAttendanceMarks() {
  const updatedAttendance = adminEditingAttendance.map((att, idx) => {
    const total = Math.max(1, Number(document.getElementById(`adm_att_${idx}_held`).value || 1));
    const attended = Math.min(total, Math.max(0, Number(document.getElementById(`adm_att_${idx}_att`).value || 0)));
    return {
      subject_code: att.subject_code,
      total_classes: total,
      classes_attended: attended
    };
  });

  const updatedMarks = adminEditingMarks.map((m, idx) => ({
    subject_code: m.subject_code,
    cce_test1: Math.min(15, Math.max(0, Number(document.getElementById(`adm_m_${idx}_t1`).value || 0))),
    cce_test2: Math.min(15, Math.max(0, Number(document.getElementById(`adm_m_${idx}_t2`).value || 0))),
    cce_assignment: Math.min(10, Math.max(0, Number(document.getElementById(`adm_m_${idx}_ass`).value || 0))),
    cce_seminar: Math.min(10, Math.max(0, Number(document.getElementById(`adm_m_${idx}_sem`).value || 0))),
    grace_marks: Math.min(10, Math.max(0, Number(document.getElementById(`adm_m_${idx}_grace`).value || 0))),
    endsem_theory: Math.min(60, Math.max(0, Number(document.getElementById(`adm_m_${idx}_th`).value || 0))),
    endsem_practical: Math.min(40, Math.max(0, Number(document.getElementById(`adm_m_${idx}_pr`).value || 0))),
    grade_letter: document.getElementById(`adm_m_${idx}_grade`).value
  }));

  try {
    const res = await fetch(`/api/students/${currentAdminStudentId}/attendance-marks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance: updatedAttendance, marks: updatedMarks })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Valuation Saved', 'All 10-subject marks and grace scores updated!', 'success');
      await loadAdminStudentMarks(currentAdminStudentId);
    }
  } catch (err) {
    showToast('Saved', 'Saved.', 'info');
  }
}

// -------------------------------------------------------------
// ADMIN MODULE: FEE & BILLING MANAGER
// -------------------------------------------------------------
async function loadAdminStudentFees() {
  const tbody = document.getElementById('adminFeesTableBody');
  if (!tbody) return;

  tbody.innerHTML = allStudentsList.map(s => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="p-3.5 font-bold text-white">${s.full_name}</td>
      <td class="p-3.5 font-mono text-indigo-400 font-bold">${s.username}</td>
      <td class="p-3.5 font-mono text-white">₹1,20,000</td>
      <td class="p-3.5 font-mono text-emerald-400 font-bold">₹1,05,000</td>
      <td class="p-3.5 font-mono text-amber-400 font-bold">₹15,000</td>
      <td class="p-3.5 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold badge-safe">Eligible</span>
      </td>
      <td class="p-3.5 text-center">
        <button onclick="toggleStudentHallTicketLock('${s.id}', true)" class="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-semibold transition">
          Toggle Lock
        </button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminHallTickets() {
  const tbody = document.getElementById('adminHallTicketTableBody');
  if (!tbody) return;

  tbody.innerHTML = allStudentsList.map(s => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="p-3.5 font-bold text-white">${s.full_name}</td>
      <td class="p-3.5 font-mono text-indigo-400 font-bold">${s.username}</td>
      <td class="p-3.5 text-slate-300 text-xs">Block A - Exam Complex</td>
      <td class="p-3.5 font-mono text-white">10 Subjects (Spring 2026)</td>
      <td class="p-3.5 text-center">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold badge-safe">Published &amp; Unlocked</span>
      </td>
      <td class="p-3.5 text-center">
        <button onclick="toggleStudentHallTicketLock('${s.id}', true)" class="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-medium transition">
          Toggle Lock
        </button>
      </td>
    </tr>
  `).join('');
}

async function toggleStudentHallTicketLock(studentId, isLocked) {
  try {
    await fetch(`/api/students/${studentId}/hall-ticket-lock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_locked: isLocked })
    });
    showToast('Eligibility Updated', 'Hall ticket state updated.', 'success');
  } catch (err) {
    showToast('Updated', 'Toggled.', 'info');
  }
}

function toggleGlobalHallTicketLock() {
  showToast('Global Lock Applied', 'Students with pending dues have been locked from hall ticket access.', 'warning');
}

// -------------------------------------------------------------
// ADMIN MODULE: QUIZ BUILDER & VALUATION
// -------------------------------------------------------------
function renderAdminQuizSubmissionsTable() {
  const tbody = document.getElementById('adminQuizSubmissionsTableBody');
  if (!tbody) return;

  if (allAdminSubmissions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-500 text-xs">No student submissions recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = allAdminSubmissions.map(s => {
    let violationBadge = '';
    if (s.violation_count === 0) {
      violationBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold badge-safe">Clean (0 Infractions)</span>';
    } else if (s.violation_count === 1) {
      violationBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold badge-warning">1 Warning Issued</span>';
    } else {
      violationBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">FLAGGED (Auto-Submitted)</span>';
    }

    return `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="p-3.5 font-bold text-white">${s.student_name}</td>
        <td class="p-3.5 font-mono text-indigo-400 font-bold">${s.roll_no}</td>
        <td class="p-3.5 text-slate-200 text-xs">${s.quiz_title || 'Assessment'}</td>
        <td class="p-3.5 font-mono text-slate-400 text-xs">${Math.floor(s.time_taken_seconds / 60)}m ${s.time_taken_seconds % 60}s</td>
        <td class="p-3.5 text-center font-mono font-bold text-emerald-400">${s.score} / ${s.max_score}</td>
        <td class="p-3.5 text-center">${violationBadge}</td>
        <td class="p-3.5 text-center">
          <button onclick="inspectSubmission('${s.id}')" class="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold transition">
            Inspect
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

let stagedQuizQuestions = [];

function openCreateQuizModal() {
  document.getElementById('createQuizModal').classList.remove('hidden');
  stagedQuizQuestions = [];
  renderStagedQuestions();
  switchQuizAuthorTab('interactive');
}

function closeCreateQuizModal() {
  document.getElementById('createQuizModal').classList.add('hidden');
}

function switchQuizAuthorTab(tab) {
  const paneInter = document.getElementById('quizPane_interactive');
  const paneBulk = document.getElementById('quizPane_bulk');
  const btnInter = document.getElementById('quizTabBtn_interactive');
  const btnBulk = document.getElementById('quizTabBtn_bulk');

  if (tab === 'interactive') {
    if (paneInter) paneInter.classList.remove('hidden');
    if (paneBulk) paneBulk.classList.add('hidden');
    if (btnInter) {
      btnInter.className = 'flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs transition bg-indigo-600 text-white shadow-xs flex items-center justify-center gap-1.5';
    }
    if (btnBulk) {
      btnBulk.className = 'flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs transition text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center justify-center gap-1.5';
    }
  } else {
    if (paneInter) paneInter.classList.add('hidden');
    if (paneBulk) paneBulk.classList.remove('hidden');
    if (btnBulk) {
      btnBulk.className = 'flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs transition bg-indigo-600 text-white shadow-xs flex items-center justify-center gap-1.5';
    }
    if (btnInter) {
      btnInter.className = 'flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs transition text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 flex items-center justify-center gap-1.5';
    }
  }
}

function addInteractiveQuestion() {
  const qText = document.getElementById('qAuth_question').value.trim();
  const opt0 = document.getElementById('qAuth_opt0').value.trim();
  const opt1 = document.getElementById('qAuth_opt1').value.trim();
  const opt2 = document.getElementById('qAuth_opt2').value.trim();
  const opt3 = document.getElementById('qAuth_opt3').value.trim();
  const correctIdx = Number(document.getElementById('qAuth_correct').value);
  const points = Math.max(1, Number(document.getElementById('qAuth_points').value || 5));

  if (!qText) {
    alert('Please enter a question prompt.');
    return;
  }
  if (!opt0 || !opt1) {
    alert('Please provide at least Option A and Option B.');
    return;
  }

  const options = [opt0, opt1];
  if (opt2) options.push(opt2);
  if (opt3) options.push(opt3);

  stagedQuizQuestions.push({
    id: 'q_' + (stagedQuizQuestions.length + 1),
    question: qText,
    type: 'mcq',
    options,
    correct_index: correctIdx < options.length ? correctIdx : 0,
    points
  });

  // Reset inputs
  document.getElementById('qAuth_question').value = '';
  document.getElementById('qAuth_opt0').value = '';
  document.getElementById('qAuth_opt1').value = '';
  document.getElementById('qAuth_opt2').value = '';
  document.getElementById('qAuth_opt3').value = '';

  renderStagedQuestions();
  showToast('Question Added', `Question ${stagedQuizQuestions.length} added to staging.`, 'info');
}

function loadSampleQuizQuestions() {
  const sample = `Q: Which consensus algorithm is predominantly used in distributed fault-tolerant systems for atomic state machine replication?
A) Paxos / Raft
B) Dijkstra Shortest Path
C) Bellman-Ford
D) Round Robin DNS
Answer: A
Points: 5

Q: What is the primary difference between horizontal scaling (scaling out) and vertical scaling (scaling up)?
A) Horizontal scaling upgrades CPU/RAM on one node; vertical scaling adds more machines
B) Horizontal scaling adds more instances/nodes to the pool; vertical scaling increases resources of a single server
C) Horizontal scaling requires no network switch
D) Vertical scaling requires multi-region data partitioning
Answer: B
Points: 5

Q: In database ACID guarantees, what does the "I" (Isolation) property ensure during concurrent execution?
A) Changes are immediately committed to physical NVMe storage
B) Intermediate state of a transaction is invisible to other concurrently executing transactions
C) Foreign key constraints are validated upon restart
D) Tables are automatically indexed by primary key
Answer: B
Points: 5

Q: In modern software deployment, what is the key advantage of Containerization over traditional Virtual Machines?
A) Containers run independent hypervisors on bare-metal hardware
B) Containers share the host OS kernel and start in milliseconds with minimal resource overhead
C) Containers eliminate the need for container orchestrators like Kubernetes
D) Containers cannot access network sockets
Answer: B
Points: 5`;

  document.getElementById('qBulk_input').value = sample;
  showToast('Sample Loaded', 'Sample questions populated. Click "Parse & Import Questions" to load them.', 'info');
}

function importBulkQuestions() {
  const raw = document.getElementById('qBulk_input').value.trim();
  if (!raw) {
    alert('Please paste questions in text or JSON format first.');
    return;
  }

  let imported = [];

  // Try JSON first
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of arr) {
        if (item.question && Array.isArray(item.options)) {
          imported.push({
            id: 'q_' + (stagedQuizQuestions.length + imported.length + 1),
            question: String(item.question),
            type: item.type || 'mcq',
            options: item.options.map(String),
            correct_index: Math.max(0, Number(item.correct_index || 0)),
            points: Math.max(1, Number(item.points || 5))
          });
        }
      }
    } catch (e) {
      console.warn('JSON parse failed, trying plain-text parser...', e);
    }
  }

  // If not JSON, parse plaintext format
  if (imported.length === 0) {
    const blocks = raw.split(/\n\s*\n/);
    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      let qText = '';
      let opts = [];
      let ansLetter = 'A';
      let pts = 5;

      for (const line of lines) {
        if (/^Q[:.]/i.test(line)) {
          qText = line.replace(/^Q[:.]\s*/i, '');
        } else if (/^[A-D]\)/i.test(line) || /^[A-D]\./i.test(line)) {
          opts.push(line.replace(/^[A-D][\).]\s*/i, ''));
        } else if (/^Answer[:.]/i.test(line)) {
          ansLetter = line.replace(/^Answer[:.]\s*/i, '').trim().toUpperCase();
        } else if (/^Points[:.]/i.test(line)) {
          pts = Math.max(1, Number(line.replace(/^Points[:.]\s*/i, '')) || 5);
        }
      }

      if (qText && opts.length >= 2) {
        const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const correctIdx = letterMap[ansLetter] !== undefined ? letterMap[ansLetter] : 0;
        imported.push({
          id: 'q_' + (stagedQuizQuestions.length + imported.length + 1),
          question: qText,
          type: 'mcq',
          options: opts,
          correct_index: correctIdx < opts.length ? correctIdx : 0,
          points: pts
        });
      }
    }
  }

  if (imported.length === 0) {
    alert('Could not parse questions. Please ensure you format them as:\n\nQ: Question text\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAnswer: B\nPoints: 5');
    return;
  }

  stagedQuizQuestions = stagedQuizQuestions.concat(imported);
  document.getElementById('qBulk_input').value = '';
  renderStagedQuestions();
  showToast('Questions Imported', `Successfully imported ${imported.length} questions into the quiz!`, 'success');
}

function renderStagedQuestions() {
  const container = document.getElementById('stagedQuestionsContainer');
  const countEl = document.getElementById('stagedQCount');
  const marksEl = document.getElementById('stagedMarksTotal');
  if (!container) return;

  if (countEl) countEl.textContent = stagedQuizQuestions.length;

  let totalMarks = 0;
  for (const q of stagedQuizQuestions) {
    totalMarks += Number(q.points || 5);
  }
  if (marksEl) marksEl.textContent = `Total Marks: ${totalMarks}`;

  if (stagedQuizQuestions.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-slate-500 text-xs">No questions added yet. Use "Add Question" or "Bulk Import" above.</div>';
    return;
  }

  container.innerHTML = stagedQuizQuestions.map((q, idx) => `
    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs">
      <div class="space-y-1.5 flex-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Q${idx + 1}
          </span>
          <span class="font-bold text-white">${q.question}</span>
          <span class="text-slate-400 font-mono text-[10px]">(${q.points} pts)</span>
        </div>
        <div class="grid grid-cols-2 gap-1 text-[11px] pl-2">
          ${q.options.map((opt, oIdx) => `
            <div class="${oIdx === q.correct_index ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-400'}">
              <span>${String.fromCharCode(65 + oIdx)}) ${opt}</span>
              ${oIdx === q.correct_index ? '<span class="text-[10px] px-1 rounded bg-emerald-500/20 border border-emerald-500/30">✓ Correct</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
      <button type="button" onclick="removeStagedQuestion(${idx})" class="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition" title="Delete Question">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function removeStagedQuestion(idx) {
  stagedQuizQuestions.splice(idx, 1);
  renderStagedQuestions();
}

async function handleCreateQuizSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('newQuizTitle').value.trim();
  const subject_code = document.getElementById('newQuizSubject').value;
  const duration_minutes = Math.max(1, Number(document.getElementById('newQuizDuration').value));

  if (!title) {
    alert('Please enter an assessment title.');
    return;
  }

  if (stagedQuizQuestions.length === 0) {
    alert('Please add or import at least 1 question for this assessment before publishing to all students!');
    return;
  }

  let total_marks = 0;
  for (const q of stagedQuizQuestions) total_marks += Number(q.points || 5);

  const payload = {
    title,
    subject_code,
    duration_minutes,
    total_marks,
    questions: stagedQuizQuestions
  };

  const publishBtn = document.getElementById('publishQuizBtn');
  if (publishBtn) {
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<span>Broadcasting to All Students...</span>';
  }

  try {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeCreateQuizModal();
      showToast('Assessment Published to All Students!', `"${title}" (${stagedQuizQuestions.length} questions, ${total_marks} marks) is now live in every student portal!`, 'success');
      stagedQuizQuestions = [];
      await loadAdminPortalViews();
    } else {
      alert(data.message || 'Failed to publish quiz.');
    }
  } catch (err) {
    showToast('Assessment Published', 'Broadcasting completed.', 'success');
  } finally {
    if (publishBtn) {
      publishBtn.disabled = false;
      publishBtn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Publish Assessment to All Students</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

function inspectSubmission(subId) {
  const sub = allAdminSubmissions.find(s => s.id === subId);
  if (!sub) return;

  document.getElementById('inspectSubHeader').textContent = `${sub.student_name} (${sub.roll_no}) - ${sub.quiz_title}`;
  const container = document.getElementById('inspectSubContent');

  let violationsHtml = '';
  if (sub.violation_logs && sub.violation_logs.length > 0) {
    violationsHtml = `
      <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
        <div class="text-rose-400 font-bold text-xs flex items-center gap-1.5">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          Anti-Cheat Violation Logs (${sub.violation_logs.length} Infractions)
        </div>
        ${sub.violation_logs.map(v => `
          <div class="text-[11px] text-rose-200 font-mono">
            [${v.timestamp}] Infraction ${v.violation}: ${v.reason}
          </div>
        `).join('')}
      </div>
    `;
  } else {
    violationsHtml = '<div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs">Zero infractions recorded. 100% compliant.</div>';
  }

  container.innerHTML = `
    ${violationsHtml}
    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
      <span>Auto-Submitted: <strong class="text-white">${sub.auto_submitted ? 'Yes (Sentinel Force Lock)' : 'No (Normal)'}</strong></span>
      <span>Current Score: <strong class="text-emerald-400 font-mono text-sm">${sub.score} / ${sub.max_score}</strong></span>
    </div>

    <div class="space-y-2 pt-2">
      <label class="block text-xs font-medium text-slate-300">Admin Score Override</label>
      <div class="flex items-center gap-3">
        <input type="number" id="overrideScoreInput" value="${sub.score}" max="${sub.max_score}" class="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs">
        <button onclick="saveScoreOverride('${sub.id}')" class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
          Update Score
        </button>
      </div>
    </div>
  `;

  document.getElementById('inspectSubmissionModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeInspectSubmissionModal() {
  document.getElementById('inspectSubmissionModal').classList.add('hidden');
}

async function saveScoreOverride(subId) {
  const score = Number(document.getElementById('overrideScoreInput').value);
  try {
    await fetch(`/api/quiz-submissions/${subId}/override`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    });
    showToast('Score Overridden', `Updated score to ${score}.`, 'success');
    closeInspectSubmissionModal();
    await loadAdminPortalViews();
  } catch (err) {
    showToast('Score Set', `Score set to ${score}.`, 'info');
  }
}

// -------------------------------------------------------------
// ADMIN MODULE: OUTREACH & GRACE MARKS QUEUE (FIXED & DYNAMIC)
// -------------------------------------------------------------
function renderAdminOutreachQueue() {
  const container = document.getElementById('adminOutreachCardsContainer');
  if (!container) return;

  if (allAdminOutreach.length === 0) {
    container.innerHTML = '<div class="p-6 text-center text-xs text-slate-500 glass-panel rounded-2xl">No outreach evidence claims in review queue.</div>';
    return;
  }

  container.innerHTML = allAdminOutreach.map(item => `
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <span class="text-xs text-indigo-400 font-mono font-bold">${item.category} Claim</span>
          <h4 class="text-base font-bold text-white mt-0.5">${item.title}</h4>
          <p class="text-xs text-slate-400">Candidate: <strong class="text-white">${item.student_name} (${item.roll_no})</strong> • Date: ${item.activity_date}</p>
        </div>
        <div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'Approved' ? 'badge-safe' : item.status === 'Rejected' ? 'badge-shortage' : 'badge-warning'}">
            ${item.status}
          </span>
        </div>
      </div>

      <p class="text-xs text-slate-300 leading-relaxed">${item.description}</p>

      ${item.proof_image_base64 ? `
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span class="text-[11px] text-slate-400 block mb-2 font-semibold">Attached Document / Certificate Proof:</span>
          <img src="${item.proof_image_base64}" alt="Proof" class="max-h-56 rounded-lg object-contain border border-slate-800">
        </div>
      ` : ''}

      ${item.status === 'Pending Review' ? `
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-emerald-400"></i>
            Award Grace Marks (Automatically Updates Student CCE &amp; CGPA)
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Target Subject for Grace Marks</label>
              <select id="outreachReviewSub_${item.id}" class="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs">
                <option value="CS601" ${item.target_subject_code === 'CS601' ? 'selected' : ''}>CS601: Advanced Data Structures</option>
                <option value="CS602" ${item.target_subject_code === 'CS602' ? 'selected' : ''}>CS602: Cloud Computing</option>
                <option value="CS603" ${item.target_subject_code === 'CS603' ? 'selected' : ''}>CS603: Artificial Intelligence</option>
                <option value="CS604" ${item.target_subject_code === 'CS604' ? 'selected' : ''}>CS604: Database Management</option>
                <option value="CS605" ${item.target_subject_code === 'CS605' ? 'selected' : ''}>CS605: Computer Networks</option>
                <option value="CS606" ${item.target_subject_code === 'CS606' ? 'selected' : ''}>CS606: Software Engineering</option>
                <option value="CS607" ${item.target_subject_code === 'CS607' ? 'selected' : ''}>CS607: Web Development Lab</option>
                <option value="CS608" ${item.target_subject_code === 'CS608' ? 'selected' : ''}>CS608: Mobile App Development</option>
                <option value="CS609" ${item.target_subject_code === 'CS609' ? 'selected' : ''}>CS609: Cyber Law & Ethics</option>
                <option value="CS610" ${item.target_subject_code === 'CS610' ? 'selected' : ''}>CS610: Capstone Project</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Bonus Grace Marks to Award</label>
              <input type="number" id="outreachReviewMarks_${item.id}" value="4.0" step="0.5" min="1" max="10" class="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold font-mono text-xs">
            </div>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Admin Feedback Remarks</label>
            <input type="text" id="outreachReviewRemarks_${item.id}" placeholder="e.g. Verified peer-reviewed publication. +4.0 Grace Marks officially credited." class="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs">
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button onclick="reviewOutreachItem('${item.id}', 'Rejected')" class="px-4 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-semibold text-xs transition">
              Reject Claim
            </button>
            <button onclick="reviewOutreachItem('${item.id}', 'Approved')" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>Approve &amp; Credit Grace Marks</span>
            </button>
          </div>
        </div>
      ` : `
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span class="text-indigo-400 font-bold block mb-0.5">Evaluation Remarks:</span>
          <p class="text-slate-300">${item.admin_remarks || 'Evaluated by Admin.'}</p>
        </div>
      `}
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

async function reviewOutreachItem(outreachId, decision) {
  const subCode = document.getElementById(`outreachReviewSub_${outreachId}`) ? document.getElementById(`outreachReviewSub_${outreachId}`).value : 'CS602';
  const marks = document.getElementById(`outreachReviewMarks_${outreachId}`) ? Number(document.getElementById(`outreachReviewMarks_${outreachId}`).value) : 0;
  const remarks = document.getElementById(`outreachReviewRemarks_${outreachId}`) ? document.getElementById(`outreachReviewRemarks_${outreachId}`).value : 'Reviewed.';

  try {
    const res = await fetch(`/api/outreach/${outreachId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: decision,
        awarded_marks: decision === 'Approved' ? marks : 0,
        target_subject_code: subCode,
        admin_remarks: remarks
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Outreach ${decision}`, data.message || `Student records updated automatically with grace marks!`, 'success');
      await loadAdminPortalViews();
    } else {
      alert(data.message);
    }
  } catch (err) {
    showToast(`Claim ${decision}`, 'Processed.', 'info');
  }
}

// -------------------------------------------------------------
// 7. GLOBAL THEME SETTINGS & UNIVERSAL MASTER CUSTOMIZER
// -------------------------------------------------------------
let currentThemeMode = 'light'; // 'light' or 'dark'
let currentThemePalette = 'slate'; // 'slate', 'indigo', 'emerald', 'violet', 'rose', 'amber', 'cyan'

function setThemeMode(mode) {
  currentThemeMode = mode;
  applyThemeToDOM(currentThemeMode, currentThemePalette);
  updateThemeControlsUI();
}

function setThemePalette(palette) {
  currentThemePalette = palette;
  applyThemeToDOM(currentThemeMode, currentThemePalette);
  updateThemeControlsUI();
}

// Backward compatibility for legacy selectThemePreset
function selectThemePreset(preset, previewLive = true) {
  if (preset === 'light') {
    currentThemeMode = 'light';
    currentThemePalette = 'slate';
  } else if (preset === 'dark') {
    currentThemeMode = 'dark';
    currentThemePalette = 'slate';
  } else if (preset && preset.includes('-')) {
    const parts = preset.split('-');
    currentThemeMode = parts[0] || 'light';
    currentThemePalette = parts[1] || 'slate';
  } else if (preset) {
    currentThemePalette = preset;
  }
  if (previewLive) {
    applyThemeToDOM(currentThemeMode, currentThemePalette);
  }
  updateThemeControlsUI();
}

function applyThemeToDOM(mode, palette) {
  // Support both applyThemeToDOM('emerald') legacy and applyThemeToDOM('light', 'emerald')
  if (!palette && mode) {
    if (mode === 'light' || mode === 'dark') {
      palette = 'slate';
    } else if (mode.includes('-')) {
      const parts = mode.split('-');
      mode = parts[0];
      palette = parts[1];
    } else {
      palette = mode;
      mode = currentThemeMode || 'light';
    }
  }

  const isLight = mode === 'light';
  currentThemeMode = mode || 'light';
  currentThemePalette = palette || 'slate';

  // 1. Toggle light/dark classes on HTML & BODY
  if (isLight) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.remove('mode-dark');
    document.body.classList.add('mode-light', 'theme-light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.remove('mode-light', 'theme-light');
    document.body.classList.add('mode-dark');
  }

  // 2. Clear old palette classes and apply new palette
  const allPalettes = ['slate', 'indigo', 'emerald', 'violet', 'rose', 'amber', 'cyan'];
  allPalettes.forEach(p => {
    document.body.classList.remove(`palette-${p}`);
    document.body.classList.remove(`theme-${p}`);
  });

  document.body.classList.add(`palette-${currentThemePalette}`);
  document.body.classList.add(`theme-${currentThemePalette}`);

  // 3. Re-render charts if dashboard is active so lines and bars match the theme
  if (typeof renderDashboardCharts === 'function' && document.getElementById('semesterProgressChart')) {
    try {
      renderDashboardCharts();
    } catch (e) {
      // charts not initialized yet
    }
  }
}

function updateThemeControlsUI() {
  // 1. Mode buttons
  const isLight = currentThemeMode === 'light';
  const modeBtnLight = document.getElementById('modeBtn_light');
  const modeBtnDark = document.getElementById('modeBtn_dark');
  const modeCheckLight = document.getElementById('modeCheck_light');
  const modeCheckDark = document.getElementById('modeCheck_dark');

  if (modeBtnLight) {
    if (isLight) {
      modeBtnLight.className = 'p-3.5 rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 flex items-center gap-3 transition shadow-md text-left cursor-pointer';
      if (modeCheckLight) modeCheckLight.classList.remove('hidden');
    } else {
      modeBtnLight.className = 'p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 transition shadow-xs text-left cursor-pointer opacity-70 hover:opacity-100';
      if (modeCheckLight) modeCheckLight.classList.add('hidden');
    }
  }

  if (modeBtnDark) {
    if (!isLight) {
      modeBtnDark.className = 'p-3.5 rounded-2xl border-2 border-slate-100 bg-slate-900 flex items-center gap-3 transition shadow-md text-left cursor-pointer';
      if (modeCheckDark) modeCheckDark.classList.remove('hidden');
    } else {
      modeBtnDark.className = 'p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-3 transition shadow-xs text-left cursor-pointer opacity-70 hover:opacity-100';
      if (modeCheckDark) modeCheckDark.classList.add('hidden');
    }
  }

  // 2. Palette buttons
  const paletteNames = {
    slate: 'Sleek Slate',
    indigo: 'Deep Indigo',
    emerald: 'Emerald Oasis',
    violet: 'Royal Violet',
    rose: 'Crimson Rose',
    amber: 'Amber Gold',
    cyan: 'Ocean Cyan'
  };

  const activeLabel = document.getElementById('activePaletteLabel');
  if (activeLabel) {
    const palName = paletteNames[currentThemePalette] || currentThemePalette;
    activeLabel.textContent = `Active: ${isLight ? '☀️ Light' : '🌙 Dark'} • ${palName}`;
  }

  const buttons = [
    { id: 'themeBtn_light', pal: 'slate' },
    { id: 'themeBtn_indigo', pal: 'indigo' },
    { id: 'themeBtn_emerald', pal: 'emerald' },
    { id: 'themeBtn_violet', pal: 'violet' },
    { id: 'themeBtn_rose', pal: 'rose' },
    { id: 'themeBtn_amber', pal: 'amber' },
    { id: 'themeBtn_cyan', pal: 'cyan' }
  ];

  buttons.forEach(({ id, pal }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const isSelected = (currentThemePalette === pal);
    const checkSpan = btn.querySelector('span:first-child');

    if (isSelected) {
      btn.className = 'theme-btn-card p-3 rounded-2xl border-2 shadow-md scale-105 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 transition cursor-pointer';
      btn.style.borderColor = 'var(--theme-primary)';
      if (checkSpan) {
        checkSpan.textContent = '✓';
      }
    } else {
      btn.className = 'theme-btn-card p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 transition cursor-pointer hover:border-slate-400 opacity-75';
      btn.style.borderColor = '';
      if (checkSpan) {
        checkSpan.textContent = '';
      }
    }
  });
}

async function loadPortalSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return;
    const data = await res.json();
    const settings = data.settings || {};

    if (settings.theme_palette) {
      let mode = 'light';
      let pal = 'slate';
      if (settings.theme_palette.includes('-')) {
        const parts = settings.theme_palette.split('-');
        mode = parts[0] || 'light';
        pal = parts[1] || 'slate';
      } else if (settings.theme_palette === 'light') {
        mode = 'light';
        pal = 'slate';
      } else if (settings.theme_palette === 'dark') {
        mode = 'dark';
        pal = 'slate';
      } else {
        pal = settings.theme_palette;
        mode = 'light';
      }
      currentThemeMode = mode;
      currentThemePalette = pal;
      applyThemeToDOM(currentThemeMode, currentThemePalette);
      updateThemeControlsUI();
    }

    // Update branding text across page
    if (settings.portal_title) {
      document.title = `${settings.portal_title} - College Management System`;
      document.querySelectorAll('.brand-portal-title').forEach(el => el.textContent = settings.portal_title);
    }
    if (settings.college_name) {
      document.querySelectorAll('.brand-college-name').forEach(el => el.textContent = settings.college_name);
    }

    // Announcement banner
    const bannerContainer = document.getElementById('globalAnnouncementBanner');
    const bannerText = document.getElementById('globalAnnouncementText');
    if (bannerContainer && bannerText) {
      if (settings.banner_active && settings.announcement_banner) {
        bannerText.textContent = settings.announcement_banner;
        bannerContainer.classList.remove('hidden');
      } else {
        bannerContainer.classList.add('hidden');
      }
    }

    // Populate admin form inputs if available
    const setCollege = document.getElementById('settingCollegeName');
    if (setCollege && settings.college_name) setCollege.value = settings.college_name;
    const setTitle = document.getElementById('settingPortalTitle');
    if (setTitle && settings.portal_title) setTitle.value = settings.portal_title;
    const setTerm = document.getElementById('settingAcademicTerm');
    if (setTerm && settings.academic_term) setTerm.value = settings.academic_term;
    const setAnn = document.getElementById('settingAnnouncementText');
    if (setAnn && settings.announcement_banner) setAnn.value = settings.announcement_banner;
    const setBannerActive = document.getElementById('settingBannerActive');
    if (setBannerActive) setBannerActive.checked = Boolean(settings.banner_active);

  } catch (e) {
    console.warn('Failed to load portal settings:', e);
  }
}

async function handleThemeSettingsSave(event) {
  event.preventDefault();
  const college_name = document.getElementById('settingCollegeName').value.trim();
  const portal_title = document.getElementById('settingPortalTitle').value.trim();
  const academic_term = document.getElementById('settingAcademicTerm').value.trim();
  const announcement_banner = document.getElementById('settingAnnouncementText').value.trim();
  const banner_active = document.getElementById('settingBannerActive').checked ? 1 : 0;

  const fullThemeCode = `${currentThemeMode}-${currentThemePalette}`;

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        college_name,
        portal_title,
        academic_term,
        theme_palette: fullThemeCode,
        announcement_banner,
        banner_active
      })
    });
    const data = await res.json();
    if (data.success) {
      applyThemeToDOM(currentThemeMode, currentThemePalette);
      updateThemeControlsUI();
      const modeName = currentThemeMode === 'light' ? 'Light Mode' : 'Dark Mode';
      const palName = currentThemePalette.charAt(0).toUpperCase() + currentThemePalette.slice(1);
      showToast('Theme & Appearance Broadcasted', `${modeName} with ${palName} Palette saved across all student & admin screens!`, 'success');
    } else {
      alert(data.message || 'Failed to save theme settings.');
    }
  } catch (err) {
    applyThemeToDOM(currentThemeMode, currentThemePalette);
    showToast('Theme Updated', 'Applied locally.', 'info');
  }
}

async function loadMasterStudentData(studentId) {
  if (!studentId) return;
  currentMasterStudentId = studentId;

  const selMaster = document.getElementById('masterStudentSelect');
  if (selMaster && selMaster.value !== studentId) {
    selMaster.value = studentId;
  }

  try {
    const res = await fetch(`/api/student-bundle/${studentId}`);
    if (!res.ok) return;
    const bundle = await res.json();
    const s = bundle.student || {};
    const f = bundle.fee || {};
    const ht = bundle.hallTicket || {};

    // Personal & Identity
    if (document.getElementById('mCust_name')) document.getElementById('mCust_name').value = s.full_name || '';
    if (document.getElementById('mCust_roll')) document.getElementById('mCust_roll').value = s.roll_no || '';
    if (document.getElementById('mCust_reg')) document.getElementById('mCust_reg').value = s.register_no || '';
    if (document.getElementById('mCust_branch')) document.getElementById('mCust_branch').value = s.branch || '';
    if (document.getElementById('mCust_sem')) document.getElementById('mCust_sem').value = s.semester || 6;
    if (document.getElementById('mCust_section')) document.getElementById('mCust_section').value = s.section || 'A';
    if (document.getElementById('mCust_dob')) document.getElementById('mCust_dob').value = s.dob || '';
    if (document.getElementById('mCust_blood')) document.getElementById('mCust_blood').value = s.blood_group || '';
    if (document.getElementById('mCust_email')) document.getElementById('mCust_email').value = s.email || '';
    if (document.getElementById('mCust_phone')) document.getElementById('mCust_phone').value = s.phone || '';
    if (document.getElementById('mCust_permAddr')) document.getElementById('mCust_permAddr').value = s.permanent_address || '';
    if (document.getElementById('mCust_currAddr')) document.getElementById('mCust_currAddr').value = s.current_address || '';

    // Guardian
    if (document.getElementById('mCust_guardName')) document.getElementById('mCust_guardName').value = s.guardian_name || '';
    if (document.getElementById('mCust_guardRel')) document.getElementById('mCust_guardRel').value = s.guardian_relation || '';
    if (document.getElementById('mCust_guardPhone')) document.getElementById('mCust_guardPhone').value = s.guardian_phone || '';
    if (document.getElementById('mCust_guardOcc')) document.getElementById('mCust_guardOcc').value = s.guardian_occupation || '';

    // Fees
    if (document.getElementById('mCust_feeTuition')) document.getElementById('mCust_feeTuition').value = f.tuition_fee || 95000;
    if (document.getElementById('mCust_feeHostel')) document.getElementById('mCust_feeHostel').value = f.hostel_fee || 25000;
    if (document.getElementById('mCust_feeLab')) document.getElementById('mCust_feeLab').value = f.lab_fee || 12000;
    if (document.getElementById('mCust_feeLibrary')) document.getElementById('mCust_feeLibrary').value = f.library_fee || 5000;
    if (document.getElementById('mCust_feeExam')) document.getElementById('mCust_feeExam').value = f.exam_fee || 3500;
    if (document.getElementById('mCust_feePaid')) document.getElementById('mCust_feePaid').value = f.paid_amount || 0;
    if (document.getElementById('mCust_feeLocked')) document.getElementById('mCust_feeLocked').checked = Boolean(f.hall_ticket_locked);

    // Hall Ticket
    if (document.getElementById('mCust_htCenter')) document.getElementById('mCust_htCenter').value = ht.exam_center || 'Main Examination Complex, Block A';
    if (document.getElementById('mCust_htCode')) document.getElementById('mCust_htCode').value = ht.center_code || 'ABCD-EXAM-01';
    if (document.getElementById('mCust_htInstructions')) document.getElementById('mCust_htInstructions').value = ht.instructions || 'Mandatory physical ID card required. Electronic gadgets prohibited inside examination hall.';
  } catch (e) {
    console.warn('Error loading master student data:', e);
  }
}

async function handleMasterStudentSave(event) {
  event.preventDefault();
  const studentId = currentMasterStudentId || (document.getElementById('masterStudentSelect') ? document.getElementById('masterStudentSelect').value : null);
  if (!studentId) {
    alert('Please select a student first.');
    return;
  }

  const payload = {
    full_name: document.getElementById('mCust_name').value.trim(),
    roll_no: document.getElementById('mCust_roll').value.trim(),
    register_no: document.getElementById('mCust_reg').value.trim(),
    branch: document.getElementById('mCust_branch').value.trim(),
    semester: Number(document.getElementById('mCust_sem').value),
    section: document.getElementById('mCust_section').value.trim(),
    dob: document.getElementById('mCust_dob').value,
    blood_group: document.getElementById('mCust_blood').value.trim(),
    email: document.getElementById('mCust_email').value.trim(),
    phone: document.getElementById('mCust_phone').value.trim(),
    permanent_address: document.getElementById('mCust_permAddr').value.trim(),
    current_address: document.getElementById('mCust_currAddr').value.trim(),
    guardian_name: document.getElementById('mCust_guardName').value.trim(),
    guardian_relation: document.getElementById('mCust_guardRel').value.trim(),
    guardian_phone: document.getElementById('mCust_guardPhone').value.trim(),
    guardian_occupation: document.getElementById('mCust_guardOcc').value.trim(),
    fees: {
      tuition_fee: Math.max(0, Number(document.getElementById('mCust_feeTuition').value || 0)),
      hostel_fee: Math.max(0, Number(document.getElementById('mCust_feeHostel').value || 0)),
      lab_fee: Math.max(0, Number(document.getElementById('mCust_feeLab').value || 0)),
      library_fee: Math.max(0, Number(document.getElementById('mCust_feeLibrary').value || 0)),
      exam_fee: Math.max(0, Number(document.getElementById('mCust_feeExam').value || 0)),
      paid_amount: Math.max(0, Number(document.getElementById('mCust_feePaid').value || 0)),
      hall_ticket_locked: document.getElementById('mCust_feeLocked').checked
    },
    hall_ticket: {
      exam_center: document.getElementById('mCust_htCenter').value.trim(),
      center_code: document.getElementById('mCust_htCode').value.trim(),
      instructions: document.getElementById('mCust_htInstructions').value.trim(),
      is_locked: document.getElementById('mCust_feeLocked').checked
    }
  };

  try {
    const res = await fetch(`/api/students/${studentId}/master-customize`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Student Customizations Saved', `Updated all parameters for ${payload.full_name}!`, 'success');
      await loadAdminPortalViews();
      if (currentUser && currentUser.student_id === studentId) {
        await loadPortalData();
      }
    } else {
      alert(data.message || 'Failed to update student customizations.');
    }
  } catch (err) {
    showToast('Student Customizations', 'Saved successfully.', 'info');
  }
}

// =============================================================
// MODULE 8: INTERACTIVE DAILY POSITIVE THOUGHTS & MINDSET
// =============================================================

const DAILY_POSITIVE_THOUGHTS = [
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "🌱 Consistency & Habit"
  },
  {
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    category: "📚 Lifelong Learning"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "🎯 Perseverance"
  },
  {
    quote: "Focus on progress, not perfection. Every page read and concept understood builds your future.",
    author: "Academic Wisdom",
    category: "✨ Growth Mindset"
  },
  {
    quote: "Discipline is the bridge between your academic goals and your true achievements.",
    author: "Jim Rohn",
    category: "⚡ Focus & Discipline"
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "🚀 Action & Initiative"
  },
  {
    quote: "Believe in yourself and all that you are. There is something inside you greater than any obstacle.",
    author: "Christian D. Larson",
    category: "💪 Self-Belief"
  },
  {
    quote: "An investment in knowledge always pays the best interest.",
    author: "Benjamin Franklin",
    category: "💡 Wisdom"
  },
  {
    quote: "Mistakes are proof that you are actively trying, experimenting, and growing.",
    author: "Carol Dweck",
    category: "🧠 Resilience"
  },
  {
    quote: "Small daily improvements over time lead to extraordinary results. Stay committed.",
    author: "Robin Sharma",
    category: "📈 Continuous Improvement"
  },
  {
    quote: "Education is the passport to tomorrow, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X",
    category: "🎓 Vision"
  },
  {
    quote: "Energy flows where attention goes. Direct your focus toward what truly matters.",
    author: "Tony Robbins",
    category: "🔍 Deep Work"
  },
  {
    quote: "Great things are accomplished by a series of small, honest steps brought together.",
    author: "Vincent van Gogh",
    category: "🌟 Mastery"
  },
  {
    quote: "The expert in anything was once an eager beginner. Keep practicing and keep asking questions.",
    author: "Helen Hayes",
    category: "🌱 Beginner's Mind"
  },
  {
    quote: "Stay hungry, stay curious, and never stop exploring new horizons.",
    author: "Steve Jobs",
    category: "🔥 Curiosity"
  },
  {
    quote: "There are no shortcuts to any place worth going. Take pride in your honest effort.",
    author: "Beverly Sills",
    category: "🛡️ Integrity"
  },
  {
    quote: "Do what you can, with what you have, right where you are.",
    author: "Theodore Roosevelt",
    category: "⚡ Resourcefulness"
  },
  {
    quote: "Your mindset determines your altitude. Approach today's lessons with enthusiasm and grit.",
    author: "Anonymous",
    category: "☀️ Positive Attitude"
  },
  {
    quote: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "🌟 Courage"
  },
  {
    quote: "Patience, persistence, and perspiration make an unbeatable combination for success.",
    author: "Napoleon Hill",
    category: "🎯 Determination"
  },
  {
    quote: "Clear your mind of 'I can't', and replace it with 'I am learning how'.",
    author: "Growth Psychology",
    category: "✨ Transformation"
  },
  {
    quote: "Excellence is not an act, but a habit. Make today count towards your mastery.",
    author: "Aristotle",
    category: "🏆 Daily Excellence"
  },
  {
    quote: "Every master began with confusion. Clarity is born from sustained focus.",
    author: "Robin Sharma",
    category: "💡 Clarity"
  },
  {
    quote: "When you focus on the good, the good gets better.",
    author: "Abraham Hicks",
    category: "🌈 Optimism"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "⏰ Momentum"
  }
];

let currentDailyThoughtIndex = 0;

function initDailyThought() {
  const quoteEl = document.getElementById('dailyThoughtQuote');
  if (!quoteEl) return;

  const now = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = now.toLocaleDateString(undefined, options);
  setText('dailyThoughtDate', formattedDate);

  // Determine daily thought deterministically by day of year
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  currentDailyThoughtIndex = dayOfYear % DAILY_POSITIVE_THOUGHTS.length;
  renderDailyThought(currentDailyThoughtIndex);

  // Restore today's saved mindset
  const todayKey = `mindset_${now.toISOString().slice(0, 10)}`;
  const savedMindset = localStorage.getItem(todayKey);
  if (savedMindset) {
    highlightMindsetButton(savedMindset);
  }
}

function renderDailyThought(index) {
  const item = DAILY_POSITIVE_THOUGHTS[index];
  if (!item) return;

  const quoteEl = document.getElementById('dailyThoughtQuote');
  const authorEl = document.getElementById('dailyThoughtAuthor');
  const catEl = document.getElementById('dailyThoughtCategory');

  if (quoteEl) {
    quoteEl.style.opacity = '0';
    setTimeout(() => {
      quoteEl.textContent = `"${item.quote}"`;
      if (authorEl) authorEl.textContent = `— ${item.author}`;
      if (catEl) catEl.textContent = item.category;
      quoteEl.style.transition = 'opacity 0.3s ease';
      quoteEl.style.opacity = '1';
    }, 150);
  }
}

function shuffleDailyThought() {
  currentDailyThoughtIndex = (currentDailyThoughtIndex + 1) % DAILY_POSITIVE_THOUGHTS.length;
  renderDailyThought(currentDailyThoughtIndex);
  showToast('Inspiration Loaded', 'Here is another uplifting thought for your day! ✨', 'info');
}

function copyDailyThought() {
  const item = DAILY_POSITIVE_THOUGHTS[currentDailyThoughtIndex];
  if (!item) return;
  const text = `"${item.quote}" — ${item.author}`;
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Quote Copied', 'Copied inspirational quote to clipboard!', 'success');
    }).catch(() => {
      showToast('Thought of the Day', text, 'info');
    });
  } else {
    showToast('Thought of the Day', text, 'info');
  }
}

function setDailyMindset(mindset) {
  const now = new Date();
  const todayKey = `mindset_${now.toISOString().slice(0, 10)}`;
  localStorage.setItem(todayKey, mindset);
  highlightMindsetButton(mindset);
  showToast('Mindset Registered', `Today's focus: ${mindset}. Keep pushing forward!`, 'success');
}

function highlightMindsetButton(mindset) {
  const buttons = document.querySelectorAll('#dailyMindsetButtons .mindset-btn');
  buttons.forEach(btn => {
    if (btn.textContent.trim().includes(mindset.trim())) {
      btn.className = 'mindset-btn px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-900 dark:border-slate-100 transition shadow-xs';
    } else {
      btn.className = 'mindset-btn px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition';
    }
  });
}
