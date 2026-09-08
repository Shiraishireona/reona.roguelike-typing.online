
let config = { mode: 'en', difficulty: 'normal', selectedSkill: 'heal' };
// ==========================================
// ✨ 新機能：起動時（リロード・再起動時）のデータ読み込み処理
// ==========================================
function loadGameData() {
    // 1. ローカルストレージからデータを取得（無ければ0）
    const highScore = parseInt(localStorage.getItem('typing_high_score')) || 0;
    const totalExp = parseInt(localStorage.getItem('typing_total_exp')) || 0;

    // 2. 総経験値から現在のランクを計算（リザルト画面と同じ計算式）
    const EXP_PER_RANK = 200000 * 1.5 * 1.5 ;
    const currentRank = Math.floor(totalExp / EXP_PER_RANK) + 1;
    const nextRankExp = (currentRank * EXP_PER_RANK) - totalExp;

    // 3. タイトル画面やヘッダーの表示要素に反映
    // ※ HTML側に以下のIDを持った要素を作っておいてください
    const topHighScoreEl = document.getElementById('top-high-score');
    if (topHighScoreEl) topHighScoreEl.innerText = `${highScore.toLocaleString()} PTS`;

    const topRankEl = document.getElementById('top-rank');
    if (topRankEl) topRankEl.innerText = `RANK ${currentRank}`;
    const lobbyRankEl = document.getElementById('lobby-rank');
    if (lobbyRankEl) lobbyRankEl.innerText = `RANK ${currentRank}`;

    const totalExpEl = document.getElementById('top-total-exp');
    if (totalExpEl) totalExpEl.innerText = `総経験値: ${totalExp.toLocaleString()} EXP`;

    const topNextExpEl = document.getElementById('top-next-exp');
    if (topNextExpEl) topNextExpEl.innerText = `次のランクまであと: ${nextRankExp.toLocaleString()} EXP`;

    if (typeof updateBasePointSummary === 'function') updateBasePointSummary();
}

// ページ（HTML）が完全に読み込まれたら、自動的に上記の関数を実行する
window.addEventListener('DOMContentLoaded', loadGameData);

const ROMAN_MAP = {
    'あ':['a'], 'い':['i','yi'], 'う':['u','wu'], 'え':['e'], 'お':['o'],
    'か':['ka'], 'き':['ki'], 'く':['ku'], 'け':['ke'], 'こ':['ko'],
    'さ':['sa'], 'し':['si','shi'], 'す':['su'], 'せ':['se'], 'そ':['so'],
    'た':['ta'], 'ち':['ti','chi'], 'つ':['tu','tsu'], 'て':['te'], 'と':['to'],
    'な':['na'], 'に':['ni'], 'ぬ':['nu'], 'ね':['ne'], 'の':['no'],
    'は':['ha'], 'ひ':['hi'], 'ふ':['fu','hu'], 'へ':['he'], 'ほ':['ho'],
    'ま':['ma'], 'み':['mi'], 'む':['mu'], 'め':['me'], 'も':['mo'],
    'や':['ya'], 'ゆ':['yu'], 'よ':['yo'],
    'ら':['ra'], 'り':['ri'], 'る':['ru'], 'れ':['re'], 'ろ':['ro'],
    'わ':['wa'], 'を':['wo'], 'ん':['nn'],
    'が':['ga'], 'ぎ':['gi'], 'ぐ':['gu'], 'げ':['ge'], 'ご':['go'],
    'ざ':['za'], 'じ':['zi','ji'], 'ず':['zu'], 'ぜ':['ze'], 'ぞ':['zo'],
    'だ':['da'], 'ぢ':['di'], 'づ':['du'], 'で':['de'], 'ど':['do'],
    'ば':['ba'], 'び':['bi'], 'ぶ':['bu'], 'べ':['be'], 'ぼ':['bo'],
    'ぱ':['pa'], 'ぴ':['pi'], 'ぷ':['pu'], 'ぺ':['pe'], 'ぽ':['po'],
    'きゃ':['kya'], 'きゅ':['kyu'], 'きょ':['kyo'],
    'しゃ':['sya','sha'], 'しゅ':['syu','shu'], 'しょ':['syo','sho'],
    'ちゃ':['tya','cha'], 'ちゅ':['tyu','chu'], 'ちょ':['tyo','cho'],
    'にゃ':['nya'], 'にゅ':['nyu'], 'にょ':['nyo'],
    'ひゃ':['hya'], 'ひゅ':['hyu'], 'ひょ':['hyo'],
    'みゃ':['mya'], 'みゅ':['myu'], 'みょ':['myo'],
    'りゃ':['rya'], 'りゅ':['ryu'], 'りょ':['ryo'],
    'ぎゃ':['gya'], 'ぎゅ':['gyu'], 'ぎょ':['gyo'],
    'じゃ':['zya','ja','jya'], 'じゅ':['zyu','ju','jyu'], 'じょ':['zyo','jo','jyo'],
    'びゃ':['bya'], 'びゅ':['byu'], 'びょ':['byo'],
    'ぴゃ':['pya'], 'ぴゅ':['piyu','pyu'], 'ぴょ':['pyo'],
    'ー':['-'], 'ぁ':['la','xa'], 'ぃ':['li','xi'], 'ぅ':['lu','xu'], 'ぇ':['le','xe'], 'ぉ':['lo','xo'],
    'ゃ':['lya','xya'], 'ゅ':['lyu','xyu'], 'ょ':['lyo','xyo'],
    'ふぁ':['fa'], 'ふぃ':['fi'], 'ふぇ':['fe'], 'ふぉ':['fo'],
    'うぃ':['wi'], 'うぇ':['we'], 'うぉ':['wo'], 'でぃ':['dhi'], 'てぃ':['thi']
};

const WORD_POOL = {
    en: [
        { d: "OVERDRIVE", y: "overdrive" }, { d: "CRYSTAL", y: "crystal" }, { d: "LIGHTNING", y: "lightning" },
        { d: "CHRONO_TRIGGER", y: "chronotrigger" }, { d: "CYBER_PUNK", y: "cyberpunk" }, { d: "DYNAMIC_BEAT", y: "dynamicbeat" }
    ],
    ja: [
        { d: "スライム", y: "すらいむ" }, { d: "ゴブリン", y: "ごぶりん" }, { d: "オーク", y: "おーく" },
        { d: "ゴーレム", y: "ごーれむ" }, { d: "呪術師の呪い", y: "じゅじゅつしののろい" }, { d: "妖精の祈り", y: "ようせいのいのり" },
        { d: "極大竜ドラゴン", y: "どらごん" }, { d: "弾幕タイピング", y: "だんまくたいぴんぐ" },
        { d: "神速一閃", y: "しんそくいっせん" }, { d: "絶対王政シールド", y: "ぜったいおうせいしーるど" },{y: "りんご", d: "林檎"}, {y: "ばなな", d: "バナナ"}, {y: "ぱそこん", d: "パソコン"},
        {y: "きーぼーど", d: "キーボード"}, {y: "ぷろぐらむ", d: "プログラム"}, {y: "かいはつ", d: "開発"},
        {y: "せんし", d: "戦士"}, {y: "まほうつかい", d: "魔法使い"}, {y: "ぽーしょん", d: "ポーション"},
        {y: "どらごん", d: "ドラゴン"}, {y: "ぼうけん", d: "冒険"}, {y: "しょうり", d: "勝利"},
        {y: "はいぼく", d: "敗北"}, {y: "ふぃーばー", d: "フィーバー"}, {y: "しーるど", d: "シールド"},
        {y: "こうげき", d: "攻撃"}, {y: "かいふく", d: "回復"}, {y: "けいけんち", d: "経験値"},
        {y: "しすてむ", d: "システム"}, {y: "ぶらうざ", d: "ブラウザ"}, {y: "えんじん", d: "エンジン"},
        {y: "だんじょん", d: "ダンジョン"}, {y: "たからばこ", d: "宝箱"}, {y: "らいげき", d: "雷撃"},
        {y: "ふぶき", d: "吹雪"}, {y: "むげん", d: "無限"}, {y: "でんせつ", d: "伝説"},
        {y: "えいゆう", d: "英雄"}, {y: "せいぎ", d: "正義"}, {y: "うちゅう", d: "宇宙"},
        {y: "ぎんが", d: "銀河"}, {y: "しんか", d: "進化"}, {y: "ふしちょう", d: "不死鳥"},
        {y: "せいきし", d: "聖騎士"}, {y: "ねんだいき", d: "年代記"}, {y: "りゅうせい", d: "流星"},
        {y: "ちへいせん", d: "地平線"}, {y: "しんえん", d: "深淵"}, {y: "せいいき", d: "聖域"},
        {y: "あんごうか", d: "暗号化"}, {y: "じどうはんべつき", d: "自動判別機"},
        {y: "たいぴんぐますたー", d: "タイピングマスター"}, {y: "しんそく", d: "神速"}, {y: "でんこうせっか", d: "電光石火"},
        {y: "しんばつ", d: "神罰"}, {y: "めいふ", d: "冥府"}, {y: "まかい", d: "魔界"},
        {y: "てんくうじょう", d: "天空城"}, {y: "げっこう", d: "月光"}, {y: "ようこう", d: "陽光"},
        {y: "しんらばんしょう", d: "森羅万象"}, {y: "いっきとうせん", d: "一騎当千"}, {y: "こてんぱん", d: "コテンパン"},
        {y: "じゅんぐり", d: "順繰り"}, {y: "ちんぷんかんぷん", d: "珍ぷんかんぷん"}, {y: "まがお", d: "真顔"},
        {y: "ぷりずむりばー", d: "プリズムリバー"}, {y: "ほうらいさん", d: "蓬莱山"}, {y: "かざみどり", d: "風見鶏"},
        {y: "すいせいむし", d: "彗星虫"}, {y: "しゃくねつ", d: "灼熱"}, {y: "ぜったいれいど", d: "絶対零度"},
        {y: "ちょうしんせいばくはつ", d: "超新星爆発"}, {y: "ぶらっくほーる", d: "ブラックホール"}, {y: "ほうかい", d: "崩壊"},
        {y: "けいりゃく", d: "計略"}, {y: "げきりん", d: "逆鱗"}, {y: "ふうらいぼう", d: "風来坊"},
        {y: "しんく", d: "深紅"}, {y: "ぐんじょう", d: "群青"}, {y: "こはく", d: "琥珀"},
        {y: "るりいろ", d: "瑠璃色"}, {y: "ひすい", d: "翡翠"}, {y: "しおさい", d: "潮騒"},
        {y: "さざなみ", d: "漣"}, {y: "あらなみ", d: "荒波"}, {y: "うずしお", d: "渦潮"},
        {y: "たいが", d: "大河"}, /* 🔍バグ修正：たい加 ➔ たいが */
        {y: "せいりゅう", d: "清流"}, {y: "げんりゅう", d: "源流"},
        {y: "こうずい", d: "洪水"}, {y: "かんばつ", d: "干ばつ"}, {y: "ごうう", d: "豪雨"},
        {y: "しんりゅう", d: "神龍"}, {y: "りゅうおう", d: "竜王"}, {y: "りゅうせいぐん", d: "流星群"},
        {y: "かいりゅう", d: "海流"}, {y: "れいりゅう", d: "冷流"}, {y: "だいりゅう", d: "大流"},
        {y: "あまつかぜ", d: "天つ風"}, {y: "かぜのたみ", d: "風の民"}, {y: "かぜまかせ", d: "風任せ"},
        {y: "たいふう", d: "台風"}, {y:"やじゅうせんぱい", d: "野獣先輩"},  {y:"くいあらためて", d: "♰悔い改めて♰"}, 
        {y:"はいってどうぞ", d:"入って、どうぞ"},{y:"ここ", d:"こ↑こ↓"}, {y:"みろよみろよ", d:"364364"},
        {y:"そうだよ", d:"そうだよ（便乗）"}, {y:"びーるびーる", d:"ビール！ビール！"}, {y:"なにやってるんですかまずいですよ", d: "何やってるんですか、まずいですよ！！"},
        {y:"ででどん", d:"デデドン！！（絶望）"}, {y:"まなつのよるのいんむ", d:"真夏の夜の淫夢"}, {y:"はくしんからてぶ", d:"（迫真）空手部・性の裏技"}
]};

