from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path("/Users/ryoma.t/Documents/Codex/2026-05-23/9-9-v0-1-asc-mc")
OLD = Path("/tmp/yaoyorozu181.old.json")

FORBIDDEN = {
    "弁才天", "大黒天", "福禄寿", "蔵王権現", "菅原道真", "太安万侶", "武内宿禰",
    "日本武尊", "言霊大神", "薬祖神", "音成神", "夜之食国神",
}

CATEGORIES = [
    ("CENTRAL_CORE", "ROOT", [("天之御中主神", "あめのみなかぬしのかみ")]),
    ("CREATION", "GENESIS", [
        ("高御産巣日神", "たかみむすひのかみ"), ("神産巣日神", "かむむすひのかみ"),
        ("宇摩志阿斯訶備比古遅神", "うましあしかびひこぢのかみ"), ("天之常立神", "あめのとこたちのかみ"),
        ("国之常立神", "くにのとこたちのかみ"), ("豊雲野神", "とよくもののかみ"),
        ("宇比地邇神", "うひぢにのかみ"), ("須比智邇神", "すひちにのかみ"),
        ("角杙神", "つのぐひのかみ"), ("活杙神", "いくぐひのかみ"),
    ]),
    ("SOLAR", "ILLUMINATION", [
        ("天照大御神", "あまてらすおおみかみ"), ("天之忍穂耳命", "あめのおしほみみのみこと"),
        ("天津日子根命", "あまつひこねのみこと"), ("活津日子根命", "いくつひこねのみこと"),
        ("熊野久須毘命", "くまのくすびのみこと"), ("天津日高日子穂々手見命", "あまつひたかひこほほでみのみこと"),
        ("天火明命", "あめのほあかりのみこと"), ("邇芸速日命", "にぎはやひのみこと"),
        ("天若日子", "あめわかひこ"), ("天之菩卑能命", "あめのほひのみこと"),
    ]),
    ("LUNAR", "REFLECTION", [
        ("月読命", "つくよみのみこと"), ("思金神", "おもいかねのかみ"),
        ("天佐具売", "あめのさぐめ"), ("万幡豊秋津師比売命", "よろずはたとよあきつしひめのみこと"),
        ("玉依毘売", "たまよりびめ"), ("市寸島比売命", "いちきしまひめのみこと"),
        ("多紀理毘売命", "たきりびめのみこと"), ("多岐都比売命", "たきつひめのみこと"),
        ("奥津島比売命", "おきつしまひめのみこと"), ("狭依毘売命", "さよりびめのみこと"),
    ]),
    ("OCEAN", "DEPTH", [
        ("大綿津見神", "おおわたつみのかみ"), ("底津綿津見神", "そこつわたつみのかみ"),
        ("中津綿津見神", "なかつわたつみのかみ"), ("上津綿津見神", "うえつわたつみのかみ"),
        ("底箇之男命", "そこつつのおのみこと"), ("中箇之男命", "なかつつのおのみこと"),
        ("上箇之男命", "うわつつのおのみこと"), ("墨江之三前大神", "すみのえのみまえのおおかみ"),
        ("塩椎神", "しおつちのかみ"), ("海佐知毘古", "うみさちびこ"),
    ]),
    ("WIND", "MOVEMENT", [
        ("志那都比古神", "しなつひこのかみ"), ("風木津別之忍男神", "かざもくつわけのおしおのかみ"),
        ("天鳥船神", "あめのとりふねのかみ"), ("鳥之石楠船神", "とりのいわくすふねのかみ"),
        ("猿田毘古神", "さるたびこのかみ"), ("道俣神", "ちまたのかみ"),
        ("道反之大神", "ちがえしのおおかみ"), ("久延毘古", "くえびこ"),
        ("天之吹男神", "あめのふきおのかみ"), ("科野之坂神", "しなののさかのかみ"),
    ]),
    ("FIRE", "IGNITION", [
        ("火之迦具土神", "ひのかぐつちのかみ"), ("火之炫毘古神", "ひのかかびこのかみ"),
        ("火之夜芸速男神", "ひのやぎはやおのかみ"), ("火須勢理命", "ほすせりのみこと"),
        ("火照命", "ほでりのみこと"), ("火遠理命", "ほおりのみこと"),
        ("奥津日子神", "おくつひこのかみ"), ("奥津比売命", "おくつひめのみこと"),
        ("樋速日神", "ひはやひのかみ"), ("火雷", "ほのいかづち"),
    ]),
    ("THUNDER", "AWAKENING", [
        ("建御雷之男神", "たけみかづちのおのかみ"), ("大雷", "おおいかづち"),
        ("黒雷", "くろいかづち"), ("析雷", "さくいかづち"),
        ("若雷", "わかいかづち"), ("土雷", "つちいかづち"),
        ("鳴雷", "なるいかづち"), ("伏雷", "ふすいかづち"),
        ("八雷神", "やくさのいかづちのかみ"), ("甕速日神", "みかはやひのかみ"),
    ]),
    ("WARRIOR", "COURAGE", [
        ("建速須佐之男命", "たけはやすさのおのみこと"), ("須佐之男命", "すさのおのみこと"),
        ("建御名方神", "たけみなかたのかみ"), ("天之尾羽張", "あめのおはばり"),
        ("伊都之尾羽張", "いつのおはばり"), ("建布都神", "たけふつのかみ"),
        ("豊布都神", "とよふつのかみ"), ("布都御魂", "ふつのみたま"),
        ("佐士布都神", "さじふつのかみ"), ("天津久米命", "あまつくめのみこと"),
    ]),
    ("EARTH_AGRICULTURE", "GROUNDING", [
        ("宇迦之御魂神", "うかのみたまのかみ"), ("豊宇気毘売神", "とようけびめのかみ"),
        ("大宜都比売神", "おおげつひめのかみ"), ("大年神", "おおとしのかみ"),
        ("御年神", "みとしのかみ"), ("若年神", "わかとしのかみ"),
        ("久々能智神", "くくのちのかみ"), ("鹿屋野比売神", "かやのひめのかみ"),
        ("波邇夜須毘古神", "はにやすびこのかみ"), ("波邇夜須毘売神", "はにやすびめのかみ"),
    ]),
    ("MARKET_PROSPERITY", "FLOW", [
        ("大国主神", "おおくにぬしのかみ"), ("大穴牟遅神", "おおあなむじのかみ"),
        ("八千矛神", "やちほこのかみ"), ("葦原色許男神", "あしはらしこおのかみ"),
        ("事代主神", "ことしろぬしのかみ"), ("少名毘古那神", "すくなびこなのかみ"),
        ("金山毘古神", "かなやまびこのかみ"), ("金山毘売神", "かなやまびめのかみ"),
        ("御食津大神", "みけつおおかみ"), ("市寸島比売命", "いちきしまひめのみこと"),
    ]),
    ("HEALING", "RESTORATION", [
        ("少名毘古那神", "すくなびこなのかみ"), ("大穴牟遅神", "おおあなむじのかみ"),
        ("神直毘神", "かむなおびのかみ"), ("大直毘神", "おおなおびのかみ"),
        ("伊豆能売", "いずのめ"), ("速秋津日子神", "はやあきつひこのかみ"),
        ("速秋津比売神", "はやあきつひめのかみ"), ("弥都波能売神", "みつはのめのかみ"),
        ("泣沢女神", "なきさわめのかみ"), ("和久産巣日神", "わくむすひのかみ"),
    ]),
    ("ART", "EXPRESSION", [
        ("天宇受売命", "あめのうずめのみこと"), ("思金神", "おもいかねのかみ"),
        ("天児屋命", "あめのこやねのみこと"), ("布刀玉命", "ふとたまのみこと"),
        ("下光比売命", "したでるひめのみこと"), ("木花之佐久夜毘売", "このはなのさくやびめ"),
        ("伊斯許理度売命", "いしこりどめのみこと"), ("玉祖命", "たまのおやのみこと"),
        ("天服織女", "あめのはたおりめ"), ("天津麻羅", "あまつまら"),
    ]),
    ("LOVE_RELATIONSHIP", "CONNECTION", [
        ("木花之佐久夜毘売", "このはなのさくやびめ"), ("石長比売", "いわながひめ"),
        ("豊玉毘売", "とよたまびめ"), ("玉依毘売", "たまよりびめ"),
        ("須勢理毘売", "すせりびめ"), ("沼河比売", "ぬなかわひめ"),
        ("櫛名田比売", "くしなだひめ"), ("八上比売", "やかみひめ"),
        ("活玉前玉比売神", "いくたまさきたまひめのかみ"), ("神大市比売", "かむおおいちひめ"),
    ]),
    ("UNDERWORLD", "SHADOW", [
        ("伊耶那美神", "いざなみのかみ"), ("黄泉津大神", "よもつおおかみ"),
        ("黄泉神", "よもつかみ"), ("予母都志許売", "よもつしこめ"),
        ("道敷大神", "ちしきのおおかみ"), ("大禍津日神", "おおまがつひのかみ"),
        ("八十禍津日神", "やそまがつひのかみ"), ("塞坐黄泉戸大神", "ふさがりますよもつとのおおかみ"),
        ("道之長乳歯神", "みちのながちはのかみ"), ("和豆良比能宇斯能神", "わずらいのうしのかみ"),
    ]),
    ("MOUNTAIN", "STABILITY", [
        ("大山津見神", "おおやまつみのかみ"), ("大山咋神", "おおやまくいのかみ"),
        ("山末之大主神", "やますえのおおぬしのかみ"), ("若山咋神", "わかやまくいのかみ"),
        ("奥山津見神", "おくやまつみのかみ"), ("戸山津見神", "とやまつみのかみ"),
        ("志芸山津見神", "しぎやまつみのかみ"), ("羽山津見神", "はやまつみのかみ"),
        ("正鹿山津見神", "まさかやまつみのかみ"), ("闇山津見神", "くらやまつみのかみ"),
    ]),
    ("WATER", "PURIFICATION", [
        ("弥都波能売神", "みつはのめのかみ"), ("速秋津日子神", "はやあきつひこのかみ"),
        ("速秋津比売神", "はやあきつひめのかみ"), ("天之水分神", "あめのみくまりのかみ"),
        ("国之水分神", "くにのみくまりのかみ"), ("沫那芸神", "あわなぎのかみ"),
        ("沫那美神", "あわなみのかみ"), ("頬那芸神", "つらなぎのかみ"),
        ("頬那美神", "つらなみのかみ"), ("闇御津羽神", "くらみつはのかみ"),
    ]),
    ("KOTODAMA_WISDOM", "INTELLIGENCE", [
        ("思金神", "おもいかねのかみ"), ("天児屋命", "あめのこやねのみこと"),
        ("布刀玉命", "ふとたまのみこと"), ("葛城之一言主之大神", "かずらきのひとことぬしのおおかみ"),
        ("事代主神", "ことしろぬしのかみ"), ("天佐具売", "あめのさぐめ"),
        ("天比登都柱", "あまひとつはしら"), ("天一根", "あめひとつね"),
        ("櫛石窓神", "くしいわまとのかみ"), ("豊石窓神", "とよいわまとのかみ"),
    ]),
    ("TIME_BOUNDARY", "THRESHOLD", [
        ("猿田毘古神", "さるたびこのかみ"), ("道俣神", "ちまたのかみ"),
        ("道反之大神", "ちがえしのおおかみ"), ("塞坐黄泉戸大神", "ふさがりますよもつとのおおかみ"),
        ("時量師神", "ときはからしのかみ"), ("大年神", "おおとしのかみ"),
        ("御年神", "みとしのかみ"), ("若年神", "わかとしのかみ"),
        ("天之御影神", "あめのみかげのかみ"), ("衝立船戸神", "つきたつふなとのかみ"),
    ]),
]

