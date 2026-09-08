/* オンラインランキング・恒久ベース成長。ゲーム本体の戦闘ロジックとは分離して管理する。 */

const ONLINE_CONFIG = window.ROGUELIKE_TYPING_CONFIG || {};
const ONLINE_STORAGE_KEY = 'roguelike_typing_online_profile_v1';
const EXP_PER_RANK_ONLINE = 200000 * 1.5 * 1.5;

const BASE_UPGRADES = {
    hpFrame: {
        name: '生命フレーム', max: 10, cost: 1,
        desc: '開始時の最大HPを +100。難易度ごとの基礎値に加算。'
    },
    shieldFrame: {
        name: 'シールドフレーム', max: 10, cost: 1,
        desc: '開始時の最大シールドを +250。難易度ごとの基礎値に加算。'
    },
    attackCore: {
        name: '打鍵演算コア', max: 10, cost: 1,
        desc: '開始時の基礎攻撃力を +8。'
    },
    repairProtocol: {
        name: '修復プロトコル', max: 8, cost: 1,
        desc: 'WAVEクリア時の回復割合を +2%。'
    },
    coreMastery: {
        name: '能力コア精錬', max: 5, cost: 2,
        desc: 'ゲーム中レベルアップで選ぶ能力コアの数値効果を 1段階ごとに +8%。'
    },
    shieldReactor: {
        name: '防壁リアクター', max: 8, cost: 1,
        desc: '戦闘中、シールドを毎秒 +10 自動修復。'
    },
    combatPlating: {
        name: 'コンバットプレート', max: 5, cost: 2,
        desc: '被ダメージを1段階ごとに 2% 軽減。'
    },
    startingCharge: {
        name: 'スタートチャージ', max: 5, cost: 1,
        desc: '戦闘開始時のTPを +10。'
    },
    startingLevel: {
        name: '初期レベル・ブースター', max: 49, cost: 1,
        desc: '開始レベルを 1 上げる。最大で Lv.50 から出撃可能。',
        statusText: level => `開始レベル: Lv.${level + 1}`
    },
    infiniteAttack: {
        name: '∞ 無限攻撃演算', infinite: true,
        desc: '上限なし。開始時の基礎攻撃力を 1Lvごとに +5。',
        costAt: level => 1 + Math.floor(level / 10),
        statusText: level => `基礎攻撃力 +${level * 5}`
    },
    infiniteDefense: {
        name: '∞ 無限防御演算', infinite: true,
        desc: '上限なし。被ダメージを 1Lvごとに 0.25% 軽減（残存ダメージに乗算）。',
        costAt: level => 1 + Math.floor(level / 10),
        statusText: level => {
            const damageMultiplier = Math.pow(0.9975, level);
            return `被ダメージ x${damageMultiplier.toFixed(3)}（軽減 ${((1 - damageMultiplier) * 100).toFixed(2)}%）`;
        }
    },
    infiniteScore: {
        name: '∞ スコア・アクセラレータ', infinite: true,
        desc: '上限なし。最終スコアを 1Lvごとに +1% 増幅。',
        costAt: level => 1 + Math.floor(level / 10),
        statusText: level => `最終スコア x${(1 + level * 0.01).toFixed(2)}`
    }
};

const CORE_SPECIALIZATIONS = {
    atk: { name: '基礎攻撃力UP', desc: '攻撃力コアの増加量を強化' },
    maxHp: { name: '最大HP拡張', desc: 'HPコアの増加量を強化' },
    maxSld: { name: '最大シールド拡張', desc: 'シールドコアの増加量を強化' },
    waveHeal: { name: 'WAVEクリア回復UP', desc: '回復コアの増加量を強化' },
    vamp: { name: 'タイピング吸血', desc: '吸血コアの回復量を強化' },
    expBst: { name: '経験値ブースト', desc: 'EXPコアの増加量を強化' },
    feverBst: { name: 'フィーバー強化', desc: 'フィーバー倍率の増加量を強化' },
    tpGain: { name: 'TPチャージ加速', desc: 'TPコアの増加量を強化' },
    crit: { name: '会心の一撃', desc: '会心率コアの増加量を強化' },
    shieldRegen: { name: 'シールド毎秒修復', desc: '修復コアの回復量を強化' },
    curseResist: { name: '呪い抵抗力', desc: '呪い耐性コアの軽減量を強化' },
    bossSlayer: { name: 'ボス特攻', desc: 'ボス特攻コアの倍率を強化' }
};