const SKILLS = {
    heal: { name: "即時回復", desc: "HP+2500, シールド+2000" },
    rain: { name: "タイピングレイン", desc: "10秒間、すべてのタイピングが敵全体への同時攻撃化", duration: 10 },
    boost: { name: "ダメージブースト", desc: "8秒間、プレイヤーの全与ダメージが2倍", duration: 8 },
    fever: { name: "インスタントフィーバー", desc: "ゲージを無視して即座にフィーバーを強制起動"},
    reflect: { name: "リフレクション", desc: "敵の攻撃を3回まで完全無効化し大ダメージ反射", maxCharges: 3 }
};

const UPGRADE_MASTER = {
    atk: { name: "基礎攻撃力UP", desc: "与える基本ダメージが+150増加。" },
    maxHp: { name: "最大HP拡張", desc: "最大基礎HPが+1500拡張され、HPが全快。" },
    maxSld: { name: "最大シールド拡張", desc: "最大基礎シールドが+1000拡張され、全快。" },
    waveHeal: { name: "WAVEクリア回復UP", desc: "WAVEクリア時の自動回復割合が+15%上昇。" },
    vamp: { name: "タイピング吸血", desc: "1文字正確にタイプするたびにHPが15回復。" },
    expBst: { name: "経験値ブースト", desc: "敵撃破時の獲得経験値(NX)が25%増加。" },
    feverBst: { name: "フィーバー強化", desc: "フィーバー時のダメージ倍率がさらに+0.5倍加算。" },
    tpGain: { name: "TPチャージ加速", desc: "タイピング成功時のTP獲得量が20%増加。" },
    crit: { name: "会心の一撃", desc: "15%の確率で基本クリティカルヒット(3倍)が有効化。" },
    shieldRegen: { name: "シールド毎秒修復", desc: "WAVE稼働中、シールドが毎秒40ずつ自動再生。" },
    curseResist: { name: "呪い抵抗力", desc: "弱体化の持続時間を半分にカット。" },
    bossSlayer: { name: "ボススレイヤー", desc: "ボスクラスへの与ダメージが常に1.5倍。" },
    feverGain: { name: "フィーバーゲージ増加", desc: "タイピング成功時のフィーバーゲージ獲得量が20%増加。" },
};

const ENEMY_ROLES = {
    normal: { name: "通常", cls: "スライム", icon: "💧" }, 
    shield: { name: "盾持ち", cls: "ゴーレム", icon: "🛡️" },
    curse: { name: "弱体化", cls: "呪術師", icon: "🔮" }, 
    heal: { name: "回復", cls: "妖精", icon: "🧚‍♀️" }, 
    boss: { name: "ボス", cls: "ドラゴン", icon: "🐉" }
};

// スタイルカード個別効果（ステータスは共通化されたため、純粋なパッシブ効果のみを定義）
const STYLE_CARDS = {
    A: [
        { id: "a_tp", name: "韋駄天の心得", desc: "個別効果: TPチャージ速度 +15%", eff: (p)=>p.tpGainBst+=0.15, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0},
        { id: "a_vamp", name: "吸血の心得", desc: "個別効果: タイプごとにHPが 2 回復", eff: (p)=>p.styleVamp+=2, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0},
        { id: "a_crit", name: "幸運の心得", desc: "個別効果: クリティカル率 +10%", eff: (p)=>p.styleCrit+=0.10, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_heal", name: "癒やしの心得", desc: "個別効果: WAVEクリア回復割合 +10%", eff: (p)=>p.waveHealPct+=10, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_curse", name: "耐魔の心得", desc: "個別効果: 呪いを受ける時間を 30% 短縮", eff: (p)=>p.curseReduce+=0.3, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_exp", name: "修練の心得", desc: "個別効果: 獲得経験値 +15%", eff: (p)=>p.expBstPct+=0.15, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_ref", name: "反撃の心得", desc: "個別効果: 被弾時に敵へ 200 の固定反射ダメージ", eff: (p)=>p.flatReflect+=200, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_atk_p", name: "修羅の入門", desc: "個別効果: 基礎一打の威力が常に +50 上乗せ", eff: (p)=>p.flatAtkAdd+=50, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_shield_p", name: "防壁の入門", desc: "個別効果: シールドが毎秒 10 自動再生", eff: (p)=>p.styleSldRegen+=10, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "a_fever_p", name: "熱情の入門", desc: "個別効果: フィーバー時のダメージ倍率 +0.2倍", eff: (p)=>p.feverDmgMult+=0.2, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 }
    ],
    S: [
        { id: "s_regen", name: "不倒の城塞", desc: "個別効果: シールドが毎秒 30 自動再生", eff: (p)=>p.styleSldRegen+=30, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 ,breakGainFever : 0},
        { id: "s_fever", name: "狂戦士の刻印", desc: "個別効果: フィーバー時のダメージ倍率 +1.0倍", eff: (p)=>p.feverDmgMult+=1.0, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_vamp", name: "吸血鬼の契約", desc: "個別効果: タイプごとにHPが 10 回復", eff: (p)=>p.styleVamp+=10, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_crit", name: "超会心回路", desc: "個別効果: クリティカル時のダメージ倍率が 4倍 に固定強化", eff: (p)=>p.critDmgMult = 4.0, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_tp", name: "神速の鼓動", desc: "個別効果: TPチャージ速度 +35%", eff: (p)=>p.tpGainBst+=0.35, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_time", name: "次元の超越", desc: "個別効果: レイン・ブーストの持続時間 +3秒", eff: (p)=>p.buffDurationAdd+=3, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_slayer", name: "竜殺しの秘術", desc: "個別効果: ボスクラスへの与ダメージ 1.5倍", eff: (p)=>p.bossDmgMult+=0.5, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_heal", name: "至高の治癒", desc: "個別効果: WAVEクリア回復割合 +25%", eff: (p)=>p.waveHealPct+=25, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_flat", name: "破滅の導き", desc: "個別効果: 一打ごとのベース威力に常に +300 上乗せ", eff: (p)=>p.flatAtkAdd+=300, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever :0},
        { id: "s_rain", name: "祝福の雨", desc: "個別効果: レイン発動中、さらに攻撃力 +30%", eff: (p)=>p.rainAtkUp=true, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_clutch", name: "絶境の闘志", desc: "個別効果: 自身の残りHPが少ないほど攻撃力最大 1.8倍", eff: (p)=>p.clutchAtk=true, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_barrier", name: "逆境バリア", desc: "個別効果: スキル使用時、反射バリアが2層余分に付与", eff: (p)=>p.extraReflect=2, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_fever_gain", name: "加速熱量", desc: "個別効果: 正タイプ時のフィーバー上昇量 +30%", eff: (p)=>p.feverGainBst+=0.3, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "s_gold", name: "金色の輝き", desc: "個別効果: クリティカル率がさらに +10% 上乗せ", eff: (p)=>p.styleCrit+=0.10, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0 }
    ],
    SS: [
        { id: "ss_god", name: "★創世神のコード", desc: "個別効果: 個別パッシブとしてHP・シールド最大値がさらに +30% 増幅", eff: (p)=>{p.styleHpMult+=0.3; p.styleSldMult+=0.3;}, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_buster", name: "★終焉のバスター", desc: "個別効果: 一打の威力に +3000 上乗せ、ただし共通シールドボーナスが相殺される(-50%)", eff: (p)=>{p.flatAtkAdd+=3000; p.styleSldMult-=0.5;}, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_shield", name: "★絶対零度シールド", desc: "個別効果: 個別パッシブとして最大シールド+3000、さらに毎秒 80 自動再生", eff: (p)=>{p.flatSldAdd+=3000; p.styleSldRegen+=80;}, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_infFever", name: "★インフィニティ・タイム", desc: "個別効果: フィーバー及びオーバードライブの消費速度が半分に延長", eff: (p)=>p.feverCostHalf=true, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_slayer", name: "★神殺しの宿命", desc: "個別効果: ボスクラス(ボス)への与ダメージが常に 3倍 に固定化", eff: (p)=>p.godSlayer=true, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_gospel", name: "★天界の福音", desc: "個別効果: WAVEクリア時、自身のHPとシールドが100%全快する", eff: (p)=>p.fullHealOnWave=true, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_chrono", name: "★クロノス・ドライブ", desc: "個別効果: フィーバー突入時、全生存エネミーの攻撃カウントを3秒遅延", eff: (p)=>p.chronoDrive=true, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_fever_heal", name: "★フィーバーヒール", desc: "個別効果：フィーバー突入時、HPとシールドを70%回復" , eff: (p)=>p.feverHealPct=0.7, overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 , breakGainFever : 0},
        { id: "ss_breakgain", name:"★ブレイクゲイン", desc: "個別効果: シールドを持つ敵のシールドを破壊したとき、フィーバーゲージを35%得る" , eff: (p)=>p.breakGainFever=0.35 , overShieldPct: 1.0, overHealPct: 0 , feverHealPct: 0 },
        { id: "ss_overheal", name:"★オーバーヒール", desc: "個別効果: シールドが満タンの時に回復すると、上限を超えて150%までシールドが回復する" , eff: (p)=>p.overHealSld=1.5 ,overShieldPct: 1.0, feverHealPct: 0 , breakGainFever : 0}
        
    ]
};

// ステータス構造の最適化（基礎値と補正値を分離）
let p = {
    lv: 1, exp: 0, nextExp: 65,
    rawMaxHp: 100, rawMaxSld: 600, rawCurrentMaxSld: 600, rawAtk: 30, // レベル・コアによる純粋な基礎値
    hp: 100, maxHp: 100, sld: 600, maxSld: 600, maxOverShield: 0, baseAtk: 30, // スタイルカード補正適用後のアクティブ値
    tp: 0, maxTp: 100, fever: 0, maxFever: 100, waveHealPct: 20, curseTimer: 0,
    rainTimer: 0, boostTimer: 0, reflectCharges: 0, cooldown: 20,
    
    currentStyle: null,
    // スタイルカード個別パッシブ用バッファ
    tpGainBst: 0, styleVamp: 0, styleSldVamp: 0, styleCrit: 0, curseReduce: 0,
    expBstPct: 0, flatReflect: 0, styleSldRegen: 0, feverDmgMult: 0, critDmgMult: 3.0,
    buffDurationAdd: 0, bossDmgMult: 0, flatAtkAdd: 0, rainAtkUp: false, clutchAtk: false,
    feverCostHalf: false, godSlayer: false, fullHealOnWave: false, chronoDrive: false,
    extraReflect: 0, feverGainBst: 0, flatHpAdd: 0, flatSldAdd: 0, styleHpMult: 0, styleSldMult: 0, styleScoreMult: 0, overHealSld: 1.0, feverHealPct: 0, breakGainFever: 0, overShieldPct: 0,
    baseSldRegen: 0, baseDmgCut: 0, infiniteDefenseLevel: 0,

    // スタイルレアリティ共通ボーナス用バッファ
    rarityDmgCut: 0, rarityCrit: 0, rarityCritMult: 0
};

let upgradesCount = {};
Object.keys(UPGRADE_MASTER).forEach(k => upgradesCount[k] = 0);

let currentWave = 1;
let enemies = [];
let targetIdx = 0;

// エンドレス専用: 前線は常に最大3体、あふれた敵は控えゾーンから攻撃する。
let reserveEnemies = [];
let enemySequence = 0;
let endlessKills = 0;
let endlessKillScore = 0;
let endlessSpawnTimer = 10;
let endlessSpawnCount = 0;
let endlessNextStyleKill = 25;

function isEndlessMode() {
    return config.difficulty === 'endless';
}

function getCombatEnemies() {
    return isEndlessMode() ? [...enemies, ...reserveEnemies] : enemies;
}

let currentWordDisplay = "";
let currentTokens = [];
let currentTokenIdx = 0;

let isFever = false;
let isSuperFever = false;
let feverTimer = 0;

// リザルト集計用スタッツ
let stats = { 
    totalDmg: 0, totalKeys: 0, missKeys: 0, maxKpm: 0,
    startTime: null, intervalId: null 
};

let gameReadyToStart = false; 
let isCountingDown = false;    
let isLevelUpMenuOpen = false; 
let pendingLevelUps = 0;
let inputListenersBound = false;

const IME_MAP = {
    'ａ':'a','ｂ':'b','ｃ':'c','ｄ':'d','ｅ':'e','ｆ':'f','ｇ':'g','ｈ':'h','ｉ':'i','ｊ':'j','ｋ':'k','ｌ':'l','ｍ':'m',
    'ｎ':'n','ｏ':'o','ｐ':'p','ｑ':'q','ｒ':'r','ｓ':'s','ｔ':'t','ｕ':'u','ｖ':'v','ｗ':'w','ｘ':'x','ｙ':'y','ｚ':'z','－':'-'
};

function kataToHira(str) {
    return str.replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));
}

function initSetup() {
    const skDiv = document.getElementById('skill-options');
    skDiv.innerHTML = '';
    Object.keys(SKILLS).forEach((k, idx) => {
        const btn = document.createElement('button');
        btn.className = `btn-opt ${idx===0?'selected':''}`;
        btn.innerHTML = `${SKILLS[k].name}<small>${SKILLS[k].desc}</small>`;
        btn.onclick = () => {
            document.querySelectorAll('#skill-options .btn-opt').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            config.selectedSkill = k;
        };
        skDiv.appendChild(btn);
    });
}

function setMode(m, element) {
    config.mode = m;
    element.parentNode.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
}

function setDifficulty(d, element) {
    config.difficulty = d;
    element.parentNode.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('selected'));
    element.classList.add('selected');
}

