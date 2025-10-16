const playerHPElement = document.getElementById('playerHP');
const playerEvasionElement = document.getElementById('playerEvasion');
const enemyEvasionDisplay = document.getElementById('enemyEvasionDisplay');
const enemyEvasionElement = document.getElementById('enemyEvasion');
const playerMinATKElement = document.getElementById('playerMinATK');
const playerMaxATKElement = document.getElementById('playerMaxATK');
const playerSpeedElement = document.getElementById('playerSpeed');
const playerCritChanceDisplay = document.getElementById('playerCritChanceDisplay');
const playerCritChanceElement = document.getElementById('playerCritChance');
const playerCritDamageDisplay = document.getElementById('playerCritDamageDisplay');
const playerCritDamageElement = document.getElementById('playerCritDamage');
const playerProfessionTitle = document.getElementById('playerProfessionTitle');
const playerReflectDamageDisplay = document.getElementById('playerReflectDamageDisplay');
const playerReflectDamageElement = document.getElementById('playerReflectDamage');
const playerBleedDisplay = document.getElementById('playerBleedDisplay');
const playerBleedChanceElement = document.getElementById('playerBleedChance');
const playerBleedDamageElement = document.getElementById('playerBleedDamage');
const enemyHPElement = document.getElementById('enemyHP');
const enemyMinATKElement = document.getElementById('enemyMinATK');
const enemyMaxATKElement = document.getElementById('enemyMaxATK');
const enemySpeedElement = document.getElementById('enemySpeed');
const enemyNameElement = document.getElementById('enemyName');
const enemyBleedStatus = document.getElementById('enemyBleedStatus');
const enemyBleedTurns = document.getElementById('enemyBleedTurns');
const enemyBleedDamageApplied = document.getElementById('enemyBleedDamageApplied');
const currentWaveElement = document.getElementById('currentWave');
const dimensionDisplayElement = document.getElementById('dimensionDisplay');
const playerLevelElement = document.getElementById('playerLevel');
const playerSPElement = document.getElementById('playerSP');
const playerXPElement = document.getElementById('playerXP');
const playerNextLevelXPElement = document.getElementById('playerNextLevelXP');
const attackButton = document.getElementById('attackButton');
const gameMessage = document.getElementById('gameMessage');
const currentMoneyElement = document.getElementById('currentMoney');
const playerChar = document.getElementById('playerChar');
const enemyChar = document.getElementById('enemyChar');
const battleArea = document.getElementById('battleArea');
const shopContainer = document.getElementById('shopContainer');
const tabUpgrades = document.getElementById('tabUpgrades');
const tabTalents = document.getElementById('tabTalents');
const tabSynthesis = document.getElementById('tabSynthesis');
const tabAbilities = document.getElementById('tabAbilities');
const tabBackpack = document.getElementById('tabBackpack');
const contentUpgrades = document.getElementById('contentUpgrades');
const contentTalents = document.getElementById('contentTalents');
const contentSynthesis = document.getElementById('contentSynthesis');
const contentAbilities = document.getElementById('contentAbilities');
const contentBackpack = document.getElementById('contentBackpack');
const talentTreeContainer = document.getElementById('talentTreeContainer');
const buyAttackButton = document.getElementById('buyAttack');
const buyMaxHPButton = document.getElementById('buyMaxHP');
const buySpeedButton = document.getElementById('buySpeed');
const buyCritDamageButton = document.getElementById('buyCritDamage');
const buyHealButton = document.getElementById('buyHeal');
const buyXPButton = document.getElementById('buyXP');
const buyReflectDamageButton = document.getElementById('buyReflectDamage');
const buyBleedButton = document.getElementById('buyBleed');
const buyEvasionButton = document.getElementById('buyEvasion');
const buyRandomUpgradeButton = document.getElementById('buyRandomUpgrade');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const resetButton = document.getElementById('resetButton');
const eventOverlay = document.getElementById('eventOverlay');
const eventPanel = document.getElementById('eventPanel');
const eventTitle = document.getElementById('eventTitle');
const eventDescription = document.getElementById('eventDescription');
const eventOptions = document.getElementById('eventOptions');
const reflectDamageShopItem = document.getElementById('reflectDamageShopItem');
const bleedShopItem = document.getElementById('bleedShopItem');
const attackUpgradeShopItem = document.getElementById('attackUpgradeShopItem');
const attackUpgradeDescription = document.getElementById('attackUpgradeDescription');
const attackUpgradeCost = document.getElementById('attackUpgradeCost');
const maxHPUpgradeShopItem = document.getElementById('maxHPUpgradeShopItem');
const maxHPUpgradeDescription = document.getElementById('maxHPUpgradeDescription');
const maxHPUpgradeCost = document.getElementById('maxHPUpgradeCost');
const critDamageShopItem = document.getElementById('critDamageShopItem');
const healShopItem = document.getElementById('healShopItem');
const characterSelectionOverlay = document.getElementById('characterSelectionOverlay');
const trialSelectionOverlay = document.getElementById('trialSelectionOverlay');
const trialOptionsContainer = document.getElementById('trialOptionsContainer');
const difficultyOptions = document.querySelectorAll('.difficulty-option');
const normalQuestListElement = document.getElementById('normalQuestList');
const transferQuestListElement = document.getElementById('transferQuestList');
const themeToggleBtn = document.getElementById('themeToggleBtn');
let player;
let currentEnemy = {};
let currentWave = 1;
let currentMoney = 400;
let currentDimension = 'normal';
let isBattleInProgress = false;
let currentTurnAbilityApplied = null;
let enemyBleedStatusData = null;
let futureEvents = [];
let activeNormalQuests = [];
let activeTransferQuests = [];
let gameDifficulty = { enemyMultiplier: 1.0, moneyMultiplier: 1.5 };
let turnsAgainstBoss = 0;
let currentItemCosts = {};
let selectedDifficulty = 'easy';
let selectedCharacterType = null;
let activeTrial = null;
let shortLivedTrialTimer = null;
let shortLivedTrialTimeRemaining = 60;
const baseItemValues = {
  attackUpgrade: { cost: 100, amount: 5, description: "永久提升攻擊力 5 點" },
  maxHPUpgrade: { cost: 120, amount: 20, description: "永久提升血量上限 20 點" },
    speedUpgrade: { cost: 80, amount: 0.5, description: "永久提升速度 0.5 點" },
  evasionUpgrade: { cost: 1000, amount: 1, description: "永久提升閃避 1%" },
  critDamageUpgrade: { cost: 50, amount: 0.1, description: "永久提升爆擊傷害 0.1x" },
  heal: { cost: 30, amount: 50, description: "回復 50 點生命值 (不超過上限)", type: "fixed" },
  buyXP: { cost: 50, amount: 150, description: "獲得 150 經驗值" },
  reflectDamageUpgrade: { cost: 50, amount: 3, description: "永久提升反傷 3%" },
  bleedUpgrade: { cost: 50, amountChance: 1, amountDamage: 1, description: "流血機率 +1%，傷害 +1%" }
};
const fragmentStats = { "瘦弱方塊碎片": { hp: 5, atk: -3, spd: 0 }, "普通方塊碎片": { hp: 10, atk: 3, spd: 0 }, "強壯方塊碎片": { hp: 20, atk: 5, spd: 0 }, "精英方塊碎片": { hp: 50, atk: 10, spd: 0 }, "魔王方塊碎片": { hp: 100, atk: 0, spd: 1 }, "強劍方塊碎片": { hp: -50, atk: 100, spd: 0 }, "強盾方塊碎片": { hp: 500, atk: -50, spd: 0 }, "鋼劍方塊碎片": { hp: -300, atk: 800, spd: 0 }, "鋼盾方塊碎片": { hp: 2500, atk: -50, spd: -2 }, "神劍方塊碎片": { hp: -1000, atk: 2500, spd: 5 }, "神盾方塊碎片": { hp: 10000, atk: -100, spd: -5 }, "遠古方塊碎片": { hp: 60, atk: 10, spd: -2 }, "遠古巨獸方塊碎片": { hp: 200, atk: 25, spd: -3 }, "史前暴虐方塊碎片": { hp: 500, atk: 50, spd: -5 }, "未來科技方塊碎片": { hp: 20, atk: 15, spd: 4 }, "未來哨兵方塊碎片": { hp: 40, atk: 30, spd: 6 }, "量子糾纏方塊碎片": { hp: 50, atk: 40, spd: 10 } };
fragmentStats["暗影碎片"] = { hp: 0, atk: 0, spd: 0 };
const baseFragmentKeys = Object.keys(fragmentStats).filter(key => key.endsWith('碎片') && key !== '暗影碎片');
baseFragmentKeys.forEach(key => {
    const original = fragmentStats[key];
    const keyII = key.replace('碎片', '碎片 II');
    const statsII = {
        hp: Math.round(original.hp * 3),
        atk: Math.round(original.atk * 3),
        spd: Math.round(original.spd * 3)
    };
    fragmentStats[keyII] = statsII;
    const keyIII = keyII.replace('碎片 II', '碎片 III');
    fragmentStats[keyIII] = {
        hp: Math.round(statsII.hp * 2),
        atk: Math.round(statsII.atk * 2),
        spd: Math.round(statsII.spd * 2)
    };});