/* 38枚。解放済みのものだけが抽選プールに加わる。 */
const UNLOCKABLE_STYLE_CARDS = [
    { id: 'b_afterimage', rarity: 'B', cost: 1, name: '残像のキー', desc: '正タイプごとにHPを 1 回復', eff: p => p.styleVamp += 1 },
    { id: 'b_tinwall', rarity: 'B', cost: 1, name: '錫の防壁', desc: '最大シールド +250', eff: p => p.flatSldAdd += 250 },
    { id: 'b_hotkey', rarity: 'B', cost: 1, name: 'ホットキー・ストライク', desc: '一打の威力 +75', eff: p => p.flatAtkAdd += 75 },
    { id: 'b_loop', rarity: 'B', cost: 1, name: 'ループ回路', desc: '正タイプ時のTP獲得量 +8%', eff: p => p.tpGainBst += 0.08 },
    { id: 'b_scout', rarity: 'B', cost: 1, name: '探索者のメモリ', desc: '敵撃破EXP +8%', eff: p => p.expBstPct += 0.08 },
    { id: 'b_patch', rarity: 'B', cost: 1, name: '応急パッチ', desc: 'WAVEクリア回復割合 +5%', eff: p => p.waveHealPct += 5 },
    { id: 'b_coolant', rarity: 'B', cost: 1, name: '冷却フィン', desc: 'シールドが毎秒 5 自動再生', eff: p => p.styleSldRegen += 5 },
    { id: 'b_spark', rarity: 'B', cost: 1, name: '火花のコンデンサ', desc: '正タイプ時のフィーバー上昇量 +8%', eff: p => p.feverGainBst += 0.08 },
    { id: 'b_charm', rarity: 'B', cost: 1, name: '護符アルゴリズム', desc: '呪いの持続時間を 15% 短縮', eff: p => p.curseReduce += 0.15 },

    { id: 'a_bloodcode', rarity: 'A', cost: 2, name: 'ブラッドコード', desc: '正タイプごとにHPを 4 回復', eff: p => p.styleVamp += 4 },
    { id: 'a_prism', rarity: 'A', cost: 2, name: 'プリズム照準', desc: 'クリティカル率 +5%', eff: p => p.styleCrit += 0.05 },
    { id: 'a_ironwill', rarity: 'A', cost: 2, name: 'アイアンウィル', desc: '最大HP +400 / 最大シールド +600', eff: p => { p.flatHpAdd += 400; p.flatSldAdd += 600; } },
    { id: 'a_overclock', rarity: 'A', cost: 2, name: 'オーバークロック', desc: '一打の威力 +180', eff: p => p.flatAtkAdd += 180 },
    { id: 'a_gale', rarity: 'A', cost: 2, name: '疾風のアンプ', desc: 'フィーバー上昇量 +18%、TP獲得量 +12%', eff: p => { p.feverGainBst += 0.18; p.tpGainBst += 0.12; } },
    { id: 'a_recovery', rarity: 'A', cost: 2, name: 'ナノ・リカバリー', desc: 'シールドが毎秒 15 自動再生', eff: p => p.styleSldRegen += 15 },
    { id: 'a_tactician', rarity: 'A', cost: 2, name: 'タクティシャン', desc: '敵撃破EXP +18%、WAVE回復 +8%', eff: p => { p.expBstPct += 0.18; p.waveHealPct += 8; } },
    { id: 'a_reflector', rarity: 'A', cost: 2, name: '反照フィールド', desc: 'アクティブスキル使用時、反射バリアを 1 層追加', eff: p => p.extraReflect += 1 },
    { id: 'a_dawn', rarity: 'A', cost: 2, name: '暁のプロトコル', desc: '最大HP +700、呪い持続を 30% 短縮', eff: p => { p.flatHpAdd += 700; p.curseReduce += 0.30; } },

    { id: 's_graviton', rarity: 'S', cost: 4, name: 'グラビトン・ハンマー', desc: '一打の威力 +550。ボスへの与ダメージ +50%', eff: p => { p.flatAtkAdd += 550; p.bossDmgMult += 0.5; } },
    { id: 's_lifeline', rarity: 'S', cost: 4, name: 'ライフライン∞', desc: '正タイプごとにHPを 9 回復、WAVE回復 +15%', eff: p => { p.styleVamp += 9; p.waveHealPct += 15; } },
    { id: 's_aegis', rarity: 'S', cost: 4, name: 'イージス・リンク', desc: '最大シールド +1800、毎秒 35 自動再生', eff: p => { p.flatSldAdd += 1800; p.styleSldRegen += 35; } },
    { id: 's_zerohour', rarity: 'S', cost: 4, name: 'ゼロアワー', desc: 'フィーバー消費速度が半分。フィーバー上昇量 +20%', eff: p => { p.feverCostHalf = true; p.feverGainBst += 0.20; } },
    { id: 's_rainmaker', rarity: 'S', cost: 4, name: 'レインメーカー', desc: 'レイン中に攻撃力 +30%、TP獲得量 +25%', eff: p => { p.rainAtkUp = true; p.tpGainBst += 0.25; } },
    { id: 's_luckyseven', rarity: 'S', cost: 4, name: 'ラッキーセブン', desc: 'クリティカル率 +18%、クリティカルダメージ +0.3', eff: p => { p.styleCrit += 0.18; p.critDmgMult += 0.3; } },

    { id: 'ss_singularity', rarity: 'SS', cost: 7, name: '★特異点シンギュラリティ', desc: '一打の威力 +1800、フィーバー中の追加倍率 +0.5', eff: p => { p.flatAtkAdd += 1800; p.feverDmgMult += 0.5; } },
    { id: 'ss_rebirth', rarity: 'SS', cost: 7, name: '★リバース・オラクル', desc: 'WAVEクリア時にHPとシールドを全回復', eff: p => p.fullHealOnWave = true },
    { id: 'ss_ark', rarity: 'SS', cost: 7, name: '★アーク・バスティオン', desc: '最大HP +1800 / 最大シールド +3500、毎秒 80 自動再生', eff: p => { p.flatHpAdd += 1800; p.flatSldAdd += 3500; p.styleSldRegen += 80; } },
    { id: 'ss_lastword', rarity: 'SS', cost: 7, name: '★ラストワード', desc: 'ボスへの与ダメージ 3倍、クリティカル率 +20%', eff: p => { p.godSlayer = true; p.styleCrit += 0.20; } },

    { id: 'sss_omega', rarity: 'SSS', cost: 12, name: '★★オメガ・オーバードライブ', desc: '一打の威力 +5000。フィーバー中の追加倍率 +1.0', eff: p => { p.flatAtkAdd += 5000; p.feverDmgMult += 1.0; } },
    { id: 'sss_yggdrasil', rarity: 'SSS', cost: 12, name: '★★生命樹ユグドラシル', desc: '正タイプごとにHPを 30 回復。WAVE回復 +40%', eff: p => { p.styleVamp += 30; p.waveHealPct += 40; } },
    { id: 'sss_bastion', rarity: 'SSS', cost: 12, name: '★★零式アークシールド', desc: '最大シールド +7000、シールドが毎秒 150 自動再生', eff: p => { p.flatSldAdd += 7000; p.styleSldRegen += 150; } },
    { id: 'sss_voidfang', rarity: 'SSS', cost: 12, name: '★★星喰らいの牙', desc: 'ボスへの与ダメージ 3倍、一打の威力 +2200', eff: p => { p.godSlayer = true; p.flatAtkAdd += 2200; } },
    { id: 'sss_chrono', rarity: 'SSS', cost: 12, name: '★★時空断層クロノス', desc: 'フィーバー消費速度が半分。フィーバー突入時に敵の攻撃を遅延', eff: p => { p.feverCostHalf = true; p.chronoDrive = true; } },
    { id: 'sss_phoenix', rarity: 'SSS', cost: 12, name: '★★不死鳥プロトコル', desc: 'WAVEクリア時にHP・シールドを全回復。フィーバー突入時も80%回復', eff: p => { p.fullHealOnWave = true; p.feverHealPct = 0.8; } },
    { id: 'sss_prometheus', rarity: 'SSS', cost: 12, name: '★★プロメテウス・コード', desc: 'クリティカル率 +35%、クリティカルダメージ +1.0', eff: p => { p.styleCrit += 0.35; p.critDmgMult += 1.0; } },
    { id: 'sss_singularity', rarity: 'SSS', cost: 12, name: '★★イベントホライゾン', desc: '最大HP・最大シールドをさらに +60% 増幅', eff: p => { p.styleHpMult += 0.60; p.styleSldMult += 0.60; } },
    { id: 'sss_cascade', rarity: 'SSS', cost: 12, name: '★★無限連鎖コア', desc: 'TP獲得量 +60%、フィーバー上昇量 +60%、EXP +35%', eff: p => { p.tpGainBst += 0.60; p.feverGainBst += 0.60; p.expBstPct += 0.35; } },
    { id: 'sss_terminal', rarity: 'SSS', cost: 12, name: '★★終端の福音', desc: '最終スコア +35%、反射ダメージ +2500', eff: p => { p.styleScoreMult += 0.35; p.flatReflect += 2500; } }
];