// レアリティ共通ステータスボーナスの動的適用処理
function applyStats() {
    let hpB = 0, sldB = 0, atkB = 0, atkF = 0, cutB = 0, critB = 0, cmultB = 0;
    
    if (p.currentStyle) {
        if (p.currentStyle.rarity === 'A') {
            hpB = 0.10; sldB = 0.15; atkF = 20; cutB = 0.10;
        } else if (p.currentStyle.rarity === 'S') {
            hpB = 0.25; sldB = 0.50; atkB = 0.15; atkF = 35; cutB = 0.25; critB = 0.30;
        } else if (p.currentStyle.rarity === 'SS') {
            hpB = 0.35; sldB = 0.70; atkB = 0.35; atkF = 100; cutB = 0.40; critB = 0.50; cmultB = 0.5;
        } else if (p.currentStyle.rarity === 'SSS') {
            hpB = 0.60; sldB = 1.20; atkB = 0.70; atkF = 300; cutB = 0.55; critB = 0.65; cmultB = 1.0;
        }
    }
    
    // 基礎値に対し、「レアリティ共通% + 個別パッシブ%」を乗算し、固定値を加算
    p.maxHp = Math.floor(p.rawMaxHp * (1 + hpB + p.styleHpMult)) + p.flatHpAdd;
    p.maxSld = Math.floor(p.rawMaxSld * (1 + sldB + p.styleSldMult)) + p.flatSldAdd;
    p.baseAtk = Math.floor(p.rawAtk * (1 + atkB)) + atkF + p.flatAtkAdd;
    
    
    p.rarityDmgCut = cutB;
    p.rarityCrit = critB;
    p.rarityCritMult = cmultB;

    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.overHealSld > 1.0 ){ 
        p.currentMaxSld = Math.floor(p.maxSld * p.overHealSld);
        if (p.sld > p.currentMaxSld) p.sld = p.currentMaxSld;
    } 
    else {
        p.currentMaxSld = p.maxSld;
        if (p.sld > p.maxSld) p.sld = p.maxSld;
    }
}

function getLevelGrowth() {
    if (config.difficulty === 'easy') return { hp: 100, sld: 300, atk: 50 };
    if (config.difficulty === 'lunatic') return { hp: 40, sld: 120, atk: 30 };
    if (config.difficulty === 'Phantasm') return { hp: 20, sld: 60, atk: 20 };
    return { hp: 60, sld: 180, atk: 40 };
}

function applyLevelGrowth() {
    const growth = getLevelGrowth();
    p.rawMaxHp += growth.hp;
    p.rawMaxSld += growth.sld;
    p.rawAtk += growth.atk;
}

function applyStartingLevel() {
    const targetLevel = Math.min(50, Math.max(1, Math.floor(p.startingLevel || 1)));
    for (let level = 1; level < targetLevel; level++) {
        p.lv++;
        p.nextExp = Math.floor(p.nextExp * 1.20);
        applyLevelGrowth();
    }
}

function updatePendingLevelUpUI() {
    const button = document.getElementById('core-cache-btn');
    if (!button) return;
    button.textContent = `CORE CACHE: ${pendingLevelUps}`;
    button.disabled = pendingLevelUps <= 0 || isLevelUpMenuOpen;
}

function openPendingLevelUps() {
    if (pendingLevelUps <= 0 || isLevelUpMenuOpen) return;
    if (document.getElementById('style-overlay').style.display === 'flex' || document.getElementById('result-overlay').style.display === 'flex') return;
    triggerLevelUpOverlay();
}

function startGame() {
    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.add('active');
    
    p.lv = 1;
    p.exp = 0;
    p.nextExp = 65;
    pendingLevelUps = 0;
    currentWave = 1;
    enemies = [];
    reserveEnemies = [];
    targetIdx = 0;
    enemySequence = 0;
    endlessKills = 0;
    endlessKillScore = 0;
    endlessSpawnTimer = 10;
    endlessSpawnCount = 0;
    endlessNextStyleKill = 25;
    currentWordDisplay = '';
    currentTokens = [];
    currentTokenIdx = 0;

    if (config.difficulty === 'easy') { p.rawMaxHp = 200; p.rawMaxSld = 1000; p.rawAtk = 50; }
    else if (config.difficulty === 'lunatic') { p.rawMaxHp = 50; p.rawMaxSld = 200; p.rawAtk = 20; }
    else if (config.difficulty === 'Phantasm') { p.rawMaxHp = 25; p.rawMaxSld = 100; p.rawAtk = 30; }
    else { p.rawMaxHp = 100; p.rawMaxSld = 600; p.rawAtk = 30; }

    // ランク由来の恒久ベース強化は、各難易度の元の基礎値へ加算する。
    if (typeof applyPersistentBaseStats === 'function') applyPersistentBaseStats();
    applyStartingLevel();
    // 初期レベル分の能力コアも保留枠へ入れる。高Lv開始でも、好きなタイミングでまとめて選べる。
    pendingLevelUps = Math.max(0, p.lv - 1);
    applyStats();
    p.hp = p.maxHp;
    p.sld = p.maxSld;
    p.overShield = 0;
    
    if (SKILLS[config.selectedSkill].maxUses) p.skillUsesLeft = SKILLS[config.selectedSkill].maxUses;
    
    if (isEndlessMode()) {
        // 開始直後からタイプできるよう最初の1体は配置し、次の侵攻を10秒後にする。
        spawnEndlessReinforcements();
    } else {
        spawnWave();
    }
    updateUI();
    updatePendingLevelUpUI();

    gameReadyToStart = true;
    const overlay = document.getElementById('countdown-overlay');
    overlay.style.display = 'flex';
    document.getElementById('countdown-text').innerText = "READY";
    document.getElementById('countdown-sub').innerText = "PRESS [ SPACE ] OR [ ENTER ] TO START";
    
    // 隠し入力欄はIME／貼り付け用に残しつつ、キー入力自体はdocumentでも受ける。
    // 再出撃で同じイベントを重複登録しない。
    if (!inputListenersBound) {
        document.getElementById('hidden-input').addEventListener('input', handleTyping);
        document.addEventListener('keydown', handleGlobalKeydown);
        inputListenersBound = true;
    }
    if(config.difficulty === 'Phantasm') {
        if (currentWave === 1) {
            triggerStyleCardOverlay();
        }
    }

}