const allAbilities = {
    "幻劍": {
        id: "ability_phantom_blade",
        name: "幻劍",
        description: "造成 (120 + Lv*20)% 傷害，必定先攻，且有 30% 機率擊暈敵人。",
        levelRequired: 0,
        spCost: 0,
        basePP: 10,
        upgradeCostSP: 1,
        exclusiveTo: "幻劍方塊",
        getEffectDescription: (level) => `造成 ${120 + level * 20}% 傷害，必定先攻，30% 機率擊暈敵人。`,
        getDamageMultiplier: (level) => (120 + level * 20) / 100,
        getIncreasedPP: (level) => Math.floor(level / 2)
    },
    "盾反": {
        id: "ability_shield_counter",
        name: "盾反",
        description: "反應性技能。有 (30+Lv)% 機率直接擊破敵人一條血條，若失敗則受到 (10 - Lv*0.1)x 倍傷害。",
        levelRequired: 0,
        spCost: 0,
        basePP: 1,
        maxLevel: 60,
        upgradeCostSP: 1,
        exclusiveTo: "幻盾方塊",
        getEffectDescription: (level) => `有 ${30 + level}% 機率擊破血條，失敗則受 ${(10 - level * 0.1).toFixed(1)}x 倍傷害。`,
        getSuccessChance: (level) => (30 + level) / 100,
        getFailureMultiplier: (level) => 10 - level * 0.1,
        getIncreasedPP: (level) => {
            if (level >= 60) return 2;
            if (level >= 30) return 1;
            return 0;
        }},
    "劍光": { id: "ability_sword_light", name: "劍光", description: "需要特定武器解鎖的招式。", levelRequired: 0, spCost: 0, basePP: 5, maxLevel: 14, upgradeCostSP: 1, isConditional: true, getEffectDescription: (level) => `造成 ${Math.pow(2, level)}% 基礎傷害。若以此招擊敗對手，下一波速度提高 ${3 + level} 點。[刺客專屬：升級時改為永久提升 100 點最低傷害]`, getDamagePercentage: (level) => Math.pow(2, level) / 100, getSpeedBoost: (level) => 3 + level, getIncreasedPP: (level) => Math.min(level, 5), getMinDamageBoost: (level) => 100 }, "吸取": { id: "ability_absorb", name: "吸取", description: "下一回合攻擊回復 50% 傷害血量", levelRequired: 2, spCost: 1, basePP: 1, upgradeCostSP: 1, getEffectDescription: (level) => `回復 ${50 + level}% 傷害血量`, getHealPercentage: (level) => (50 + level) / 100, getIncreasedPP: (level) => 0, forbiddenTo: ["刺客方塊", "刺客 | 改", "短命方塊"] }, "狂暴": { id: "ability_berserk", name: "狂暴", description: "使用後1回合攻擊增加 30 點，速度增加 4 點", levelRequired: 5, spCost: 2, basePP: 1, upgradeCostSP: 1, getEffectDescription: (level) => `使用後1回合攻擊增加 ${30 + level * 5} 點，速度增加 ${4 + level * 0.5} 點`, getAttackBoost: (level) => 30 + level * 5, getSpeedBoost: (level) => 4 + level * 0.5, getIncreasedPP: (level) => 0 }, "猛擊": { id: "ability_smash", name: "猛擊", description: "下一回合攻擊變為最高傷害*(1+Lv*0.1)，受到傷害時血量減少上限20%(不致死)，爆擊機率提升至30%+Lv%。", levelRequired: 5, spCost: 1, basePP: 1, upgradeCostSP: 1, getEffectDescription: (level) => `下一回合攻擊變為最高傷害*(${(1 + level * 0.1).toFixed(1)}x)，受到傷害時血量減少上限20%(不致死)，爆擊機率提升至${(30 + level)}%。`, getDamageMultiplier: (level) => (1 + level * 0.1), getCritChanceBoost: (level) => (30 + level), getIncreasedPP: (level) => 0, forbiddenTo: ["短命方塊"] }, "治癒": { id: "ability_heal", name: "治癒", description: "將此次攻擊改為等量的治療量*(1+Lv*0.1)。", levelRequired: 2, spCost: 1, basePP: 1, upgradeCostSP: 1, getEffectDescription: (level) => `將此次攻擊改為等量的治療量*(${(1 + level * 0.1).toFixed(1)}x)。`, getHealMultiplier: (level) => (1 + level * 0.1), getIncreasedPP: (level) => 0, forbiddenTo: ["刺客方塊", "刺客 | 改", "短命方塊"] }, "拔刀斬": { id: "ability_draw_sword", name: "拔刀斬", description: "本回合不攻擊，下一回合造成 250+(Lv*50)% 的最高傷害", levelRequired: 3, spCost: 1, basePP: 3, upgradeCostSP: 1, exclusiveTo: ["劍士方塊", "劍士 | 改"], getEffectDescription: (level) => `本回合不攻擊，下一回合造成 ${250 + (level * 50)}% 的最高傷害。`, getDamagePercentage: (level) => (250 + (level * 50)) / 100, getIncreasedPP: (level) => 0 },
    "高速移動": {
        id: "ability_high_speed_movement",
        name: "高速移動",
        description: "造成 (攻擊力 * 速度 * 3)% 的傷害，並使你必定閃避下一次敵人的攻擊。",
        levelRequired: 0,
        spCost: 0,
        basePP: 5,
        maxLevel: 0,
        upgradeCostSP: 999,
        exclusiveTo: "短命 | 改",
        getEffectDescription: (level) => "造成 (攻擊力 * 速度 * 3)% 的傷害，並使你必定閃避下一次敵人的攻擊。",
        getDamageMultiplier: (speed) => (speed * 3) / 100,
        getIncreasedPP: (level) => 0
    },
    "破財免災": {
        id: "ability_money_for_life",
        name: "破財免災",
        description: "本回合攻擊力提升至150%。若以此招式擊敗敵人，不會獲得金錢，但會增加一條血條。",
        levelRequired: 7,
        spCost: 3,
        basePP: 2,
        maxLevel: 0,
        upgradeCostSP: 999,
        exclusiveTo: "短命方塊",
        getEffectDescription: (level) => "攻擊力提升至150%。若以此招式擊敗敵人，不會獲得金錢，但會增加一條血條。",
        getDamageMultiplier: () => 1.5,
        getIncreasedPP: () => 0
    },
    "防禦姿態": { 
        id: "ability_defensive_stance", 
        name: "防禦姿態", 
        description: "本回合獲得護盾，護盾血量為最大生命值的30%，但本回合造成的傷害降低70%。", 
        levelRequired: 1, 
        spCost: 0, 
        basePP: 99, 
        maxLevel: 0,
        upgradeCostSP: 999,
        exclusiveTo: ["變化方塊", "變化 | 改"],
        getEffectDescription: (level) => `本回合獲得護盾 (30%最大生命值)，但傷害降低70%。`,
        getShieldPercent: () => 0.3,
        getDamagePenalty: () => 0.7,
        getIncreasedPP: (level) => 0
    },
    "攻擊姿態": {
        id: "ability_attack_stance",
        name: "攻擊姿態",
        description: "本次攻擊傷害提升至 250%，但本次受到的傷害增加 300%",
        levelRequired: 0, // 自動學習
        spCost: 0,
        basePP: 99,
        maxLevel: 0, // 無法升級
        upgradeCostSP: 999,
        exclusiveTo: "變化 | 改", // 只有轉職後才能看到和使用
        getEffectDescription: (level) => `本次攻擊傷害 = 250%，受到傷害增加 300%。`,
        getDamageMultiplier: () => 2.5, // 傷害變為 250%
        getIncomingDamageMultiplier: () => 4.0, // 受到傷害增加 300%，即變為 100% + 300% = 400%
        getIncreasedPP: (level) => 0
    }};
