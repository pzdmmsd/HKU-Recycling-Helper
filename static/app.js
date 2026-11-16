"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const state = { config: null, samples: [], selectedSample: null, mode: "sample", busy: false, corpus: null, lang: "en", lastResult: null };

  const UI_STRINGS = {
    en: {
      page_title: "HKU Recycling Helper · One item at a time",
      skip_link: "Skip to item checker",
      brand_subtitle: "HKU RECYCLING HELPER",
      nav_caption: "A LITTLE HELP GOES A LONG WAY",
      nav_check: "Check an item",
      nav_how: "How it works",
      nav_sources: "Source library",
      card_eyebrow: "CAMPUS COVERAGE",
      card_title: "Clear rules. Everyday items.",
      card_desc: "Source-backed guidance for sorting and preparing your recyclables on campus.",
      card_location: "re Kiosk · Main Campus",
      footer_badge: "Source-backed guidance",
      sidebar_footer_text: "Covering the re Kiosk at<br>Run Run Shaw Podium.",
      about_btn: "About this helper",
      topbar_eyebrow: "HKU RECYCLING HELPER",
      topbar_location: "re Kiosk · Main Campus",
      hero_kicker: "A SMALL STEP TOWARDS LESS WASTE",
      hero_heading: "A little clarity.<br>A cleaner <em>campus.</em>",
      hero_sub: "Know what belongs, how to prepare it, and where to go.<br class=\"desktop-break\">Start with one everyday item.",
      hero_art_caption: "ONE ITEM AT A TIME",
      walk_title: "New here? Try a quick check.",
      walk_1: "Choose a sample",
      walk_2: "Check the item",
      walk_3: "Read the evidence",
      sec_01: "01 / THE ITEM",
      one_item_tag: "One item, please",
      checker_heading: "Where does it go?",
      checker_intro: "A little detail makes a better decision.",
      mode_sample: "Sample mode",
      mode_tag_nokey: "QUICK EXAMPLES",
      mode_live: "Live AI",
      samples_label: "Common examples",
      samples_select_one: "SELECT ONE",
      privacy_base: "Keep it about the item. Don’t enter names, student UIDs, contact details, or personal records.",
      your_item_label: "Your item",
      sec_02: "02 / THE NEXT STEP",
      empty_heading: "A good habit starts<br>with one item.",
      empty_desc: "Select an item or enter a description to view the sorting decision, preparation steps, and cited sources.",
      empty_feat_1: "Clear decision",
      empty_feat_2: "Visible evidence",
      sample_result_notice: "Built-in example — switch to Live AI to check your own item description.",
      clarification_label: "A LITTLE MORE DETAIL",
      facility_label: "COVERED FACILITY",
      prep_heading: "Before you drop it off",
      prep_heading_sample: "Preparation steps",
      evidence_heading: "Where this comes from",
      details_summary: "About this answer",
      loading_heading: "Checking the details…",
      ground_heading: "The sign at the bin has the final say.",
      ground_desc: "Follow campus staff and current on-site signage at all times.",
      ground_btn: "How it works",
      footer_motto: "Less guessing. Better habits.",
      footer_right: "RE KIOSK · MAIN CAMPUS",
      how_eyebrow: "HOW IT WORKS",
      how_title: "Clarity, with the sources<br>to back it up.",
      how_intro: "Describe one everyday item in any language, including its material and whether it is empty, clean, or stained. Typos are normalized automatically before checking the rules for the re Kiosk on Main Campus.",
      how_s1_title: "Check the scope",
      how_s1_desc: "Hazardous, laboratory, and commercial waste requests are excluded. Campus staff and on-site bin signage always take priority.",
      how_s2_title: "Match cited evidence",
      how_s2_desc: "Live mode retrieves matching records from the local rule collection and verifies all required conditions.",
      how_s3_title: "Clear decision states",
      how_s3_desc: "Results show Accepted, Not accepted, Cannot determine, or General guidance when an item is outside the re Kiosk rule set.",
      how_note: "Sample mode provides built-in examples for common items so you can preview how decisions and citations are presented.",
      how_close_btn: "Let’s check an item",
      sources_eyebrow: "THE SOURCE LIBRARY",
      sources_title: "Good answers need<br>good foundations.",
      sources_intro: "Official public references cited by the rule collection are listed below with their section locators and verification dates.",
      sources_note: "General Hong Kong recycling guidance provides background context only and does not establish acceptance at an HKU facility. Always follow current campus signage.",
      about_eyebrow: "ABOUT THIS HELPER",
      about_title: "A campus habit,<br>one item at a time.",
      about_p1: "HKU Recycling Helper provides source-backed recycling guidance for the re Kiosk at Run Run Shaw Podium, Main Campus.",
      about_h_privacy: "Privacy",
      about_p_privacy: "Keep descriptions focused on the item and free of personal information. The app does not store query logs or conversation history.",
      about_h_scope: "Coverage",
      about_p_scope: "Supports multilingual input for one everyday item at a time, backed by cited HKU and EPD references. Always follow on-site bin signage and campus staff instructions.",
      about_close_btn: "Back to the helper",
      ready_when_you_are: "READY WHEN YOU ARE",
      checking_your_item: "CHECKING YOUR ITEM",
      check_item_btn: "Check item",
      checking_btn: "Checking…",
      placeholder_sample: "Choose an example above to get started.",
      placeholder_live: "For example: 一個乾淨的薄餅盒 / one clean pizza box / un carton de pizza propre.",
      input_kind_sample: "EXAMPLE DESCRIPTION",
      input_kind_live: "ANY-LANGUAGE INPUT · ONE ITEM",
      input_help_sample: "Example descriptions are preset. Switch to Live AI to enter your own item.",
      input_help_live: "Typos and multiple languages are supported. Results cite official source records.",
      mode_desc_sample: "Select a common item example, or switch to Live AI to check your own item.",
      mode_desc_live: "Check your item against the cited live rule collection.",
      privacy_mode_sample: "Sample mode makes no external request.",
      privacy_mode_live: "Live mode processes your item description and matched rules via Alibaba Cloud Bailian without saving query logs.",
      footnote_sample: "Covers the re Kiosk at Run Run Shaw Podium, Main Campus.",
      footnote_live: "Applies to the re Kiosk at Run Run Shaw Podium, Main Campus.",
      loading_sample: "Reading the selected example…",
      loading_live: "Retrieving matching rules and verifying evidence…",
      no_evidence_sample: "No specific source citation applies to this example.",
      no_evidence_live: "No cited live rule supports a facility decision for this item.",
      browse_refs: "Browse official reference links ↗",
      ref_disclaimer: "Reference links provide general background context.",
      retry_conn: "Retry connection",
    },
    "zh-HK": {
      page_title: "港大回收助手 HKU Recycling Helper · 每次查詢一件物品",
      skip_link: "跳至物品查詢工具",
      brand_subtitle: "港大回收助手",
      nav_caption: "舉手之勞 · 資源回收",
      nav_check: "查詢物品",
      nav_how: "使用說明",
      nav_sources: "資料來源庫",
      card_eyebrow: "覆蓋範圍",
      card_title: "清晰指引 · 日常回收",
      card_desc: "根據官方公開指引，為校園日常物品提供分類與清潔準備建議。",
      card_location: "re Kiosk · 本部校園",
      footer_badge: "官方來源支持",
      sidebar_footer_text: "涵蓋本部校園邵逸夫平台<br>re Kiosk 回收點。",
      about_btn: "關於此助手",
      topbar_eyebrow: "港大回收助手 · HKU RECYCLING HELPER",
      topbar_location: "re Kiosk · 本部校園",
      hero_kicker: "源頭減廢 · 由日常小步開始",
      hero_heading: "清晰分類，<br>共建更整潔的<em>校園。</em>",
      hero_sub: "了解哪些物品可回收、投放前的清潔步驟及回收位置。<br class=\"desktop-break\">由查詢一件日常物品開始。",
      hero_art_caption: "每次查詢一件物品",
      walk_title: "初次使用？試試快速查詢。",
      walk_1: "選擇常見範例",
      walk_2: "點擊查詢物品",
      walk_3: "查閱來源依據",
      sec_01: "01 / 物品描述",
      one_item_tag: "每次一件物品",
      checker_heading: "這件物品該放哪裏？",
      checker_intro: "提供材質與清潔狀態，可獲得更準確的分類建議。",
      mode_sample: "常見範例",
      mode_tag_nokey: "快速預覽",
      mode_live: "即時 AI 查詢",
      samples_label: "常見物品範例",
      samples_select_one: "請選擇一項",
      privacy_base: "請只描述物品本身，切勿輸入姓名、學生編號（UID）、聯絡方式或個人資料。",
      your_item_label: "你的物品",
      sec_02: "02 / 分類結果與下一步",
      empty_heading: "良好回收習慣，<br>由一件物品開始。",
      empty_desc: "選擇上方常見範例或輸入物品描述，即可查看分類結果、投放前準備步驟及官方資料來源。",
      empty_feat_1: "清晰分類結果",
      empty_feat_2: "附有官方來源",
      sample_result_notice: "內置常見範例 — 切換至「即時 AI 查詢」即可輸入並檢查你自己的物品。",
      clarification_label: "需要補充資料",
      facility_label: "適用回收設施",
      prep_heading: "投放前準備步驟",
      prep_heading_sample: "投放前準備步驟",
      evidence_heading: "資料來源依據",
      details_summary: "關於此結果",
      loading_heading: "正在核對資料…",
      ground_heading: "請以回收桶現場標示為準。",
      ground_desc: "請時刻遵守校園職員指示及回收設施現場的最新告示。",
      ground_btn: "使用說明",
      footer_motto: "減少猜測 · 養成良好習慣",
      footer_right: "RE KIOSK · 本部校園",
      how_eyebrow: "使用說明",
      how_title: "清晰分類，<br>有據可依。",
      how_intro: "可用任何語言描述一件日常物品（包含材質，以及是否已清空、洗淨或沾有污漬）。系統會自動修正拼寫並核對本部校園 re Kiosk 的回收規則。",
      how_s1_title: "確認適用範圍",
      how_s1_desc: "危險品、實驗室廢物及商業廢物不在本助手範圍內。現場職員指示及回收桶標示永遠優先。",
      how_s2_title: "核對官方來源",
      how_s2_desc: "即時 AI 模式會從本地規則庫檢索匹配記錄，並嚴格核對所有清潔及拆解條件。",
      how_s3_title: "明確標示不確定性",
      how_s3_desc: "結果分為「此回收點接收」、「此回收點不接收」、「無法確定」或「一般回收指引」（適用於 re Kiosk 規則以外的日常物品）。",
      how_note: "「常見範例」模式提供內置示例，方便快速預覽不同分類結果與來源格式。",
      how_close_btn: "開始查詢物品",
      sources_eyebrow: "資料來源庫",
      sources_title: "可靠建議，<br>源於清晰依據。",
      sources_intro: "以下列出規則庫所引用的官方公開參考資料、具體章節位置及核實日期。",
      sources_note: "香港環保署（EPD）的一般減廢及回收指引僅供背景參考，不代表港大特定設施接收該物品。請以現場標示為準。",
      about_eyebrow: "關於此助手",
      about_title: "校園回收習慣，<br>由每次一件物品開始。",
      about_p1: "港大回收助手（HKU Recycling Helper）為香港大學本部校園邵逸夫平台 re Kiosk 提供有據可依的回收分類指引。",
      about_h_privacy: "私隱保障",
      about_p_privacy: "請僅輸入物品描述，切勿包含個人資料。本應用程式不會儲存查詢紀錄或對話歷史。",
      about_h_scope: "覆蓋範圍",
      about_p_scope: "支援多語言輸入，每次查詢一件日常物品，並附有港大及環保署官方參考連結。請時刻遵守現場回收桶標示及校園職員指示。",
      about_close_btn: "返回回收助手",
      ready_when_you_are: "準備就緒",
      checking_your_item: "正在查詢物品",
      check_item_btn: "查詢物品",
      checking_btn: "正在查詢…",
      placeholder_sample: "請在上方選擇一個常見範例。",
      placeholder_live: "例如：一個乾淨的薄餅盒 / one clean pizza box / 乾淨的即食麵碗（已撕走蓋）",
      input_kind_sample: "範例物品描述",
      input_kind_live: "支援多語言輸入 · 每次一件物品",
      input_help_sample: "範例描述為預設內容。如需自行輸入物品，請切換至「即時 AI 查詢」。",
      input_help_live: "支援多語言及拼寫容錯，結果附有官方資料來源連結。",
      mode_desc_sample: "選擇常見物品範例，或切換至「即時 AI 查詢」檢查你的物品。",
      mode_desc_live: "根據已引用的規則庫檢查你的物品。",
      privacy_mode_sample: "常見範例模式不會發送外部請求。",
      privacy_mode_live: "即時模式會透過阿里雲百煉處理物品描述與匹配規則，本程式不會保存查詢日誌。",
      footnote_sample: "涵蓋本部校園邵逸夫平台 re Kiosk 回收點。",
      footnote_live: "適用於本部校園邵逸夫平台 re Kiosk 回收點。",
      loading_sample: "正在讀取所選範例…",
      loading_live: "正在檢索匹配規則並核實來源依據…",
      no_evidence_sample: "此範例無需引用特定設施規則。",
      no_evidence_live: "目前沒有已引用的回收點規則支持此物品的決定。",
      browse_refs: "瀏覽官方參考資料連結 ↗",
      ref_disclaimer: "參考連結提供一般背景資訊。",
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
    "sample-accepted": "一個已撕除膠紙、乾淨且乾燥的紙箱。",
    "sample-not-accepted": "一張有塑膠塗層的零食包裝紙。",
    "sample-uncertain": "這個容器應該放進哪個回收桶？",
    "sample-refusal": "我應該如何處理危險實驗室廢物？",
  };

  const TEXT_ZH = {
    "re Kiosk — Run Run Shaw Podium, Main Campus": "re Kiosk — 本部校園邵逸夫平台",
    "No facility-specific recommendation": "無特定回收點建議",
    "No facility recommendation": "無回收設施建議",
    "Remove tape and flatten the box.": "撕除膠紙並把紙箱壓平。",
    "Clean the lid.": "清潔杯蓋。",
    "Clean the cup.": "清潔紙杯。",
    "Remove food residue.": "清除所有食物殘渣。",
    "Clean the bottle.": "清潔樽身。",
    "Keep it out of paper, plastic and metal recycling.": "請勿放入廢紙、塑膠或金屬回收桶。",
    "Clean, dry cardboard is accepted in the paper recycling stream at re Kiosk.": "乾淨且乾燥的紙皮／紙箱可放入 re Kiosk 的廢紙回收箱。",
    "Composite or plastic-coated wrappers are excluded from the recycling streams at re Kiosk.": "複合材質或帶有塑膠塗層的包裝紙不獲 re Kiosk 回收。",
    "The material and cleanliness of the container are not specified, so a recycling decision cannot be made yet.": "由於未註明容器的材質及是否已清空洗淨，暫時無法作出回收決定。",
    "What is the container made from, and is it empty and clean?": "請問這個容器是什麼材質？是否已經清空並清洗乾淨？",
    "Hazardous and laboratory waste are outside the scope of campus dry recycling. Please follow laboratory safety procedures or contact campus staff.": "危險品及實驗室廢物不屬於校園一般回收範圍。請遵循實驗室安全程序或聯絡校園職員處理。",
    "Clean pizza boxes are accepted in the paper recycling stream at re Kiosk.": "乾淨的薄餅盒可放入 re Kiosk 的廢紙回收箱。",
    "Baking paper is excluded from paper recycling at re Kiosk.": "牛油紙／烘焙紙（Baking paper）不獲 re Kiosk 廢紙回收。",
    "Clean plastic coffee cup lids (separated from the cup) are accepted in the plastics stream at re Kiosk.": "已與杯身分離並清洗乾淨的塑膠咖啡杯蓋，可放入 re Kiosk 的塑膠回收箱。",
    "Paper coffee cup sleeves (separated from the cup) are accepted in the paper recycling stream at re Kiosk.": "已與杯身分離的紙製咖啡杯隔熱套，可放入 re Kiosk 的廢紙回收箱。",
    "Clean takeaway coffee cups (with lid and sleeve removed) are accepted in the beverage carton stream at re Kiosk.": "已移除杯蓋及隔熱套並清洗乾淨的外賣咖啡杯，可放入 re Kiosk 的飲品紙包盒回收箱。",
    "Clean fruit foam nets are accepted in the plastics recycling stream at re Kiosk.": "乾淨的生果網套（發泡膠網）可放入 re Kiosk 的塑膠回收箱。",
    "Cleaned styrofoam containers with all food residue removed are accepted in the plastics stream, even if lightly stained.": "已清除所有食物殘渣並清洗乾淨的發泡膠盒，即使有少許色素染色，仍可放入塑膠回收箱。",
    "Empty, clean plastic contact lens trays (with the foil lid removed) are accepted in the plastics stream at re Kiosk.": "已完全撕除鋁箔蓋、清空並洗淨的隱形眼鏡塑膠盒托，可放入 re Kiosk 的塑膠回收箱。",
    "Foil lids from contact lens packaging are excluded from recycling at re Kiosk.": "隱形眼鏡包裝的鋁箔蓋不獲 re Kiosk 回收。",
    "Instant noodle container lids are excluded from recycling at re Kiosk.": "杯麵／碗麵的封口蓋不獲 re Kiosk 回收。",
    "Empty, clean plastic instant noodle cups (with the lid removed) are accepted in the plastics stream at re Kiosk.": "已撕除封口蓋、清空並洗淨的塑膠杯麵碗，可放入 re Kiosk 的塑膠回收箱。",
    "Cling film with food labels attached is excluded from plastics recycling at re Kiosk.": "附有食品標籤貼紙的保鮮紙不獲 re Kiosk 塑膠回收。",
    "Empty, clean plastic personal care bottles (with the pump head removed) are accepted in the plastics stream at re Kiosk.": "已拆走泵頭、清空並洗淨的個人護理塑膠樽，可放入 re Kiosk 的塑膠回收箱。",
    "Empty, clean metal mooncake tins are accepted in the metals recycling stream at re Kiosk.": "清空並乾淨的金屬月餅罐可放入 re Kiosk 的金屬回收箱。",
    "An item description is needed before checking the recycling rules.": "請先輸入物品描述以核對回收規則。",
    "What is the item, what material is it made from, and is it empty and clean?": "請問這是什麼物品、由什麼材質製成，以及是否已清空並清洗乾淨？",
    "Hazardous, laboratory and commercial waste are outside the scope of this helper. Do not use this helper to decide disposal; ask campus staff for the appropriate procedure.": "危險品、實驗室廢物及商業垃圾不在本助手的服務範圍內。請勿使用本工具決定其處置方式，請向校園職員查詢正確程序。",
    "Follow campus staff instructions and bin signage. This helper cannot override them; ask campus staff if the guidance is unclear.": "請遵守校園職員指示及回收桶現場標示。本助手不能取代現場指示；如有疑問請向校園職員查詢。",
    "I can only check an ordinary item against the cited recycling rules. I cannot follow instructions to bypass those rules. Ask campus staff for disposal questions outside this scope.": "本助手僅能根據已引用的回收規則檢查日常物品，無法執行繞過規則的指令。超出範圍的棄置問題請向校園職員查詢。",
    "This helper only covers the re Kiosk on Main Campus and does not locate bins or confirm other facilities.": "本助手目前僅涵蓋本部校園的 re Kiosk，不提供尋找最近回收桶或確認其他設施的功能。",
    "Are you asking about the re Kiosk on Main Campus?": "請問你是否想查詢本部校園的 re Kiosk？",
    "This helper does not have real-time facility availability. Check current signage or contact campus staff.": "本助手無法提供設施的即時開放狀態，請查看現場告示或聯絡校園職員。",
    "Please remove names, student identifiers and contact details before using live mode.": "使用即時查詢前，請先移除姓名、學生編號及聯絡資料。",
    "Can you describe only the item, material and condition?": "請只描述物品名稱、材質及清潔狀態。",
    "The description refers to an unidentified or mixed-material composite item that cannot be verified from the facility rules.": "描述涉及未指明或複合材質物品，無法從現有回收點規則中核實。",
    "Please identify the specific item, its main material and whether any parts can be separated.": "請指明具體物品名稱、主要材質，以及各部分是否可以拆開。",
    "The description does not identify a specific item or material.": "描述中未指明具體物品或材質。",
    "The description does not identify a supported material clearly enough.": "描述中未能清晰識別受支援的回收材質。",
    "Is the item paper, metal, plastic, a glass bottle or a beverage carton, and is it empty and clean?": "請問物品屬於廢紙、金屬、塑膠、玻璃樽還是飲品紙包盒？是否已清空並洗淨？",
    "The description includes multiple materials or items. Mixed-material acceptance cannot be inferred.": "描述包含多種材質或多件物品，系統無法推斷混合材質是否獲接收。",
    "Please describe one item and its main material; mention any inseparable parts.": "請每次描述一件物品及其主要材質，並註明是否有無法拆開的部件。",
    "This helper checks one item at a time. The description appears to contain several items or item types.": "本助手每次只檢查一件物品，你的描述似乎包含多件物品。",
    "Please submit one item with its material and condition.": "請每次提交一件物品，並註明其材質及清潔狀態。",
    "The description contains uncertainty about the item or its condition.": "描述中對物品材質或狀態存在不確定字眼。",
    "Please confirm the material and whether the item is empty, clean and dry where relevant.": "請先確認物品材質，以及是否已清空、洗淨及保持乾爽。",
    "The item's condition is missing, so a recycling decision would be premature.": "尚未提供物品的清潔或清空狀態，暫時無法作出回收決定。",
    "Is it empty and clean? For paper, is it dry and free of food or grease?": "請問物品是否已清空並洗淨？（如屬紙類，是否乾爽且無食物殘渣或油漬？）",
    "The description does not confirm the conditions required by the matching rule.": "描述尚未確認匹配規則所需的清潔或處理條件。",
    "The matching live rules conflict for the stated conditions. Ask campus staff before deciding.": "匹配的規則在所述條件下存在衝突，請在投放前向校園職員查詢。",
    "The model could not establish a supported decision from the retrieved rules. Check the official facility guidance or ask campus staff.": "模型無法從檢索到的規則中確立受支持的決定，請查閱官方指引或向校園職員查詢。",
    "Please confirm the exact item type, material and condition.": "請確認物品的具體類型、材質及清潔狀態。",
    "No cited, facility-specific live rule supports a decision for this item. Missing evidence does not mean the item is not accepted. Check the official facility guidance or ask campus staff.": "目前沒有特定回收點規則支持此物品的決定。缺乏記錄不代表該物品不獲接收，請查閱官方指引或向校園職員查詢。",
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
      return `請確認物品的具體類型及所需條件：${rest}`;
    }
    return text;
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
      container.append(el("p", "secondary-text", state.lang === "zh-HK" ? "暫無可用範例，請檢查本地數據並重新載入。" : "No sample examples are available. Check the local sample data and reload."));
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
        ? `即時 AI 已就緒 · ${config.provider || "Alibaba Cloud Bailian"} · ${config.model || "configured model"}`
        : `即時 AI 暫不可用：${config.live_unavailable_reason || "請先完成服務配置。"}`;
    } else {
      $("live-availability").textContent = config.live_available
        ? `Live ready · ${config.provider || "Alibaba Cloud Bailian"} · ${config.model || "configured model"}`
        : `Live AI unavailable: ${config.live_unavailable_reason || "complete provider setup and approve the source collection first."}`;
    }
    const count = Number(config.live_rule_count ?? config.approved_rule_count ?? 0);
    if (state.lang === "zh-HK") {
      $("corpus-status").textContent = count > 0
        ? `${count} 條生效規則 · 核實於 ${formatDate(config.corpus_verified_on)}`
        : "0 條生效規則 · 規則庫尚未配置";
    } else {
      $("corpus-status").textContent = count > 0
        ? `${count} live rules · Checked ${formatDate(config.corpus_verified_on)}`
        : "0 live rules · Rule collection not configured";
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
      $("evidence-count").textContent = evidence.length ? `${evidence.length} 項來源` : "";
    } else {
      $("evidence-count").textContent = evidence.length ? `${evidence.length} ${sampleMode ? "EXAMPLE" : "SOURCE"}${evidence.length === 1 ? "" : "S"}` : "";
    }
    $("no-evidence").hidden = !!evidence.length;
    $("no-evidence").textContent = sampleMode ? t("no_evidence_sample") : t("no_evidence_live");
    for (const source of evidence) {
      const url = safeUrl(source.url);
      const card = el(url ? "a" : "div", "evidence-link");
      const titleText = trText(source.title) || (state.lang === "zh-HK" ? "官方參考來源" : "Supporting source");
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
        const prefix = state.lang === "zh-HK" ? "核實日期：" : sampleMode ? "Example created " : "Source verified ";
        body.append(el("small", null, `${prefix}${formatDate(source.verified_on)}`));
      }
      card.append(icon("book"), body);
      if (url) card.append(icon("external"));
      container.append(card);
    }
    if (sampleMode || !evidence.length) {
      const referenceButton = el("button", "text-button reference-button", t("browse_refs"));
      referenceButton.type = "button";
      referenceButton.addEventListener("click", () => { walkthrough(4); openSources(); });
      container.append(referenceButton);
      container.append(el("p", "reference-disclaimer", t("ref_disclaimer")));
    }
  }

  function renderMetadata(result, sampleMode) {
    const metadata = $("result-metadata");
    metadata.replaceChildren();
    const zh = state.lang === "zh-HK";
    const entries = zh
      ? [
          ["結果類型", sampleMode ? "內置常見範例" : result.status === "general_guidance" ? "一般 AI 回收指引（非特定設施）" : result.mode === "screening" ? "本地範圍與條件篩查" : "即時 AI 規則核對"],
          ["服務提供方", sampleMode ? "無 — 本地範例" : result.provider || "本地篩查"],
          ["模型", sampleMode ? "無 — 內置範例" : result.model || "未調用模型"],
          ["規則庫版本", result.corpus_version || state.config?.corpus_version || "未提供"],
          ["規則核實日期", formatDate(result.corpus_verified_on || state.config?.corpus_verified_on)],
          ["提示詞版本", result.prompt_version || state.config?.prompt_version || "未提供"],
          ["請求編號", result.request_id || "未提供"],
        ]
      : [
          ["Answer type", sampleMode ? "Built-in sample" : result.status === "general_guidance" ? "General AI guidance (not facility-specific)" : result.mode === "screening" ? "Local scope / evidence screening (no model call)" : "Live AI response"],
          ["Provider", sampleMode ? "None — no API call" : result.provider || "Local screening"],
          ["Model", sampleMode ? "None — built-in sample" : result.model || "No model call"],
          ["Corpus", result.corpus_version || state.config?.corpus_version || "Not available"],
          ["Corpus verified", formatDate(result.corpus_verified_on || state.config?.corpus_verified_on)],
          ["Prompt version", result.prompt_version || state.config?.prompt_version || "Not available"],
          ["Request", result.request_id || "Not available"],
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
      ? (zh ? "常見範例 · 快速預覽" : "SAMPLE · BUILT-IN EXAMPLE")
      : result.status === "general_guidance"
        ? (zh ? "即時查詢 · 一般指引" : "LIVE · GENERAL GUIDANCE")
        : result.mode === "screening"
          ? (zh ? "本地篩查 · 無需調用模型" : "LOCAL SCREENING · NO AI CALL")
          : (zh ? "即時查詢 · 官方來源核對" : "LIVE · SOURCE-BACKED CHECK");
    $("result-status").dataset.status = result.status;
    const statusIcon = result.status === "accepted" ? "check" : result.status === "not_accepted" ? "close" : result.status === "refused" ? "shield" : "question";
    $("status-icon-use").setAttribute("href", `#icon-${statusIcon}`);
    $("result-eyebrow").textContent = sampleMode
      ? (zh ? "範例結果" : "ILLUSTRATIVE RESULT")
      : result.status === "general_guidance"
        ? (zh ? "一般回收指引" : "GENERAL GUIDANCE")
        : (zh ? "分類決定" : "DECISION");
    $("decision-heading").textContent = labels[result.status];
    $("sample-result-notice").hidden = !sampleMode;
    const reasonText = trText(result.reason) || (zh ? "未提供說明。" : "No explanation was provided.");
    $("result-reason").textContent = reasonText;
    $("clarification-box").hidden = !result.clarification;
    $("clarification-text").textContent = trText(result.clarification) || "";
    const rawFacility = result.facility || (result.status === "general_guidance" ? "No facility-specific recommendation" : "No facility recommendation");
    $("result-facility").textContent = trText(rawFacility);
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
    const payload = { mode: state.mode, description: state.mode === "sample" ? state.selectedSample.description : $("description").value.trim() };
    if (state.mode === "sample") payload.sample_id = state.selectedSample.id;
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
      $("result-announcement").textContent = state.lang === "zh-HK" ? "查詢未能完成，未生成任何回收決定。" : "The check could not be completed. No recycling decision was made.";
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
      ? `${count} 條生效規則 · ${sources.length} 項官方參考來源 · 版本 ${state.config?.corpus_version || data.version || "pending"}`
      : `${count} live rules · ${sources.length} reference${sources.length === 1 ? "" : "s"} · Corpus ${state.config?.corpus_version || data.version || "pending"}`;
    const container = $("source-library");
    container.replaceChildren();
    if (!sources.length) {
      container.append(el("p", "secondary-text", zh ? "暫無參考來源記錄。" : "The reference register is not available yet."));
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
          ? (approved ? "Included in live corpus · 已納入生效規則庫之官方來源" : "僅供背景參考 · 未用於特定設施決定")
          : (approved ? "Included in live corpus · cited official reference" : "Reference only · not used for live answers")
      ));
      container.append(card);
    }
  }

  async function openSources() {
    openDialog("sources-dialog");
    if (state.corpus) { renderSources(state.corpus); return; }
    $("library-summary").textContent = state.lang === "zh-HK" ? "正在載入資料來源庫…" : "Loading the source register…";
    $("source-library").replaceChildren();
    try { state.corpus = await request("./api/corpus"); renderSources(state.corpus); }
    catch (error) { $("library-summary").textContent = state.lang === "zh-HK" ? "無法載入資料來源庫。" : "The source register could not be loaded."; $("source-library").append(el("p", "notice notice-error", error.message)); }
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
    else { errors.push(results[0].reason.message); $("live-availability").textContent = "Live availability could not be checked."; $("corpus-status").textContent = "Corpus status unavailable"; }
    if (results[1].status === "fulfilled") {
      const data = results[1].value;
      state.samples = Array.isArray(data) ? data : data.samples || [];
      renderSamples();
    } else { errors.push(results[1].reason.message); $("sample-chips").replaceChildren(el("span", "loading-label", "Samples could not be loaded.")); }
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