function handleGlobalKeydown(e) {
    if (gameReadyToStart && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        gameReadyToStart = false;
        runCountdownSystem();
        return;
    }
    if (!gameReadyToStart && !isCountingDown && !isLevelUpMenuOpen && document.getElementById('style-overlay').style.display !== 'flex' && document.getElementById('result-overlay').style.display !== 'flex') {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (p.tp >= p.maxTp) { p.tp = 0; activateActiveSkill(); }
            return;
        }

        // フォーカスが隠しinputから外れても、通常の1文字キーなら必ずゲームへ渡す。
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing) {
            e.preventDefault();
            processTypingInput(e.key);
        }
    }
}

function runCountdownSystem() {
    isCountingDown = true;
    const txt = document.getElementById('countdown-text');
    document.getElementById('countdown-sub').innerText = "敵軍が接近中...";
    let count = 3;
    txt.innerText = count;

    let timer = setInterval(() => {
        count--;
        if (count > 0) {
            txt.innerText = count;
        } else if (count === 0) {
            txt.innerText = "START!!";
        } else {
            clearInterval(timer);
            document.getElementById('countdown-overlay').style.display = 'none';
            isCountingDown = false;
            stats.startTime = Date.now();
            stats.intervalId = setInterval(updateGameLoop, 100);
            document.getElementById('hidden-input').focus();
        }
    }, 1000);
}

function tokenize(yomiStr) {
    let str = kataToHira(yomiStr);
    let tokens = [];
    if (config.mode === 'en') {
        for (let i = 0; i < str.length; i++) {
            tokens.push({ kana: str[i], specs: [str[i].toLowerCase()], input: "" });
        }
        return tokens;
    }
    let i = 0;
    while (i < str.length) {
        let one = str[i];
        if (one === 'っ') {
            let nextTwo = str.substring(i+1, i+3);
            let nextOne = str.substring(i+1, i+2);
            if (nextOne === "") {
                tokens.push({ kana: 'っ', specs: ['tsu', 'tu', 'xtsu'], input: "" });
                i++; continue;
            }
            let nextSpecs = ROMAN_MAP[nextTwo] || ROMAN_MAP[nextOne] || [nextOne.toLowerCase()];
            let combinedSpecs = [];
            nextSpecs.forEach(ns => {
                if (ns[0]) combinedSpecs.push(ns[0] + ns);
                combinedSpecs.push('xtsu' + ns);
                combinedSpecs.push('ltu' + ns);
            });
            tokens.push({ kana: 'っ' + (ROMAN_MAP[nextTwo]?nextTwo:nextOne), specs: combinedSpecs, input: "" });
            i += (ROMAN_MAP[nextTwo] ? 3 : 2);
            continue;
        }
        if (one === 'ん') {
            let nextTwo = str.substring(i+1, i+3);
            let nextOne = str.substring(i+1, i+2);
            if (nextOne === "") {
                tokens.push({ kana: 'ん', specs: ['n', 'nn'], input: "" });
                i++; continue;
            }
            let nextSpecs = ROMAN_MAP[nextTwo] || ROMAN_MAP[nextOne] || [nextOne.toLowerCase()];
            let combinedSpecs = [];
            let isBoinOrYa = ['あ','い','う','え','お','や','ゆ','よ','な','に','ぬ','ね','の'].includes(nextOne);
            nextSpecs.forEach(ns => {
                combinedSpecs.push('nn' + ns);
                if (!isBoinOrYa) combinedSpecs.push('n' + ns);
            });
            tokens.push({ kana: 'ん' + (ROMAN_MAP[nextTwo]?nextTwo:nextOne), specs: combinedSpecs, input: "" });
            i += (ROMAN_MAP[nextTwo] ? 3 : 2);
            continue;
        }
        let two = str.substring(i, i+2);
        if (ROMAN_MAP[two]) {
            tokens.push({ kana: two, specs: [...ROMAN_MAP[two]], input: "" });
            i += 2; continue;
        }
        if (ROMAN_MAP[one]) {
            tokens.push({ kana: one, specs: [...ROMAN_MAP[one]], input: "" });
            i++;
        } else {
            tokens.push({ kana: one, specs: [one.toLowerCase()], input: "" });
            i++;
        }
    }
    return tokens;
}

function spawnWave() {
    enemies = [];
    reserveEnemies = [];
    targetIdx = 0;
    let roles = ['normal', 'shield', 'curse'];
    if (currentWave >= 5) roles.push('heal');
    
    let isBossWave = (currentWave % 10 === 0);
    if (isBossWave) {
        roles = ['boss'];
        const warn = document.getElementById('boss-warning');
        warn.style.display = 'block';
        setTimeout(() => warn.style.display = 'none', 1500);
        document.body.className = "boss-bg";
    } else {
        document.body.className = "";
    }

    let enemyCount = isBossWave ? 1 : 3;
    for (let i = 0; i < enemyCount; i++) {
        let role = roles[Math.floor(Math.random() * roles.length)];
        
        // 【微調整】インフレの強さをほんの少しマイルドに下方修正
        let baseHp = (100 + currentWave * 160) * Math.pow(1.035, currentWave - 1);
        let sld = 0;
        let name = ENEMY_ROLES[role].cls;

        if (config.difficulty === 'hard') baseHp *= 1.4;
        if (config.difficulty === 'lunatic') baseHp *= 2.0;
        if (config.difficulty === 'Phantasm') baseHp *= 3.0;

        if (role === 'shield') { sld = Math.floor(baseHp * 0.7); name = "鉄壁ゴーレム"; }
        if (role === 'curse') name = "古の呪術師";
        if (role === 'heal') name = "大妖精エルフ";
        if (role === 'boss') { baseHp *= 5.0; name = "【世界滅亡の狂竜】ドラゴン"; }

        let cdMax = 5;
        if (config.difficulty === 'easy') cdMax = 15;
        if (config.difficulty === 'hard') cdMax = 4;
        if (config.difficulty === 'lunatic' || config.difficulty === 'Phantasm') cdMax = 3;
        if (config.difficulty === 'extra') cdMax= 5;
        if (role === 'boss') cdMax = 6;

        enemies.push({
            id: i, name: `${name}`, role: role,
            hp: baseHp, maxHp: baseHp, sld: sld, maxSld: sld,
            cd: cdMax, cdMax: cdMax, chargeCount: 0
        });
    }
    
    if (!currentWordDisplay) nextWord();
    else renderWord();
}

function clearTypingWord(message = '') {
    currentWordDisplay = '';
    currentTokens = [];
    currentTokenIdx = 0;
    const areaKanji = document.getElementById('word-kanji');
    const areaTarget = document.getElementById('word-target');
    if (areaKanji) areaKanji.innerText = message;
    if (areaTarget) areaTarget.innerText = '';
}

function getEndlessSpawnInterval() {
    // 10秒から撃破数に応じて短縮し、最短2秒で止める。
    return Math.max(2, 10 - endlessKills * 0.08);
}

function getEndlessSpawnAmount() {
    // 1体ずつ始まり、撃破数に応じて最大1～3体ずつ侵攻する。
    return Math.min(3, 1 + Math.floor(endlessKills / 35));
}

function makeEndlessEnemy() {
    const strength = 1 + endlessKills * 0.14;
    const regularRoles = ['normal', 'shield', 'curse'];
    if (endlessKills >= 18) regularRoles.push('heal');

    // 25回の侵攻ごとにボスを混ぜ、撃破報酬を狙える山場にする。
    const role = endlessSpawnCount > 0 && endlessSpawnCount % 25 === 0
        ? 'boss'
        : regularRoles[Math.floor(Math.random() * regularRoles.length)];
    let baseHp = (180 + strength * 130) * Math.pow(1.028, Math.max(0, strength - 1));
    let sld = 0;
    let name = ENEMY_ROLES[role].cls;
    if (role === 'shield') { sld = Math.floor(baseHp * 0.7); name = '鉄壁ゴーレム'; }
    if (role === 'curse') name = '古の呪術師';
    if (role === 'heal') name = '大妖精エルフ';
    if (role === 'boss') { baseHp *= 5; name = '【終焉の侵攻竜】ドラゴン'; }

    let cdMax = Math.max(2.6, 5 - endlessKills * 0.012);
    if (role === 'boss') cdMax = Math.max(3.5, cdMax + 1.2);

    enemySequence++;
    return {
        id: `endless-${enemySequence}`,
        name,
        role,
        hp: Math.floor(baseHp),
        maxHp: Math.floor(baseHp),
        sld,
        maxSld: sld,
        cd: cdMax,
        cdMax,
        chargeCount: 0,
        power: strength
    };
}

function promoteReserveEnemies() {
    while (enemies.length < 3 && reserveEnemies.length > 0) {
        enemies.push(reserveEnemies.shift());
    }
    if (targetIdx >= enemies.length) targetIdx = 0;
}

function spawnEndlessReinforcements() {
    const amount = getEndlessSpawnAmount();
    for (let i = 0; i < amount; i++) {
        endlessSpawnCount++;
        const enemy = makeEndlessEnemy();
        if (enemies.length < 3) enemies.push(enemy);
        else reserveEnemies.push(enemy);
    }
    if (enemies.length > 0) {
        if (!currentWordDisplay) nextWord();
        else renderWord();
    }
}

function updateEndlessSpawning() {
    endlessSpawnTimer -= 0.1;
    if (endlessSpawnTimer > 0) return;
    spawnEndlessReinforcements();
    // 実フレーム誤差を残して次の侵攻へ引き継ぐ。
    endlessSpawnTimer += getEndlessSpawnInterval();
}

function nextWord() {
    if (enemies.length === 0 || !enemies[targetIdx]) return;
    const pool = WORD_POOL[config.mode];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    
    currentWordDisplay = picked.d;
    currentTokens = tokenize(picked.y);
    currentTokenIdx = 0;
    renderWord();
}