PROFILE = {
    "CENTRAL_CORE": ("void center origin", ["Soul"], "意識の中心軸", "The Origin", "統合", "虚無", "静寂", "頭頂・中心軸", 963, "The World", "太極", (70, 72, 58, 100)),
    "CREATION": ("void earth seed", ["Soul", "Brain"], "創造原理の起動", "The Creator", "生成", "未分化", "畏れ", "丹田・脊柱", 741, "The Magician", "乾為天", (78, 64, 66, 88)),
    "SOLAR": ("fire light will", ["Soul", "Heart"], "自己照明と使命", "The Radiant Sovereign", "照らす力", "過剰な自我", "誇り", "心臓・眼", 528, "The Sun", "離為火", (74, 86, 62, 84)),
    "LUNAR": ("moon water memory", ["Heart", "Soul"], "内省と感受性", "The Reflective Mirror", "受容", "迷い", "静かな不安", "胃・胸", 432, "The Moon", "坎為水", (82, 86, 50, 76)),
    "OCEAN": ("water depth flow", ["Heart", "Body"], "感情の深海", "The Deep Current", "包容", "飲み込まれる感覚", "郷愁", "腎臓・骨盤", 417, "The Star", "沢水困", (58, 88, 76, 72)),
    "WIND": ("air road signal", ["Brain", "Body"], "移動と伝達", "The Messenger", "流動性", "散漫", "軽やかさ", "肺・肩", 639, "The Fool", "巽為風", (82, 62, 78, 62)),
    "FIRE": ("fire heat purge", ["Body", "Soul"], "燃焼と変容", "The Flame", "浄化", "破壊衝動", "怒り", "胃・血流", 396, "Strength", "火雷噬嗑", (60, 66, 90, 70)),
    "THUNDER": ("thunder shock awakening", ["Brain", "Body"], "覚醒の電撃", "The Breakthrough", "突破", "焦燥", "緊張", "神経系", 852, "The Tower", "震為雷", (86, 52, 84, 72)),
    "WARRIOR": ("metal storm boundary", ["Body", "Brain"], "決断と防衛", "The Warrior", "勇気", "闘争過多", "覚悟", "筋肉・顎", 285, "The Chariot", "地水師", (72, 50, 92, 62)),
    "EARTH_AGRICULTURE": ("earth grain growth", ["Body", "Heart"], "育成と生活基盤", "The Cultivator", "育てる力", "停滞", "安心", "腹・脚", 174, "The Empress", "坤為地", (56, 74, 88, 58)),
    "MARKET_PROSPERITY": ("earth gold exchange", ["Brain", "Body"], "交換と繁栄", "The Exchange", "循環", "執着", "期待", "手・胃", 528, "Wheel of Fortune", "風雷益", (82, 60, 78, 56)),
    "HEALING": ("water green repair", ["Heart", "Body"], "修復と祓い", "The Healer", "回復", "背負いすぎ", "慈悲", "胸・免疫", 528, "Temperance", "水風井", (62, 90, 78, 76)),
    "ART": ("sound light gesture", ["Heart", "Brain"], "表現と創造性", "The Performer", "表現", "承認依存", "歓び", "喉・手", 639, "The Star", "火風鼎", (84, 88, 62, 72)),
    "LOVE_RELATIONSHIP": ("water flower bond", ["Heart"], "縁と親密さ", "The Beloved", "結ぶ力", "依存", "愛着", "胸・骨盤", 528, "The Lovers", "沢山咸", (58, 94, 58, 74)),
    "UNDERWORLD": ("shadow soil gate", ["Soul", "Heart"], "影と再生", "The Descent", "変容", "停滞した痛み", "喪失", "骨・下腹", 396, "Death", "地火明夷", (74, 76, 66, 86)),
    "MOUNTAIN": ("mountain stone root", ["Body", "Soul"], "安定と垂直軸", "The Mountain", "不動心", "頑固", "静かな強さ", "骨格・背中", 174, "The Hermit", "艮為山", (58, 62, 88, 78)),
    "WATER": ("water purification river", ["Heart", "Body"], "浄化と循環", "The Purifier", "流す力", "境界の薄さ", "潤い", "腎臓・体液", 417, "The High Priestess", "水雷屯", (62, 86, 74, 72)),
    "KOTODAMA_WISDOM": ("word logic ritual", ["Brain", "Soul"], "言葉と知恵", "The Logos", "命名", "理屈過多", "明晰さ", "喉・前頭葉", 741, "The Hierophant", "風天小畜", (94, 64, 46, 82)),
    "TIME_BOUNDARY": ("time gate road", ["Brain", "Soul"], "境界と転機", "The Gatekeeper", "切替", "先延ばし", "緊張と期待", "足・皮膚", 852, "Judgement", "山水蒙", (76, 62, 74, 80)),
}

