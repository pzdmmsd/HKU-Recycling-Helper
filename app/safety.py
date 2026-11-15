"""Conservative, deterministic first-pass screening before any API request."""

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class ScreenResult:
    status: str
    reason: str
    clarification: str | None = None


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.casefold()).strip()


def has_phrase(text: str, phrase: str) -> bool:
    return bool(re.search(r"(?<!\w)" + re.escape(phrase.casefold()) + r"(?!\w)", text))


COMMON_ENGLISH = frozenset({
    "a", "an", "and", "are", "bin", "bottle", "box", "can", "carton", "clean", "coffee",
    "container", "cup", "do", "dry", "empty", "food", "for", "glass", "how", "i", "is",
    "it", "lid", "metal", "my", "no", "not", "of", "one", "paper", "pizza", "plastic",
    "residue", "sample", "should", "the", "this", "tin", "to", "tray", "use", "water", "what",
    "where", "which", "with", "wrap", "you",
})


def needs_language_normalization(text: str, vocabulary: set[str]) -> bool:
    """Return true for non-ASCII text, likely foreign text, or a close typo."""
    if any(ord(character) > 127 for character in text):
        return True
    words = re.findall(r"[a-z]+", normalize(text))
    if not words:
        return False
    known = {normalize(word) for word in vocabulary if len(normalize(word)) >= 3}
    unknown = [word for word in words if len(word) >= 3 and word not in COMMON_ENGLISH and word not in known]
    return bool(unknown)


MATERIAL_PATTERNS = {
    "paper": r"\b(paper|cardboard|newspaper|magazine|envelope|tissue|receipt|pizza box)\b",
    "metal": r"\b(metal|alumin[ui]um|steel|tin|soda can|drink can|beverage can)\b",
    "plastic": r"\b(plastic|pet bottle|hdpe|polystyrene|styrofoam|pvc|polypropylene)\b",
    "glass": r"\b(glass)\b",
    "carton": r"\b(beverage carton|drink carton|milk carton|juice carton|tetra pak|tetrapak)\b",
}


def materials_in(text: str) -> set[str]:
    return {name for name, pattern in MATERIAL_PATTERNS.items() if re.search(pattern, text)}


def conditions_in(text: str) -> set[str]:
    conditions = set()
    patterns = {
        "clean": r"\b(clean|cleaned|washed|rinsed)\b",
        "empty": r"\b(empty|emptied|no liquid|no contents)\b",
        "dry": r"\b(dry|dried)\b",
        "rinsed": r"\b(rinsed|washed)\b",
        "flattened": r"\b(flattened|flat|crushed)\b",
        "cap_removed": r"\b(cap removed|removed (?:the )?cap|without (?:a |the )?cap|cap off)\b",
        "lid_removed": r"\b(lid removed|removed (?:the )?lid|without (?:a |the )?lid|lid off)\b",
        "dirty": r"\b(dirty|soiled|greasy|food.stained|food.contaminated|oily)\b",
        "food_contaminated": r"\b(food.stained|food.contaminated|food residue|greasy|oily|food left)\b",
        "drink_carton": r"\b(beverage carton|drink carton|milk carton|juice carton|tetra pak|tetrapak)\b",
        "glass_bottle": r"\b(glass (?:drink |beverage )?bottle)\b",
    }
    for code, pattern in patterns.items():
        if re.search(pattern, text):
            conditions.add(code)
    # Negation covers every alias, including 'not washed', and an intended action
    # is not a statement that the item already satisfies that condition.
    aliases = {
        "clean": r"clean|cleaned|washed|rinsed",
        "empty": r"empty|emptied",
        "dry": r"dry|dried",
        "rinsed": r"rinsed|washed",
        "flattened": r"flattened|flat|crushed",
        "dirty": r"dirty|soiled|greasy|food.stained|food.contaminated|oily",
        "food_contaminated": r"food.stained|food.contaminated|food residue|greasy|oily|food left",
        "cap_removed": r"cap removed|removed (?:the )?cap|cap off",
        "lid_removed": r"lid removed|removed (?:the )?lid|lid off",
    }
    for code, words in aliases.items():
        if re.search(r"\b(?:not|isn't|wasn't|hasn't|never|no|without|free of)\s+(?:\w+\s+){0,3}(?:" + words + r")\b", text):
            conditions.discard(code)
    if re.search(r"\b(unwashed|unrinsed|unclean)\b", text):
        conditions.discard("clean")
        conditions.discard("rinsed")
    actions = {"clean": r"clean|wash|rinse", "rinsed": r"wash|rinse", "empty": r"empty", "dry": r"dry", "flattened": r"flatten|crush"}
    for code, verbs in actions.items():
        if re.search(r"\b(?:will|would|should|could|can|must|to|please|how do|how can|how should)\b(?:\s+\w+){0,4}\s+(?:" + verbs + r")\b", text):
            conditions.discard(code)
    if "dirty" in conditions or "food_contaminated" in conditions:
        conditions.discard("clean")
    if re.search(r"\b(wet|damp|soaked)\b", text):
        conditions.discard("dry")
    if re.search(r"\b(liquid left|still contains|half.full|full of)\b", text):
        conditions.discard("empty")
    return conditions