function renderWord() {
    const areaKanji = document.getElementById('word-kanji');
    const areaTarget = document.getElementById('word-target');
    
    if (!currentWordDisplay) return;
    areaKanji.innerText = currentWordDisplay;
    
    let typedHtml = "";
    let currentHtml = "";
    let restHtml = "";
    
    for (let i = 0; i < currentTokenIdx; i++) {
        typedHtml += currentTokens[i].activeRomaji || currentTokens[i].specs[0];
    }
    
    if (currentTokenIdx < currentTokens.length) {
        let tok = currentTokens[currentTokenIdx];
        typedHtml += tok.input;
        
        let activeSpec = tok.specs.find(s => s.startsWith(tok.input)) || tok.specs[0];
        tok.activeRomaji = activeSpec;
        
        let remInToken = activeSpec.substring(tok.input.length);
        if (remInToken.length > 0) {
            currentHtml = `<span class="char-current">${remInToken[0]}</span>`;
            restHtml = remInToken.substring(1);
        }
        for (let i = currentTokenIdx + 1; i < currentTokens.length; i++) {
            restHtml += currentTokens[i].specs[0];
        }
    }
    areaTarget.innerHTML = `<span class="char-typed">${typedHtml}</span>${currentHtml}<span>${restHtml}</span>`;
}

function handleTyping(e) {
    const inputVal = e.target.value;
    e.target.value = '';
    processTypingInput(inputVal);
}

function processTypingInput(inputVal) {
    if (gameReadyToStart || isCountingDown || isLevelUpMenuOpen || document.getElementById('style-overlay').style.display === 'flex' || document.getElementById('result-overlay').style.display === 'flex') {
        return;
    }

    if (!inputVal || enemies.length === 0 || currentTokenIdx >= currentTokens.length) return;

    let char = inputVal.substring(inputVal.length - 1).toLowerCase();
    if (IME_MAP[char]) char = IME_MAP[char];

    let tok = currentTokens[currentTokenIdx];
    let nextInput = tok.input + char;
    let validSpecs = tok.specs.filter(s => s.startsWith(nextInput));
    
    if (validSpecs.length > 0) {
        tok.input = nextInput;
        tok.specs = validSpecs;
        stats.totalKeys++;
        
        // 吸血処理
        let totalHpVamp = (upgradesCount.vamp * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('vamp', 15) : 15)) + p.styleVamp;
        if (totalHpVamp > 0) p.hp = Math.min(p.maxHp, p.hp + totalHpVamp);
        if (p.styleSldVamp > 0) p.sld = Math.min(p.maxSld, p.sld + p.styleSldVamp);
        
        let fGain = 1.6 * (1 + (upgradesCount.feverGain || 0) * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('feverGain', 0.2) : 0.2) + p.feverGainBst);
        if (isFever || isSuperFever) fGain *= 0;
        p.fever = Math.min(p.maxFever, p.fever + fGain);
        if (p.fever >= p.maxFever && !isFever && !isSuperFever) triggerFever();

        let tpGain = 1.6 * (1 + upgradesCount.tpGain * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('tpGain', 0.2) : 0.2) + p.tpGainBst);
        p.tp = Math.min(p.maxTp, p.tp + tpGain);

        const tArea = document.getElementById('typing-area');
        tArea.style.transform = 'scale(1.01)';
        setTimeout(() => tArea.style.transform = 'scale(1)', 40);

        // クリティカル判定に共通レアリティボーナスを加算
        let totalCritChance = (upgradesCount.crit * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('crit', 0.15) : 0.15)) + p.styleCrit + p.rarityCrit;
        let isCrit = (Math.random() < totalCritChance);
        
        let finalDmg = p.baseAtk;
        if (p.clutchAtk && p.hp < (p.maxHp * 0.4)) finalDmg *= 1.8;

        if (isSuperFever) finalDmg *= (4 + upgradesCount.feverBst * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('feverBst', 0.5) : 0.5) + p.feverDmgMult);
        else if (isFever) finalDmg *= (2 + upgradesCount.feverBst * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('feverBst', 0.5) : 0.5) + p.feverDmgMult);

        if (p.boostTimer > 0) finalDmg *= 2;
        if (p.rainAtkUp && p.rainTimer > 0) finalDmg *= 1.3;
        if (p.curseTimer > 0) finalDmg *= 0.5;
        
        if (enemies[targetIdx]?.role === 'boss') {
            if (p.godSlayer) finalDmg *= 3.0;
            else if (upgradesCount.bossSlayer > 0 || p.bossDmgMult > 0) finalDmg *= (1 + (upgradesCount.bossSlayer > 0 ? (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('bossSlayer', 0.5) : 0.5) : 0) + p.bossDmgMult);
        }
        
        if (isCrit) {
            let mult = p.critDmgMult + p.rarityCritMult;
            finalDmg *= mult;
        }

        finalDmg = Math.floor(finalDmg + (Math.random() * (finalDmg*0.1) - (finalDmg*0.05)));
        if (finalDmg < 1) finalDmg = 1;
        inflictDamage(finalDmg, isCrit);

        let completeSpec = tok.specs.find(s => s === tok.input);
        if (completeSpec) {
            tok.activeRomaji = completeSpec;
            currentTokenIdx++;
            if (currentTokenIdx >= currentTokens.length) {
                currentWordDisplay = ""; 
                nextWord();
                return;
            }
        }
        renderWord();
    } else {
        stats.missKeys++; // ミスタイプ集計
        document.getElementById('game-container').classList.add('screen-flash');
        setTimeout(() => document.getElementById('game-container').classList.remove('screen-flash'), 250);
        if (!isFever && !isSuperFever) p.fever = 0;
    }
    updateUI();
}

function inflictDamage(dmg, isCrit) {
    stats.totalDmg += dmg;
    if (p.rainTimer > 0) {
        getCombatEnemies().forEach(en => applyDmgToEnemy(en, dmg, isCrit));
    } else {
        let activeEnemy = enemies[targetIdx];
        if (activeEnemy) applyDmgToEnemy(activeEnemy, dmg, isCrit);
    }
    checkEnemyDeaths();
}

function applyDmgToEnemy(enemy, dmg, isCrit) {
    createFloatingDamage(dmg, enemy.id, isCrit);
    if (enemy.sld > 0) {
        enemy.sld -= dmg;
        if (enemy.sld < 0 && p.breakGainFever > 0 && !isFever && !isSuperFever) {
            p.fever = Math.min(p.maxFever, p.fever + (p.breakGainFever * p.maxFever));
            if (p.fever >= p.maxFever) triggerFever();
        } else if (enemy.sld < 0 && p.breakGainFever > 0 && (isFever || isSuperFever)) {
            feverTimer += 3; // フィーバー中のシールドブレイクはフィーバー時間を延長する
            if (feverTimer > 10 && isFever && !isSuperFever) { 
                isSuperFever = false , isFever = true
                if (feverTimer > 40) feverTimer = 40;
            }else if (feverTimer > 10 && isSuperFever && !isFever) {
                 isSuperFever = true, isFever = false;    
                if (feverTimer > 40) feverTimer = 40;
            }
        }
        if (enemy.sld < 0) { enemy.hp += enemy.sld; enemy.sld = 0; }
    } else {
        enemy.hp -= dmg;
    }
}

function getEnemyExpReward(en) {
    // エンドレスでは撃破数を進行度として扱い、倒すほどEXPも上昇させる。
    const progress = isEndlessMode() ? Math.max(1, Math.floor(endlessKills / 3) + 1) : currentWave;
    let baseExp = 20 + progress * 9;
    if (!isEndlessMode()) {
        if ((config.difficulty === 'extra' && currentWave >= 150) || (config.difficulty === 'Phantasm' && currentWave >= 150)) {
            baseExp = 35 + currentWave * 27;
        } else if ((config.difficulty === 'extra' && currentWave >= 100) || (config.difficulty === 'Phantasm' && currentWave >= 100)) {
            baseExp = 20 + currentWave * 18;
        }
    }
    if (en.role === 'shield') baseExp *= 1.2;
    if (en.role === 'curse') baseExp *= 1.3;
    if (en.role === 'heal') baseExp *= 1.4;
    if (en.role === 'boss') baseExp *= 5.0;

    // WAVE／撃破進行が深いほど、全難易度で獲得EXPを2%ずつ上昇させる。
    const expProgress = isEndlessMode() ? endlessKills : Math.max(0, currentWave - 1);
    baseExp *= 1 + expProgress * 0.02;
    if (upgradesCount.expBst > 0 || p.expBstPct > 0) {
        baseExp *= 1 + upgradesCount.expBst * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('expBst', 0.25) : 0.25) + p.expBstPct;
    }
    return baseExp;
}

function getEndlessKillBounty(role) {
    if (role === 'boss') return 3000;
    if (role === 'shield') return 600;
    return 300;
}

function intensifyEndlessSurvivors() {
    // すでに出現している敵も撃破のたびに攻撃性能を更新する。
    const power = 1 + endlessKills * 0.14;
    const cdMax = Math.max(2.6, 5 - endlessKills * 0.012);
    getCombatEnemies().forEach(en => {
        en.power = Math.max(en.power || 1, power);
        en.cdMax = en.role === 'boss' ? Math.max(3.5, cdMax + 1.2) : cdMax;
        en.cd = Math.min(en.cd, en.cdMax);
    });
}

function checkEnemyDeaths() {
    let expGained = 0;
    const removeDeadEnemies = list => list.filter(en => {
        if (en.hp > 0) return true;
        expGained += getEnemyExpReward(en);
        if (isEndlessMode()) {
            endlessKills++;
            endlessKillScore += getEndlessKillBounty(en.role);
        }
        return false;
    });

    enemies = removeDeadEnemies(enemies);
    if (isEndlessMode()) reserveEnemies = removeDeadEnemies(reserveEnemies);
    if (expGained > 0) gainExp(Math.floor(expGained));

    if (isEndlessMode()) {
        if (expGained > 0) intensifyEndlessSurvivors();
        promoteReserveEnemies();
        if (endlessKills >= endlessNextStyleKill) {
            endlessNextStyleKill += 25;
            triggerStyleCardOverlay();
        }
        if (enemies.length === 0) clearTypingWord('ENDLESS SIGNAL: WAITING FOR REINFORCEMENTS');
        else if (!isLevelUpMenuOpen && document.getElementById('style-overlay').style.display !== 'flex') {
            if (!currentWordDisplay) nextWord();
            else renderWord();
        }
        return;
    }

    if (targetIdx >= enemies.length) targetIdx = 0;
    if (enemies.length !== 0) {
        renderWord();
        return;
    }

    if (p.fullHealOnWave) {
        p.hp = p.maxHp; p.sld = p.maxSld;
    } else {
        const healPct = (p.waveHealPct + upgradesCount.waveHeal * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('waveHeal', 15) : 15)) / 100;
        if (p.overHealSld > 1.0) {
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * healPct));
            p.sld = Math.min(p.currentMaxSld, p.sld + Math.floor(p.currentMaxSld * healPct));
        } else {
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * healPct));
            p.sld = Math.min(p.maxSld, p.sld + Math.floor(p.maxSld * healPct));
        }
    }

    if (currentWave % 10 === 0) {
        currentWave++;
        triggerStyleCardOverlay();
        return;
    }

    currentWave++;
    const maxWave = config.difficulty === 'extra' || config.difficulty === 'Phantasm' ? 250 : 100;
    if (currentWave > maxWave) {
        clearInterval(stats.intervalId);
        showFinalResult(true);
    } else {
        spawnWave();
    }
}