function safeReadOnlineProfile() {
    try {
        const stored = JSON.parse(localStorage.getItem(ONLINE_STORAGE_KEY) || '{}');
        return stored && typeof stored === 'object' ? stored : {};
    } catch (_) {
        return {};
    }
}

function makeUid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `rt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOnlineProfile() {
    const profile = safeReadOnlineProfile();
    return {
        uid: typeof profile.uid === 'string' && profile.uid ? profile.uid : makeUid(),
        username: typeof profile.username === 'string' ? profile.username : '',
        // 接続先は config.js の固定値だけを使う。localStorage の旧設定は参照しない。
        endpoint: ONLINE_CONFIG.rankingEndpoint || '',
        spentPoints: Number.isFinite(profile.spentPoints) ? profile.spentPoints : 0,
        baseLevels: profile.baseLevels && typeof profile.baseLevels === 'object' ? profile.baseLevels : {},
        coreSpecializations: profile.coreSpecializations && typeof profile.coreSpecializations === 'object' ? profile.coreSpecializations : {},
        unlockedStyleIds: Array.isArray(profile.unlockedStyleIds) ? profile.unlockedStyleIds : []
    };
}

function saveOnlineProfileData(profile) {
    localStorage.setItem(ONLINE_STORAGE_KEY, JSON.stringify(profile));
}

function ensureOnlineProfile() {
    const raw = safeReadOnlineProfile();
    if (!raw.uid) saveOnlineProfileData(getOnlineProfile());
}

function getCurrentUserRank() {
    const totalExp = parseInt(localStorage.getItem('typing_total_exp'), 10) || 0;
    return Math.floor(totalExp / EXP_PER_RANK_ONLINE) + 1;
}

function getEarnedBasePoints() {
    return Math.max(0, (getCurrentUserRank() - 1) * 2);
}

function getAvailableBasePoints() {
    return Math.max(0, getEarnedBasePoints() - getOnlineProfile().spentPoints);
}

function getBaseUpgradeLevel(id) {
    const value = Number(getOnlineProfile().baseLevels[id] || 0);
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function getBaseUpgradeCost(upgrade, level) {
    return typeof upgrade.costAt === 'function' ? upgrade.costAt(level) : upgrade.cost;
}

function isBaseUpgradeMaxed(upgrade, level) {
    return !upgrade.infinite && level >= upgrade.max;
}

function getCoreSpecializationLevel(id) {
    const value = Number(getOnlineProfile().coreSpecializations?.[id] || 0);
    return Number.isFinite(value) ? value : 0;
}

/* 全体精錬と個別調律を合算して、レベルアップ能力コアの数値を強化する。 */
function scaleLevelUpCore(id, value) {
    if (value === undefined) { value = id; id = ''; }
    return value * (1 + getBaseUpgradeLevel('coreMastery') * 0.08 + getCoreSpecializationLevel(id) * 0.12);
}

function applyPersistentBaseStats() {
    p.rawMaxHp += getBaseUpgradeLevel('hpFrame') * 100;
    p.rawMaxSld += getBaseUpgradeLevel('shieldFrame') * 250;
    p.rawAtk += getBaseUpgradeLevel('attackCore') * 8;
    p.waveHealPct = 20 + getBaseUpgradeLevel('repairProtocol') * 2;
    p.baseSldRegen = getBaseUpgradeLevel('shieldReactor') * 10;
    p.baseDmgCut = getBaseUpgradeLevel('combatPlating') * 0.02;
    p.tp = getBaseUpgradeLevel('startingCharge') * 10;
    p.rawAtk += getBaseUpgradeLevel('infiniteAttack') * 5;
    // 無限防御は残存ダメージに0.25%ずつ乗算し、100%軽減に到達しないようにする。
    p.infiniteDefenseLevel = getBaseUpgradeLevel('infiniteDefense');
    p.startingLevel = Math.min(50, 1 + getBaseUpgradeLevel('startingLevel'));
}

function getScoreMultiplier() {
    return 1 + getBaseUpgradeLevel('infiniteScore') * 0.01;
}

function updateBasePointSummary() {
    const el = document.getElementById('top-base-points');
    if (el) el.textContent = `ベースポイント: ${getAvailableBasePoints()} PT（獲得 ${getEarnedBasePoints()} / 使用 ${getOnlineProfile().spentPoints}）`;
}

function setBaseTerminalMessage(message) {
    const el = document.getElementById('base-point-summary');
    if (el) el.textContent = message || `利用可能ポイント: ${getAvailableBasePoints()} PT　（ランクアップ1回につき +2 PT）`;
}

function renderBaseUpgradeTerminal(message = '') {
    const profile = getOnlineProfile();
    setBaseTerminalMessage(message);
    const baseList = document.getElementById('base-upgrade-list');
    const cardList = document.getElementById('style-unlock-list');
    if (!baseList || !cardList) return;

    baseList.replaceChildren();
    Object.entries(BASE_UPGRADES).forEach(([id, data]) => {
        const level = getBaseUpgradeLevel(id);
        const isMaxed = isBaseUpgradeMaxed(data, level);
        const cost = getBaseUpgradeCost(data, level);
        const levelCap = data.infinite ? '∞' : data.max;
        const status = typeof data.statusText === 'function' ? `<br>${data.statusText(level)}` : '';
        const card = document.createElement('article');
        card.className = `base-upgrade-card${data.infinite ? ' infinite-upgrade' : ''}`;
        card.innerHTML = `<div><h4>${data.name}</h4><p>${data.desc}</p><div class="level-info">Lv.${level} / ${levelCap}${status}</div></div>`;
        const button = document.createElement('button');
        button.className = 'purchase-btn';
        button.textContent = isMaxed ? 'MAX' : `${cost} PTで強化`;
        button.disabled = isMaxed || getAvailableBasePoints() < cost;
        button.addEventListener('click', () => purchaseBaseUpgrade(id));
        card.appendChild(button);
        baseList.appendChild(card);
    });

    const coreList = document.getElementById('core-specialization-list');
    if (coreList) {
        coreList.replaceChildren();
        Object.entries(CORE_SPECIALIZATIONS).forEach(([id, core]) => {
            const level = Math.min(3, Number(profile.coreSpecializations?.[id] || 0));
            const card = document.createElement('article');
            card.className = 'core-specialization-card';
            card.innerHTML = `<div><h4>${core.name}</h4><p>${core.desc}<br>現在: +${level * 12}%（Lv.${level}/3）</p></div>`;
            const button = document.createElement('button');
            button.className = 'purchase-btn';
            button.textContent = level >= 3 ? 'MAX' : '1 PTで調律';
            button.disabled = level >= 3 || getAvailableBasePoints() < 1;
            button.addEventListener('click', () => purchaseCoreSpecialization(id));
            card.appendChild(button);
            coreList.appendChild(card);
        });
    }

    const unlocked = new Set(profile.unlockedStyleIds);
    const countEl = document.getElementById('style-unlock-count');
    if (countEl) countEl.textContent = `(${unlocked.size} / ${UNLOCKABLE_STYLE_CARDS.length})`;
    cardList.replaceChildren();
    UNLOCKABLE_STYLE_CARDS.forEach(cardData => {
        const isUnlocked = unlocked.has(cardData.id);
        const card = document.createElement('article');
        card.className = `unlock-card ${cardData.rarity}${isUnlocked ? ' unlocked' : ''}`;
        card.innerHTML = `<div><h4><span class="rarity-label ${cardData.rarity}">${cardData.rarity}</span>${cardData.name}</h4><p>${cardData.desc}</p></div>`;
        const button = document.createElement('button');
        button.className = 'purchase-btn';
        button.textContent = isUnlocked ? '解放済み' : `${cardData.cost} PTで解放`;
        button.disabled = isUnlocked || getAvailableBasePoints() < cardData.cost;
        button.addEventListener('click', () => purchaseStyleCard(cardData.id));
        card.appendChild(button);
        cardList.appendChild(card);
    });
}

function purchaseBaseUpgrade(id) {
    const upgrade = BASE_UPGRADES[id];
    if (!upgrade) return;
    const profile = getOnlineProfile();
    const current = getBaseUpgradeLevel(id);
    const cost = getBaseUpgradeCost(upgrade, current);
    if (isBaseUpgradeMaxed(upgrade, current)) return renderBaseUpgradeTerminal(`${upgrade.name} はすでに最大です。`);
    if (getAvailableBasePoints() < cost) return renderBaseUpgradeTerminal('ベースポイントが足りません。ランクを上げると 2 PT 獲得します。');
    profile.baseLevels[id] = current + 1;
    profile.spentPoints += cost;
    saveOnlineProfileData(profile);
    updateBasePointSummary();
    renderBaseUpgradeTerminal(`${upgrade.name} を Lv.${current + 1} に強化しました。`);
}

function purchaseStyleCard(id) {
    const style = UNLOCKABLE_STYLE_CARDS.find(card => card.id === id);
    if (!style) return;
    const profile = getOnlineProfile();
    if (profile.unlockedStyleIds.includes(id)) return renderBaseUpgradeTerminal(`${style.name} はすでに解放済みです。`);
    if (getAvailableBasePoints() < style.cost) return renderBaseUpgradeTerminal('ベースポイントが足りません。ランクを上げると 2 PT 獲得します。');
    profile.unlockedStyleIds.push(id);
    profile.spentPoints += style.cost;
    saveOnlineProfileData(profile);
    updateBasePointSummary();
    renderBaseUpgradeTerminal(`【${style.rarity}】${style.name} を解放しました。以後、スタイル抽選に出現します。`);
}

function purchaseCoreSpecialization(id) {
    const core = CORE_SPECIALIZATIONS[id];
    if (!core) return;
    const profile = getOnlineProfile();
    profile.coreSpecializations = profile.coreSpecializations && typeof profile.coreSpecializations === 'object' ? profile.coreSpecializations : {};
    const current = Number(profile.coreSpecializations[id] || 0);
    if (current >= 3) return renderBaseUpgradeTerminal(`${core.name} はすでに最大です。`);
    if (getAvailableBasePoints() < 1) return renderBaseUpgradeTerminal('ベースポイントが足りません。ランクを上げると 2 PT 獲得します。');
    profile.coreSpecializations[id] = current + 1;
    profile.spentPoints += 1;
    saveOnlineProfileData(profile);
    updateBasePointSummary();
    renderBaseUpgradeTerminal(`${core.name} を個別調律 Lv.${current + 1} に強化しました。`);
}

function openBaseUpgradeOverlay() {
    renderBaseUpgradeTerminal();
    document.getElementById('base-overlay').style.display = 'flex';
}

function enterGameSetup() {
    document.getElementById('lobby-screen').classList.remove('active');
    document.getElementById('setup-screen').classList.add('active');
}

function backToLobby() {
    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('lobby-screen').classList.add('active');
}

function closeHubOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.style.display = 'none';
}

function getUnlockedCardsByRarity(rarity) {
    const unlocked = new Set(getOnlineProfile().unlockedStyleIds);
    return UNLOCKABLE_STYLE_CARDS.filter(card => card.rarity === rarity && unlocked.has(card.id));
}

function getStyleCardPool(rarity) {
    const originalCards = STYLE_CARDS[rarity] || [];
    return [...originalCards, ...getUnlockedCardsByRarity(rarity)].map(card => ({ ...card, rarity }));
}

function chooseStyleRarity(forceSS = false) {
    if (forceSS && getStyleCardPool('SS').length) return 'SS';
    const weighted = [
        { rarity: 'B', weight: 0.18 }, { rarity: 'A', weight: 0.40 },
        { rarity: 'S', weight: 0.28 }, { rarity: 'SS', weight: 0.11 },
        { rarity: 'SSS', weight: 0.03 }
    ].filter(item => getStyleCardPool(item.rarity).length);
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of weighted) {
        roll -= item.weight;
        if (roll <= 0) return item.rarity;
    }
    return weighted[weighted.length - 1].rarity;
}

function pullStyleCards(count, forceSS = false) {
    const pulled = [];
    for (let attempts = 0; pulled.length < count && attempts < 120; attempts++) {
        const pool = getStyleCardPool(chooseStyleRarity(forceSS)).filter(card => !pulled.some(pulledCard => pulledCard.id === card.id));
        if (pool.length) pulled.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    if (pulled.length < count) {
        const allCards = ['B', 'A', 'S', 'SS', 'SSS'].flatMap(getStyleCardPool).filter(card => !pulled.some(pulledCard => pulledCard.id === card.id));
        while (pulled.length < count && allCards.length) pulled.push(allCards.splice(Math.floor(Math.random() * allCards.length), 1)[0]);
    }
    return pulled;
}

function openProfileOverlay() {
    const profile = getOnlineProfile();
    document.getElementById('profile-name').value = profile.username;
    document.getElementById('profile-uid').value = profile.uid;
    document.getElementById('profile-endpoint').value = ONLINE_CONFIG.rankingEndpoint || '';
    document.getElementById('profile-overlay').style.display = 'flex';
}

function saveOnlineProfile() {
    const profile = getOnlineProfile();
    profile.username = document.getElementById('profile-name').value.trim().slice(0, 20);
    // UID と GAS URL は画面・保存処理の両方で固定。変更できるのは表示名だけ。
    profile.endpoint = ONLINE_CONFIG.rankingEndpoint || '';
    saveOnlineProfileData(profile);
    closeHubOverlay('profile-overlay');
    updateBasePointSummary();
}

function getRankingEndpoint() {
    const endpoint = ONLINE_CONFIG.rankingEndpoint || '';
    return endpoint.startsWith('https://') ? endpoint : '';
}

function setRankingStatus(message) {
    const el = document.getElementById('ranking-status');
    if (el) el.textContent = message;
}

function normalizeNumber(value) {
    const number = Number(String(value ?? 0).replace(/,/g, ''));
    return Number.isFinite(number) ? Math.floor(number) : 0;
}

function normalizeRankingRow(row) {
    if (Array.isArray(row)) return { uid: String(row[0] ?? ''), username: String(row[1] ?? 'NO NAME'), score: normalizeNumber(row[2]), wave: normalizeNumber(row[3]) };
    const data = row && typeof row === 'object' ? row : {};
    return {
        uid: String(data.uid ?? data.UID ?? data.userId ?? data.id ?? ''),
        username: String(data.username ?? data.userName ?? data.name ?? data['ユーザー名'] ?? 'NO NAME'),
        score: normalizeNumber(data.highScore ?? data.score ?? data['最高スコア']),
        wave: normalizeNumber(data.maxWave ?? data.wave ?? data['最高到達ウェーブ'])
    };
}

function extractRankingRows(payload) {
    const rows = Array.isArray(payload) ? payload : (payload?.ranking || payload?.rows || payload?.data || []);
    return Array.isArray(rows) ? rows.map(normalizeRankingRow).sort((a, b) => b.score - a.score || b.wave - a.wave) : [];
}

function renderRanking(rows) {
    const body = document.getElementById('ranking-body');
    if (!body) return;
    body.replaceChildren();
    const myUid = getOnlineProfile().uid;
    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        if (row.uid && row.uid === myUid) tr.className = 'me';
        [index + 1, row.username, `${row.score.toLocaleString()} PTS`, `${row.wave} WAVE`].forEach(value => {
            const td = document.createElement('td');
            td.textContent = String(value);
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

async function fetchWithTimeout(url, options = {}) {
    const timeout = Number(ONLINE_CONFIG.requestTimeoutMs) || 10000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function loadOnlineRanking() {
    const endpoint = getRankingEndpoint();
    if (!endpoint) {
        setRankingStatus('GAS ウェブアプリ URL が未設定です。config.js の固定設定を確認してください。');
        renderRanking([]);
        return;
    }
    setRankingStatus('ランキングを読み込んでいます…');
    try {
        const url = new URL(endpoint);
        url.searchParams.set('action', ONLINE_CONFIG.listAction || 'ranking');
        url.searchParams.set('_', String(Date.now()));
        const response = await fetchWithTimeout(url.toString(), { method: 'GET', redirect: 'follow' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rows = extractRankingRows(await response.json());
        renderRanking(rows);
        setRankingStatus(rows.length ? `全 ${rows.length} 件を表示中（最高スコア順）` : 'ランキングはまだ空です。');
    } catch (error) {
        renderRanking([]);
        setRankingStatus(`ランキングを取得できませんでした: ${error.message}`);
    }
}

function openRankingOverlay() {
    document.getElementById('ranking-overlay').style.display = 'flex';
    loadOnlineRanking();
}

async function submitOnlineRecord(highScore, maxWave) {
    const status = document.getElementById('res-online-status');
    const endpoint = getRankingEndpoint();
    if (!endpoint) {
        if (status) status.textContent = 'ランキング未送信（GAS URL が未設定）';
        return;
    }
    const profile = getOnlineProfile();
    const payload = {
        action: ONLINE_CONFIG.submitAction || 'submit',
        uid: profile.uid,
        username: profile.username || 'NO NAME',
        userName: profile.username || 'NO NAME',
        highScore: highScore,
        score: highScore,
        maxWave: maxWave,
        wave: maxWave,
        updatedAt: new Date().toISOString()
    };
    if (status) status.textContent = 'オンラインランキングに送信中…';
    try {
        const response = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (status) status.textContent = 'オンラインランキングへ送信しました。';
    } catch (error) {
        if (status) status.textContent = `ランキング送信に失敗: ${error.message}`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ensureOnlineProfile();
    updateBasePointSummary();
});