const normalEnemyTypes = { tier1: { "瘦弱方塊": { name: "瘦弱方塊", hpPerBar: 80, bars: 1, attackMin: 5, attackMax: 15, speed: 4, evasion: 0, moneyReward: 50, xpReward: 30 }, "普通方塊": { name: "普通方塊", hpPerBar: 120, bars: 1, attackMin: 10, attackMax: 25, speed: 6, evasion: 0, moneyReward: 80, xpReward: 50 }, }, tier2: { "強壯方塊": { name: "強壯方塊", hpPerBar: 180, bars: 1, attackMin: 15, attackMax: 35, speed: 8, evasion: 0, moneyReward: 120, xpReward: 80 }, "精英方塊": { name: "精英方塊", hpPerBar: 250, bars: 1, attackMin: 20, attackMax: 45, speed: 10, evasion: 5, moneyReward: 200, xpReward: 120 }, "強盾方塊": { name: "強盾方塊", hpPerBar: 10000, bars: 1, attackMin: 2, attackMax: 4, speed: 3, evasion: 0, moneyReward: 1500, xpReward: 150 }, "強劍方塊": { name: "強劍方塊", hpPerBar: 400, bars: 1, attackMin: 100, attackMax: 180, speed: 5, evasion: 0, moneyReward: 1500, xpReward: 150 }, }, tier3: { "鋼劍方塊": { name: "鋼劍方塊", hpPerBar: 1000, bars: 1, attackMin: 500, attackMax: 800, speed: 15, evasion: 15, moneyReward: 5000, xpReward: 600 }, "鋼盾方塊": { name: "鋼盾方塊", hpPerBar: 80000, bars: 1, attackMin: 20, attackMax: 40, speed: 13, evasion: 0, moneyReward: 5000, xpReward: 600 }, "神劍方塊": { name: "神劍方塊", hpPerBar: 262145, bars: 2, attackMin: 1000, attackMax: 1500, speed: 35, evasion: 25, moneyReward: 20000, xpReward: 1500, specialDrop: { item: "青光劍柄", chance: 0.05 } }, "神盾方塊": { name: "神盾方塊", hpPerBar: 800000, bars: 4, attackMin: 40, attackMax: 160, speed: 33, evasion: 5, moneyReward: 20000, xpReward: 1500 } }, boss: { "魔王方塊": { name: "魔王方塊", hpPerBar: 1000, bars: 1, attackMin: 30, attackMax: 60, speed: 12, evasion: 10, moneyReward: 500, xpReward: 250, healOnAttack: 0.3, specialDrop: { item: "魔王之心", chance: 0.25 } } }, specialBoss: { "持劍者": { name: "持劍者", hpPerBar: 100000, bars: 10, attackMin: 1000, attackMax: 1000, speed: 10, moneyReward: 100000, xpReward: 10000 } } };
const ancientEnemyTypes = { tier1: { "遠古方塊": { name: "遠古方塊", hpPerBar: 300, bars: 1, attackMin: 25, attackMax: 40, speed: 7, evasion: 5, moneyReward: 300, xpReward: 150 }, }, tier2: { "遠古巨獸方塊": { name: "遠古巨獸方塊", hpPerBar: 800, bars: 1, attackMin: 40, attackMax: 60, speed: 5, evasion: 0, moneyReward: 600, xpReward: 300, specialDrop: { item: "遠古龍鱗", chance: 0.20 } }, }, tier3: { "史前暴虐方塊": { name: "史前暴虐方塊", hpPerBar: 2000, bars: 1, attackMin: 80, attackMax: 120, speed: 3, evasion: 0, moneyReward: 1500, xpReward: 750, specialDrop: { item: "暴虐之爪", chance: 0.20 } } } };
const futureEnemyTypes = { tier1: { "未來科技方塊": { name: "未來科技方塊", hpPerBar: 280, bars: 1, attackMin: 20, attackMax: 50, speed: 15, evasion: 20, moneyReward: 350, xpReward: 180 }, }, tier2: { "未來哨兵方塊": { name: "未來哨兵方塊", hpPerBar: 400, bars: 1, attackMin: 35, attackMax: 55, speed: 20, evasion: 25, moneyReward: 700, xpReward: 350, specialDrop: { item: "高頻刀刃", chance: 0.20 } }, }, tier3: { "量子糾纏方塊": { name: "量子糾纏方塊", hpPerBar: 600, bars: 1, attackMin: 50, attackMax: 70, speed: 25, evasion: 40, moneyReward: 2000, xpReward: 900, specialDrop: { item: "量子核心", chance: 0.20 } } } };
const questTemplates = [
    { id: "killNormal", name: "擊殺普通方塊", type: "kill", targetEnemy: "普通方塊", targetCount: 3, moneyReward: 150, xpReward: 80, requiredLevel: 3 },
    { id: "killStrong", name: "擊殺強壯方塊", type: "kill", targetEnemy: "強壯方塊", targetCount: 1, moneyReward: 200, xpReward: 100, requiredLevel: 5 },
    { id: "killElite", name: "擊殺精英方塊", type: "kill", targetEnemy: "精英方塊", targetCount: 1, moneyReward: 300, xpReward: 150, requiredLevel: 8 },
    { id: "killBoss", name: "擊殺魔王方塊", type: "kill", targetEnemy: "魔王方塊", targetCount: 1, moneyReward: 500, xpReward: 250, requiredLevel: 10 },
    { id: "killShield", name: "擊殺強盾方塊", type: "kill", targetEnemy: "強盾方塊", targetCount: 1, moneyReward: 600, xpReward: 300, requiredLevel: 12 },
    { id: "killSword", name: "擊殺強劍方塊", type: "kill", targetEnemy: "強劍方塊", targetCount: 1, moneyReward: 600, xpReward: 300, requiredLevel: 12 },
    { id: "collectorRequest1", name: "收藏家的委託", type: "submit", submissionItems: { "普通方塊碎片": 5, "強壯方塊碎片": 3 }, moneyReward: 300, xpReward: 150, requiredLevel: 5 },
    { id: "blacksmithNeed", name: "鐵匠的需求", type: "submit", submissionItems: { "強劍方塊碎片": 1, "強盾方塊碎片": 1 }, moneyReward: 500, xpReward: 200, requiredLevel: 12 },
    { id: "ancientPower", name: "來自遠古的力量", type: "submit", submissionItems: { "魔王之心": 1 }, moneyReward: 2000, xpReward: 1000, requiredLevel: 15 },
    { id: "assassinTransfer", name: "刺客轉職任務", type: "kill", targetEnemy: "精英方塊", targetCount: 1, moneyReward: 1000, xpReward: 500, requiredLevel: 15, specificProfession: "刺客方塊", specialCondition: "在一個回合內擊敗一個精英方塊", isTransferQuest: true, transferToProfession: "刺客 | 改", requiredTier: 0 },
    { id: "swordsmanTransfer", name: "劍士轉職任務", type: "kill", targetEnemy: "魔王方塊", targetCount: 1, moneyReward: 1000, xpReward: 500, requiredLevel: 15, specificProfession: "劍士方塊", specialCondition: "在5回合內擊敗魔王方塊", isTransferQuest: true, transferToProfession: "劍士 | 改", transferBleedChanceBoost: 50, requiredTier: 0 },
    { id: "shieldmanTransfer", name: "盾士轉職任務", type: "custom", targetCount: 1000, moneyReward: 1000, xpReward: 500, requiredLevel: 15, specificProfession: "盾士方塊", specialCondition: "總反傷傷害達到1000", isTransferQuest: true, transferToProfession: "盾士 | 改", transferReflectBoost: 60, transferMaxHPBoost: 1000, requiredTier: 0 },
    { id: "shortlivedTransfer", name: "短命方塊轉職任務", type: "custom", targetCount: 50, moneyReward: 1000, xpReward: 500, requiredLevel: 10, specificProfession: "短命方塊", specialCondition: "在戰鬥中總共消耗 50 條血條", isTransferQuest: true, transferToProfession: "短命 | 改", requiredTier: 0 },
    { id: "variantTransfer", name: "變化方塊轉職任務", type: "kill", targetEnemy: ["強盾方塊", "鋼盾方塊", "神盾方塊"], targetCount: 1, moneyReward: 1000, xpReward: 500, requiredLevel: 18, specificProfession: "變化方塊", specialCondition: "全程使用「防禦姿態」擊敗任意一個盾系方塊 (強盾/鋼盾/神盾)", isTransferQuest: true, transferToProfession: "變化 | 改", requiredTier: 0 },
    { id: "phantomBladeTransfer", name: "幻劍之道", type: "custom", targetCount: 50, moneyReward: 5000, xpReward: 2500, requiredLevel: 50, specificProfession: "劍士 | 改", specialCondition: "使用 50 次「拔刀斬」", isTransferQuest: true, transferToProfession: "幻劍方塊", requiredTier: 1 },
    { id: "phantomShieldTransfer", name: "幻盾之壁", type: "custom", targetCount: 10, moneyReward: 5000, xpReward: 2500, requiredLevel: 50, specificProfession: "盾士 | 改", specialCondition: "用反傷擊破 10 條血條", isTransferQuest: true, transferToProfession: "幻盾方塊", requiredTier: 1 },
    { id: "tyrantSwordTransfer", name: "暴劍之路", type: "submit", submissionItems: { "遠古核心": 10 }, moneyReward: 10000, xpReward: 5000, requiredLevel: 50, specificProfession: "劍士 | 改", isTransferQuest: true, transferToProfession: "暴劍方塊", requiredTier: 1 },
    { id: "tyrantShieldTransfer", name: "暴盾之壁", type: "submit", submissionItems: { "遠古核心": 10 }, moneyReward: 10000, xpReward: 5000, requiredLevel: 50, specificProfession: "盾士 | 改", isTransferQuest: true, transferToProfession: "暴盾方塊", requiredTier: 1 },
];
const talentTreeData = { offense: { name: "攻擊天賦", talents: [ { id: "offense1", name: "鋒利之刃", maxLevel: 5, cost: 1, description: "每級永久提升 2% 當前攻擊力。", applyEffect: (level) => { const bonus = Math.max(1, Math.round(((player.attackMin + player.attackMax) / 2) * 0.02)); if (!player.profession.includes("刺客")) player.attackMin += bonus; player.attackMax += bonus; } }, { id: "offense2", name: "精準打擊", maxLevel: 5, cost: 1, description: "每級永久提升 1% 爆擊率。", applyEffect: (level) => { player.critChance += 1; }, requires: { id: "offense1", level: 2 } }, { id: "offense3", name: "致命一擊", maxLevel: 5, cost: 2, description: "每級永久提升 0.1x 爆擊傷害。", applyEffect: (level) => { player.critDamage += 0.1; }, requires: { id: "offense2", level: 3 } }, { id: "offense4", name: "乘勝追擊", maxLevel: 3, cost: 2, description: "對生命值低於 30% 的敵人，每級額外造成 5% 傷害。", applyEffect: (level) => { player.executeDamageBonus = (player.executeDamageBonus || 0) + 0.05; }, requires: { id: "offense3", level: 1 } }, { id: "offense5", name: "破傷風", maxLevel: 3, cost: 2, description: "【劍士專屬】每級提升 2% 流血機率與 3% 流血傷害。", applyEffect: (level) => { if (player.profession.includes("劍士")) { player.bleedChance += 2; player.bleedDamagePercentage += 3; } }, requires: { id: "offense4", level: 1 } }, { id: "offense6", name: "專注射擊", maxLevel: 5, cost: 2, description: "【刺客專屬】每級永久提升相當於 1% 最高攻擊力的最低攻擊力。", applyEffect: (level) => { player.minDamageBonusPercentOfMax = (player.minDamageBonusPercentOfMax || 0) + 0.01; }, requires: { id: "offense2", level: 2 } } ] }, defense: { name: "防禦天賦", talents: [ { id: "defense1", name: "堅韌體魄", maxLevel: 5, cost: 1, description: "每級永久提升 3% 當前最大生命值。", applyEffect: (level) => { const bonus = Math.max(5, Math.round(player.maxHp * 0.03)); player.maxHp += bonus; player.hp += bonus; } }, { id: "defense2", name: "身法迅捷", maxLevel: 5, cost: 1, description: "每級永久提升 1% 閃避率。", applyEffect: (level) => { player.evasion += 1; }, requires: { id: "defense1", level: 2 } }, { id: "defense3", name: "不屈", maxLevel: 5, cost: 2, description: "受到攻擊時，每級減少 1 點傷害。", applyEffect: (level) => { player.flatDamageReduction = (player.flatDamageReduction || 0) + 1; }, requires: { id: "defense2", level: 1 } }, { id: "defense4", name: "屹立不搖", maxLevel: 5, cost: 2, description: "【盾士專屬】每級永久提升 2% 反傷率。", applyEffect: (level) => { if (player.profession.includes("盾士")) player.reflectDamage += 2; }, requires: { id: "defense3", level: 2 } }, { id: "defense5", name: "背水一戰", maxLevel: 3, cost: 3, description: "生命值低於 25% 時，每級額外提升 5% 閃避率。", applyEffect: (level) => { player.lastStandEvasionBonus = (player.lastStandEvasionBonus || 0) + 5; }, requires: { id: "defense3", level: 2 } }, { id: "defense6", name: "盾牌精通", maxLevel: 3, cost: 2, description: "【盾士專屬】從商店購買血量上限時，每級額外獲得 10% 的加成。", applyEffect: (level) => { player.hpUpgradeBonus = (player.hpUpgradeBonus || 0) + 0.1; }, requires: { id: "defense4", level: 1 } }, ] }, utility: { name: "支援天賦", talents: [ { id: "utility1", name: "點石成金", maxLevel: 5, cost: 1, description: "每級永久提升 3% 金錢獲取量。", applyEffect: (level) => { player.moneyBonusPercent = (player.moneyBonusPercent || 0) + 0.03; } }, { id: "utility2", name: "快速學習", maxLevel: 5, cost: 1, description: "每級永久提升 3% 經驗值獲取量。", applyEffect: (level) => { player.xpBonusPercent = (player.xpBonusPercent || 0) + 0.03; }, requires: { id: "utility1", level: 2 } }, { id: "utility3", name: "砍價高手", maxLevel: 5, cost: 2, description: "每級在商店購物時，永久獲得 2% 的金錢折扣。", applyEffect: (level) => { player.shopDiscountPercent = (player.shopDiscountPercent || 0) + 0.02; }, requires: { id: "utility1", level: 3 } }, { id: "utility4", name: "潛能奇才", maxLevel: 1, cost: 5, description: "升級時額外獲得 1 技能點。", applyEffect: (level) => { player.bonusSPOnLevelUp = (player.bonusSPOnLevelUp || 0) + 1; }, requires: { id: "utility2", level: 3 } }, { id: "utility5", name: "碎片收藏家", maxLevel: 3, cost: 3, description: "擊敗敵人時，有 5% * 等級的機率額外掉落一個相同碎片。", applyEffect: (level) => { player.extraFragmentChance = (player.extraFragmentChance || 0) + 0.05; }, requires: { id: "utility3", level: 1 } }, { id: "utility6", name: "高效合成", maxLevel: 3, cost: 3, description: "進行特殊武器合成時，有 10% * 等級的機率不消耗暗影碎片。", applyEffect: (level) => { player.efficientCraftingChance = (player.efficientCraftingChance || 0) + 0.1; }, requires: { id: "utility5", level: 2 } } ] } };
const normalRandomEvents = [ { name: "幸運噴泉", description: "你發現了一口散發著柔和光芒的噴泉。你要許願嗎？", options: [ { text: "許願獲得力量 (回復50%生命)", onSelect: () => { const healAmount = Math.round(player.maxHp * 0.5); player.hp = Math.min(player.maxHp, player.hp + healAmount); showFloatingText(`+${healAmount} HP`, playerChar, 'heal'); return "噴泉回應了你，你的傷勢復原了！"; }}, { text: "許願獲得財富 (獲得 200 金錢)", onSelect: () => { currentMoney += 200; return "你在池底發現了閃閃發光的 200 金錢！"; }}, { text: "默默離開", onSelect: () => "你沒有打擾噴泉的寧靜，繼續前進。" } ] }, { name: "神秘商人", description: "一位戴著兜帽的神秘商人向你招手。", options: [ { text: () => `購買「力量藥水」 (永久+5%攻擊力) - ${getDiscountedCost(Math.round(200 * gameDifficulty.moneyMultiplier))}金錢`, isAvailable: () => currentMoney >= getDiscountedCost(Math.round(200 * gameDifficulty.moneyMultiplier)), onSelect: () => { const cost = getDiscountedCost(Math.round(200 * gameDifficulty.moneyMultiplier)); currentMoney -= cost; player.totalMoneySpent += cost; if (player.profession.includes("刺客")) { player.attackMax = Math.round(player.attackMax * 1.05); } else { player.attackMin = Math.round(player.attackMin * 1.05); player.attackMax = Math.round(player.attackMax * 1.05); } return "你喝下藥水，感覺力量湧上來了！永久攻擊力+5%。"; } }, { text: () => `購買「技能點卷軸」 (+1 SP) - ${getDiscountedCost(Math.round(300 * gameDifficulty.moneyMultiplier))}金錢`, isAvailable: () => currentMoney >= getDiscountedCost(Math.round(300 * gameDifficulty.moneyMultiplier)), onSelect: () => { const cost = getDiscountedCost(Math.round(300 * gameDifficulty.moneyMultiplier)); currentMoney -= cost; player.totalMoneySpent += cost; player.sp += 1; return "卷軸化為光芒融入你的體内，你獲得了 1 點技能點！"; } }, { text: "我只是看看", onSelect: () => "你搖了搖頭，商人聳聳肩，消失在陰影中。" } ] }, { name: "旅行藥劑師", description: "一位背著巨大背包的藥劑師向你兜售他調製的藥水。", options: [ { text: "力量藥劑 (+25%攻擊, -15%速度, 持續3波)", onSelect: () => { const atkBoost = Math.round(player.attackMax * 0.25); const spdLoss = Math.round(player.speed * 0.15); player.attackMin += atkBoost; player.attackMax += atkBoost; player.speed -= spdLoss; addFutureEvent({ wave: currentWave + 3, isEffect: true, endEffect: () => { player.attackMin -= atkBoost; player.attackMax -= atkBoost; player.speed += spdLoss; gameMessage.textContent = "力量藥劑效果消退了。"; }}); return "藥劑入喉，你感到肌肉膨脹，但步伐變得沉重。"; }}, { text: "敏捷藥劑 (+25%速度, -15%最大HP, 持續3波)", onSelect: () => { const spdBoost = Math.round(player.speed * 0.25); const hpLoss = Math.round(player.maxHp * 0.15); player.speed += spdBoost; player.maxHp -= hpLoss; if (player.hp > player.maxHp) player.hp = player.maxHp; addFutureEvent({ wave: currentWave + 3, isEffect: true, endEffect: () => { player.speed -= spdBoost; player.maxHp += hpLoss; gameMessage.textContent = "敏捷藥劑效果消退了。"; }}); return "你感覺身輕如燕，但身体也變得更加脆弱。"; }}, { text: "生命之泉 (回復100%生命, 失去30%金錢)", isAvailable: () => player.hp < player.maxHp && currentMoney > 0, onSelect: () => { const moneyLoss = Math.round(currentMoney * 0.3); currentMoney -= moneyLoss; player.totalMoneySpent += moneyLoss; player.hp = player.maxHp; return `你花費 ${moneyLoss} 金錢買下了泉水，傷口完全癒合了！`; }} ] }, { name: "可疑的捷徑", description: "你發現一條隱密的小路，似乎可以繞過前方的敵人。", options: [ { text: "走捷徑！", onSelect: () => { const outcome = Math.random(); if (outcome < 0.4) { const wavesSkipped = 2 + Math.floor(Math.random() * 2); currentWave += wavesSkipped; return `捷徑很安全！你成功繞過了 ${wavesSkipped} 波敵人！`; } else if (outcome < 0.8) { const hpLoss = Math.round(player.maxHp * 0.2); player.hp = Math.max(1, player.hp - hpLoss); showFloatingText(`-${hpLoss}`, playerChar, 'damage'); return "你在捷徑中摔倒了，雖然避開了敵人，但也受了傷！"; } else { forceStartBattle("精英方塊", false, currentWave + 5); return "捷徑的盡頭是一個強大的精英方塊，它守護著這條路！"; }}}, { text: "還是走大路吧", onSelect: () => "你決定不冒險，穩紮穩打地前進。" } ] }, { name: "時空之門", description: "一道扭曲的時空之門在你面前展開...", rarity: 0.3, options: [ { text: "進入遠古維度", onSelect: () => { currentDimension = 'ancient'; generateEnemy(); return "你踏入了傳送門，進入了充滿原始氣息的遠古維度！"; }}, { text: "探索未來維度", onSelect: () => { currentDimension = 'future'; generateEnemy(); return "你穿過了門扉，來到一個充滿金屬與霓虹的未來維度！"; }}, { text: "保持現狀，關閉時空門", onSelect: () => "你認為這太過危險，選擇關閉了時空門。" } ] }, { name: "次元裂隙的不穩定核心", description: "你感覺到周圍的空間極度不穩定，一道充滿混亂能量的裂隙若隱若現。", rarity: 0.1, options: [ { text: "投入能量穩定它 (消耗 2 SP)", isAvailable: () => player.sp >= 2, onSelect: () => { player.sp -=2; gainXP(1000); return "你將自身潛力注入裂隙，混亂的能量平息了。你從中感悟良多，獲得 1000 經驗值！"; }}, { text: "躍入混亂的中心！(進入破碎次元)", onSelect: () => { currentDimension = 'shattered'; generateEnemy(); return "你躍入了裂隙！周圍的一切都已破碎，歡迎來到破碎次元！"; }}, { text: "遠離這個危險的地方", onSelect: () => "你明智地選擇遠離這個極不穩定的区域。" } ] } ];
const ancientRandomEvents = [ { name: "回歸裂隙", description: "你找到一個相對穩定的時空裂口，它似乎可以將你送回原來的世界。", rarity: 0.5, options: [ { text: "回到初始世界", onSelect: () => { currentDimension = 'normal'; generateEnemy(); return "你穿過裂隙，成功返回了初始世界！"; } }, { text: "繼續在遠古探索", onSelect: () => "你決定再冒險一會兒，放棄了這次返回的機會。" } ] }, { name: "史前壁畫", description: "你發現一處刻有古老戰鬥場景的洞穴壁畫，似乎蘊含著遠古的力量。", options: [ { text: "研究壁畫", onSelect: () => { if (Math.random() < 0.7) { gainXP(200); player.critDamage += 0.1; return "你從壁畫中領悟了原始の戦闘スキル！200経験値を獲得し、永久にクリティカルダメージ+0.1x！"; } else { player.critChance = Math.max(0, player.critChance - 2); return "壁畫中混亂の景象讓你精神錯亂，永久爆擊率-2%！"; }}}, { text: "這只是塗鴉", onSelect: () => "你對這些原始藝術不感興趣。" } ] }, { name: "休眠的火山", description: "一座散發著硫磺氣味的火山在你面前，深處傳來低沉的脈動。", options: [ { text: "驚動火山 (接下來3波敵人被強化，但掉落額外碎片)", onSelect: () => { addFutureEvent({wave: currentWave + 3, isEffect: true, endEffect: () => { gameMessage.textContent = "火山的影響結束了。"; delete player.volcanoEruption; }}); player.volcanoEruption = { duration: 3 }; return "你向火山口投下巨石，整片大地開始震動！接下來的敵人將被熔岩強化！"; }}, { text: "悄悄離開", onSelect: () => "你不想惹麻煩，小心地繞開了火山。" } ] }, { name: "琥珀中的方塊", description: "一塊巨大的琥珀困著一個古代方塊，它似乎還活著。", options: [ { text: "融化琥珀釋放它", onSelect: () => { if (Math.random() < 0.6) { gainXP(300); return "被釋放的古代方塊感激地向你點了點頭，化作一道光給予你祝福。獲得300經驗值！"; } else { forceStartBattle("遠古方塊", false, currentWave); return "這個方塊充滿了被囚禁的憤怒，一被釋放就向你發起了攻擊！"; } } }, { text: "不要打擾它", onSelect: () => "你決定讓歷史保持原樣。" } ] } ];
const futureRandomEvents = [ { name: "回歸裂隙", description: "一個數據流構成的裂口在你面前閃爍，計算顯示這是一個通往過去的穩定蟲洞。", rarity: 0.5, options: [ { text: "回到初始世界", onSelect: () => { currentDimension = 'normal'; generateEnemy(); return "你穿過數據蟲洞，成功返回了初始世界！"; } }, { text: "繼續在未來探索", onSelect: () => "你對未來的科技還有好奇，決定再停留一會儿。" } ] }, { name: "廢棄的武器實驗室", description: "一個閃爍著警報燈的廢棄實驗室。裡面可能有高科技武器，也可能有危險。", options: [ { text: "進去搜索", onSelect: () => { if (Math.random() < 0.5) { equipTemporaryWeapon({name: "原型雷射槍", atk: 50, spd: 5, hp: 0}, 3); return "你找到一把「原型雷射槍」，它暫時取代了你的武器！"; } else { forceStartBattle("未來哨兵方塊", false, currentWave + 5); return "你觸發了警報！一個實驗室守衛出現了！"; }}}, { text: "避免觸發警報", onSelect: () => "你決定不冒險進入這個可疑的地方。" } ] }, { name: "時間悖論", description: "時空發生扭曲，一個來自10波之前的你自己的幻影出現在面前，看起來比現在弱小得多。", isAvailable: () => currentWave > 10, options: [ { text: "擊敗過去的自己，收回經驗", onSelect: () => { forceStartBattle("過去的幻影", false, currentWave - 10); return "為了變得更強，你必須面對過去的自己！"; }}, { text: "無視悖論 (50%機率損失1SP)", onSelect: () => { if (Math.random() < 0.5) { player.sp = Math.max(0, player.sp - 1); return "你試圖無視悖論，但混亂的時空能量讓你失去了一點潛力。"; } else { return "你成功穩住了心神，沒有受到悖論的影響。"; }}} ] }, { name: "AI管理員的交易", description: "一個全息投影的AI出現在你面前：『偵測到時空旅行者。需要臨時權限嗎？價格是你的「潛力」。』", options: [ { text: "購買「超頻模組」(+50%速度, 持續3波) - 消耗1 SP", isAvailable: () => player.sp >= 1, onSelect: () => { player.sp -= 1; const speedBoost = player.speed * 0.5; player.speed += speedBoost; addFutureEvent({ wave: currentWave + 3, isEffect: true, endEffect: () => { player.speed -= speedBoost; gameMessage.textContent = "「超頻模組」效果結束。"; } }); return "AI為你安裝了超頻模組，你的速度大幅提升！"; } }, { text: "購買「奈米修復蜂群」(每波回復20%HP, 持續3波) - 消耗1 SP", isAvailable: () => player.sp >= 1 && !player.profession.includes("刺客"), onSelect: () => { player.sp -= 1; const nanoHealEvent = { wave: currentWave + 3, isEffect: true, action: () => { const healAmount = Math.ceil(player.maxHp * 0.2); player.hp = Math.min(player.maxHp, player.hp + healAmount); showFloatingText(`+${healAmount}`, playerChar, 'heal'); gameMessage.textContent = `奈米修復蜂群為你回復了 ${healAmount} 生命值！`; }, endEffect: () => { gameMessage.textContent = "「奈米修復蜂群」能量耗盡。"; futureEvents = futureEvents.filter(e => e.action !== nanoHealEvent.action); } }; addFutureEvent(nanoHealEvent); addFutureEvent({wave: currentWave + 1, action: nanoHealEvent.action}); addFutureEvent({wave: currentWave + 2, action: nanoHealEvent.action}); return "AI釋放了奈米蜂群，它們將在接下來的幾波戰鬥中為你療傷。"; } }, { text: "我用自己的力量戰鬥", onSelect: () => "你拒絕了AI的交易。" } ] } ];
const shatteredRandomEvents = [ { name: "回歸之路", description: "在混亂的碎片中，你找到一條勉強可以辨識的路，它似乎通往你原來的世界。", rarity: 0.5, options: [{ text: "離開破碎次元", onSelect: () => { currentDimension = 'normal'; generateEnemy(); return "你逃離了混亂，成功返回初始世界！" }}, { text: "繼續在混亂中尋找機遇", onSelect: () => "你決定繼續這場瘋狂的冒險。" }] }, { name: "破碎核心的奇點", description: "破碎次元的中心，一個吞噬一切的奇點在脈動。你可以嘗試穩定它，或躍入更深層的未知。", rarity: 0.1, options: [ { text: "嘗試穩定它 (消耗 5 SP)", isAvailable: () => player.sp >= 5, onSelect: () => { player.sp -= 5; gainXP(5000); return "你耗費巨大潛力穩定了奇點，純粹的經驗洪流湧入你的腦海！獲得5000XP！"; } }, { text: "躍入奇點！(進入破碎次元II)", onSelect: () => { currentDimension = 'shattered_2'; generateEnemy(); return "你躍入了終極的混亂！現實的法則在此處已無意義！"; } } ] }, { name: "維度商人", description: "一個由純粹能量構成的商人攔住了你。它不收金錢，只對你的『潛力』感興趣。", options: [ { text: "購買「終極之力」 (永久+10%全屬性) - 消耗 10 SP", isAvailable: () => player.sp >= 10, onSelect: () => { player.sp -= 10; player.maxHp = Math.round(player.maxHp * 1.1); player.attackMin = Math.round(player.attackMin * 1.1); player.attackMax = Math.round(player.attackMax * 1.1); player.speed = parseFloat((player.speed * 1.1).toFixed(1)); return "你將大量潛力交易出去，感覺自己脫胎換骨了！"; }}, { text: "購買「次元武器：虛空之刃」- 消耗 5 SP", isAvailable: () => player.sp >= 5, onSelect: () => { player.sp -= 5; craftWeapon({ "神劍方塊碎片": 4, "神盾方塊碎片": 4 }, false, "虛空之刃"); return "商人交給你一把由時空碎片構成的武器！"; }}, { text: "我對你的商品沒興趣", onSelect: () => "商人失望地看著你，然後消散在空氣中。" } ] }, { name: "存在的回響", description: "你感覺到一股強烈的存在感。一個你曾經擊敗的強大敵人的回響再次凝聚成形！", isAvailable: () => player.defeatedEnemies.size > 0, options: [ { text: "挑戰回響，獲取更多碎片！", onSelect: () => { const choices = Array.from(player.defeatedEnemies); const enemyToFight = choices[Math.floor(Math.random() * choices.length)]; forceStartBattle(enemyToFight, false, currentWave); return `【${enemyToFight}】的回響出現了！擊敗它來獲取獎勵！`; }}, { text: "避開回響", onSelect: () => "你不想再次面對那個惡夢，選擇了繞路。" } ] } ];
const shattered2RandomEvents = [
    { name: "回歸奇點", description: "一個相對穩定的奇點，似乎可以让你回到稍微不那麼混亂的破碎次元 I。", rarity: 0.5, options: [{ text: "回到破碎次元 I", onSelect: () => { currentDimension = 'shattered'; generateEnemy(); return "你逃離了終極的瘋狂，回到了破碎次元。"; } }, { text: "我還能堅持！", onSelect: () => "你決定繼續挑戰自己的極限。" }] },
    { 
        name: "最終裂隙", 
        description: "一道散發著純粹混沌能量的裂隙在你面前展開，它通往所有維度的終點。這是一條不歸路。",
        rarity: 0.2,
        options: [
            { 
                text: "進入破碎次元 III (消耗 10 SP)", 
                isAvailable: () => player.sp >= 10,
                onSelect: () => { 
                    player.sp -= 10;
                    currentDimension = 'shattered_3'; 
                    generateEnemy(); 
                    return "你將自身潛力作為鑰匙，開啟了通往最終次元的道路！歡迎來到破碎次元 III！"; 
                }},
            { text: "現在還不是時候...", onSelect: () => "你從裂隙的恐怖中退縮了，選擇了更安全的路。" }
        ]},
    { name: "終焉倒數", description: "你感到這個次元正在崩塌！你必須在 5 波內找到出口，否則將被虛無吞噬！", options: [ { text: "我明白了...", onSelect: () => { addFutureEvent({ wave: currentWave + 5, isEffect: true, endEffect: () => { if (currentDimension === 'shattered_2' || currentDimension === 'shattered_3') { player.hp = 0; endGame('你沒能及時逃脫，被次元崩塌吞噬了...'); updateDisplay(); } }}); return "倒數開始了...你感到了前所未有的壓力！"; } } ] }, 
    { name: "混沌鐵匠", description: "一個瘋狂的鐵匠在敲打著不存在的金屬。他似乎可以用你的 II 碎片打造出什麼。", options: [ { text: "給他 8 個 II 碎片", isAvailable: () => { const iiFrags = Object.keys(player.backpack).filter(k => k.includes("II")); let total = 0; iiFrags.forEach(frag => { total += player.backpack[frag]; }); return total >= 8; }, onSelect: () => { let fragsToRemove = 8; const iiFrags = Object.keys(player.backpack).filter(k => k.includes("II")); for(const frag of iiFrags) { const toRemove = Math.min(fragsToRemove, player.backpack[frag]); player.backpack[frag] -= toRemove; fragsToRemove -= toRemove; if(player.backpack[frag] <= 0) delete player.backpack[frag]; if(fragsToRemove <= 0) break; } const bonusHp = Math.floor(Math.random() * 2001) - 500; const bonusAtk = Math.floor(Math.random() * 1001) - 250; const bonusSpd = Math.floor(Math.random() * 21) - 5; craftWeapon({}, false, "混沌神器"); player.weaponStats.hp += bonusHp; player.weaponStats.atk += bonusAtk; player.weaponStats.spd += bonusSpd; return `鐵匠瘋狂地捶打，為你打造了獨一無二的【混沌神器】！(HP:${bonusHp > 0 ? '+':''}${bonusHp}, ATK:${bonusAtk > 0 ? '+':''}${bonusAtk}, SPD:${bonusSpd > 0 ? '+':''}${bonusSpd})`; } } ] } 
];
const specialRecipes = [ { name: "血色屠戮者", composition: { "強劍方塊碎片": 4, "精英方塊碎片": 4 }, bonusStats: { bleedChance: 30, bleedDamagePercentage: 10 }, specialEffect: "打造出劍士專屬武器【血色屠戮者】！流血機率+30%，流血傷害+10%！", exclusiveTo: "劍士" }, { name: "不動如山之壁", composition: { "強盾方塊碎片": 6, "魔王方塊碎片": 2 }, bonusStats: { hp: 3000, reflectDamage: 150 }, specialEffect: "打造出盾士專屬武器【不動如山之壁】！提供了巨額生命值和反傷！", exclusiveTo: "盾士" }, { name: "遠古之心", composition: { "史前暴虐方塊碎片": 2, "遠古巨獸方塊碎片": 6 }, bonusStats: { hp: 3000, atk: 500, spd: -5 }, specialEffect: "打造出【遠古之心】！充滿了原始的巨力！" }, { name: "相位穿梭者", composition: { "量子糾纏方塊碎片": 3, "未來哨兵方塊碎片": 5 }, bonusStats: { atk: 1000, spd: 5, evasion: 20 }, specialEffect: "打造出【相位穿梭者】！你的身法變得難以捉摸！" }, { name: "神泣", composition: { "神劍方塊碎片": 8 }, bonusStats: { atk: 250000, hp: -20000 }, specialEffect: "打造出禁忌武器【神泣】！你獲得了神明般的攻擊力，但代價是脆弱的生命！" }, { name: "霸者之證", composition: { "魔王之心": 1, "神劍方塊碎片": 2, "神盾方塊碎片": 2 }, bonusStats: { hp: 15000, atk: 5000, spd: 3 }, specialEffect: "【霸者之證】每回合開始時回復 150 點生命值，並提供全方位屬性加成。" }, { name: "大地龍鎧", composition: { "遠古龍鱗": 2, "暴虐之爪": 1, "遠古方塊碎片": 3 }, bonusStats: { hp: 20000, spd: -30, flatDamageReduction: 12 }, specialEffect: "【大地龍鎧】提供無與倫比的生命值和傷害減免，但極其沉重。" }, { name: "時序斷層之刃", composition: { "量子核心": 1, "高頻刀刃": 2, "未來科技方塊碎片": 3 }, bonusStats: { atk: 1500, spd: 20, evasion: 15 }, specialEffect: "【時序斷層之刃】攻擊時有 65% 機率使敵人陷入時空錯亂，跳過下一回合。" },
    { name: "影舞者之吻", composition: { "量子核心": 1, "暴虐之爪": 1, "精英方塊碎片": 4 }, bonusStats: { hp: -2000, atk: 8000, spd: 15 }, specialEffect: "【刺客專屬】攻擊造成傷害時，將 25% 傷害轉化為下一回合的臨時護盾 (護盾值不疊加)。", exclusiveTo: "刺客" },
    { name: "永恆怒火", composition: { "遠古龍鱗": 1, "史前暴虐方塊碎片": 3, "強劍方塊碎片": 2 }, bonusStats: { hp: 500, atk: 100, spd: 5 }, specialEffect: "【永恆怒火】在同一場戰鬥中，每經過一回合，你的攻擊力永久提升 100 點 (效果在戰鬥結束後重置)。" },
    { name: "黃金之觸", composition: { "魔王之心": 1, "強壯方塊碎片": 6 }, bonusStats: { hp: 200, atk: 200, spd: 2 }, specialEffect: "【黃金之觸】擊敗敵人時，獲得的金錢永久提高 50%。" },
    { 
        name: "混沌造物", 
        composition: { "神劍方塊碎片 II": 2, "神盾方塊碎片 II": 2, "神劍方塊碎片": 3 }, 
        bonusStats: { critChance: 20 }, 
        specialEffect: "【混沌造物】裝備時，你的爆擊機率提升 20%！"
    },
    { name: "神賜", composition: { "神盾方塊碎片": 7, "魔王之心": 1 }, bonusStats: { hp: 50000, atk: 0, spd: 0 }, specialEffect: "【神賜】蘊含著神聖的力量，每次攻擊時有 15% 機率使敵人畏縮，跳過下一回合。" },
    { 
        name: "黃晶", 
        composition: { "神劍方塊碎片": 4, "神盾方塊碎片": 4 }, 
        type: 'material', 
        specialEffect: "你成功合成了珍貴的材料【黃晶】！" 
    },
    { 
        name: "綠晶", 
        composition: { "黃晶": 1, "暗影碎片": 7 }, 
        type: 'material', 
        specialEffect: "你成功合成了充滿活力的材料【綠晶】！" 
    },
    { 
        name: "紅晶", 
        composition: { "綠晶": 1, "暗影碎片": 7 }, 
        type: 'material', 
        specialEffect: "你成功合成了蘊含著力量的材料【紅晶】！" 
    },
    { 
        name: "月見 I", 
        composition: { "神劍方塊碎片": 3, "神盾方塊碎片": 3, "黃晶": 2 },
        type: 'material', 
        requiredDimension: 'shattered', // 只能在破碎次元 I 製作
        specialEffect: "你成功合成了【月見 I】！它散發著柔和的光芒。" 
    },
    { 
        name: "月見 II", 
        composition: { "神劍方塊碎片 II": 3, "神盾方塊碎片 II": 3, "綠晶": 2 },
        type: 'material', 
        requiredDimension: 'shattered_2', // 只能在破碎次元 II 製作
        specialEffect: "你成功合成了【月見 II】！它蘊含著更強大的能量。" 
    },
    { 
        name: "月見 III", 
        composition: { "神劍方塊碎片 III": 3, "神盾方塊碎片 III": 3, "紅晶": 2 },
        type: 'material', 
        requiredDimension: 'shattered_3', // 只能在破碎次元 III 製作
        specialEffect: "你成功合成了【月見 III】！它的能量幾乎要溢出來了！" 
    },
    { 
        name: "月見晶石", 
        composition: { "月見 III": 8 },
        type: 'material', 
        // 沒有 requiredDimension，表示可以在任何地方製作
        specialEffect: "你將月見的力量凝聚到了極致，合成了【月見晶石】！" 
    }
    ,{
        name: "澗月",
        composition: {
            "月見晶石": 1,
            "神劍方塊碎片 II": 1,
            "黃晶": 2,
            "綠晶": 2,
            "紅晶": 2
        },
        bonusStats: { hp: 0, atk: 0, spd: 0 },
        specialEffect: "【澗月】打造成功！當你的攻擊傷害足夠擊破一條血條時，多餘的傷害將會攻擊下一條血條（最多溢出100次）。"
    },
    { 
        name: "劍刃", 
        composition: { "強劍方塊碎片": 5, "精英方塊碎片": 2, "魔王方塊碎片": 1 },
        type: 'material', 
        specialEffect: "你成功合成了鋒利的材料【劍刃】！" 
    },
    { 
        name: "碎刃", 
        composition: { "強盾方塊碎片": 5, "精英方塊碎片": 2, "魔王方塊碎片": 1 },
        type: 'material', 
        specialEffect: "你成功合成了沉重的材料【碎刃】！" 
    },
    { 
        name: "神刃", 
        composition: { "劍刃": 2, "碎刃": 2 },
        type: 'material', 
        specialEffect: "你成功合成了蘊含著恐怖力量的【神刃】！" 
    },
    { 
        name: "遠古核心", 
        composition: { "史前暴虐方塊碎片": 4, "神刃": 2 },
        type: 'material', 
        specialEffect: "你成功合成了充滿原始力量的【遠古核心】！" 
    },
    { 
        name: "時空刃", 
        composition: { "量子糾纏方塊碎片": 4, "量子核心": 4 },
        type: 'material', 
        specialEffect: "你成功合成了蘊含時空能量的【時空刃】！" 
    },
    { 
        name: "時空石", 
        composition: { "時空刃": 2, "神刃": 2 },
        type: 'material', 
        specialEffect: "你將兩種強大的刃融合，合成了【時空石】！" 
    }
];
const craftingRecipes = [];
const RELIC_RARITY_DATA = {
    0: { name: '普通', class: 'relic-common' },
    1: { name: '精良', class: 'relic-uncommon' },
    2: { name: '稀有', class: 'relic-rare' }
};
const RELIC_RARITY_MULTIPLIERS = {0: 1.0,1: 1.6,2: 2.5};
const allRelics = [
    { id: 'relic_weapon_1', name: '磨損的劍刃', type: '武器', stat: 'attack', minBonus: 1, maxBonus: 3, description: "提升 {bonus}% 攻擊力" },
    { id: 'relic_weapon_2', name: '精準瞄具', type: '武器', stat: 'critChance', minBonus: 1, maxBonus: 2, description: "提升 {bonus}% 爆擊率" },
    { id: 'relic_weapon_3', name: '力量水晶', type: '武器', stat: 'critDamage', minBonus: 3, maxBonus: 6, description: "提升 {bonus}% 爆擊傷害" },
    { id: 'relic_weapon_4', name: '腐蝕尖刺', type: '武器', stat: 'bleedChance', minBonus: 2, maxBonus: 4, description: "提升 {bonus}% 流血機率" },
    { id: 'relic_weapon_5', name: '加速核心', type: '武器', stat: 'speed', minBonus: 1, maxBonus: 3, description: "提升 {bonus}% 速度" },
    { id: 'relic_armor_1', name: '厚實的甲片', type: '裝甲', stat: 'maxHp', minBonus: 2, maxBonus: 4, description: "提升 {bonus}% 最大生命值" },
    { id: 'relic_armor_2', name: '光滑的護符', type: '裝甲', stat: 'evasion', minBonus: 0.5, maxBonus: 1.5, description: "提升 {bonus}% 閃避率" },
    { id: 'relic_armor_3', name: '尖刺外殼', type: '裝甲', stat: 'reflectDamage', minBonus: 3, maxBonus: 5, description: "提升 {bonus}% 反傷率" },
    { id: 'relic_armor_4', name: '地精的錢袋', type: '裝甲', stat: 'moneyBonus', minBonus: 2, maxBonus: 5, description: "提升 {bonus}% 金錢獲取量" },
    { id: 'relic_armor_5', name: '學者的眼鏡', type: '裝甲', stat: 'xpBonus', minBonus: 2, maxBonus: 5, description: "提升 {bonus}% 經驗值獲取量" },
];
function getNextLevelXP(currentLevel) { return 100 + (currentLevel - 1) * 50; }
function getDiscountedCost(baseCost) {return Math.round(baseCost * (1 - (player.shopDiscountPercent || 0)));}