function activateActiveSkill() {
    const container = document.getElementById('game-container');
    container.style.boxShadow = "0 0 80px #fff";
    setTimeout(() => { container.style.boxShadow = "0 0 30px rgba(0,240,255,0.1)"; }, 300);

    const sk = config.selectedSkill;
    let addDur = p.buffDurationAdd;
    if (sk === 'heal' && p.overHealSld > 1.0) { p.hp = Math.min(p.maxHp, p.hp + 2500); p.sld = Math.min(p.currentMaxSld, p.sld + 2000); p.skillUsesLeft--; }
    else if (sk === 'heal') { p.hp = Math.min(p.maxHp, p.hp + 2500); p.sld = Math.min(p.maxSld, p.sld + 2000); p.skillUsesLeft--; }
    else if (sk === 'rain') p.rainTimer = SKILLS.rain.duration + addDur;
    else if (sk === 'boost') p.boostTimer = SKILLS.boost.duration + addDur;
    else if (sk === 'fever') triggerFever();
    else if (sk === 'reflect') p.reflectCharges = SKILLS.reflect.maxCharges + p.extraReflect;
    updateUI();
}

function triggerFever() {
    if (isFever) { isSuperFever = true; feverTimer += 10;} 
    else { isFever = true; feverTimer = 10; }
    p.fever = 99.9; // 表示上は常に100%に見せる
    if (p.chronoDrive) {
        getCombatEnemies().forEach(en => en.cd += 3.0);
    }
    if (p.feverHealPct > 0) {
        p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * p.feverHealPct));
        p.sld = Math.min(p.maxSld, p.sld + Math.floor(p.maxSld * p.feverHealPct));
    }
}

function updateGameLoop() {
    if (isLevelUpMenuOpen || isCountingDown || gameReadyToStart || document.getElementById('style-overlay').style.display === 'flex' || document.getElementById('result-overlay').style.display === 'flex') return;

    if (feverTimer > 0) {
        let dec = p.feverCostHalf ? 0.05 : 0.1;
        feverTimer -= dec;
        p.fever = (feverTimer / 10) * 100;
        if (feverTimer <= 0) { isFever = false; isSuperFever = false; p.fever = 0; }
    }
    if (p.curseTimer > 0) p.curseTimer = Math.max(0, p.curseTimer - 0.1);
    if (p.rainTimer > 0) p.rainTimer = Math.max(0, p.rainTimer - 0.1);
    if (p.boostTimer > 0) p.boostTimer = Math.max(0, p.boostTimer - 0.1);

    if (isEndlessMode()) updateEndlessSpawning();

    let totalSldRegen = (upgradesCount.shieldRegen * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('shieldRegen', 4) : 4)) + (p.styleSldRegen / 10) + (p.baseSldRegen / 10);
    if(p.overHealSld > 1.0 && totalSldRegen > 0) p.sld = Math.min(p.currentMaxSld, p.sld + totalSldRegen);
    else if (totalSldRegen > 0) p.sld = Math.min(p.maxSld, p.sld + totalSldRegen);
    if (p.overShieldPct > 0) {
        p.maxOverShield = Math.min(p.currentMaxSld * p.overShieldPct);
        let totalOverShieldRegen = Math.min(upgradesCount.shieldRegen * (typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('shieldRegen', 2) : 2) )+ (p.styleSldRegen / 5);
        if (totalOverShieldRegen > 0) p.overShield = Math.min(p.maxOverShield, p.overShield + totalOverShieldRegen);
    }
        if (p.OverShieldPct < 0) p.overShield = 0;

    if (!isFever && !isSuperFever) {
        getCombatEnemies().forEach(en => {
            en.cd -= 0.1;
            if (en.cd <= 0) { executeEnemyAction(en); en.cd = en.cdMax; }
        });
    }

    getCombatEnemies().forEach(en => {
        if (en.role === 'heal' && Math.random() < 0.08) {
            const progress = isEndlessMode() ? Math.max(1, en.power || 1) : currentWave;
            const healAmt = 40 * Math.pow(1.05, progress * 0.1);
            getCombatEnemies().forEach(tEn => { if (tEn.hp < tEn.maxHp) tEn.hp = Math.min(tEn.maxHp, tEn.hp + healAmt); });
        }
    });

    updateUI();
    calculateRealtimeStats();
}

function executeEnemyAction(en) {
    // 【微調整】エネミーのベース火力を下方マイルド調整
    const progress = isEndlessMode() ? (en.power || 1) : currentWave;
    const inflation = isEndlessMode() ? 1.018 : 1.02;
    let scaleDmg = (10 + progress * 8) * Math.pow(inflation, progress - 1);
    let rawDmg = scaleDmg;

    if (en.role === 'curse') {
        let duration = 8;
        duration *= (1 - p.curseReduce);
        if (upgradesCount.curseResist > 0) duration *= (1 - Math.min(0.9, typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore('curseResist', 0.5) : 0.5));
        p.curseTimer = Math.max(0, duration);
        return;
    } else if (en.role === 'boss') {
        en.chargeCount++;
        if (en.chargeCount >= 3) { inflictPlayerDamage(rawDmg * 4); en.chargeCount = 0; } 
        else { inflictPlayerDamage(rawDmg * 1.8); }
    } else if (en.role === 'shield') {
        inflictPlayerDamage(rawDmg * 0.8);
    } else {
        inflictPlayerDamage(rawDmg);
    }
}

function inflictPlayerDamage(rawDmg) {
    // 【仕様変更】共通レアリティボーナスの「ダメージカット」を適用
    if (p.rarityDmgCut > 0) {
        rawDmg *= (1 - p.rarityDmgCut);
    }
    if (p.baseDmgCut > 0) rawDmg *= (1 - p.baseDmgCut);
    if (p.infiniteDefenseLevel > 0) rawDmg *= Math.pow(0.9975, p.infiniteDefenseLevel);
    rawDmg = Math.floor(rawDmg);
    if (rawDmg < 1) rawDmg = 1;

    if (p.reflectCharges > 0) {
        p.reflectCharges--;
        getCombatEnemies().forEach(en => applyDmgToEnemy(en, rawDmg * 2, false));
        checkEnemyDeaths();
        return;
    }

    if (p.flatReflect > 0) {
        getCombatEnemies().forEach(en => applyDmgToEnemy(en, p.flatReflect, false));
        checkEnemyDeaths();
    }
    
    createPlayerFloatingDamage(rawDmg);

    if (p.sld > 0) { p.sld -= rawDmg; if (p.sld < 0) { p.hp += p.sld; p.sld = 0; } } 
    else { p.hp -= rawDmg; }

    if (p.hp <= 0) {
        clearInterval(stats.intervalId);
        showFinalResult(false); // 敗北ゲームオーバー
    }
}

function gainExp(amount) {
    p.exp += amount;
    const oldMaxHp = p.maxHp;
    const oldMaxSld = p.maxSld;
    let levelsGained = 0;

    while (p.exp >= p.nextExp) {
        p.exp -= p.nextExp;
        p.lv++;
        p.nextExp = Math.floor(p.nextExp * 1.20);
        applyLevelGrowth();
        levelsGained++;
    }

    if (levelsGained <= 0) return;

    applyStats();
    // 上昇差分だけ現在値も回復
    if (p.overHealSld > 1.0) {
        p.hp = Math.min(p.maxHp, p.hp + (p.maxHp - oldMaxHp));
        p.sld = Math.min(p.currentMaxSld, p.sld + (p.maxSld - oldMaxSld));
    } else {
        p.hp = Math.min(p.maxHp, p.hp + (p.maxHp - oldMaxHp));
        p.sld = Math.min(p.maxSld, p.sld + (p.maxSld - oldMaxSld));
    }

    // レベルアップ能力コアは即時に選ばず、任意のタイミングでまとめて使える。
    pendingLevelUps += levelsGained;
    updatePendingLevelUpUI();
}

function triggerLevelUpOverlay() {
    if (pendingLevelUps <= 0) {
        isLevelUpMenuOpen = false;
        document.getElementById('lvlup-overlay').style.display = 'none';
        updatePendingLevelUpUI();
        return;
    }
    isLevelUpMenuOpen = true;
    const overlay = document.getElementById('lvlup-overlay');
    const choicesDiv = document.getElementById('lvlup-choices');
    const pendingInfo = document.getElementById('lvlup-pending-info');
    pendingInfo.innerText = `全12種類の能力コアからランダムに3つを検出。残り ${pendingLevelUps} 回分を連続で選択できます。`;
    choicesDiv.innerHTML = '';
    updatePendingLevelUpUI();
    
    let pool = Object.keys(UPGRADE_MASTER);
    let choices = [];
    while (choices.length < 3 && pool.length > 0) {
        let idx = Math.floor(Math.random() * pool.length);
        choices.push(pool.splice(idx, 1)[0]);
    }

    choices.forEach(k => {
        const btn = document.createElement('button');
        const coreMultiplier = typeof getBaseUpgradeLevel === 'function' ? 1 + getBaseUpgradeLevel('coreMastery') * 0.08 : 1;
        btn.className = 'start-btn';
        btn.style.margin = "6px 0";
        btn.style.background = "linear-gradient(135deg, #1e293b, #0f172a)";
        btn.style.border = "2px solid #00f0ff";
        btn.style.color = "#fff";
        btn.innerHTML = `<span style="color:var(--accent-color); font-size:1.15rem;">${UPGRADE_MASTER[k].name}</span> (Lv.${upgradesCount[k]})<br><span style="font-size:0.85rem; font-weight:normal; color:#cbd5e1;">${UPGRADE_MASTER[k].desc}${coreMultiplier > 1 ? `<br><span style="color:var(--fever-color)">精錬補正 x${coreMultiplier.toFixed(2)}</span>` : ''}</span>`;
        btn.onclick = () => {
            upgradesCount[k]++;
            const coreValue = value => typeof scaleLevelUpCore === 'function' ? scaleLevelUpCore(k, value) : value;
            if (k === 'atk') p.rawAtk += coreValue(150);
            if (k === 'maxHp') p.rawMaxHp += coreValue(1500);
            if (k === 'maxSld') p.rawMaxSld += coreValue(1000);
            
            applyStats();
            if (k === 'maxHp') p.hp = p.maxHp;
            if (k === 'maxSld') p.sld = p.maxSld;

            pendingLevelUps--;
            if (pendingLevelUps > 0) {
                triggerLevelUpOverlay();
            } else {
                overlay.style.display = 'none';
                isLevelUpMenuOpen = false;
                updatePendingLevelUpUI();
                document.getElementById('hidden-input').focus();
            }
        };
        choicesDiv.appendChild(btn);
    });
    overlay.style.display = 'flex';
}

