function saveGame() { 
    try { 
        const gameState = { 
            player: { ...player, defeatedEnemies: Array.from(player.defeatedEnemies || []) }, 
            currentWave, 
            currentMoney, 
            currentDimension,
            currentEnvironment,
            activeNormalQuests,
            activeTransferQuests,
            currentItemCosts, 
            gameDifficulty, 
            futureEvents,
            activeTrial,
            selectedDifficulty,
            shortLivedTrialTimeRemaining,
        }; 
        localStorage.setItem('blockRpgSaveData', JSON.stringify(gameState)); 
        gameMessage.textContent = '遊戲進度已儲存！'; 
    } catch (e) { 
        console.error('儲存失敗:', e); 
        gameMessage.textContent = '儲存失敗，可能是瀏覽器不支援或空間已滿。'; 
    }}
function loadGame() { 
    const savedData = localStorage.getItem('blockRpgSaveData'); 
    if (savedData) { 
        try { 
            const gameState = JSON.parse(savedData); 
            let defaultPlayer = {
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
            player = { ...defaultPlayer, ...gameState.player };
            if (player.isTransferred && player.transferTier === undefined) {
                if (player.profession.includes(" | 改")) {
                    player.transferTier = 1;
                }else{
                    player.transferTier=0;}}
            player.transferTier = player.transferTier || 0;
            player.discoveredRecipes = player.discoveredRecipes || {};
            player.relics = player.relics || [];
            player.equippedRelic = player.equippedRelic || null;
            player.defeatedEnemies = new Set(player.defeatedEnemies || []); 
            currentWave = gameState.currentWave; 
            currentMoney = gameState.currentMoney; 
            currentDimension = gameState.currentDimension || 'normal';
            currentEnvironment = gameState.currentEnvironment || null; 
            activeTrial = gameState.activeTrial || null;
            selectedDifficulty = gameState.selectedDifficulty || 'easy';
            shortLivedTrialTimeRemaining = gameState.shortLivedTrialTimeRemaining || 60;
            if (gameState.activeNormalQuests !== undefined && gameState.activeTransferQuests !== undefined) {
                activeNormalQuests = gameState.activeNormalQuests;
                activeTransferQuests = gameState.activeTransferQuests;
            } else if (gameState.activeQuests) {
                activeNormalQuests = gameState.activeQuests.filter(q => !q.isTransferQuest);
                activeTransferQuests = gameState.activeQuests.filter(q => q.isTransferQuest);
            }else{activeNormalQuests=[];activeTransferQuests=[];}
            currentItemCosts = gameState.currentItemCosts; 
            gameDifficulty = gameState.gameDifficulty; 
            futureEvents = gameState.futureEvents || []; 
            characterSelectionOverlay.style.display = 'none'; 
            if (player.swordHolderFightState) {
                if (player.swordHolderFightState.battleWillActive) {
                    player.tempAttackMultiplier = 0.5;
                }player.swordHolderFightState=null;}
            if (player.tempAttackMultiplier < 1.0) {
                const exhaustionEventExists = futureEvents.some(event => 
                    event.endEffect && event.endEffect.toString().includes("脫力效果消失了")
                );
                if (!exhaustionEventExists) {
                    addFutureEvent({
                        wave: currentWave + 3,
                        isEffect: true,
                        endEffect: () => {
                            player.tempAttackMultiplier = 1.0;
                            gameMessage.textContent = "脫力效果消失了，你恢復了正常的力量。";
                            updateDisplay();
                        }});
                    gameMessage.textContent = `進度已讀取！脫力效果將在 3 波後消失。`;
                } else {
                     gameMessage.textContent = `進度已讀取！歡迎回來，目前在第 ${currentWave} 波。`;
                }
            }else{gameMessage.textContent=`進度已讀取！歡迎回來，目前在第 ${currentWave} 波。`;}
            generateEnemy(true); 
            handleTrialTimerOnLoad(); // 處理試煉計時器
            updateAllDisplays(); 
        } catch(e) { 
            console.error('讀取失敗:', e); 
            gameMessage.textContent = '讀取存檔失敗，檔案可能已損壞。'; 
            localStorage.removeItem('blockRpgSaveData'); 
        }}else{gameMessage.textContent = '沒有找到任何存檔。'; }}
function resetGame() { 
    showCustomConfirm(
        "你確定要重置所有進度嗎？\n這個操作無法復原！",
        () => {
            stopShortLivedTrialTimer(); // 確保計時器停止
            localStorage.removeItem('blockRpgSaveData'); 
            window.location.reload(); 
        },
        null, // onCancel can be null to just close the modal
        {
            confirmText: "確定重置",
            cancelText: "取消",
            confirmClass: 'btn-red',
            cancelClass: 'btn-green'
        }
    );
}