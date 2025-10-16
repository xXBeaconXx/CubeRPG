function initializePlayer(type) {
  player = {
    hp: 0, maxHp: 0, attackMin: 0, attackMax: 0, speed: 5, critChance: 5, critDamage: 2.0, evasion: 0, level: 1, xp: 0, sp: 0,
    abilities: {}, talents: {}, backpack: {}, weaponStats: { name: "自製武器", hp: 0, atk: 0, spd: 0, composition: {} },
    nextWaveSpeedBoost: 0, priorityAbility: null, tempAttackMin: 0, tempAttackMax: 0, bonusMinAttack: 0, tempSpeed: 0, tempCritChance: 0,
    tempAttackToMax: false, canTakeDamagePenalty: false, isHealingTurn: false, isDrawingSword: false, profession: "", reflectDamage: 0,
    stunTurns: 0,
    bars: 1, maxBars: 1, lastBarGainWave: 0,
    totalReflectedDamage: 0, bleedChance: 0, bleedDamagePercentage: 0, transferTier: 0, temporaryWeapon: null, defeatedEnemies: new Set(),
    flatDamageReduction: 0, waveRegenPercent: 0, moneyBonusPercent: 0, xpBonusPercent: 0, bonusSPOnLevelUp: 0, eventChanceBonus: 0,
    extraFragmentChance: 0, executeDamageBonus: 0, minDamageBonusPercentOfMax: 0, lastStandEvasionBonus: 0, hpUpgradeBonus: 0,
    shopDiscountPercent: 0, efficientCraftingChance: 0, turnStartHeal: 0, turnSkipChance: 0,
    shield: 0,
    damageToShield: 0,
    weaponMoneyBonus: 0,
    rampingAttack: 0,
    rampingAttackBonus: 0,
    bonusCritDamage: 0,
    recoilDamagePercent: 0,
    damagePenaltyPercent: 0,
    damageSpillover: false,
    piercingSpillover: false,
    reflectSpillover: false,
    questTracking: null,
    relics: [],
    equippedRelic: null,
    discoveredRecipes: {},
    totalMoneySpent: 0,
    swordHolderFightState: null,
    tempAttackMultiplier: 1.0,
  };
  activeNormalQuests = [];
  activeTransferQuests = [];
  currentDimension = 'normal';
  currentItemCosts = JSON.parse(JSON.stringify(baseItemValues));
  switch (selectedDifficulty) { case 'easy': gameDifficulty = { enemyMultiplier: 1.0, moneyMultiplier: 1.5 }; break; case 'normal': gameDifficulty = { enemyMultiplier: 1.2, moneyMultiplier: 1.0 }; break; case 'hard': gameDifficulty = { enemyMultiplier: 1.5, moneyMultiplier: 0.8 }; break; }
  switch (type) {
    case 'swordsman': player = { ...player, maxHp: 80, hp: 80, attackMin: 50, attackMax: 100, speed: 5, critChance: 5, critDamage: 2.0, profession: "劍士方塊" }; currentItemCosts.attackUpgrade = { cost: 100, amount: 10, description: "永久提升攻擊力 10 點" }; break;
    case 'shieldman': player = { ...player, maxHp: 300, hp: 300, attackMin: 5, attackMax: 10, speed: 5, critChance: 5, critDamage: 2.0, profession: "盾士方塊" }; currentItemCosts.maxHPUpgrade = { cost: 100, amount: 100, description: "永久提升血量上限 100 點" }; currentItemCosts.attackUpgrade = { cost: 60, amount: 1, description: "永久提升攻擊力 1 點" }; currentItemCosts.heal = { cost: 50, amount: 0.1, description: "回復 10% 最大生命值", type: "percentage" }; break;
    case 'berserker': player = { ...player, maxHp: 50, hp: 50, attackMin: 10, attackMax: 30, speed: 5, critChance: 50, critDamage: 6.0, profession: "狂戰方塊" }; break;
    case 'assassin': player = { ...player, maxHp: 60, hp: 60, attackMin: 0, attackMax: 200, speed: 10, critChance: 0, critDamage: 1.0, evasion: 10, profession: "刺客方塊" }; currentItemCosts.attackUpgrade = { cost: 80, amount: 20, description: "永久提升最高攻擊力 20 點 (最低不變)" }; currentItemCosts.maxHPUpgrade = { cost: 100, amount: 10, description: "永久提升血量上限 10 點" }; currentItemCosts.heal = { cost: 99999, description: "刺客無法回血" }; break;
    case 'variant': 
        player = { 
            ...player, 
            maxHp: 100, 
            hp: 100, 
            attackMin: 20, 
            attackMax: 50, 
            speed: 5, 
            critChance: 10, 
            critDamage: 3.0, 
            profession: "變化方塊" 
        };
        learnAbility('防禦姿態'); 
        break;
    case 'shortlived':
        player = {
            ...player,
            maxHp: 1,
            hp: 1,
            bars: 10,
            maxBars: 10,
            attackMin: 50,
            attackMax: 80,
            speed: 15,
            critChance: 5,
            critDamage: 3.0,
            profession: "短命方塊"
        };break;}
  if (activeTrial && activeTrial.id === 'assassinChaos') {
      player.evasion = 0;
      player.critChance = 0;
      player.critDamage = 1.0;
      player.reflectDamage = 0;
      player.bleedChance = 0;
  }}