function triggerStyleCardOverlay() {
    const overlay = document.getElementById('style-overlay');
    const optDiv = document.getElementById('style-card-options');
    optDiv.innerHTML = '';

    // 既存カードに、ベース端末で解放したカードだけを加えた抽選プールを使用。
    // Phantasmの初回SS確定は従来どおり維持する。
    let pulledCards = typeof pullStyleCards === 'function'
        ? pullStyleCards(3, config.difficulty === 'Phantasm' && currentWave === 1)
        : [];
    pulledCards.forEach(card => {
        const div = document.createElement('div');
        div.className = `style-card-select ${card.rarity}`;
        
        let bonusText = "";
        if (card.rarity === "B") bonusText = "【B級共通】<br>固有効果のみ発動";
        if (card.rarity === "A") bonusText = "【A級共通】<br>HP+10% / 盾+15% / 攻+20<br>ダメカット+10%";
        if (card.rarity === "S") bonusText = "【S級共通】<br>HP+25% / 盾+50%<br>攻+15%+35 / 軽減+25%<br>会心率+30%";
        if (card.rarity === "SS") bonusText = "【SS級共通】<br>HP+35% / 盾+70%<br>攻+35%+100 / 軽減+40%<br>会心率+50% / 会心ダメ+0.5";
        if (card.rarity === "SSS") bonusText = "【SSS級共通】<br>HP+60% / 盾+120%<br>攻+70%+300 / 軽減+55%<br>会心率+65% / 会心ダメ+1.0";

        div.innerHTML = `
            <div>
                <span class="badge-rarity ${card.rarity}">${card.rarity}級</span>
                <h3 style="color:#fff; margin-top:5px; font-size:1.15rem;">${card.name}</h3>
            </div>
            <p style="font-size:0.8rem; color:#cbd5e1; margin:8px 0; line-height:1.3; font-weight:bold; border-bottom:1px solid #334155; padding-bottom:5px;">${card.desc}</p>
            <p style="font-size:0.75rem; color:#94a3b8; line-height:1.3; margin-bottom:10px;">${bonusText}</p>
            <span style="font-size:0.75rem; color:var(--accent-color); font-weight:bold;">[このスタイルを選択]</span>
        `;
        div.onclick = () => {
            resetPassiveStats(); 
            p.currentStyle = card;
            card.eff(p); 
            applyStats(); 
            
            p.hp = p.maxHp;
            p.sld = p.maxSld;
            
            overlay.style.display = 'none';
            resumeAfterStyleSelection();
        };
        optDiv.appendChild(div);
    });

    overlay.style.display = 'flex';
}

function rejectStyleCard() {
    let bonusExp = Math.floor(p.nextExp * 0.5);
    gainExp(bonusExp);
    alert(`現在のスタイルを維持しました。\n保留ボーナスとして、現在の必要経験値の50% (NX +${bonusExp}) を獲得！`);
    document.getElementById('style-overlay').style.display = 'none';
    resumeAfterStyleSelection();
}

function resumeAfterStyleSelection() {
    if (isEndlessMode()) {
        updateUI();
        document.getElementById('hidden-input').focus();
        return;
    }
    if (config.difficulty === 'extra' || config.difficulty === 'Phantasm') {
        if(currentWave > 250) {
            clearInterval(stats.intervalId);
            showFinalResult(true); // 250WAVEクリア
        } else {
            spawnWave();
            updateUI();
            document.getElementById('hidden-input').focus();
        }
    } else if (currentWave > 100) {
        clearInterval(stats.intervalId);
        showFinalResult(true);
    } else {
        spawnWave();
        updateUI();
        document.getElementById('hidden-input').focus();
    }
}

function resetPassiveStats() {
    p.tpGainBst = 0; p.styleVamp = 0; p.styleSldVamp = 0; p.styleCrit = 0; p.curseReduce = 0;
    p.expBstPct = 0; p.flatReflect = 0; p.styleSldRegen = 0; p.feverDmgMult = 0; p.critDmgMult = 3.0;
    p.buffDurationAdd = 0; p.bossDmgMult = 0; p.flatAtkAdd = 0; p.rainAtkUp = false; p.clutchAtk = false;
    p.feverCostHalf = false; p.godSlayer = false; p.fullHealOnWave = false; p.chronoDrive = false;
    p.extraReflect = 0; p.feverGainBst = 0; p.flatHpAdd = 0; p.flatSldAdd = 0; p.styleHpMult = 0; p.styleSldMult = 0; p.styleScoreMult = 0;
    p.waveHealPct = 20 + (typeof getBaseUpgradeLevel === 'function' ? getBaseUpgradeLevel('repairProtocol') * 2 : 0);
    p.overHealSld = 1.0; p.feverHealPct = 0; p.breakGainFever = 0; p.overShieldPct = 0;
}

function calculateRealtimeStats() {
    let elapsedSec = (Date.now() - stats.startTime) / 1000;
    if (elapsedSec <= 0) return;
    let currentKpm = Math.floor((stats.totalKeys / elapsedSec) * 60);
    if (currentKpm > stats.maxKpm) stats.maxKpm = currentKpm; // 最高速度保存
    const endlessInfo = isEndlessMode() ? ` | KILLS: ${endlessKills} | BOUNTY: ${endlessKillScore.toLocaleString()}` : '';
    document.getElementById('monitor').innerText = `DPS: ${Math.floor(stats.totalDmg / elapsedSec)} | KPM: ${currentKpm}${endlessInfo}`;
}

// 【新機能】ゲームオーバー＆全クリア時のリザルト集計・スコア計算処理
function showFinalResult(isWin) {
    document.getElementById('lvlup-overlay').style.display = 'none';
    document.getElementById('style-overlay').style.display = 'none';
    
    const overlay = document.getElementById('result-overlay');
    const title = document.getElementById('res-title');
    const sub = document.getElementById('res-subtitle');
    
    if (isEndlessMode()) {
        title.innerText = '♾️ ENDLESS RECORD ♾️';
        title.style.color = '#fb923c';
        sub.innerText = `侵攻を ${endlessKills} 体で食い止めた。次の記録へ。`;
    } else if (isWin) {
        title.innerText = "🎉 完全制覇 🎉";
        title.style.color = "var(--fever-color)";
        sub.innerText = "神の指を持つタイピスト・ここに新生";
    } else {
        title.innerText = "❌ 作戦失敗 (GAME OVER) ❌";
        title.style.color = "var(--danger-color)";
        sub.innerText = "エネミーの超インフレ暴力に圧倒された...";
    }
    
    const maxWave = config.difficulty === 'extra' || config.difficulty === 'Phantasm' ? 250 : 100;
    const reachedWave = isEndlessMode() ? endlessKills : (isWin ? maxWave : Math.max(1, currentWave - 1));
    document.getElementById('res-wave').innerText = isEndlessMode()
        ? `ENDLESS / ${endlessKills} KILLS`
        : `${reachedWave} / ${maxWave} WAVE`;
    document.getElementById('res-max-kpm').innerText = `${stats.maxKpm} KPM`;
    document.getElementById('res-keys').innerText = `${stats.totalKeys} 回 / ${stats.missKeys} 回`;
    
    let totalAttempts = stats.totalKeys + stats.missKeys;
    let accuracy = totalAttempts > 0 ? (stats.totalKeys / totalAttempts) * 100 : 0;
    document.getElementById('res-accuracy').innerText = `${accuracy.toFixed(2)} %`;
    document.getElementById('res-total-dmg').innerText = stats.totalDmg.toLocaleString();
    
    let diffBonus = 1.0;
    if (config.difficulty === 'easy') diffBonus = 0.5;
    if (config.difficulty === 'hard') diffBonus = 1.5;
    if (config.difficulty === 'lunatic' || config.difficulty === 'Phantasm') diffBonus = 2.5;
    
    // スコア計算式 (100万点を超えるエキサイティング仕様)
    let basePerformance = (stats.totalDmg * 0.2) + (stats.totalKeys * 50);
    let rawScore = basePerformance * (accuracy / 100) * diffBonus;
    // エンドレスでは撃破報酬をそのままスコアへ。通常WAVEの到達報酬は従来どおり。
    let waveBonus = isEndlessMode() ? endlessKillScore : reachedWave * 4000;
    if (isWin && !isEndlessMode()) waveBonus += 200000; // 完全クリアボーナス加算
    
    const scoreMultiplier = (typeof getScoreMultiplier === 'function' ? getScoreMultiplier() : 1) + p.styleScoreMult;
    document.getElementById('res-diff-bonus').innerText = isEndlessMode()
        ? `ENDLESS BOUNTY: ${endlessKillScore.toLocaleString()} / SCORE x${scoreMultiplier.toFixed(2)}`
        : `難易度 x${diffBonus.toFixed(1)} / SCORE x${scoreMultiplier.toFixed(2)}`;
    let finalScore = Math.floor((rawScore + waveBonus) * scoreMultiplier);
    document.getElementById('res-score').innerText = `${finalScore.toLocaleString()} PTS`;
    // ==========================================
    // ✨ ここから追加：ハイスコア・EXP・ランク処理 ✨
    // ==========================================
    
    // 1. ローカルストレージから過去のデータを読み込み（無ければ0）
    let highScore = parseInt(localStorage.getItem('typing_high_score')) || 0;
    let totalExp = parseInt(localStorage.getItem('typing_total_exp')) || 0;

    // 2. ハイスコアの更新チェック
    let isNewRecord = false;
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('typing_high_score', highScore);
        isNewRecord = true;
    }

    // 3. ランク（レベル）の計算設定
    // 100万点を超える仕様なので、とりあえず「200万EXPごとに1ランクアップ」と仮定
    const EXP_PER_RANK = 200000 * 1.5 * 1.5;

    // 今回のスコアを足す前のランクを計算
    let oldRank = Math.floor(totalExp / EXP_PER_RANK) + 1;

    // 経験値（今回のスコア）を累積して保存
    totalExp += finalScore;
    localStorage.setItem('typing_total_exp', totalExp);

    // 足した後の新しいランクを計算
    let newRank = Math.floor(totalExp / EXP_PER_RANK) + 1;
    let isRankUp = newRank > oldRank;

    // 次のランクに上がるために必要な残りEXP
    let nextRankExp = (newRank * EXP_PER_RANK) - totalExp;

    // 4. 画面（リザルト画面）への表示反映
    // ハイスコア表示（新記録なら演出をつける）
    const highScoreEl = document.getElementById('res-high-score');
    if (highScoreEl) {
        highScoreEl.innerText = `${highScore.toLocaleString()} PTS ${isNewRecord ? '🔥 NEW RECORD! 🔥' : ''}`;
    }

    // ユーザーランク表示（ランクアップなら演出をつける）
    const rankEl = document.getElementById('res-rank');
    if (rankEl) {
        rankEl.innerText = `RANK ${newRank} ${isRankUp ? '🎉 RANK UP!! 🎉' : ''}`;
        if (isRankUp) rankEl.style.color = "var(--fever-color)"; // ランクアップ時は目立たせる
    }

    // 次のランクまでの必要経験値表示
    const nextExpEl = document.getElementById('res-next-exp');
    if (nextExpEl) {
        nextExpEl.innerText = `次のランクまであと: ${nextRankExp.toLocaleString()} EXP`;
    }

    // ==========================================
    // ✨ 追加ここまで ✨
    // ==========================================
    if (typeof updateBasePointSummary === 'function') updateBasePointSummary();
    overlay.style.display = 'flex';
    if (typeof submitOnlineRecord === 'function') submitOnlineRecord(highScore, reachedWave);
}