CATEGORY_LABEL = {
    "CENTRAL_CORE": "中央神", "CREATION": "創造神系", "SOLAR": "太陽神系", "LUNAR": "月神系",
    "OCEAN": "海神系", "WIND": "風神系", "FIRE": "火神系", "THUNDER": "雷神系",
    "WARRIOR": "武神系", "EARTH_AGRICULTURE": "農耕神系", "MARKET_PROSPERITY": "商業神系",
    "HEALING": "治癒神系", "ART": "芸術神系", "LOVE_RELATIONSHIP": "愛・縁結び系",
    "UNDERWORLD": "冥界神系", "MOUNTAIN": "山神系", "WATER": "水神系",
    "KOTODAMA_WISDOM": "言霊神系", "TIME_BOUNDARY": "時間・境界神系",
}

KANAMAP = {
    "あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
    "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
    "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
    "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo","や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri",
    "る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"o","ん":"n","が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
    "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
    "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo","ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
    "ゃ":"ya","ゅ":"yu","ょ":"yo","っ":"", "ー":"-"
}

def romanize(kana: str) -> str:
    s = kana.replace("おお", "oo").replace("づ", "ず")
    out = []
    i = 0
    while i < len(s):
        if i + 1 < len(s) and s[i + 1] in "ゃゅょ":
            base = KANAMAP.get(s[i], "")
            y = KANAMAP.get(s[i + 1], "")
            if base.endswith("i"):
                out.append(base[:-1] + y)
            else:
                out.append(base + y)
            i += 2
            continue
        out.append(KANAMAP.get(s[i], s[i]))
        i += 1
    text = "".join(out)
    text = re.sub(r"([aeiou])\\1", r"\\1", text)
    parts = text.split("の")
    return text[:1].upper() + text[1:]