function selectCharacter(type) {
    selectedCharacterType = type;
    characterSelectionOverlay.style.display = 'none';
    showTrialSelection(type);
}
function showTrialSelection(characterType) {
    trialOptionsContainer.innerHTML = '';
    const normalGameCard = document.createElement('div');
    normalGameCard.className = 'trial-card';
    normalGameCard.innerHTML = `
        <h3>普通模式</h3>
        <p>遊玩經典的方塊RPG體驗。</p>
        <button>開始遊戲</button>
    `;
    normalGameCard.querySelector('button').onclick = () => {
        activeTrial = null;
        initializePlayer(selectedCharacterType);
        trialSelectionOverlay.style.display = 'none';
        startGame();
    };
    trialOptionsContainer.appendChild(normalGameCard);
    if (characterType === 'swordsman') {
        const attackTrialCard = document.createElement('div');
        attackTrialCard.className = 'trial-card';
        attackTrialCard.innerHTML = `
            <h3>攻擊試煉 (Beta)</h3>
            <p>規則：</p>
            <p>1. 你的傷害 x200% (剩1血時恢復)</p>
            <p>2. 敵人傷害 x99999</p>
            <p>3. 滿血被擊中時，必定剩 1 HP</p>
            <p>4. 商店只能升級「攻擊」與「回血」</p>
            <button>挑戰試煉</button>
        `;
        attackTrialCard.querySelector('button').onclick = () => {
            activeTrial = { id: 'swordsmanAttack', name: '攻擊試煉' };
            initializePlayer(selectedCharacterType);
            trialSelectionOverlay.style.display = 'none';
            startGame();
        };
        trialOptionsContainer.appendChild(attackTrialCard);
    }
    if (characterType === 'assassin') {
        const chaosTrialCard = document.createElement('div');
        chaosTrialCard.className = 'trial-card';
        chaosTrialCard.innerHTML = `
            <h3>混亂試煉 (Beta)</h3>
            <p>規則：</p>
            <p>1. 商店無法手動升級</p>
            <p>2. 可花費50金錢隨機強化一項屬性</p>
            <p>3. 每波開始時，除了最低攻擊力，所有屬性都會被打亂</p>
            <button>挑戰試煉</button>
        `;
        chaosTrialCard.querySelector('button').onclick = () => {
            activeTrial = { id: 'assassinChaos', name: '混亂試煉' };
            initializePlayer(selectedCharacterType);
            trialSelectionOverlay.style.display = 'none';
            startGame();
        };trialOptionsContainer.appendChild(chaosTrialCard);
    }
    if (characterType === 'shortlived') {
        const shortLivedTrialCard = document.createElement('div');
        shortLivedTrialCard.className = 'trial-card';
        shortLivedTrialCard.innerHTML = `
            <h3>短命試煉 (Beta)</h3>
            <p>規則：</p>
            <p>1. 每波有 60 秒倒數計時。</p>
            <p>2. 計時結束未能進入下一波則失去一條血條並重置計時。</p>
            <p>3. 無法使用任何招式。</p>
            <p>4. 無法購買爆擊傷害與閃避。</p>
            <p>5. 自身無法爆擊或閃避。</p>
            <p>6. 無法透過任何方式獲得血條。</p>
            <button>挑戰試煉</button>
        `;
        shortLivedTrialCard.querySelector('button').onclick = () => {
            activeTrial = { id: 'shortLivedTrial', name: '短命試煉' };
            initializePlayer(selectedCharacterType);
            trialSelectionOverlay.style.display = 'none';
            startGame();
        };
        trialOptionsContainer.appendChild(shortLivedTrialCard);
    }
    trialSelectionOverlay.style.display = 'flex';}