def screen(description: str, *, known_item: bool = False, require_condition: bool = True) -> ScreenResult | None:
    text = normalize(description)
    if not text:
        return ScreenResult("cannot_determine", "An item description is needed before checking the pilot rules.", "What is the item, what material is it made from, and is it empty and clean?")
    if re.search(r"\b(lab(?:oratory)?|hazardous|chemical|biohazard|clinical|medical waste|sharps?|syringes?|needles?|radioactive|mercury|solvents?|pesticides?|asbestos|batter(?:y|ies)|lithium|aerosol|gas cylinder|paint|bleach|commercial waste|industrial waste|contractor)\b|(?:危险|危險|有害|实验室|實驗室|化学|化學|医疗|醫療|电池|電池|锂|鋰|针头|針頭|注射器|农药|農藥|石棉|放射性|水银|水銀|溶剂|溶劑|商业垃圾|商業垃圾|工业垃圾|工業垃圾)", text):
        return ScreenResult("refused", "Hazardous, laboratory and commercial waste are outside this student pilot. Do not use this helper to decide disposal; ask campus staff for the appropriate procedure.")
    if re.search(r"\b(staff|signage|bin sign|sign says|sign on|security guard|staff instruction)\b|(?:工作人员|工作人員|职员|職員|标识|標識|告示|保安)", text):
        return ScreenResult("refused", "Follow campus staff instructions and bin signage. This helper cannot override them; ask campus staff if the guidance is unclear.")
    if re.search(r"\b(ignore|disregard|override|forget)\b.{0,70}\b(instruction|rule|prompt|system|previous|staff|sign|safety)|(?:忽略|无视|無視|绕过|繞過|忘记|忘記).{0,30}(?:指令|规则|規則|提示|系统|系統|工作人员|工作人員|标识|標識|安全)", text) or re.search(r"\b(system prompt|api key|developer message|pretend|jailbreak)\b|<\|(?:system|assistant)|\[INST\]", text):
        return ScreenResult("refused", "I can only check an ordinary item against the cited recycling rules. I cannot follow instructions to bypass those rules. Ask campus staff for disposal questions outside this pilot.")
    if re.search(r"\b(hall|residence|residential|kennedy town|kowloon|sassoon|cyberport|centennial|outside campus|off.campus|nearest|closest|other facilit(?:y|ies)|elsewhere|public bin|street bin|library bin|restaurant|office bin)\b", text) or re.search(r"\b(?:at|near|outside|inside)\s+(?:the )?(?!re kiosk\b|main campus\b|hku\b)[a-z]", text):
        return ScreenResult("cannot_determine", "This pilot only covers the re Kiosk on Main Campus and does not locate bins or confirm other facilities.", "Are you asking about the re Kiosk on Main Campus?")
    if re.search(r"\b(open now|opening hours|today|right now|currently open|available now)\b", text):
        return ScreenResult("cannot_determine", "This helper does not have real-time facility availability. Check current signage or contact campus staff.")
    if re.search(r"\b(my name|student id|student number|\buid\b)\b|(?:我的名字|我叫|姓名|学生证|學生證|学号|學號|电话|電話|手机|手機|邮箱|郵箱|地址|住址|身份证|身份證)|[\w.+-]+@[\w.-]+\.[a-z]{2,}", text):
        return ScreenResult("cannot_determine", "Please remove names, student identifiers and contact details before using live mode.", "Can you describe only the item, material and condition?")
    materials = materials_in(text)
    if not materials and not known_item:
        return ScreenResult("cannot_determine", "The description does not identify a supported material clearly enough.", "Is the item paper, metal, plastic, a glass bottle or a beverage carton, and is it empty and clean?")
    if len(materials) > 1:
        return ScreenResult("cannot_determine", "The description includes multiple materials or items. Mixed-material acceptance cannot be inferred.", "Please describe one item and its main material; mention any inseparable parts.")
    # A bare sentence-initial "Can I/it..." is a modal verb, not a metal can.
    item_words = r"\b(?:bottles?|cans|(?:(?:metal|tin|alumin[ui]um|drink|beverage|soda)\s+can)|boxes?|trays?|cartons?|cups?|wrappers?|containers?|jars?|plates?|bowls?|tissues?|receipts?|newspapers?|magazines?|bags?)\b"
    split_items = re.split(r"\b(?:and|plus|along with)\b|[;+]", text)
    multiple_objects = sum(bool(re.search(item_words, part)) for part in split_items) > 1
    if multiple_objects or re.search(r"\b(?:two|three|four|five|several|multiple|[2-9]|\d{2,})\s+(?:(?:clean|empty|dry|plastic|glass|metal|paper)\s+){0,4}" + item_words, text):
        return ScreenResult("cannot_determine", "This pilot checks one item at a time. The description appears to contain several items or item types.", "Please submit one item with its material and condition.")
    # Condition uncertainty must be resolved even if unrelated positive words appear.
    if re.search(r"\b(not sure|unsure|don't know|do not know|might be|maybe|perhaps)\b|(?:不确定|不確定|不知道|也许|也許)", text):
        return ScreenResult("cannot_determine", "The description contains uncertainty about the item or its condition.", "Please confirm the material and whether the item is empty, clean and dry where relevant.")
    conditions = conditions_in(text)
    if require_condition and not (conditions & {"clean", "empty", "dry", "dirty", "food_contaminated"}):
        return ScreenResult("cannot_determine", "The item's condition is missing, so a recycling decision would be premature.", "Is it empty and clean? For paper, is it dry and free of food or grease?")
    return None
