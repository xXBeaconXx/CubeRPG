const finalBossStats = {
    name: "最終boss",
    hpPerBar: 99999,
    maxHp: 99999,
    hp: 99999,
    bars: 999,
    barsRemaining: 999,
    totalBars: 999,
    attackMin: 9999,
    attackMax: 9999,
    speed: 999,
    moneyReward: 0,
    xpReward: 0,
};
const timeManipulatorStats = {
    name: "時間操縱者",
    hpPerBar: 1000,
    bars: 10,
    attackMin: 1000,
    attackMax: 1000,
    speed: 100,
    moneyReward: 10000,
    xpReward: 1500,
    specialDrop: { item: "雷電顯示卡", chance: 0.05 } 
};
const tyrantStats = {
    name: "暴虐者",
    hpPerBar: 100000,
    bars: 1,
    attackMin: 1000,
    attackMax: 1000,
    speed: 1,
    moneyReward: 2000,
    xpReward: 10000,
    specialDrop: { item: "原始種子", chance: 0.05 }
};

function summonFinalBoss() {
    if ((player.backpack["月見晶石"] || 0) < 1) {gameMessage.textContent = "你沒有月見晶石！";return;}
    if (isBattleInProgress) {gameMessage.textContent = "戰鬥中無法使用物品！";return;}
    
    showCustomConfirm("你確定要使用月見晶石嗎？\n這將會召喚出無可名狀的恐怖存在，此戰將是你的終點。", () => {
        player.backpack["月見晶石"]--;
        if (player.backpack["月見晶石"] <= 0) {delete player.backpack["月見晶石"];}
        gameMessage.textContent = "你高舉月見晶石，整個世界開始崩塌... 最終boss降臨了！";
        isBattleInProgress = true;
        attackButton.disabled = true;
        currentEnemy = { ...finalBossStats };
        updateAllDisplays();
        setTimeout(() => {
            isBattleInProgress = false;
            attackButton.disabled = false;
            updateDisplay();
        },2000);
    }, null, { confirmText: "確定", cancelText: "取消", confirmClass: 'btn-green', cancelClass: 'btn-red'});
}

function summonSwordHolderBoss() {
    if ((player.backpack["神刃"] || 0) < 1) {
        gameMessage.textContent = "你沒有神刃！";
        return;}
    if (isBattleInProgress) {
        gameMessage.textContent = "戰鬥中無法使用物品！";
        return;}

    showCustomConfirm("你確定要使用神刃嗎？\n這將會召喚出一位強大的持劍者。", () => {
        player.backpack["神刃"]--;
        if (player.backpack["神刃"] <= 0) {
            delete player.backpack["神刃"];
        }
        gameMessage.textContent = "神刃碎裂，一位沉默的持劍者出現在你面前！";
        isBattleInProgress = true;
        attackButton.disabled = true;

        const bossTemplate = normalEnemyTypes.specialBoss["持劍者"];
        currentEnemy = { ...bossTemplate };
        player.swordHolderFightState = { lowHealthCount: 0, battleWillActive: false, wasLowLastUpdate: false };
        player.tempAttackMultiplier = 1.0;
        const effectiveStats = getPlayerEffectiveStats();
        const dynamicAtk = Math.round(1000 + effectiveStats.maxHp * 0.1);
        const dynamicSpd = parseFloat((10 * (1 + effectiveStats.speed * 0.1)).toFixed(1));
        currentEnemy.maxHp = bossTemplate.hpPerBar;
        currentEnemy.hp = bossTemplate.hpPerBar;
        currentEnemy.attackMin = dynamicAtk;
        currentEnemy.attackMax = dynamicAtk;
        currentEnemy.speed = dynamicSpd;
        currentEnemy.barsRemaining = bossTemplate.bars || 1;
        currentEnemy.totalBars = bossTemplate.bars || 1;
        updateAllDisplays();
        setTimeout(() => {
            isBattleInProgress = false;
            attackButton.disabled = false;
            updateDisplay();
        },2000);
    });
}

function summonTimeManipulatorBoss() {
    if ((player.backpack["時空石"] || 0) < 1) {
        gameMessage.textContent = "你沒有時空石！";
        return;}
    if (isBattleInProgress) {
        gameMessage.textContent = "戰鬥中無法使用物品！";
        return;
    }
    if (currentDimension !== 'future') {
        gameMessage.textContent = "時空石只能在未來維度中產生共鳴！";
        return;
    }

    showCustomConfirm("你確定要使用時空石嗎？\n這將會召喚出時間的操縱者，一場艱難的戰鬥即將開始。", () => {
        player.backpack["時空石"]--;
        if (player.backpack["時空石"] <= 0) {
            delete player.backpack["時空石"];
        }
        gameMessage.textContent = "時空石碎裂，周圍的時間流動變得極不穩定... 時間操縱者降臨了！";
        isBattleInProgress = true;
        attackButton.disabled = true;

        const bossTemplate = timeManipulatorStats;
        currentEnemy = { 
            ...bossTemplate,
            turnCounter: 0 
        };
        currentEnemy.maxHp = bossTemplate.hpPerBar;
        currentEnemy.hp = bossTemplate.hpPerBar;
        currentEnemy.barsRemaining = bossTemplate.bars || 1;
        currentEnemy.totalBars = bossTemplate.bars || 1;
        updateAllDisplays();
        setTimeout(() => {
            isBattleInProgress = false;
            attackButton.disabled = false;
            updateDisplay();
        },2000);
    });
}

function summonTyrantBoss() {
    if ((player.backpack["遠古核心"] || 0) < 1) {
        gameMessage.textContent = "你沒有遠古核心！";
        return;
    }
    if (isBattleInProgress) {
        gameMessage.textContent = "戰鬥中無法使用物品！";
        return;
    }
    if (currentDimension !== 'ancient') {
        gameMessage.textContent = "遠古核心只能在遠古維度中被激活！";
        return;
    }
    
    showCustomConfirm("你確定要使用遠古核心嗎？\n一股純粹的暴虐能量即將被釋放。", () => {
        player.backpack["遠古核心"]--;
        if (player.backpack["遠古核心"] <= 0) { delete player.backpack["遠古核心"]; }
        gameMessage.textContent = "核心碎裂，大地顫抖... 暴虐者降臨了！";
        isBattleInProgress = true;
        attackButton.disabled = true;

        currentEnemy = { ...tyrantStats };
        currentEnemy.maxHp = tyrantStats.hpPerBar;
        currentEnemy.hp = tyrantStats.hpPerBar;
        currentEnemy.barsRemaining = tyrantStats.bars || 1;
        currentEnemy.totalBars = tyrantStats.bars || 1;

        updateAllDisplays();
        setTimeout(() => {
            isBattleInProgress = false;
            attackButton.disabled = false;
            updateDisplay();
        }, 2000);
    });
}
function handleFinalBossDefeat() {
    attackButton.disabled = true;
    isBattleInProgress = true;
    shopContainer.style.pointerEvents = 'none';
    const finalStats = getPlayerEffectiveStats();
    document.getElementById('wavesCleared').textContent = currentWave;
    document.getElementById('finalLevel').textContent = player.level;
    document.getElementById('finalProfession').textContent = player.profession;
    document.getElementById('totalMoneySpent').textContent = player.totalMoneySpent;
    document.getElementById('finalMaxHP').textContent = finalStats.maxHp;
    document.getElementById('finalAttack').textContent = `${finalStats.attackMin} - ${finalStats.attackMax}`;
    document.getElementById('finalSpeed').textContent = finalStats.speed.toFixed(1);
    document.getElementById('settlementOverlay').style.display = 'flex';
}