function createFloatingDamage(dmg, enemyCardId, isCrit) {
    const container = document.getElementById('game-container');
    const layer = document.getElementById('effect-layer');
    if (!layer || !container) return;

    const cards = document.getElementsByClassName('enemy-card');
    let targetCard = null;
    for(let card of cards) { if(card.dataset.id == enemyCardId) { targetCard = card; break; } }
    
    let left = container.offsetWidth / 2;
    let top = 160; 

    if (targetCard) {
        const cRect = container.getBoundingClientRect();
        const tRect = targetCard.getBoundingClientRect();
        left = (tRect.left + tRect.width / 2) - cRect.left;
        top = (tRect.top + tRect.height / 3) - cRect.top;
        left += (Math.random() * 40 - 20);
        top += (Math.random() * 20 - 10);
    }

    const num = document.createElement('div');
    num.className = `dmg-num ${isCrit ? 'critical-dmg' : ''}`;
    num.style.left = `${left}px`;
    num.style.top = `${top}px`;
    num.innerText = isCrit ? `💥${dmg}💥` : dmg;
    
    layer.appendChild(num);
    setTimeout(() => num.remove(), 500);
}

function createPlayerFloatingDamage(dmg) {
    const container = document.getElementById('game-container');
    const layer = document.getElementById('effect-layer');
    const playerPanel = document.getElementById('player-panel');
    if (!layer || !container || !playerPanel) return;

    const cRect = container.getBoundingClientRect();
    const pRect = playerPanel.getBoundingClientRect();

    let left = (pRect.left + pRect.width / 4) - cRect.left;
    let top = (pRect.top + pRect.height / 3) - cRect.top;
    left += (Math.random() * 40 - 20);
    top += (Math.random() * 16 - 8);

    const num = document.createElement('div');
    num.className = 'dmg-num player-dmg';
    num.style.left = `${left}px`;
    num.style.top = `${top}px`;
    num.innerText = `-${dmg}`;

    layer.appendChild(num);
    setTimeout(() => num.remove(), 550);
}

function updateUI() {
    document.getElementById('hud-wave').innerText = isEndlessMode() ? 'ENDLESS' : currentWave;
    if (isEndlessMode()) {
        document.getElementById('hud-max-wave').innerText = '∞';
    } else if (config.difficulty === 'extra' || config.difficulty === 'Phantasm') {
        document.getElementById('hud-max-wave').innerText = "250";
    } else {
        document.getElementById('hud-max-wave').innerText = "100";
    }
    document.getElementById('hud-lvl').innerText = p.lv;
    document.getElementById('hp-bar').style.width = `${Math.max(0, (p.hp / p.maxHp)*100)}%`;
    document.getElementById('txt-hp').innerText = `${Math.max(0, Math.floor(p.hp))}/${p.maxHp}`;
    document.getElementById('shield-bar').style.width = `${Math.max(0, (p.sld / p.maxSld)*100)}%`;
    document.getElementById('txt-shield').innerText = `${Math.max(0, Math.floor(p.sld))}/${p.maxSld}`;
    document.getElementById('exp-bar').style.width = `${(p.exp / p.nextExp)*100}%`;
    document.getElementById('txt-exp').innerText = `${Math.floor((p.exp / p.nextExp)*100)}%`;
    document.getElementById('fever-bar').style.width = `${p.fever}%`;
    document.getElementById('tp-bar').style.width = `${p.tp}%`;

    const badgeStyle = document.getElementById('style-badge');
    if (p.currentStyle) {
        badgeStyle.className = "has-style";
        badgeStyle.innerHTML = `装着スタイル: <span style="font-weight:bold; color:var(--accent-color)">[${p.currentStyle.rarity}級] ${p.currentStyle.name}</span><br><span style="font-size:0.75rem; color:#cbd5e1;">${p.currentStyle.desc}</span>`;
    } else {
        badgeStyle.className = "";
        badgeStyle.innerText = isEndlessMode()
            ? `スタイル未装着 (${endlessNextStyleKill} KILLSごとに獲得)`
            : 'スタイル未装着 (10WAVEごとに獲得)';
    }

    if (isEndlessMode()) {
        document.body.className = isSuperFever ? 'sfever-bg' : (isFever ? 'fever-bg' : 'endless-bg');
    } else if (currentWave % 10 !== 0) {
        document.body.className = isSuperFever ? 'sfever-bg' : (isFever ? 'fever-bg' : '');
    }

    const badge = document.getElementById('state-badge');
    if (isSuperFever) { badge.innerText = "OVERDRIVE (x4 DAMAGE)"; badge.style.color = "var(--sfever-color)"; }
    else if (isFever) { badge.innerText = "FEVER TIME (x2 DAMAGE)"; badge.style.color = "var(--fever-color)"; }
    else if (p.curseTimer > 0) { badge.innerText = `CURSED (${p.curseTimer.toFixed(1)}s - ATK 50%)`; badge.style.color = "#e11d48"; }
    else if (isEndlessMode()) {
        badge.innerText = `ENDLESS // KILLS ${endlessKills} // NEXT ${Math.max(0, endlessSpawnTimer).toFixed(1)}s`;
        badge.style.color = '#fb923c';
    } else { badge.innerText = "SYSTEM NORMAL"; badge.style.color = "var(--text-color)"; }

    let skObj = SKILLS[config.selectedSkill];
    let extra = skObj.maxUses ? ` (残り:${p.skillUsesLeft}回)` : "";
    if (p.rainTimer > 0) extra = ` (活性中:${p.rainTimer.toFixed(1)}s)`;
    if (p.boostTimer > 0) extra = ` (活性中:${p.boostTimer.toFixed(1)}s)`;
    if (p.reflectCharges > 0) extra = ` (バリア:${p.reflectCharges}層)`;
    
    document.getElementById('active-skill-info').innerHTML = `
        <strong>【${skObj.name}${extra}】</strong><br>
        ${p.tp >= p.maxTp ? '<span style="color:var(--accent-color); font-weight:bold; text-shadow:0 0 5px #00f0ff;">★ READY [SPACE / ENTER]</span>' : `CHARGE: ${Math.floor(p.tp)}%`}
    `;

    const enArea = document.getElementById('enemies-area');
    enArea.innerHTML = '';
    enemies.forEach((en, index) => {
        const card = document.createElement('div');
        card.className = `enemy-card ${index === targetIdx ? 'target' : ''} ${isSuperFever ? 'sfever-active' : (isFever ? 'fever-active' : '')}`;
        card.dataset.id = en.id;
        card.onclick = () => { targetIdx = index; updateUI(); };

        let roleColor = en.role === 'boss' ? 'background:var(--danger-color); color:white;' : '';
        let bossCharge = en.role === 'boss' && en.chargeCount > 0 ? `<br><span style="color:var(--danger-color); font-size:0.75rem; font-weight:bold;">メガフレアチャージ: ${en.chargeCount}/3</span>` : "";

        card.innerHTML = `
            <div class="enemy-header">
                <div class="enemy-title-set">
                    <span class="enemy-icon">${ENEMY_ROLES[en.role].icon}</span>
                    <div class="enemy-name">${en.name}</div>
                </div>
                <span class="enemy-role-badge" style="${roleColor}">${ENEMY_ROLES[en.role].name}</span>
            </div>
            ${bossCharge}
            <div class="enemy-bars">
                <div class="bar-container" style="height:10px; margin-bottom:4px;"><div class="bar" style="background:var(--danger-color); width:${Math.max(0, (en.hp/en.maxHp)*100)}%;"></div></div>
                ${en.maxSld > 0 ? `<div class="bar-container" style="height:6px; margin-bottom:0;"><div class="bar" style="background:#2563eb; width:${Math.max(0, (en.sld/en.maxSld)*100)}%;"></div></div>` : ''}
            </div>
            <div class="enemy-timer">${Math.max(0, Math.ceil(en.cd))}s</div>
        `;
        enArea.appendChild(card);
    });

    const reserveArea = document.getElementById('reserve-area');
    if (!reserveArea) return;
    reserveArea.replaceChildren();
    if (!isEndlessMode() || reserveEnemies.length === 0) {
        reserveArea.classList.remove('active');
        return;
    }

    reserveArea.classList.add('active');
    const label = document.createElement('div');
    label.className = 'reserve-label';
    label.innerHTML = `控えゾーン<br><strong>${reserveEnemies.length}体</strong><br><small>攻撃参加中</small>`;
    reserveArea.appendChild(label);
    reserveEnemies.forEach(en => {
        const card = document.createElement('div');
        card.className = 'reserve-card';
        const hpPercent = Math.max(0, (en.hp / en.maxHp) * 100);
        card.innerHTML = `
            <div><span>${ENEMY_ROLES[en.role].icon}</span> ${en.name}</div>
            <div class="reserve-role">${ENEMY_ROLES[en.role].name} / ${Math.max(0, Math.ceil(en.cd))}s</div>
            <div class="bar-container"><div class="bar" style="background:var(--danger-color);width:${hpPercent}%;"></div></div>
        `;
        reserveArea.appendChild(card);
    });
}



window.onload = initSetup;

