"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const state = { config: null, samples: [], selectedSample: null, mode: "sample", busy: false, corpus: null, lang: "en", lastResult: null };
  const MAP_URL = "https://www.wastereduction.hku.hk/re-facilities#comp-m7bndgl81";

  const UI_STRINGS = {
    en: {
      page_title: "HKU Recycling Helper · Campus Recycling Guide",
      skip_link: "Skip to item checker",
      brand_subtitle: "HKU RECYCLING HELPER",
      nav_caption: "CAMPUS RECYCLING GUIDE",
      nav_check: "Check an item",
      nav_how: "How it works",
      nav_sources: "Reference sources",
      card_eyebrow: "CAMPUS FACILITIES",
      card_title: "Sort right on campus.",
      card_desc: "Find out whether your item can be recycled, how to clean it, and where to drop it off.",
      card_location: "re Facilities Map · HKU",
      footer_badge: "Based on HKU guidelines",
      sidebar_footer_text: "Covers re Kiosk, Smart Recycling<br>Bins &amp; campus re Bins.",
      about_btn: "About this helper",
      topbar_eyebrow: "HKU RECYCLING HELPER",
      topbar_location: "Campus Recycling Map",
      hero_kicker: "HKU CAMPUS WASTE REDUCTION & RECYCLING",
      hero_heading: "Sort with clarity.<br>Recycle <em>right.</em>",
      hero_sub: "Check whether an everyday item can be recycled, how to clean it before drop-off,<br class=\"desktop-break\">and which HKU facility accepts it.",
      hero_art_caption: "ONE ITEM AT A TIME",
      walk_title: "Quick start",
      walk_1: "Pick an example or enter an item",
      walk_2: "Check sorting rules",
      walk_3: "View steps & facility",
      sec_01: "01 / ITEM CHECK",
      one_item_tag: "Single item",
      checker_heading: "Can this be recycled on campus?",
      checker_intro: "Select a common example below, or switch to Live AI to enter your own item.",
      mode_sample: "Sample mode",
      mode_tag_nokey: "EXAMPLES",
      mode_live: "Live AI",
      samples_label: "Common examples",
      samples_select_one: "SELECT ONE",
      privacy_base: "Describe only the item, its material, and whether it is empty and clean.",
      your_item_label: "Item description",
      sec_02: "02 / SORTING RESULT",
      empty_heading: "Check an item<br>before you toss it.",
      empty_desc: "Select an example on the left or switch to Live AI to see whether it is accepted, how to clean it, and which campus bin to use.",
      empty_feat_1: "Clear sorting rules",
      empty_feat_2: "Official HKU sources",
      sample_result_notice: "Preset example — switch to Live AI to check your own item.",
      clarification_label: "MORE DETAILS NEEDED",
      facility_label: "RECOMMENDED FACILITY",
      view_facility_map: "View campus recycling map on HKU re Facilities",
      prep_heading: "Preparation before drop-off",
      prep_heading_sample: "Preparation before drop-off",
      evidence_heading: "Official reference sources",
      details_summary: "Technical details",
      loading_heading: "Checking sorting rules…",
      ground_heading: "On-site bin signage always comes first.",
      ground_desc: "If a bin sign or campus staff member gives different instructions on-site, always follow their guidance.",
      ground_btn: "How it works",
      footer_motto: "Sort right. Waste less.",
      footer_right: "HKU RE FACILITIES",
      how_eyebrow: "HOW IT WORKS",
      how_title: "Clear sorting guidance,<br>backed by official sources.",
      how_intro: "Enter one everyday item in Chinese or English. The helper checks it against HKU recycling rules and tells you how to prepare it and which campus facility to use.",
      how_s1_title: "Safety & scope check",
      how_s1_desc: "Hazardous, laboratory, medical, and commercial waste cannot be placed in campus recycling bins and must follow specialist disposal procedures.",
      how_s2_title: "Match HKU rules & facilities",
      how_s2_desc: "Matches your item to the appropriate stream at re Kiosk (Run Run Shaw Podium), Smart Recycling Bins, or campus re Bins.",
      how_s3_title: "Preparation & citations",
      how_s3_desc: "Shows required cleaning steps (such as rinsing or removing lids) alongside links to the official HKU Photo Guide and EPD references.",
      how_note: "Sample mode lets you preview common examples right away; switch to Live AI to check any item of your own.",
      how_close_btn: "Start checking",
      sources_eyebrow: "REFERENCE SOURCES",
      sources_title: "Official HKU & EPD<br>recycling references.",
      sources_intro: "All sorting rules in this helper are derived from the official public references listed below.",
      sources_note: "General EPD tips provide background guidance for items not covered by specific HKU rules. Always follow on-site campus bin signage.",
      about_eyebrow: "ABOUT THIS HELPER",
      about_title: "Campus recycling,<br>made simple.",
      about_p1: "HKU Recycling Helper helps students and staff check whether everyday items can be recycled at the re Kiosk (Run Run Shaw Podium, Main Campus), Smart Recycling Bins, and campus re Bins.",
      about_h_privacy: "Privacy",
      about_p_privacy: "Please enter only item descriptions and avoid personal details. No query logs or conversation histories are saved by this application.",
      about_h_scope: "Facilities covered",
      about_p_scope: "Covers paper, plastics, metals, glass bottles, and beverage cartons (Tetra Pak) across HKU re Facilities, with direct links to the official campus recycling map.",
      about_close_btn: "Back to the helper",
      ready_when_you_are: "READY",
      checking_your_item: "CHECKING",
      check_item_btn: "Check item",
      checking_btn: "Checking…",
      placeholder_sample: "Select an example above to preview.",
      placeholder_live: "e.g. clean pizza box / 膠樽 / 維他奶紙包盒 / takeaway coffee cup",
      input_kind_sample: "PRESET EXAMPLE",
      input_kind_live: "CHINESE OR ENGLISH",
      input_help_sample: "Switch to Live AI above to type your own item.",
      input_help_live: "Supports English and Traditional/Simplified Chinese (typos are handled automatically).",
      mode_desc_sample: "Browse preset examples for common campus items.",
      mode_desc_live: "Enter any everyday item to check its sorting rules and suitable facilities.",
      privacy_mode_sample: "",
      privacy_mode_live: "",
      footnote_sample: "Covers HKU re Kiosk, Smart Recycling Bins, and campus re Bins.",
      footnote_live: "Matches items to HKU re Kiosk, Smart Recycling Bins, and campus re Bins.",
      loading_sample: "Loading example…",
      loading_live: "Checking HKU recycling rules and facility streams…",
      no_evidence_sample: "No specific source record applies to this example.",
      no_evidence_live: "No specific rule record matched this item.",
      browse_refs: "View all official reference sources ↗",
      retry_conn: "Retry connection",
    },
    "zh-HK": {
      page_title: "港大回收助手 HKU Recycling Helper · 校園回收分類指南",
      skip_link: "跳至物品查詢工具",
      brand_subtitle: "港大回收助手",
      nav_caption: "校園回收指南",
      nav_check: "查詢物品",
      nav_how: "使用說明",
      nav_sources: "參考資料來源",
      card_eyebrow: "校園回收設施",
      card_title: "清晰分類 · 正確回收",
      card_desc: "根據港大官方指引，查詢日常物品是否可回收、投放前清理步驟及適用設施。",
      card_location: "校園回收設施地圖 · HKU",
      footer_badge: "依據港大官方指引",
      sidebar_footer_text: "涵蓋邵逸夫平台 re Kiosk、<br>智能回收箱及校園三色桶。",
      about_btn: "關於此助手",
      topbar_eyebrow: "港大回收助手 · HKU RECYCLING HELPER",
      topbar_location: "校園回收設施地圖",
      hero_kicker: "港大校園減廢與資源回收",
      hero_heading: "清晰分類，<br>正確<em>回收。</em>",
      hero_sub: "即時查詢日常物品是否可回收、投放前的清理步驟，<br class=\"desktop-break\">以及適用的港大回收設施。",
      hero_art_caption: "每次查詢一件物品",
      walk_title: "快速上手",
      walk_1: "選擇範例或輸入物品",
      walk_2: "查詢回收規則",
      walk_3: "查看清理步驟與設施",
      sec_01: "01 / 物品查詢",
      one_item_tag: "單件物品",
      checker_heading: "這件物品可以在校園回收嗎？",
      checker_intro: "選擇下方常見物品範例，或切換至「即時 AI 查詢」輸入你的物品。",
      mode_sample: "常見範例",
      mode_tag_nokey: "快速預覽",
      mode_live: "即時 AI 查詢",
      samples_label: "常見物品範例",
      samples_select_one: "請選擇一項",
      privacy_base: "請只輸入物品名稱、材質及清潔狀態（切勿輸入姓名或學生編號等個人資料）。",
      your_item_label: "物品描述",
      sec_02: "02 / 分類結果",
      empty_heading: "投放之前，<br>先查一查。",
      empty_desc: "在左側選擇常見範例或切換至「即時 AI 查詢」，即可查看是否可回收、清理步驟及適用回收桶。",
      empty_feat_1: "清晰分類指引",
      empty_feat_2: "港大官方來源",
      sample_result_notice: "預設常見範例 — 切換至「即時 AI 查詢」即可輸入並檢查你自己的物品。",
      clarification_label: "需要補充資料",
      facility_label: "適用回收設施",
      view_facility_map: "前往 HKU re Facilities 查看校園回收設施地圖",
      prep_heading: "投放前清理步驟",
      prep_heading_sample: "投放前清理步驟",
      evidence_heading: "官方參考資料",
      details_summary: "技術詳情",
      loading_heading: "正在核對回收規則…",
      ground_heading: "現場回收桶標示永遠優先。",
      ground_desc: "如現場回收桶告示或校園職員的指示與此不同，請以現場指示為準。",
      ground_btn: "使用說明",
      footer_motto: "正確分類 · 源頭減廢",
      footer_right: "港大 RE FACILITIES",
      how_eyebrow: "使用說明",
      how_title: "清晰分類指引，<br>官方來源支持。",
      how_intro: "以中文或英文輸入一件日常物品，系統會自動核對港大回收規則，並列出投放前的清理步驟及適用校園設施。",
      how_s1_title: "安全與範圍篩查",
      how_s1_desc: "危險品、實驗室、醫療及商業廢物不可放入校園回收桶，必須按專門安全程序處理。",
      how_s2_title: "匹配港大規則與設施",
      how_s2_desc: "根據物品材質匹配邵逸夫平台 re Kiosk、各樓宇智能回收箱（Smart Recycling Bins）或校園三色桶（re Bin）。",
      how_s3_title: "清理步驟與官方來源",
      how_s3_desc: "清楚列出投放前所需的處理步驟（如清空、沖洗、拆蓋），並附上港大圖文指南及環保署參考連結。",
      how_note: "「常見範例」模式可快速預覽常見物品結果；切換至「即時 AI 查詢」即可輸入任何日常物品。",
      how_close_btn: "開始查詢物品",
      sources_eyebrow: "參考資料來源",
      sources_title: "港大及環保署<br>官方參考資料。",
      sources_intro: "本助手的所有分類規則均整理自以下香港大學及環保署的官方公開指引。",
      sources_note: "香港環保署（EPD）的一般減廢及回收貼士僅供背景參考；請時刻以校園回收桶現場標示為準。",
      about_eyebrow: "關於此助手",
      about_title: "校園資源回收，<br>一目了然。",
      about_p1: "港大回收助手（HKU Recycling Helper）協助師生快速查詢日常物品是否可於本部校園邵逸夫平台 re Kiosk、智能回收箱（Smart Recycling Bins）及校園三色桶（re Bin）回收。",
      about_h_privacy: "私隱保障",
      about_p_privacy: "請僅輸入物品描述，切勿輸入個人資料。本應用程式不會儲存查詢紀錄或對話歷史。",
      about_h_scope: "涵蓋設施與類別",
      about_p_scope: "涵蓋廢紙、塑膠、金屬、玻璃樽及飲品紙包盒（Tetra Pak），並提供直達港大官方回收設施地圖的連結。",
      about_close_btn: "返回回收助手",
      ready_when_you_are: "準備就緒",
      checking_your_item: "正在查詢",
      check_item_btn: "查詢物品",
      checking_btn: "正在查詢…",
      placeholder_sample: "請在上方選擇一個常見範例。",
      placeholder_live: "例如：薄餅盒 / 膠樽 / 維他奶紙包盒 / 外賣咖啡杯 / clean pizza box",
      input_kind_sample: "預設範例",
      input_kind_live: "支援中英文輸入",
      input_help_sample: "如需自行輸入物品，請點擊上方「即時 AI 查詢」。",
      input_help_live: "支援繁簡中文及英文輸入（例如：薄餅盒、膠樽、汽水罐、玻璃樽）。",
      mode_desc_sample: "瀏覽常見校園物品的回收分類範例。",
      mode_desc_live: "輸入中英文物品名稱，即時核對回收規則與適用設施。",
      privacy_mode_sample: "",
      privacy_mode_live: "",
      footnote_sample: "涵蓋港大 re Kiosk、智能回收箱及校園 re Bin。",
      footnote_live: "根據物品類別匹配港大 re Kiosk、智能回收箱及校園 re Bin。",
      loading_sample: "正在載入範例…",
      loading_live: "正在核對港大回收規則與適用設施…",
      no_evidence_sample: "此範例無特定規則記錄。",
      no_evidence_live: "未有特定設施規則直接匹配此物品。",
      browse_refs: "查看所有官方參考資料 ↗",
      retry_conn: "重新連接",
    },
  };

  const STATUS_LABELS = {
    en: {
      accepted: "Accepted at the covered facility",
      not_accepted: "Not accepted at the covered facility",
      cannot_determine: "Cannot determine",
      refused: "Outside this helper’s scope",
      general_guidance: "General guidance - not facility-specific",
    },
    "zh-HK": {
      accepted: "此回收點接收",
      not_accepted: "此回收點不接收",
      cannot_determine: "無法確定",
      refused: "超出此助手範圍",
      general_guidance: "一般回收指引（非特定回收點）",
    },
  };

  const SAMPLE_LABELS = {
    en: {
      "sample-accepted": "Clean cardboard",
      "sample-not-accepted": "Coated wrapper",
      "sample-uncertain": "Missing details",
      "sample-refusal": "Lab waste",
    },
    "zh-HK": {
      "sample-accepted": "乾淨紙箱",
      "sample-not-accepted": "塗層包裝紙",
      "sample-uncertain": "資料不足",
      "sample-refusal": "實驗室廢物",
    },
  };

  const SAMPLE_DESCRIPTIONS_ZH = {
    "sample-accepted": "一個已撕走膠紙、乾淨乾爽的紙箱。",
    "sample-not-accepted": "一張帶有塑膠塗層的零食包裝紙。",
    "sample-uncertain": "這個容器應該放進哪個回收桶？",
    "sample-refusal": "我應該如何處理危險實驗室廢物？",
  };

  const TEXT_ZH = {
    "re Kiosk — Run Run Shaw Podium, Main Campus": "re Kiosk — 本部校園邵逸夫平台",
    "No facility-specific recommendation": "請參閱下方適用設施建議",
    "No facility recommendation": "請參閱下方適用設施建議",
    "Remove tape and flatten the box.": "撕走膠紙並把紙箱壓平。",
    "Remove any food residue and keep the box clean and dry.": "清除食物殘渣，並保持紙盒乾淨乾爽。",
    "Empty all liquid, rinse the bottle, and remove the cap.": "倒空液體，沖洗樽身並取下樽蓋。",
    "Empty and rinse the can before recycling.": "投放前請先倒空並沖洗乾淨。",
    "Remove tape or non-paper bindings, keep dry, and flatten boxes.": "撕走膠紙或非紙質釘裝物，保持乾爽並把紙箱壓平。",
    "Empty, rinse thoroughly, and remove the cap or lid.": "倒空內容物、徹底沖洗乾淨，並取下樽蓋。",
    "Cut open, rinse the inside, and flatten the carton.": "剪開紙包盒、沖洗內壁並壓平。",
    "Clean the lid.": "沖洗乾淨杯蓋。",
    "Clean the cup.": "倒空並沖洗乾淨紙杯。",
    "Remove food residue.": "清除所有食物殘渣並沖洗乾淨。",
    "Clean the bottle.": "倒空並沖洗乾淨樽身。",
    "Keep it out of paper, plastic and metal recycling.": "請勿放入廢紙、塑膠或金屬回收桶。",
    "Clean, empty plastic bottles and containers are accepted in the plastics recycling stream at HKU re Facilities.": "清空並洗淨的塑膠水樽及容器，可放入港大回收設施的塑膠回收箱。",
    "Empty, clean aluminium and metal cans are accepted in the metals recycling stream at HKU re Facilities.": "清空並洗淨的鋁罐及金屬罐，可放入港大回收設施的金屬回收箱。",
    "Clean, dry paper, magazines, newspapers, and flattened cardboard boxes are accepted in the paper recycling stream at HKU re Facilities.": "乾淨乾爽的廢紙、雜誌、報紙及壓平的紙箱，可放入港大回收設施的廢紙回收箱。",
    "Empty, rinsed glass bottles and jars are accepted in the glass bottle stream at re Kiosk and designated Smart Recycling Bins.": "清空並沖洗乾淨的玻璃樽及玻璃瓶，可放入 re Kiosk 或指定智能回收箱的玻璃樽回收箱。",
    "Clean, rinsed beverage cartons (Tetra Pak) are accepted in the beverage carton stream at re Kiosk.": "沖洗乾淨並壓平的紙包飲品盒（Tetra Pak），可放入 re Kiosk 的飲品紙包盒專用回收箱。",
    "Tissues, napkins, and paper towels have short fibres and hygiene concerns, and are excluded from paper recycling.": "紙巾、餐巾紙及抹手紙因纖維過短且有衛生考慮，不可放入廢紙回收箱。",
    "Thermal receipts contain chemical coatings and are excluded from paper recycling.": "感熱紙收據（熱敏紙小票）含有化學塗層，不可放入廢紙回收箱。",
    "Clean, dry cardboard is accepted in the paper recycling stream at re Kiosk.": "乾淨乾爽的紙皮及紙箱可放入廢紙回收箱。",
    "Composite or plastic-coated wrappers are excluded from the recycling streams at re Kiosk.": "複合材質或帶有塑膠塗層的包裝紙不可回收，請放入一般垃圾桶。",
    "The material and cleanliness of the container are not specified, so a recycling decision cannot be made yet.": "由於未註明容器的材質及是否已清空洗淨，暫時無法判斷是否可回收。",
    "What is the container made from, and is it empty and clean?": "請問這個容器是什麼材質（如塑膠、玻璃、金屬或紙類）？是否已經清空並洗淨？",
    "Hazardous and laboratory waste are outside the scope of campus dry recycling. Please follow laboratory safety procedures or contact campus staff.": "危險品及實驗室廢物不屬於校園一般回收範圍，請按實驗室安全程序處理或聯絡校園職員。",
    "Clean pizza boxes are accepted in the paper recycling stream at re Kiosk.": "乾淨無油漬的薄餅盒可放入廢紙回收箱。",
    "Baking paper is excluded from paper recycling at re Kiosk.": "牛油紙／烘焙紙帶有防黏塗層，不可放入廢紙回收箱。",
    "Clean plastic coffee cup lids (separated from the cup) are accepted in the plastics stream at re Kiosk.": "已與紙杯分開並洗淨的塑膠咖啡杯蓋，可放入塑膠回收箱。",
    "Paper coffee cup sleeves (separated from the cup) are accepted in the paper recycling stream at re Kiosk.": "已取下的紙製咖啡杯隔熱套，可放入廢紙回收箱。",
    "Clean takeaway coffee cups (with lid and sleeve removed) are accepted in the beverage carton stream at re Kiosk.": "已移除杯蓋及隔熱套並沖洗乾淨的外賣咖啡杯，可放入 re Kiosk 的飲品紙包盒回收箱。",
    "Clean fruit foam nets are accepted in the plastics recycling stream at re Kiosk.": "乾淨的生果網套（發泡膠網）可放入塑膠回收箱。",
    "Cleaned styrofoam containers with all food residue removed are accepted in the plastics stream, even if lightly stained.": "已清除所有食物殘渣並洗淨的發泡膠盒（即使留有少許色素染色），可放入塑膠回收箱。",
    "Empty, clean plastic contact lens trays (with the foil lid removed) are accepted in the plastics stream at re Kiosk.": "已完全撕走鋁箔封口蓋並洗淨的隱形眼鏡塑膠盒托，可放入塑膠回收箱。",
    "Foil lids from contact lens packaging are excluded from recycling at re Kiosk.": "隱形眼鏡包裝的鋁箔封口蓋屬於複合材質，不可回收。",
    "Instant noodle container lids are excluded from recycling at re Kiosk.": "杯麵及碗麵的封口蓋屬於複合材質，不可回收。",
    "Empty, clean plastic instant noodle cups (with the lid removed) are accepted in the plastics stream at re Kiosk.": "已撕走封口蓋、清空並洗淨的塑膠杯麵碗，可放入塑膠回收箱。",
    "Cling film with food labels attached is excluded from plastics recycling at re Kiosk.": "貼有食品標籤的保鮮紙不可放入塑膠回收箱。",
    "Empty, clean plastic personal care bottles (with the pump head removed) are accepted in the plastics stream at re Kiosk.": "已拆走泵頭、清空並洗淨的個人護理塑膠樽（如洗頭水樽、沐浴露樽），可放入塑膠回收箱。",
    "Empty, clean metal mooncake tins are accepted in the metals recycling stream at re Kiosk.": "清空並乾淨的金屬月餅罐可放入金屬回收箱。",
    "An item description is needed before checking the recycling rules.": "請先輸入物品名稱或描述。",
    "What is the item, what material is it made from, and is it empty and clean?": "請問這是什麼物品、由什麼材質製成，以及是否已清空並洗淨？",
    "Hazardous, laboratory and commercial waste are outside the scope of this helper. Do not use this helper to decide disposal; ask campus staff for the appropriate procedure.": "危險品、實驗室廢物及商業垃圾不屬於校園一般回收範圍，請向相關實驗室或校園職員查詢正確處置程序。",
    "Follow campus staff instructions and bin signage. This helper cannot override them; ask campus staff if the guidance is unclear.": "請以現場回收桶標示及校園職員指示為準。如有疑問，請向現場職員查詢。",
    "I can only check an ordinary item against the cited recycling rules. I cannot follow instructions to bypass those rules. Ask campus staff for disposal questions outside this scope.": "本助手僅供查詢日常物品的校園回收規則。超出範圍的棄置問題請向校園職員查詢。",
    "This helper only covers the re Kiosk on Main Campus and does not locate bins or confirm other facilities.": "請點擊下方「查看校園回收設施地圖」按鈕，瀏覽全校各區回收設施位置。",
    "Are you asking about the re Kiosk on Main Campus?": "你亦可直接點擊下方地圖連結，查看全校回收箱位置。",
    "This helper does not have real-time facility availability. Check current signage or contact campus staff.": "本助手不設設施即時開放狀態查詢；re Kiosk 及智能回收箱一般為 24 小時開放，詳情請以現場告示為準。",
    "Please remove names, student identifiers and contact details before using live mode.": "查詢前請先移除姓名、學生編號（UID）及聯絡方式等個人資料。",
    "Can you describe only the item, material and condition?": "請只輸入物品名稱、材質及清潔狀態。",
    "The description refers to an unidentified or mixed-material composite item that cannot be verified from the facility rules.": "此物品屬於材質不明或複合材質包裝，無法直接放入單一材質回收箱。",
    "Please identify the specific item, its main material and whether any parts can be separated.": "請註明具體物品名稱、主要材質，以及不同材質的部件能否拆開。",
    "The description does not identify a specific item or material.": "描述中未指明具體物品名稱或材質。",
    "The description does not identify a supported material clearly enough.": "未能從描述中識別出具體回收材質。",
    "Is the item paper, metal, plastic, a glass bottle or a beverage carton, and is it empty and clean?": "請問物品屬於廢紙、金屬、塑膠、玻璃樽還是飲品紙包盒？是否已清空並洗淨？",
    "The description includes multiple materials or items. Mixed-material acceptance cannot be inferred.": "描述包含多件物品或多種材質，請分開逐一查詢。",
    "Please describe one item and its main material; mention any inseparable parts.": "請每次輸入一件物品及其主要材質（如不同部件可拆開，請分別查詢）。",
    "This helper checks one item at a time. The description appears to contain several items or item types.": "請每次查詢一件物品，以便提供準確的分類與清理步驟。",
    "Please submit one item with its material and condition.": "請每次輸入一件物品及其材質。",
    "The description contains uncertainty about the item or its condition.": "描述中對物品材質或清潔狀態較為不確定。",
    "Please confirm the material and whether the item is empty, clean and dry where relevant.": "請先確認物品材質，以及是否已清空、洗淨及保持乾爽。",
    "The item's condition is missing, so a recycling decision would be premature.": "請確認物品是否已清空及清潔乾淨。",
    "Is it empty and clean? For paper, is it dry and free of food or grease?": "請問物品是否已清空並洗淨？（如屬紙類，是否乾爽且無油漬或食物殘渣？）",
    "The description does not confirm the conditions required by the matching rule.": "此物品需滿足清潔條件方可回收（不可帶有食物殘渣、油漬或液體）。",
    "The matching live rules conflict for the stated conditions. Ask campus staff before deciding.": "此描述同時涉及可回收與不可回收的部件，請將各部件拆開後分別查詢，或向現場職員查詢。",
    "The model could not establish a supported decision from the retrieved rules. Check the official facility guidance or ask campus staff.": "暫時無法從現有規則中確定此物品的分類，請參考現場回收桶標示或向職員查詢。",
    "Please confirm the exact item type, material and condition.": "請補充物品的具體名稱、材質及清潔狀態。",
    "No cited, facility-specific live rule supports a decision for this item. Missing evidence does not mean the item is not accepted. Check the official facility guidance or ask campus staff.": "現有特定規則未直接涵蓋此物品，請參考現場回收桶標示或向校園職員查詢。",
    "HKU Recycling 101": "港大回收入門 HKU Recycling 101",
    "HKU re Facilities — re Kiosk": "港大回收設施 — re Kiosk",
    "EPD Clean Recycling": "環保署「乾淨回收」指引",
    "EPD Important Notices": "環保署重要告示",
    "EPD Food Waste Recycling Schemes": "環保署廚餘回收計劃",
    "EPD Waste Reduction and Recycling Tips": "環保署減廢及回收貼士",
    "HKU Photo Guide — pizza box": "港大圖文指南 — 薄餅盒",
    "HKU Photo Guide — baking paper": "港大圖文指南 — 牛油紙／烘焙紙",
    "HKU Photo Guide — coffee cup lid": "港大圖文指南 — 咖啡杯蓋",
    "HKU Photo Guide — cup sleeve": "港大圖文指南 — 咖啡杯隔熱套",
    "HKU Photo Guide — takeaway coffee cup": "港大圖文指南 — 外賣咖啡杯",
    "HKU Photo Guide — foam net": "港大圖文指南 — 生果網套",
    "HKU Photo Guide — styrofoam": "港大圖文指南 — 發泡膠",
    "HKU Photo Guide — contact lens tray": "港大圖文指南 — 隱形眼鏡塑膠盒托",
    "HKU Photo Guide — contact lens foil lid": "港大圖文指南 — 隱形眼鏡鋁箔蓋",
    "HKU Photo Guide — instant noodle lid": "港大圖文指南 — 杯麵封口蓋",
    "HKU Photo Guide — instant noodle cup": "港大圖文指南 — 塑膠杯麵碗",
    "HKU Photo Guide — cling film with food label": "港大圖文指南 — 附標籤保鮮紙",
    "HKU Photo Guide — personal care bottle": "港大圖文指南 — 個人護理塑膠樽",
    "HKU Photo Guide — mooncake tin": "港大圖文指南 — 金屬月餅罐",
  };

  function t(key) {
    return UI_STRINGS[state.lang]?.[key] ?? UI_STRINGS.en[key] ?? key;
  }

  function trText(text) {
    if (!text || state.lang !== "zh-HK") return text;
    if (TEXT_ZH[text]) return TEXT_ZH[text];
    if (text.startsWith("Please confirm the item's exact type and all relevant conditions: ")) {
      const rest = text.slice("Please confirm the item's exact type and all relevant conditions: ".length);
      return `投放前請確保物品符合以下條件：${rest}`;
    }
    return text;
  }

  function resolveFacilityRecommendation(result) {
    const zh = state.lang === "zh-HK";
    if (!result) {
      return { primary: zh ? "re Kiosk（邵逸夫平台）· 智能回收箱 · 校園 re Bin" : "re Kiosk (Run Run Shaw Podium) · Smart Recycling Bins · Campus re Bins", detail: "" };
    }
    const ruleIds = (result.evidence || []).map((e) => e.rule_id || "");
    const text = `${result.item || ""} ${result.reason || ""} ${result.clarification || ""} ${(result.preparation || []).join(" ")} ${ruleIds.join(" ")}`.toLowerCase();

    if (result.status === "refused") {
      return {
        primary: zh
          ? "不適用於校園回收桶（請聯絡實驗室或物業處職員處理）"
          : "Not for campus recycling bins (Contact laboratory or Estates Office staff)",
        detail: zh
          ? "危險品、醫療、實驗室或商業廢物須按專門安全程序處置，切勿放入 re Kiosk、智能回收箱或三色桶。"
          : "Follow specialist campus disposal procedures for hazardous, laboratory, or commercial waste.",
      };
    }

    if (result.status === "not_accepted") {
      return {
        primary: zh
          ? "校園一般垃圾桶（re Kiosk、智能回收箱及三色桶均不接收）"
          : "Campus General Waste Bins (Not accepted at re Kiosk, Smart Recycling Bins, or re Bins)",
        detail: zh
          ? "此物品不屬於校園回收範圍，請放入一般垃圾桶，以免污染其他回收物。"
          : "This item cannot be recycled on campus; place it in a general waste bin to avoid contaminating recyclables.",
      };
    }

    if (text.includes("food scrap") || text.includes("fruit peel") || text.includes("vegetable peel") || text.includes("food waste") || text.includes("banana peel") || text.includes("廚餘") || text.includes("果皮")) {
      return {
        primary: zh
          ? "校園廚餘回收桶或一般垃圾桶（切勿放入廢紙、塑膠或金屬回收桶）"
          : "Campus Food Waste Bins or General Waste Bins (Keep out of dry recycling bins)",
        detail: zh
          ? "請使用校園內的廚餘收集點；如附近未設廚餘桶，請放入一般垃圾桶。"
          : "Use a campus food-waste collection point if available, or dispose of as general waste.",
      };
    }

    if (text.includes("rechargeable") || text.includes("充電池")) {
      return {
        primary: zh
          ? "re Kiosk — 本部校園邵逸夫平台（24 小時開放 · 設有充電池回收箱）"
          : "re Kiosk — Run Run Shaw Podium, Main Campus (24-hr · Rechargeable Battery collection)",
        detail: zh
          ? "位於本部校園邵逸夫平台（Subway 旁、邵仁枚樓對面），設有專門的充電池回收箱。"
          : "Located at Run Run Shaw Podium (next to Subway, opposite Runme Shaw Building) with dedicated rechargeable battery collection.",
      };
    }

    if ((text.includes("coffee-cup") && !text.includes("lid") && !text.includes("sleeve")) || (text.includes("coffee cup") && !text.includes("lid") && !text.includes("sleeve")) || text.includes("beverage carton") || text.includes("drink carton") || text.includes("milk carton") || text.includes("juice carton") || text.includes("tetra pak") || text.includes("tetrapak") || text.includes("carton stream") || text.includes("紙包")) {
      return {
        primary: zh
          ? "re Kiosk — 本部校園邵逸夫平台（24 小時開放 · 飲品紙包盒專用回收箱）"
          : "re Kiosk — Run Run Shaw Podium, Main Campus (24-hr · Tetra Pak / Beverage Carton stream)",
        detail: zh
          ? "注意：智能回收箱（Smart Recycling Bins）及一般三色桶不設紙包飲品盒回收，請前往邵逸夫平台 re Kiosk 投放。"
          : "Note: Smart Recycling Bins and standard re Bins do not collect beverage cartons; please use the re Kiosk at Run Run Shaw Podium.",
      };
    }

    if (text.includes("glass") || text.includes("玻璃")) {
      return {
        primary: zh
          ? "re Kiosk（本部校園邵逸夫平台）· 指定智能回收箱（百周年校園中央平台 G/F 及松蔭園）"
          : "re Kiosk (Run Run Shaw Podium) · Selected Smart Recycling Bins (Central Podium G/F & Pine Court)",
        detail: zh
          ? "24 小時開放；玻璃樽可於邵逸夫平台 re Kiosk、百周年校園中央平台 G/F 及松蔭園智能回收箱投放。"
          : "24-hour access; glass bottles are collected at re Kiosk and designated Smart Recycling Bins (Central Podium Levels G/F & Pine Court).",
      };
    }

    if (text.includes("styrofoam") || text.includes("foam-net") || text.includes("foam net") || text.includes("contact-lens") || text.includes("contact lens") || text.includes("noodle-container") || text.includes("instant noodle cup") || text.includes("coffee-cup-lid") || text.includes("coffee cup lid") || text.includes("發泡膠") || text.includes("生果網")) {
      return {
        primary: zh
          ? "re Kiosk（本部校園邵逸夫平台）· 智能回收箱（Smart Recycling Bins · 其他塑膠類別）"
          : "re Kiosk (Run Run Shaw Podium, Main Campus) · Smart Recycling Bins (Other Plastics stream)",
        detail: zh
          ? "re Kiosk 接收各類乾淨塑膠；智能回收箱設於梁銶琚樓 LG2/F、明華綜合大樓 1/F、許愛周科學館 G/F、百周年校園中央平台 G/F 及沙宣道校園。"
          : "re Kiosk collects diverse clean plastics; Smart Recycling Bins are located at K.K. Leung LG2/F, Meng Wah 1/F, Hui Oi Chow G/F, Central Podium G/F, and Sassoon Road Campus.",
      };
    }

    if (result.status === "accepted" || text.includes("paper") || text.includes("cardboard") || text.includes("plastic") || text.includes("metal") || text.includes("alumin") || text.includes("tin") || text.includes("can") || text.includes("bottle") || text.includes("box")) {
      return {
        primary: zh
          ? "re Kiosk（本部校園邵逸夫平台）· 智能回收箱（Smart Recycling Bins）· 校園各處 re Bin"
          : "re Kiosk (Run Run Shaw Podium, Main Campus) · Smart Recycling Bins · Campus re Bins",
        detail: zh
          ? "re Kiosk 及智能回收箱均為 24 小時開放（梁銶琚樓 LG2/F、明華 1/F、許愛周 G/F、百周年中央平台 G/F、沙宣道校園）；配合 HKU App 內 GreenU 功能使用智能回收箱可賺取積分。"
          : "re Kiosk and Smart Recycling Bins operate 24 hours (K.K. Leung LG2/F, Meng Wah 1/F, Hui Oi Chow G/F, Central Podium G/F, Sassoon Rd); use GreenU in the HKU App at Smart Bins to earn points.",
      };
    }

    return {
      primary: zh
        ? "re Kiosk（本部校園邵逸夫平台）· 智能回收箱（Smart Recycling Bins）· 校園各處 re Bin"
        : "re Kiosk (Run Run Shaw Podium, Main Campus) · Smart Recycling Bins · Campus re Bins",
      detail: zh
        ? "請確認物品屬於廢紙、塑膠、金屬、玻璃樽或飲品紙包盒並已洗淨，或點擊下方按鈕查看全校回收設施地圖。"
        : "Confirm the item's material and cleanliness to match the right recycling stream, or view the campus recycling map below.",
    };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#icon-${name}`);
    svg.append(use);
    return svg;
  }

  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function formatDate(value) {
    if (!value) return state.lang === "zh-HK" ? "尚未核實" : "Not yet verified";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(state.lang === "zh-HK" ? "zh-HK" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch(path, { ...options, signal: controller.signal, cache: "no-store" });
      let data;
      try { data = await response.json(); } catch { throw new Error("The local server returned an unreadable response. Please check that the project backend is running."); }
      if (!response.ok) throw new Error(data?.error?.message || `The request could not be completed (${response.status}). Please try again.`);
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("The request took too long. No recycling decision was made. Please try again shortly.");
      if (error instanceof TypeError) throw new Error("Could not reach the local server. Start the project launcher, then reload this page.");
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function walkthrough(step) {
    for (let n = 1; n <= 3; n += 1) {
      const node = $(`walk-step-${n}`);
      node.classList.toggle("current", step === n);
      node.classList.toggle("complete", n < step);
      if (step === n) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
    }
  }

  function clearResult() {
    state.lastResult = null;
    $("result-content").hidden = true;
    $("result-loading").hidden = true;
    $("result-empty").hidden = false;
    $("result-label").textContent = t("ready_when_you_are");
    $("result-card").setAttribute("aria-labelledby", "result-heading");
    $("result-announcement").textContent = "";
    $("check-error").hidden = true;
  }

  function updateSubmit() {
    const ready = state.mode === "sample" ? !!state.selectedSample : !!state.config?.live_available && !!$("description").value.trim();
    $("check-button").disabled = state.busy || !ready;
  }

  function displaySampleDescription(sample) {
    if (!sample) return "";
    return state.lang === "zh-HK" ? (SAMPLE_DESCRIPTIONS_ZH[sample.id] || sample.description) : sample.description;
  }

  function chooseSample(sample) {
    if (state.busy) return;
    state.selectedSample = sample;
    $("description").value = displaySampleDescription(sample);
    for (const button of $("sample-chips").querySelectorAll("button")) {
      const selected = button.dataset.sampleId === sample.id;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    clearResult();
    walkthrough(2);
    updateSubmit();
  }

  function sampleIcon(sample) {
    const description = `${sample.label} ${sample.description}`.toLowerCase();
    if (/lab|hazard|battery|unsafe/.test(description)) return "shield";
    if (/uncertain|missing|container|ambiguous/.test(description)) return "question";
    if (/paper|cardboard|carton|wrapper/.test(description)) return "paper";
    if (/metal|can|tin/.test(description)) return "can";
    return "bottle";
  }

  function renderSamples() {
    const container = $("sample-chips");
    container.replaceChildren();
    if (!state.samples.length) {
      container.append(el("p", "secondary-text", state.lang === "zh-HK" ? "暫無可用範例，請重新載入頁面。" : "No examples available. Please reload the page."));
      return;
    }
    const labels = SAMPLE_LABELS[state.lang] || SAMPLE_LABELS.en;
    for (const sample of state.samples) {
      const button = el("button", "sample-chip");
      button.type = "button";
      button.dataset.sampleId = sample.id;
      const isSelected = state.selectedSample?.id === sample.id;
      button.classList.toggle("selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
      button.setAttribute("aria-label", labels[sample.id] || sample.label);
      button.append(icon(sampleIcon(sample)), el("span", null, labels[sample.id] || sample.label));
      button.addEventListener("click", () => chooseSample(sample));
      container.append(button);
    }
  }

  function updateModeCopy() {
    const sampleMode = state.mode === "sample";
    $("description").placeholder = sampleMode ? t("placeholder_sample") : t("placeholder_live");
    $("input-kind").textContent = sampleMode ? t("input_kind_sample") : t("input_kind_live");
    $("input-help").textContent = sampleMode ? t("input_help_sample") : t("input_help_live");
    $("mode-description").textContent = sampleMode ? t("mode_desc_sample") : t("mode_desc_live");
    $("privacy-mode").textContent = sampleMode ? t("privacy_mode_sample") : t("privacy_mode_live");
    $("form-footnote-text").textContent = sampleMode ? t("footnote_sample") : t("footnote_live");
  }

  function switchMode(mode) {
    if (state.busy || (mode === "live" && !state.config?.live_available)) return;
    state.mode = mode;
    const sampleMode = mode === "sample";
    for (const name of ["sample", "live"]) {
      $(`mode-${name}`).classList.toggle("selected", name === mode);
      $(`mode-${name}`).setAttribute("aria-pressed", String(name === mode));
    }
    $("sample-picker").hidden = !sampleMode;
    $("description").readOnly = sampleMode;
    $("description").value = sampleMode && state.selectedSample ? displaySampleDescription(state.selectedSample) : "";
    $("character-count").hidden = sampleMode;
    $("character-count").textContent = "0 / 1000";
    updateModeCopy();
    clearResult();
    updateSubmit();
    if (!sampleMode) $("description").focus();
  }

  function applyConfig() {
    const config = state.config;
    if (!config) return;
    $("mode-live").disabled = !config.live_available;
    $("live-availability").classList.toggle("ready", !!config.live_available);
    if (state.lang === "zh-HK") {
      $("live-availability").textContent = config.live_available
        ? "即時 AI 查詢已就緒"
        : `即時 AI 暫不可用：${config.live_unavailable_reason || "請先在 .env 配置 API Key。"}`;
    } else {
      $("live-availability").textContent = config.live_available
        ? "Live AI ready"
        : `Live AI unavailable: ${config.live_unavailable_reason || "configure your API key in .env first."}`;
    }
    const count = Number(config.live_rule_count ?? config.approved_rule_count ?? 0);
    if (state.lang === "zh-HK") {
      $("corpus-status").textContent = count > 0
        ? `已收錄 ${count} 項校園回收規則 · 更新於 ${formatDate(config.corpus_verified_on)}`
        : "規則庫尚未配置";
    } else {
      $("corpus-status").textContent = count > 0
        ? `${count} campus rules · Updated ${formatDate(config.corpus_verified_on)}`
        : "Rule collection not configured";
    }
    updateSubmit();
  }

  function setBusy(busy) {
    state.busy = busy;
    $("result-card").setAttribute("aria-busy", String(busy));
    $("check-button-label").textContent = busy ? t("checking_btn") : t("check_item_btn");
    $("check-button").querySelector(".spinner").hidden = !busy;
    $("check-button").querySelector(".button-arrow").hidden = busy;
    $("mode-sample").disabled = busy;
    $("mode-live").disabled = busy || !state.config?.live_available;
    $("description").readOnly = busy || state.mode === "sample";
    for (const button of $("sample-chips").querySelectorAll("button")) button.disabled = busy;
    updateSubmit();
  }

  function renderEvidence(evidence, sampleMode) {
    const container = $("evidence-list");
    container.replaceChildren();
    if (state.lang === "zh-HK") {
      $("evidence-count").textContent = evidence.length ? `${evidence.length} 項官方來源` : "";
    } else {
      $("evidence-count").textContent = evidence.length ? `${evidence.length} SOURCE${evidence.length === 1 ? "" : "S"}` : "";
    }
    $("no-evidence").hidden = !!evidence.length;
    $("no-evidence").textContent = sampleMode ? t("no_evidence_sample") : t("no_evidence_live");
    for (const source of evidence) {
      const url = safeUrl(source.url);
      const card = el(url ? "a" : "div", "evidence-link");
      const titleText = trText(source.title) || (state.lang === "zh-HK" ? "官方參考來源" : "Official reference");
      if (url) {
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", `${titleText} (${state.lang === "zh-HK" ? "於新分頁開啟" : "opens in a new tab"})`);
        card.addEventListener("click", () => walkthrough(4));
      }
      const body = el("div");
      body.append(el("strong", null, titleText));
      if (source.locator) body.append(el("small", null, source.locator));
      if (source.verified_on) {
        const prefix = state.lang === "zh-HK" ? "核實日期：" : "Verified ";
        body.append(el("small", null, `${prefix}${formatDate(source.verified_on)}`));
      }
      card.append(icon("book"), body);
      if (url) card.append(icon("external"));
      container.append(card);
    }
    if (!evidence.length) {
      const referenceButton = el("button", "text-button reference-button", t("browse_refs"));
      referenceButton.type = "button";
      referenceButton.addEventListener("click", () => { walkthrough(4); openSources(); });
      container.append(referenceButton);
    }
  }

  function renderMetadata(result, sampleMode) {
    const metadata = $("result-metadata");
    metadata.replaceChildren();
    const zh = state.lang === "zh-HK";
    const entries = zh
      ? [
          ["查詢模式", sampleMode ? "常見範例" : result.status === "general_guidance" ? "一般回收指引" : result.mode === "screening" ? "本地規則篩查" : "即時 AI 規則核對"],
          ["服務提供方", sampleMode ? "本地內置" : result.provider || "本地篩查"],
          ["模型", sampleMode ? "內置範例" : result.model || "未調用模型"],
          ["規則庫版本", result.corpus_version || state.config?.corpus_version || "未提供"],
          ["規則更新日期", formatDate(result.corpus_verified_on || state.config?.corpus_verified_on)],
          ["請求編號", result.request_id || "未提供"],
        ]
      : [
          ["Mode", sampleMode ? "Preset example" : result.status === "general_guidance" ? "General AI guidance" : result.mode === "screening" ? "Local screening" : "Live AI check"],
          ["Provider", sampleMode ? "Built-in" : result.provider || "Local screening"],
          ["Model", sampleMode ? "Built-in example" : result.model || "None"],
          ["Corpus version", result.corpus_version || state.config?.corpus_version || "Not available"],
          ["Last updated", formatDate(result.corpus_verified_on || state.config?.corpus_verified_on)],
          ["Request ID", result.request_id || "Not available"],
        ];
    for (const [label, value] of entries) metadata.append(el("dt", null, label), el("dd", null, value));
  }

  function renderResult(result, focusHeading = true) {
    const labels = STATUS_LABELS[state.lang] || STATUS_LABELS.en;
    if (!result || !Object.hasOwn(labels, result.status)) throw new Error("The server returned an incomplete decision. No recommendation can be shown. Please try again.");
    state.lastResult = result;
    const sampleMode = result.mode === "sample";
    const zh = state.lang === "zh-HK";
    $("result-empty").hidden = true;
    $("result-loading").hidden = true;
    $("result-content").hidden = false;
    $("result-card").setAttribute("aria-labelledby", "decision-heading");
    $("result-label").textContent = sampleMode
      ? (zh ? "常見範例" : "EXAMPLE")
      : result.status === "general_guidance"
        ? (zh ? "一般回收指引" : "GENERAL GUIDANCE")
        : result.mode === "screening"
          ? (zh ? "範圍與條件提示" : "SCOPE CHECK")
          : (zh ? "官方規則匹配" : "VERIFIED RULE");
    $("result-status").dataset.status = result.status;
    const statusIcon = result.status === "accepted" ? "check" : result.status === "not_accepted" ? "close" : result.status === "refused" ? "shield" : "question";
    $("status-icon-use").setAttribute("href", `#icon-${statusIcon}`);
    $("result-eyebrow").textContent = sampleMode
      ? (zh ? "範例結果" : "EXAMPLE RESULT")
      : result.status === "general_guidance"
        ? (zh ? "一般回收指引" : "GENERAL GUIDANCE")
        : (zh ? "回收分類結果" : "SORTING DECISION");
    $("decision-heading").textContent = labels[result.status];
    $("sample-result-notice").hidden = !sampleMode;
    const reasonText = trText(result.reason) || (zh ? "未提供說明。" : "No explanation was provided.");
    $("result-reason").textContent = reasonText;
    $("clarification-box").hidden = !result.clarification;
    $("clarification-text").textContent = trText(result.clarification) || "";

    const facilityInfo = resolveFacilityRecommendation(result);
    $("result-facility").textContent = facilityInfo.primary;
    $("result-facility-detail").textContent = facilityInfo.detail;
    $("result-facility-detail").hidden = !facilityInfo.detail;
    $("facility-map-link").href = MAP_URL;
    $("facility-map-text").textContent = t("view_facility_map");

    const preparation = Array.isArray(result.preparation) ? result.preparation : [];
    $("preparation-section").hidden = !preparation.length;
    $("preparation-heading").textContent = sampleMode ? t("prep_heading_sample") : t("prep_heading");
    const list = $("preparation-list");
    list.replaceChildren();
    for (const item of preparation) {
      const li = el("li");
      li.append(icon("check"), el("span", null, trText(item)));
      list.append(li);
    }
    renderEvidence(Array.isArray(result.evidence) ? result.evidence : [], sampleMode);
    renderMetadata(result, sampleMode);
    $("result-announcement").textContent = `${labels[result.status]}. ${reasonText}`;
    walkthrough(3);
    if (focusHeading) {
      $("decision-heading").focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 640px)").matches) $("result-card").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }

  async function checkItem(event) {
    event.preventDefault();
    if (state.busy) return;
    if (state.mode === "sample" && !state.selectedSample) return;
    if (state.mode === "live" && (!state.config?.live_available || !$("description").value.trim())) return;
    const payload = {
      mode: state.mode,
      description: state.mode === "sample" ? state.selectedSample.description : $("description").value.trim(),
    };
    if (state.mode === "sample") payload.sample_id = state.selectedSample.id;
    if (state.lang === "zh-HK") payload.lang = "zh-HK";
    $("check-error").hidden = true;
    $("result-content").hidden = true;
    $("result-empty").hidden = true;
    $("result-loading").hidden = false;
    $("loading-message").textContent = state.mode === "sample" ? t("loading_sample") : t("loading_live");
    $("result-label").textContent = t("checking_your_item");
    $("result-announcement").textContent = t("checking_your_item");
    setBusy(true);
    try {
      const result = await request("./api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      renderResult(result, true);
    } catch (error) {
      clearResult();
      $("check-error").textContent = error.message;
      $("check-error").hidden = false;
      $("result-announcement").textContent = state.lang === "zh-HK" ? "查詢未能完成，請稍後再試。" : "The check could not be completed. Please try again.";
    } finally {
      setBusy(false);
    }
  }

  function renderSources(data) {
    const references = Array.isArray(data) ? data : Array.isArray(data.references) ? data.references : [];
    const approvedSources = !Array.isArray(data) && Array.isArray(data.sources) ? data.sources : [];
    const approvedIds = new Set(approvedSources.map((source) => source.id));
    const sources = [...new Map([...approvedSources, ...references].map((source) => [source.id || source.url, source])).values()];
    const count = state.config?.live_rule_count ?? state.config?.approved_rule_count ?? 0;
    const zh = state.lang === "zh-HK";
    $("library-summary").textContent = zh
      ? `已收錄 ${count} 項校園回收規則 · ${sources.length} 項官方參考資料`
      : `${count} campus rules · ${sources.length} official reference${sources.length === 1 ? "" : "s"}`;
    const container = $("source-library");
    container.replaceChildren();
    if (!sources.length) {
      container.append(el("p", "secondary-text", zh ? "暫無參考來源記錄。" : "No reference sources available."));
      return;
    }
    for (const source of sources) {
      const card = el("article", "library-source");
      const url = safeUrl(source.url);
      const displayTitle = trText(source.title) || source.id || "Reference";
      const title = el(url ? "a" : "h3", null, displayTitle);
      if (url) {
        title.href = url;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
        title.append(icon("external"));
        title.setAttribute("aria-label", `${displayTitle} (${zh ? "於新分頁開啟" : "opens in a new tab"})`);
      }
      card.append(title);
      if (source.locator) card.append(el("p", null, source.locator));
      if (source.verified_on) card.append(el("p", null, zh ? `核實日期：${formatDate(source.verified_on)}` : `Verified ${formatDate(source.verified_on)}`));
      const permission = source.permission || {};
      const approved = approvedIds.has(source.id) || (["approved", "team_override"].includes(permission.status) && permission.allow_api_processing === true && permission.allow_distribution === true);
      card.append(el(
        "span",
        "source-state",
        zh
          ? (approved ? "官方回收指引來源" : "一般背景參考資料")
          : (approved ? "Included in live corpus · Official reference" : "Background reference")
      ));
      container.append(card);
    }
  }

  async function openSources() {
    openDialog("sources-dialog");
    if (state.corpus) { renderSources(state.corpus); return; }
    $("library-summary").textContent = state.lang === "zh-HK" ? "正在載入參考資料…" : "Loading reference sources…";
    $("source-library").replaceChildren();
    try { state.corpus = await request("./api/corpus"); renderSources(state.corpus); }
    catch (error) { $("library-summary").textContent = state.lang === "zh-HK" ? "無法載入參考資料。" : "Could not load reference sources."; $("source-library").append(el("p", "notice notice-error", error.message)); }
  }

  function openDialog(id) {
    const dialog = $(id);
    if (!dialog.open) dialog.showModal();
  }

  function setLanguage(lang) {
    state.lang = lang === "zh-HK" ? "zh-HK" : "en";
    document.documentElement.lang = state.lang;
    document.title = t("page_title");
    for (const btn of document.querySelectorAll("[data-lang]")) {
      const active = btn.dataset.lang === state.lang;
      btn.classList.toggle("selected", active);
      btn.setAttribute("aria-pressed", String(active));
    }
    for (const node of document.querySelectorAll("[data-i18n]")) {
      node.textContent = t(node.dataset.i18n);
    }
    for (const node of document.querySelectorAll("[data-i18n-html]")) {
      node.innerHTML = t(node.dataset.i18nHtml);
    }
    $("check-button-label").textContent = state.busy ? t("checking_btn") : t("check_item_btn");
    updateModeCopy();
    if (state.mode === "sample" && state.selectedSample) {
      $("description").value = displaySampleDescription(state.selectedSample);
    }
    renderSamples();
    applyConfig();
    if (state.lastResult && !$("result-content").hidden) {
      renderResult(state.lastResult, false);
    } else if (!$("result-empty").hidden) {
      $("result-label").textContent = t("ready_when_you_are");
    }
    if (state.corpus) renderSources(state.corpus);
    try { localStorage.setItem("re-helper-lang", state.lang); } catch { /* Storage is optional. */ }
  }

  async function loadApp() {
    $("global-error").hidden = true;
    const results = await Promise.allSettled([request("./api/config"), request("./api/samples")]);
    const errors = [];
    if (results[0].status === "fulfilled") { state.config = results[0].value; applyConfig(); }
    else { errors.push(results[0].reason.message); $("live-availability").textContent = "Service status unavailable."; $("corpus-status").textContent = "Rule collection unavailable"; }
    if (results[1].status === "fulfilled") {
      const data = results[1].value;
      state.samples = Array.isArray(data) ? data : data.samples || [];
      renderSamples();
    } else { errors.push(results[1].reason.message); $("sample-chips").replaceChildren(el("span", "loading-label", "Examples could not be loaded.")); }
    if (errors.length) {
      const banner = $("global-error");
      banner.replaceChildren(el("span", null, [...new Set(errors)].join(" ")));
      const retry = el("button", null, t("retry_conn"));
      retry.type = "button";
      retry.addEventListener("click", () => { retry.disabled = true; loadApp(); });
      banner.append(retry);
      banner.hidden = false;
    }
  }

  $("check-form").addEventListener("submit", checkItem);
  $("mode-sample").addEventListener("click", () => switchMode("sample"));
  $("mode-live").addEventListener("click", () => switchMode("live"));
  for (const btn of document.querySelectorAll("[data-lang]")) {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  }
  $("description").addEventListener("input", () => {
    $("character-count").textContent = `${$("description").value.length} / 1000`;
    clearResult();
    updateSubmit();
  });
  $("open-sources").addEventListener("click", openSources);
  for (const button of document.querySelectorAll("[data-open-dialog]")) button.addEventListener("click", () => openDialog(button.dataset.openDialog));
  for (const button of document.querySelectorAll("[data-close-dialog]")) button.addEventListener("click", () => button.closest("dialog").close());
  for (const dialog of document.querySelectorAll("dialog")) dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  $("dismiss-walkthrough").addEventListener("click", () => {
    $("walkthrough").hidden = true;
    try { localStorage.setItem("re-helper-walkthrough-dismissed", "yes"); } catch { /* Storage is optional. */ }
  });
  try {
    $("walkthrough").hidden = localStorage.getItem("re-helper-walkthrough-dismissed") === "yes";
    const savedLang = localStorage.getItem("re-helper-lang");
    if (savedLang === "zh-HK" || savedLang === "en") setLanguage(savedLang);
  } catch { /* The helper works with storage disabled. */ }
  walkthrough(1);
  loadApp();
})();