def build():
    deities = []
    name_to_ids: dict[str, list[str]] = {}
    counter = 1
    for category, system, items in CATEGORIES:
        elements, layers, role, archetype, gift, shadow, emotion, body_area, freq, tarot, iching, scores = PROFILE[category]
        for index, (name, kana) in enumerate(items):
            if name in FORBIDDEN:
                raise ValueError(f"Forbidden deity selected: {name}")
            brain, heart, body, soul = scores
            shift = (index - 4) * 2
            item = {
                "id": f"YAO-{counter:03d}",
                "name_ja": name,
                "name_kana": kana,
                "name_romaji": romanize(kana),
                "category": category,
                "category_label": CATEGORY_LABEL[category],
                "system": system,
                "element": elements.split(),
                "human_os_layer": layers,
                "brain": max(0, min(100, brain + shift)),
                "heart": max(0, min(100, heart - shift // 2)),
                "body": max(0, min(100, body + (index % 3 - 1) * 4)),
                "soul": max(0, min(100, soul + (4 - index) * 2)),
                "role": role,
                "archetype": archetype,
                "gift": gift,
                "shadow": shadow,
                "emotion": emotion,
                "body_area": body_area,
                "frequency": freq + (index % 5) * 3,
                "tarot_correspondence": tarot,
                "iching_keyword": iching,
                "description_short": f"{name}は、{CATEGORY_LABEL[category]}に配置した古典文献確認済みの神名。",
                "description_long": f"{name}は古典文献で確認できる神名として採用した。YAOYOROZU-181 OSでは、神話上の記述を信仰対象としてではなく、人間の心理・行動・感情・身体・創造性を読むための象徴として扱う。",
                "activation_question": f"今の自分は、どの場面で「{gift}」を必要としているか？",
                "practice": f"3分間だけ呼吸を整え、今日の行動に{gift}をひとつ加える。最後に「何を手放すか」を一文で書く。",
                "keywords": [gift, role, emotion, *elements.split()[:2]],
                "related_deities": [],
                "source_status": "classical",
                "source_text": ["古事記"],
                "historical_note": "國學院大學「神名データベース」に掲載される『古事記』登場神名として確認。系譜・性格付けには諸説があるため、本アプリでは確認できる神名採用にとどめる。",
                "symbolic_interpretation": f"ZEN GENESIS OS上では「{role}」を司り、ギフトとして「{gift}」、影として「{shadow}」を象徴する。",
            }
            deities.append(item)
            name_to_ids.setdefault(name, []).append(item["id"])
            counter += 1
    for item in deities:
        related = [i for i in name_to_ids[item["name_ja"]] if i != item["id"]]
        item["related_deities"] = related[:6]
    return deities

def removed(new_deities):
    new_names = {d["name_ja"] for d in new_deities}
    old = json.loads(OLD.read_text(encoding="utf-8")) if OLD.exists() else []
    result = []
    seen = set()
    for item in old:
        reasons = []
        name = item["name_ja"]
        if name in FORBIDDEN:
            reasons.append("ユーザー指定の除外対象")
        if str(item.get("name_romaji", "")).startswith("Symbolic-"):
            reasons.append("仮ローマ字表記を廃止")
        if name not in new_names:
            reasons.append("181柱の古典文献確認済み再選定から除外")
        if reasons and name not in seen:
            result.append({
                "name_ja": name,
                "old_id": item["id"],
                "old_category": item.get("category"),
                "reasons": reasons,
            })
            seen.add(name)
    return result

deities = build()
if len(deities) != 181:
    raise SystemExit(f"Expected 181, got {len(deities)}")
if any(d["name_ja"] in FORBIDDEN for d in deities):
    raise SystemExit("Forbidden name present")
if any(d["name_romaji"].startswith("Symbolic-") for d in deities):
    raise SystemExit("Symbolic romaji present")

(ROOT / "data" / "yaoyorozu181.json").write_text(json.dumps(deities, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "data" / "removed_deities.json").write_text(json.dumps(removed(deities), ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote classical data", len(deities))