// ====================================================
// NEW SYSTEM: Battlefield Environments
// ====================================================
const battlefieldEnvironments = {
    MistyField: {
        name: "濃霧",
        description: "所有單位的閃避率提升 20%。",
        duration: 5,
        applyEffect: (stats) => { stats.evasion = (stats.evasion || 0) + 20; return stats; },
        isAppliedTo: 'all' // all, player, enemy
    },
    MagicSpring: {
        name: "魔法湧泉",
        description: "所有治療效果提升 100%。",
        duration: 5,
        // 效果將在 game-logic.js 中直接應用
    },
    CrystalCave: {
        name: "水晶洞穴",
        description: "所有爆擊造成的傷害額外提升 50%。",
        duration: 5,
        applyEffect: (stats) => { stats.critDamage = (stats.critDamage || 1.5) * 1.5; return stats; },
        isAppliedTo: 'all'
    },
    CorrosiveSwamp: {
        name: "腐蝕沼澤",
        description: "回合結束時，所有單位受到最大生命值 5% 的傷害。",
        duration: 5,
        // 效果將在 game-logic.js 中直接應用
    },
    LightningField: {
        name: "雷電場地",
        description: "玩家免疫暈眩，攻擊力與速度提升30%。敵人的閃避率提升5%。",
        duration: 10,
        isItemEffect: true, // 標記為物品效果，以便區分
        applyEffect: (stats) => { // 只應用於玩家
            stats.attackMin = Math.round(stats.attackMin * 1.3);
            stats.attackMax = Math.round(stats.attackMax * 1.3);
            stats.speed = parseFloat((stats.speed * 1.3).toFixed(1));
            return stats;
        },
        isAppliedTo: 'player'
    },
    PrimalField: {
        name: "原始場地",
        description: "玩家每回合回復10%最大生命值，攻擊力與最大生命值提升50%，但必定後手攻擊。敵人的生命值、攻擊力與金錢獎勵提升30%。",
        duration: 10,
        isItemEffect: true,
        applyEffect: (stats) => { // 只應用於玩家
            stats.attackMin = Math.round(stats.attackMin * 1.5);
            stats.attackMax = Math.round(stats.attackMax * 1.5);
            stats.maxHp = Math.round(stats.maxHp * 1.5);
            return stats;
        },
        isAppliedTo: 'player'
    }
};
// ====================================================
// NEW SYSTEM: Enemy Affixes
// ====================================================
const enemyAffixes = {
    Sync: {
        name: "同步",
        description: "敵人的最大、最小攻擊力將設定為玩家當前最大、最小攻擊力的 75%（不含臨時Buff）",
        applyStats: (enemy) => {
            if (typeof getPlayerEffectiveStats === 'function') {
                const stats = getPlayerEffectiveStats();
                enemy.attackMin = Math.round(stats.attackMin / (player.tempAttackMultiplier || 1.0) * 0.75);
                enemy.attackMax = Math.round(stats.attackMax / (player.tempAttackMultiplier || 1.0) * 0.75);
            }
        }
    },
    Overload: {
        name: "超載",
        description: "敵人攻擊時，有30%機率對玩家造成兩次獨立的傷害判定，但每次傷害都只有原來的 60%。",
        onAttack: (enemy, defender, attackFn) => {
            if (Math.random() < 0.3) {
                for (let i = 0; i < 2; i++) {
                    attackFn(0.6); // 傳入傷害倍率
                }
                return true; // 已處理
            }
            return false;
        }
    },
    Disrupt: {
        name: "干擾",
        description: "敵人每攻擊一次都會使計時器減少1~3秒。",
        isTrialOnly: 'shortLivedTrial',
        onDealDamage: (damage, enemy, player) => {
            if (typeof shortLivedTrialTimer === 'number') {
                const reduce = Math.floor(Math.random() * 3) + 1;
                shortLivedTrialTimer = Math.max(0, shortLivedTrialTimer - reduce);
                gameMessage.textContent += ` [干擾] 詞綴觸發，計時器減少了 ${reduce} 秒！`;
            }
        }
    },
    Exchange: {
        name: "交換",
        description: "擊敗此敵人後的金錢獎勵與經驗獎勵交換。",
        onDefeat: (enemy) => {
            // 標記本場需交換獎勵
            enemy.exchangeReward = true;
        }
    },
    TimeDilation: {
        name: "時緩",
        description: "對此敵人的負面狀態只持續一回合。",
        onStatusApply: (enemy, status) => {
            // 標記狀態只持續一回合
            if (status) status.turnsRemaining = 1;
        }
    },
    Undying: {
        name: "不屈",
        description: "只有在滿血時，受到足以秒殺的傷害才會剩下1hp。",
        onTakeFatalDamage: (enemy, damage) => {
            // 只有滿血時才觸發
            if (enemy.hp === enemy.maxHp && damage >= enemy.hp) {
                enemy.hp = 1;
                return true; // 已觸發
            }
            return false;
        }
    },
    Counter: {
        name: "反制",
        description: "敵人在閃避攻擊後會立即多攻擊一次。",
        onEvade: (enemy, player) => {
            // 標記本回合需反擊
            enemy.counterAttackThisTurn = true;
        }
    },
    Wave: {
        name: "波動",
        description: "敵人的傷害在單數回合為50%，雙數回合為150%。",
        modifyDamage: (damage, enemy) => {
            if (!enemy.turnCount) enemy.turnCount = 1;
            if (enemy.turnCount % 2 === 1) {
                return Math.round(damage * 0.5);
            } else {
                return Math.round(damage * 1.5);
            }
        },
        onTurnStart: (enemy) => {
            enemy.turnCount = (enemy.turnCount || 0) + 1;
        }
    },
    Evolve: {
        name: "進化",
        description: "玩家在15回合內未擊敗敵人，敵人將會獲得額外2個詞條（不含進化）。",
        onTurnStart: (enemy) => {
            enemy.evolveTurn = (enemy.evolveTurn || 0) + 1;
            if (enemy.evolveTurn === 15 && !enemy.evolved) {
                // 進化觸發
                const availableAffixKeys = Object.keys(enemyAffixes).filter(k => k !== 'Evolve' && !enemy.affixes.some(a => a.name === enemyAffixes[k].name));
                const shuffled = availableAffixKeys.sort(() => 0.5 - Math.random());
                for (let i = 0; i < 2 && i < shuffled.length; i++) {
                    const key = shuffled[i];
                    const newAffix = { ...enemyAffixes[key] };
                    enemy.affixes.push(newAffix);
                    if (newAffix.applyStats) newAffix.applyStats(enemy);
                }
                enemy.evolved = true;
                gameMessage.textContent += ` 【進化】詞綴觸發，敵人獲得了新詞綴！`;
            }
        }
    },
    Forgetful: {
        name: "遺忘",
        description: "此戰遺物將無效。",
        applyStats: (enemy) => { enemy.forgetRelics = true; }
    },
    Steal: {
        name: "竊取",
        description: "攻擊命中時有10%機率讓玩家減少10%金錢。",
        onDealDamage: (damage, enemy, player) => {
            if (Math.random() < 0.10 && currentMoney > 0) {
                const stolen = Math.max(1, Math.round(currentMoney * 0.10));
                currentMoney -= stolen;
                showFloatingText(`-${stolen}`, playerChar, 'money');
                gameMessage.textContent += ` [竊取] 詞綴觸發，你損失了 ${stolen} 金錢！`;
            }
        }
    },
    Armored: {
        name: "護甲",
        description: "受到的所有傷害減少 20%。",
        applyIncomingDamage: (damage) => Math.max(1, Math.round(damage * 0.8))
    },
    Vampiric: {
        name: "吸血",
        description: "攻擊造成傷害時，回復等同於傷害 20% 的生命值。",
        onDealDamage: (damage, enemy) => {
            const healed = Math.round(damage * 0.2);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healed);
            showFloatingText(`+${healed}`, enemyChar, 'heal');
        }
    },
    Thorns: {
        name: "荊棘",
        description: "被攻擊時，反彈玩家本次攻擊傷害的 20%。",
        onTakeDamage: (damage, player) => {
            const reflectDmg = Math.max(1, Math.round(damage * 0.2));
            player.hp -= reflectDmg;
            showFloatingText(`-${reflectDmg}`, playerChar, 'damage');
            gameMessage.textContent += ` 你受到了 [荊棘] 詞綴的反彈傷害！`;
        }
    },
    Swift: {
        name: "快速",
        description: "基礎速度提升 50%。",
        applyStats: (enemy) => { enemy.speed = Math.round(enemy.speed * 1.5); }
    },
    Regenerating: {
        name: "再生",
        description: "每回合開始時，回復 5% 最大生命值。",
        onTurnStart: (enemy) => {
            const healed = Math.round(enemy.maxHp * 0.05);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + healed);
            showFloatingText(`+${healed}`, enemyChar, 'heal');
        }
    },
    Avenger: {
        name: "復仇",
        description: "死亡時，對玩家造成一次等同於其最大攻擊力的傷害。",
        onDeath: (enemy, player) => {
            const damage = enemy.attackMax;
            player.hp -= damage;
            showFloatingText(`-${damage}`, playerChar, 'crit');
            gameMessage.textContent += ` [復仇] 詞綴觸發，你受到了 ${damage} 點傷害！`;
        }
    },
    Resilient: {
        name: "韌性",
        description: "免疫所有負面效果（暈眩、流血）。",
    }
};