function startGame() {
  generateEnemy();
  generateMultipleQuests();
  updateAllDisplays();
  if (activeTrial && activeTrial.id === 'shortLivedTrial') {
    startShortLivedTrialTimer();
  }
}
function endGame(message) { 
    gameMessage.textContent = message; 
    attackButton.disabled = true; 
    isBattleInProgress = false; 
    if (activeTrial && activeTrial.id === 'shortLivedTrial') {
        stopShortLivedTrialTimer();
    }
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    let currentTheme;
    if (document.body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = '☀️';
        currentTheme = 'dark';
    } else {
        themeToggleBtn.textContent = '🌙';
        currentTheme = 'light';
    }
    localStorage.setItem('theme', currentTheme);}
function equipTemporaryWeapon(weapon, duration) { if (player.temporaryWeapon) { unequipTemporaryWeapon(); } player.temporaryWeapon = { ...weapon, duration: duration }; player.maxHp -= player.weaponStats.hp; player.hp = Math.min(player.hp, player.maxHp); if (player.profession.includes("刺客")) { player.attackMax -= player.weaponStats.atk; } else { player.attackMin -= player.weaponStats.atk; player.attackMax -= player.weaponStats.atk; } player.speed -= player.weaponStats.spd; player.maxHp += weapon.hp; player.hp += weapon.hp; if (player.profession.includes("刺客")) { player.attackMax += weapon.atk; } else { player.attackMin += weapon.atk; player.attackMax += weapon.atk; } player.speed += weapon.spd; updateDisplay(); }
function unequipTemporaryWeapon() { const tempWeapon = player.temporaryWeapon; if (!tempWeapon) return; player.maxHp -= tempWeapon.hp; player.hp = Math.min(player.hp, player.maxHp); if (player.profession.includes("刺客")) { player.attackMax -= tempWeapon.atk; } else { player.attackMin -= tempWeapon.atk; player.attackMax -= tempWeapon.atk; } player.speed -= tempWeapon.spd; player.maxHp += player.weaponStats.hp; player.hp += player.weaponStats.hp; if (player.profession.includes("刺客")) { player.attackMax += player.weaponStats.atk; } else { player.attackMin += player.weaponStats.atk; player.attackMax += player.weaponStats.atk; } player.speed += player.weaponStats.spd; player.temporaryWeapon = null; gameMessage.textContent = "臨時武器能量耗盡，已恢復你原本的武器。"; updateDisplay(); }
function checkTemporaryWeapon() { if (player.temporaryWeapon) { player.temporaryWeapon.duration--; if (player.temporaryWeapon.duration <= 0) { unequipTemporaryWeapon(); } } }
difficultyOptions.forEach(option => { option.addEventListener('click', () => { difficultyOptions.forEach(opt => opt.classList.remove('selected')); option.classList.add('selected'); selectedDifficulty = option.dataset.difficulty; }); });
attackButton.addEventListener('click', () => { if (isBattleInProgress) return; startBattleTurn(); });
saveButton.addEventListener('click', saveGame);
loadButton.addEventListener('click', loadGame);
resetButton.addEventListener('click', resetGame);
themeToggleBtn.addEventListener('click', toggleTheme);
const tabRelics = document.getElementById('tabRelics');
const contentRelics = document.getElementById('contentRelics');
tabUpgrades.addEventListener('click', () => { tabUpgrades.classList.add('active'); tabTalents.classList.remove('active'); tabSynthesis.classList.remove('active'); tabAbilities.classList.remove('active'); tabBackpack.classList.remove('active'); tabRelics.classList.remove('active'); contentUpgrades.classList.add('active'); contentTalents.classList.remove('active'); contentSynthesis.classList.remove('active'); contentAbilities.classList.remove('active'); contentBackpack.classList.remove('active'); contentRelics.classList.remove('active'); updateShopItemsForProfession(); });
tabTalents.addEventListener('click', () => { tabUpgrades.classList.remove('active'); tabTalents.classList.add('active'); tabSynthesis.classList.remove('active'); tabAbilities.classList.remove('active'); tabBackpack.classList.remove('active'); tabRelics.classList.remove('active'); contentUpgrades.classList.remove('active'); contentTalents.classList.add('active'); contentSynthesis.classList.remove('active'); contentAbilities.classList.remove('active'); contentBackpack.classList.remove('active'); contentRelics.classList.remove('active'); renderTalentTree(); });
tabSynthesis.addEventListener('click', () => { tabUpgrades.classList.remove('active'); tabTalents.classList.remove('active'); tabSynthesis.classList.add('active'); tabAbilities.classList.remove('active'); tabBackpack.classList.remove('active'); tabRelics.classList.remove('active'); contentUpgrades.classList.remove('active'); contentTalents.classList.remove('active'); contentSynthesis.classList.add('active'); contentAbilities.classList.remove('active'); contentBackpack.classList.remove('active'); contentRelics.classList.remove('active'); renderSynthesisRecipes(); });
tabAbilities.addEventListener('click', () => { tabUpgrades.classList.remove('active'); tabTalents.classList.remove('active'); tabSynthesis.classList.remove('active'); tabAbilities.classList.add('active'); tabBackpack.classList.remove('active'); tabRelics.classList.remove('active'); contentUpgrades.classList.remove('active'); contentTalents.classList.remove('active'); contentSynthesis.classList.remove('active'); contentAbilities.classList.add('active'); contentBackpack.classList.remove('active'); contentRelics.classList.remove('active'); renderAbilityShopItems(); });
tabBackpack.addEventListener('click', () => { tabUpgrades.classList.remove('active'); tabTalents.classList.remove('active'); tabSynthesis.classList.remove('active'); tabAbilities.classList.remove('active'); tabBackpack.classList.add('active'); tabRelics.classList.remove('active'); contentUpgrades.classList.remove('active'); contentTalents.classList.remove('active'); contentSynthesis.classList.remove('active'); contentAbilities.classList.remove('active'); contentBackpack.classList.add('active'); contentRelics.classList.remove('active'); renderBackpack(); });
tabRelics.addEventListener('click', () => { tabUpgrades.classList.remove('active'); tabTalents.classList.remove('active'); tabSynthesis.classList.remove('active'); tabAbilities.classList.remove('active'); tabBackpack.classList.remove('active'); tabRelics.classList.add('active'); contentUpgrades.classList.remove('active'); contentTalents.classList.remove('active'); contentSynthesis.classList.remove('active'); contentAbilities.classList.remove('active'); contentBackpack.classList.remove('active'); contentRelics.classList.add('active'); renderRelics(); });
contentBackpack.addEventListener('input', (event) => { if (event.target.classList.contains('craft-input')) { updateCraftingPreview(); } });
contentBackpack.addEventListener('click', (event) => { if (event.target.id === 'craft-weapon-button') { craftWeapon(); } });
buyAttackButton.addEventListener('click', () => { const cost = getDiscountedCost(currentItemCosts.attackUpgrade.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; if (player.profession.includes("刺客")) { player.attackMax += currentItemCosts.attackUpgrade.amount; } else { player.attackMin += currentItemCosts.attackUpgrade.amount; player.attackMax += currentItemCosts.attackUpgrade.amount; } gameMessage.textContent = `成功購買！攻擊力永久提升 ${currentItemCosts.attackUpgrade.amount} 點！`; } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyMaxHPButton.addEventListener('click', () => { const cost = getDiscountedCost(currentItemCosts.maxHPUpgrade.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; const baseAmount = currentItemCosts.maxHPUpgrade.amount; const bonusAmount = Math.round(baseAmount * (player.hpUpgradeBonus || 0)); const totalAmount = baseAmount + bonusAmount; player.maxHp += totalAmount; player.hp += totalAmount; const effectiveStats = getPlayerEffectiveStats(); player.hp = Math.min(player.hp, effectiveStats.maxHp); gameMessage.textContent = `成功購買！血量上限永久提升 ${totalAmount} 點！` + (bonusAmount > 0 ? ` (含天賦加成 ${bonusAmount} 點)` : ""); } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buySpeedButton.addEventListener('click', () => { const cost = getDiscountedCost(baseItemValues.speedUpgrade.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; player.speed += baseItemValues.speedUpgrade.amount; gameMessage.textContent = `成功購買！速度永久提升 ${baseItemValues.speedUpgrade.amount} 點！`; } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyCritDamageButton.addEventListener('click', () => { if (player.profession.includes("刺客")) return; const cost = getDiscountedCost(baseItemValues.critDamageUpgrade.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; player.critDamage += baseItemValues.critDamageUpgrade.amount; gameMessage.textContent = `成功購買！爆擊傷害永久提升 ${baseItemValues.critDamageUpgrade.amount}x！`; } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyHealButton.addEventListener('click', () => { if (player.profession.includes("刺客")) return; const cost = getDiscountedCost(currentItemCosts.heal.cost); if (currentMoney >= cost) { const effectiveStats = getPlayerEffectiveStats(); if (player.hp < effectiveStats.maxHp) { currentMoney -= cost; player.totalMoneySpent += cost; let healedAmount = (currentItemCosts.heal.type === "percentage") ? Math.round(effectiveStats.maxHp * currentItemCosts.heal.amount) : currentItemCosts.heal.amount; if (currentEnvironment && currentEnvironment.name === "魔法湧泉") { healedAmount *= 2; } player.hp = Math.min(effectiveStats.maxHp, player.hp + healedAmount); gameMessage.textContent = `成功購買！回復了 ${healedAmount} 點生命值！`; } else { gameMessage.textContent = '你的血量已滿！'; } } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyXPButton.addEventListener('click', () => { const cost = getDiscountedCost(baseItemValues.buyXP.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; gainXP(baseItemValues.buyXP.amount); gameMessage.textContent = `成功購買！獲得了 ${baseItemValues.buyXP.amount} 經驗值！`; } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyReflectDamageButton.addEventListener('click', () => { if (!player.profession.includes("盾士")) return; const cost = getDiscountedCost(baseItemValues.reflectDamageUpgrade.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; player.reflectDamage += baseItemValues.reflectDamageUpgrade.amount; gameMessage.textContent = `成功購買！反傷永久提升 ${baseItemValues.reflectDamageUpgrade.amount}%！`; } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyBleedButton.addEventListener('click', () => { if (!player.profession.includes("劍士")) return; const cost = getDiscountedCost(baseItemValues.bleedUpgrade.cost); if (currentMoney >= cost) { currentMoney -= cost; player.totalMoneySpent += cost; player.bleedChance += baseItemValues.bleedUpgrade.amountChance; player.bleedDamagePercentage += baseItemValues.bleedDamagePercentage; gameMessage.textContent = `成功購買！流血機率提升 ${baseItemValues.bleedDamagePercentage}%，傷害提升 ${baseItemValues.bleedDamagePercentage}%！`; } else { gameMessage.textContent = '金錢不足！'; } updateDisplay(); });
buyRandomUpgradeButton.addEventListener('click', buyRandomUpgrade);
buyEvasionButton.addEventListener('click', () => { 
    const cost = getDiscountedCost(baseItemValues.evasionUpgrade.cost);
    let evasionCap = 50;
    if (player.profession.includes("刺客")) {
        evasionCap = 70;
    }
    if (player.evasion >= evasionCap) {
        gameMessage.textContent = '你的基礎閃避率已達上限！';
        return;
    }
    if (currentMoney >= cost) { 
        currentMoney -= cost; 
        player.totalMoneySpent += cost; 
        player.evasion += baseItemValues.evasionUpgrade.amount; 
        gameMessage.textContent = `成功購買！閃避永久提升 ${baseItemValues.evasionUpgrade.amount}%！`; 
    } else { 
        gameMessage.textContent = '金錢不足！'; 
    }updateDisplay();});
const tabNormalQuests = document.getElementById('tabNormalQuests');
const tabTransferQuests = document.getElementById('tabTransferQuests');
const contentNormalQuests = document.getElementById('contentNormalQuests');
const contentTransferQuests = document.getElementById('contentTransferQuests');
const refreshQuestsBtn = document.getElementById('refreshQuestsBtn');
tabNormalQuests.addEventListener('click', () => {
    tabNormalQuests.classList.add('active');
    tabTransferQuests.classList.remove('active');
    contentNormalQuests.classList.add('active');
    contentTransferQuests.classList.remove('active');
});
tabTransferQuests.addEventListener('click', () => {
    tabNormalQuests.classList.remove('active');
    tabTransferQuests.classList.add('active');
    contentNormalQuests.classList.remove('active');
    contentTransferQuests.classList.add('active');
});
refreshQuestsBtn.addEventListener('click', refreshNormalQuests);
document.getElementById('environmentDetailBtn').addEventListener('click', () => {
    if (currentEnvironment) {
        showCustomAlert(`環境: ${currentEnvironment.name}\n\n效果: ${currentEnvironment.description}`);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggleBtn').textContent = '☀️';
    } else {
        document.getElementById('themeToggleBtn').textContent = '🌙';
    }
  if (localStorage.getItem('blockRpgSaveData')) {
      characterSelectionOverlay.style.display = 'none';
      loadGame();
  }else{characterSelectionOverlay.style.display = 'flex';}
  tabUpgrades.classList.add('active');
  contentUpgrades.classList.add('active');
  const tutorialOverlay = document.getElementById('tutorialOverlay');
  const showTutorialBtn = document.getElementById('showTutorialBtn');
  const closeTutorialBtn = document.getElementById('closeTutorialBtn');
  if (showTutorialBtn) {
    showTutorialBtn.addEventListener('click', () => {
        tutorialOverlay.style.display = 'flex';
    });}
  if (closeTutorialBtn) {
    closeTutorialBtn.addEventListener('click', () => {
        tutorialOverlay.style.display = 'none';});}
  if (tutorialOverlay) {
    tutorialOverlay.addEventListener('click', (event) => {
        if (event.target === tutorialOverlay) {
            tutorialOverlay.style.display = 'none';}});}});

function startShortLivedTrialTimer(resetTime = true) {
    stopShortLivedTrialTimer(); // 先確保舊的計時器已停止
    const timerDisplay = document.getElementById('shortLivedTrialTimerDisplay');
    const timerElement = document.getElementById('shortLivedTrialTime');
    if (!timerDisplay || !timerElement) return;

    timerDisplay.style.display = 'block';
    if (resetTime) {
        shortLivedTrialTimeRemaining = 60;
    }
    timerElement.textContent = shortLivedTrialTimeRemaining;

    shortLivedTrialTimer = setInterval(() => {
        shortLivedTrialTimeRemaining--;
        timerElement.textContent = shortLivedTrialTimeRemaining;

        if (shortLivedTrialTimeRemaining <= 0) {
            player.bars--;
            gameMessage.textContent = "時間到！你失去了一條血條！";
            if (player.bars <= 0) {
                endGame('你的血條已耗盡，挑戰失敗...');
            } else {
                startShortLivedTrialTimer();
            }
            updateDisplay();
        }},1000);}

function stopShortLivedTrialTimer() {
    clearInterval(shortLivedTrialTimer);
    shortLivedTrialTimer = null;
    const timerDisplay = document.getElementById('shortLivedTrialTimerDisplay');
    if (timerDisplay) {
        timerDisplay.style.display = 'none';
    }
}

function handleTrialTimerOnLoad() {
    if (activeTrial && activeTrial.id === 'shortLivedTrial') {
        startShortLivedTrialTimer(false);
    } else {
        stopShortLivedTrialTimer();
    }
}