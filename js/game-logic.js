let currentEnvironment = null;

function getPlayerEffectiveStats() {
    let stats = {
        maxHp: player.maxHp,
        attackMin: player.attackMin,
        attackMax: player.attackMax,
        speed: player.speed,
        critChance: player.critChance,
        critDamage: player.critDamage,
        evasion: player.evasion,
        reflectDamage: player.reflectDamage,
        bleedChance: player.bleedChance,
        moneyBonusPercent: (player.moneyBonusPercent || 0) * 100,
        xpBonusPercent: (player.xpBonusPercent || 0) * 100
    };
    // 若本場敵人有遺忘詞綴，遺物無效
    if (!(currentEnemy && currentEnemy.forgetRelics)) {
        if (player.equippedRelic) {
            const relic = player.equippedRelic;
            const bonus = relic.bonus;
            switch (relic.stat) {
                case 'maxHp':
                case 'attack':
                case 'speed':
                case 'critDamage':
                    const multiplier = 1 + bonus / 100;
                    if (relic.stat === 'maxHp') stats.maxHp = Math.round(stats.maxHp * multiplier);
                    if (relic.stat === 'attack') {
                        stats.attackMin = Math.round(stats.attackMin * multiplier);
                        stats.attackMax = Math.round(stats.attackMax * multiplier);
                    }
                    if (relic.stat === 'speed') stats.speed = parseFloat((stats.speed * multiplier).toFixed(1));
                    if (relic.stat === 'critDamage') stats.critDamage = parseFloat((stats.critDamage * multiplier).toFixed(1));
                    break;
                case 'critChance': stats.critChance += bonus; break;
                case 'evasion': stats.evasion += bonus; break;
                case 'reflectDamage': stats.reflectDamage += bonus; break;
                case 'bleedChance': stats.bleedChance += bonus; break;
                case 'moneyBonus': stats.moneyBonusPercent += bonus; break;
                case 'xpBonus': stats.xpBonusPercent += bonus; break;
            }
        }
    }

    if (currentEnvironment && currentEnvironment.applyEffect && currentEnvironment.isAppliedTo !== 'enemy' && !currentEnvironment.paused) {
        stats = currentEnvironment.applyEffect(stats);
    }

    let evasionCap = 50;
    if (player.profession.includes("刺客")) {
        evasionCap = 70;
    }
    stats.evasion = Math.min(stats.evasion, evasionCap);
    const attackMultiplier = player.tempAttackMultiplier || 1.0;
    stats.attackMin = Math.round(stats.attackMin * attackMultiplier);
    stats.attackMax = Math.round(stats.attackMax * attackMultiplier);
    return stats;
}
function resetPlayerTempStats() { 
    player.tempAttackMin = 0; 
    player.tempAttackMax = 0; 
    player.bonusMinAttack = 0; 
    player.tempSpeed = 0; 
    player.tempCritChance = 0; 
    player.tempAttackToMax = false; 
    player.canTakeDamagePenalty = false; 
    player.isHealingTurn = false; 
    player.damagePenaltyPercent = 0;
    player.tempDamageMultiplier = 1.0;
    player.tempIncomingDamageMultiplier = 1.0;
    currentTurnAbilityApplied = null; 
}
function generateEnemy(isFromLoad = false) {
  if (activeTrial && activeTrial.id === 'shortLivedTrial' && !isFromLoad) {
    startShortLivedTrialTimer();
  }
  if (!isFromLoad) {
      if (activeTrial && activeTrial.id === 'assassinChaos' && currentWave > 1) {
          const values = [player.maxHp, player.attackMax, player.speed];
          for (let i = values.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [values[i], values[j]] = [values[j], values[i]];
          }
          player.maxHp = Math.max(1, Math.round(values[0]));
          player.attackMax = Math.max(1, Math.round(values[1]));
          player.speed = Math.max(0, parseFloat(values[2].toFixed(1)));
          player.hp = player.maxHp;
          gameMessage.textContent = '混亂降臨！你的屬性已被重塑！';
      }
      let preCombatMessage = "";
      if (player.nextWaveSpeedBoost > 0) {
          player.speed += player.nextWaveSpeedBoost;
          preCombatMessage += `你的速度因「劍光」效果，永久提升了 ${player.nextWaveSpeedBoost} 點！ `;
          player.nextWaveSpeedBoost = 0;
      }
      if ((player.waveRegenPercent || 0) > 0) {
        const effectiveStats = getPlayerEffectiveStats();
        const regenAmount = Math.round(effectiveStats.maxHp * player.waveRegenPercent);
        if (player.hp < effectiveStats.maxHp && regenAmount > 0) {
             player.hp = Math.min(effectiveStats.maxHp, player.hp + regenAmount);
             preCombatMessage += `你戰後休整，回復了 ${regenAmount} 點生命。`;
        }}
      if(preCombatMessage && !gameMessage.textContent.includes('混亂降臨')) gameMessage.textContent = preCombatMessage;
      else if (preCombatMessage) gameMessage.textContent += " " + preCombatMessage;
  }
  // --- BATTLEFIELD ENVIRONMENT LOGIC ---
  let shouldGenerateNewEnv = false;
  // 檢查當前環境是否已結束
  if (currentEnvironment && currentEnvironment.duration > 0) {
      currentEnvironment.duration--;
      if (currentEnvironment.duration <= 0) {
          gameMessage.textContent += ` ${currentEnvironment.name} 的效果消失了。`;
          currentEnvironment = null;
      }}
  // 如果當前沒有環境，且符合生成條件，則生成新環境
  if (!currentEnvironment && !isFromLoad && currentDimension === 'normal' && (currentWave - 1) % 5 === 0) {
      shouldGenerateNewEnv = true;
  }
  if (shouldGenerateNewEnv) {
      // 過濾掉只能由物品觸發的場地
      const availableEnvKeys = Object.keys(battlefieldEnvironments).filter(key => !battlefieldEnvironments[key].isItemEffect);
      if (availableEnvKeys.length > 0) {
          const randomKey = availableEnvKeys[Math.floor(Math.random() * availableEnvKeys.length)];
          currentEnvironment = { ...battlefieldEnvironments[randomKey] };
          gameMessage.textContent = `戰場環境變為：${currentEnvironment.name}！`;
      }
  } else if (currentDimension !== 'normal') {
      currentEnvironment = null; // 在非普通維度時清除環境
  }
  let enemyToSpawn = null;
  let waveMessage = '';
  let enemyPool;
  switch (currentDimension) {
      case 'ancient': 
          enemyPool = currentWave <= 50 ? ancientEnemyTypes.tier1 : (currentWave <= 100 ? ancientEnemyTypes.tier2 : ancientEnemyTypes.tier3);
          waveMessage = `遠古維度波次 ${currentWave}：`; 
          break;
      case 'future': 
          enemyPool = currentWave <= 50 ? futureEnemyTypes.tier1 : (currentWave <= 100 ? futureEnemyTypes.tier2 : futureEnemyTypes.tier3);
          waveMessage = `未來維度波次 ${currentWave}：`; 
          break;
      case 'shattered':
          const allTiers = {...normalEnemyTypes.tier1, ...normalEnemyTypes.tier2, ...normalEnemyTypes.tier3, ...normalEnemyTypes.boss, ...ancientEnemyTypes.tier1, ...ancientEnemyTypes.tier2, ...ancientEnemyTypes.tier3, ...futureEnemyTypes.tier1, ...futureEnemyTypes.tier2, ...futureEnemyTypes.tier3};
          enemyPool = allTiers;
          waveMessage = `破碎次元波次 ${currentWave}：`; 
          break;
      case 'shattered_2':
          const allBaseEnemies = {...normalEnemyTypes.tier1, ...normalEnemyTypes.tier2, ...normalEnemyTypes.tier3, ...ancientEnemyTypes.tier1, ...ancientEnemyTypes.tier2, ...ancientEnemyTypes.tier3, ...futureEnemyTypes.tier1, ...futureEnemyTypes.tier2, ...futureEnemyTypes.tier3};
          const baseKeys = Object.keys(allBaseEnemies);
          const randomBaseKey = baseKeys[Math.floor(Math.random() * baseKeys.length)];
          const baseEnemy = allBaseEnemies[randomBaseKey];
          enemyToSpawn = {...baseEnemy};
          enemyToSpawn.name = `${baseEnemy.name} II`;
          enemyToSpawn.hpPerBar = Math.round(baseEnemy.hpPerBar * 50); 
          enemyToSpawn.bars = (baseEnemy.bars || 1) + 4;
          enemyToSpawn.attackMin = Math.round(baseEnemy.attackMin * 10);
          enemyToSpawn.attackMax = Math.round(baseEnemy.attackMax * 10);
          waveMessage = `破碎次元 II 波次 ${currentWave}：`;
          break;
      case 'shattered_3':
          const allBaseEnemiesFor3 = {...normalEnemyTypes.tier1, ...normalEnemyTypes.tier2, ...normalEnemyTypes.tier3, ...ancientEnemyTypes.tier1, ...ancientEnemyTypes.tier2, ...ancientEnemyTypes.tier3, ...futureEnemyTypes.tier1, ...futureEnemyTypes.tier2, ...futureEnemyTypes.tier3};
          const baseKeysFor3 = Object.keys(allBaseEnemiesFor3);
          const randomBaseKeyFor3 = baseKeysFor3[Math.floor(Math.random() * baseKeysFor3.length)];
          const baseEnemyFor3 = allBaseEnemiesFor3[randomBaseKeyFor3];
          enemyToSpawn = {...baseEnemyFor3};
          enemyToSpawn.name = `${baseEnemyFor3.name} III`;
          enemyToSpawn.hpPerBar = Math.round(baseEnemyFor3.hpPerBar * 50 * 2); 
          enemyToSpawn.bars = ((baseEnemyFor3.bars || 1) + 4) * 2;
          enemyToSpawn.attackMin = Math.round(baseEnemyFor3.attackMin * 10 * 2);
          enemyToSpawn.attackMax = Math.round(baseEnemyFor3.attackMax * 10 * 2);
          waveMessage = `破碎次元 III 波次 ${currentWave}：`;
          break;
      default:
          if (currentWave > 0 && currentWave % 50 === 0) {
              enemyPool = normalEnemyTypes.boss;
          } else if (currentWave <= 50) {
              enemyPool = normalEnemyTypes.tier1;
          } else if (currentWave <= 100) {
              enemyPool = normalEnemyTypes.tier2;
          } else {
              enemyPool = normalEnemyTypes.tier3;
          }
          waveMessage = `第 ${currentWave} 波：`; 
          break;
  }
  if (!enemyToSpawn) {
      const enemyKeys = Object.keys(enemyPool);
      const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
      enemyToSpawn = enemyPool[randomKey];
  }

  waveMessage += `${enemyToSpawn.name} 出現了！`;
  
  const growthFactor = 1 + (Math.floor((currentWave - 1) / 10) * 0.1);
  currentEnemy = { ...enemyToSpawn };

  currentEnemy.isBoss = Object.values(normalEnemyTypes.boss).some(b => b.name === currentEnemy.name) || 
                         Object.values(normalEnemyTypes.specialBoss).some(b => b.name === currentEnemy.name);
  if (currentEnemy.isBoss && currentEnvironment) {
    currentEnvironment.paused = true;
  } else if (!currentEnemy.isBoss && currentEnvironment && currentEnvironment.paused) {
    delete currentEnvironment.paused;
  }
  
  if (!currentEnemy.name.includes(" II") && !currentEnemy.name.includes(" III")) {
      currentEnemy.maxHp = Math.round(enemyToSpawn.hpPerBar * growthFactor * gameDifficulty.enemyMultiplier);
      currentEnemy.attackMin = Math.round(enemyToSpawn.attackMin * growthFactor * gameDifficulty.enemyMultiplier);
      currentEnemy.attackMax = Math.round(enemyToSpawn.attackMax * growthFactor * gameDifficulty.enemyMultiplier);
  } else {
      currentEnemy.maxHp = Math.round(currentEnemy.hpPerBar * growthFactor);
      currentEnemy.attackMin = Math.round(currentEnemy.attackMin * growthFactor);
      currentEnemy.attackMax = Math.round(currentEnemy.attackMax * growthFactor);
  }
  currentEnemy.hp = currentEnemy.maxHp;
  currentEnemy.barsRemaining = currentEnemy.bars || 1;
  currentEnemy.totalBars = currentEnemy.bars || 1;
  currentEnemy.affixes = [];
  const affixKeys = Object.keys(enemyAffixes);
  let affixCount = 0;
  if (currentEnemy.isBoss) {
    affixCount = 4;
  } else if (currentWave >= 200) {
    affixCount = 3;
  } else if (currentWave >= 100) {
    affixCount = 2;
  } else if (currentWave >= 80) {
    affixCount = Math.random() < 0.5 ? 1 : 2;
  } else if (currentWave >= 20) {
    affixCount = 1;
  }
  if (selectedDifficulty === 'easy') {
      affixCount = Math.min(affixCount, 1);
  } else if (selectedDifficulty === 'normal') {
      affixCount = Math.min(affixCount, 2);
  }
  if (affixCount > 0) {
    const shuffledKeys = [...affixKeys].sort(() => 0.5 - Math.random());
    for (let i = 0; i < affixCount && i < shuffledKeys.length; i++) {
        const key = shuffledKeys[i];
        const newAffix = { ...enemyAffixes[key] };
        currentEnemy.affixes.push(newAffix);
        if (newAffix.applyStats) {
            newAffix.applyStats(currentEnemy);
        }}}
  if (currentEnvironment && currentEnvironment.name === "雷電場地" && !currentEnvironment.paused) {
    currentEnemy.evasion = (currentEnemy.evasion || 0) + 5;
  }
  if (currentEnvironment && currentEnvironment.name === "原始場地" && !currentEnvironment.paused) {
      currentEnemy.maxHp = Math.round(currentEnemy.maxHp * 1.3);
      currentEnemy.hp = currentEnemy.maxHp;
      currentEnemy.attackMin = Math.round(currentEnemy.attackMin * 1.3);
      currentEnemy.attackMax = Math.round(currentEnemy.attackMax * 1.3);
  }
  if (currentEnvironment && currentEnvironment.applyEffect && currentEnvironment.isAppliedTo !== 'player' && !currentEnvironment.paused) {
      const tempStats = { speed: currentEnemy.speed, critDamage: 1.5, evasion: currentEnemy.evasion };
      const modifiedStats = currentEnvironment.applyEffect(tempStats);
      currentEnemy.speed = modifiedStats.speed;
      currentEnemy.evasion = modifiedStats.evasion;
  }

  if (player.volcanoEruption && player.volcanoEruption.duration > 0) {
      currentEnemy.attackMin = Math.round(currentEnemy.attackMin * 1.3);
      currentEnemy.attackMax = Math.round(currentEnemy.attackMax * 1.3);
  }
  enemyBleedStatusData = null;
  currentEnemy.isDisrupted = false;
  if (!isFromLoad) {
      for (const abilityName in player.abilities) {
          if (player.abilities[abilityName].learned) {
              const abilityDef = allAbilities[abilityName];
              const playerAbility = player.abilities[abilityName];
              playerAbility.maxPP = abilityDef.basePP + (abilityDef.getIncreasedPP(playerAbility.level) || 0);
              playerAbility.currentPP = playerAbility.maxPP;
          }}
      if (!gameMessage.textContent.includes('返回了') && !gameMessage.textContent.includes('進入了') && !gameMessage.textContent.includes('休整') && !gameMessage.textContent.includes('混亂降臨') && !gameMessage.textContent.includes('戰場環境變為')) {
          gameMessage.textContent = waveMessage + " 點擊「攻擊」開始戰鬥！";
      } else if (!isFromLoad) {
          gameMessage.textContent += " " + waveMessage + " 點擊「攻擊」開始戰鬥！";
      }}
  player.questTracking = null;
  const variantQuest = activeTransferQuests.find(q => q.id === 'variantTransfer' && !q.completed);
  if (variantQuest && variantQuest.targetEnemy.includes(currentEnemy.name)) {
      player.questTracking = {
          questId: 'variantTransfer',
          conditionMet: true,
          enemyName: currentEnemy.name
      };
      gameMessage.textContent += " (轉職任務目標出現！)";
  }
  attackButton.disabled = false;
  updateDisplay();
}

function handleShortLivedBarLoss(reason) {
    if (player.bars <= 1) {
        player.bars = 0;
        return { battleOver: true, message: `${reason} 你的血條已耗盡。` };
    }
    player.bars--;
    if (!activeTrial || activeTrial.id !== 'shortLivedTrial') {
        player.maxBars--;
    }
    const atkBoost = Math.round(player.attackMax * 0.10);
    player.attackMax += atkBoost;
    const quest = activeTransferQuests.find(q => q.id === 'shortlivedTransfer' && !q.completed);
    if (quest) {
        quest.currentProgress++;
        updateQuestDisplay();
    }

    return { 
        battleOver: false, 
        message: `${reason} 你失去了一條血條，但最大攻擊力提升了 ${atkBoost}！` 
    };
}
async function startBattleTurn() {
  if (activeTrial && activeTrial.id === 'shortLivedTrial') { currentTurnAbilityApplied = null; } // 短命試煉禁用技能
  if (isBattleInProgress) return;
  isBattleInProgress = true; attackButton.disabled = true; gameMessage.textContent = ''; resetPlayerTempStats();
  
  if (currentEnvironment && currentEnvironment.name === "原始場地" && !currentEnvironment.paused) {
      const healAmount = Math.round(getPlayerEffectiveStats().maxHp * 0.10);
      player.hp = Math.min(getPlayerEffectiveStats().maxHp, player.hp + healAmount);
      showFloatingText(`+${healAmount}`, playerChar, 'heal');
      gameMessage.textContent += `原始場地為你回復了 ${healAmount} 生命！ `;
  }
  if (currentEnemy.affixes) {
      currentEnemy.affixes.forEach(affix => {
          if (affix.onTurnStart) {
              affix.onTurnStart(currentEnemy);
          }
      });
  }

  if (currentEnemy.name === "時間操縱者") {
      currentEnemy.turnCounter = (currentEnemy.turnCounter || 0) + 1;
  }
  player.shield = 0;
  if (player.rampingAttack > 0) {
    player.attackMin += player.rampingAttack;
    player.attackMax += player.rampingAttack;
    player.rampingAttackBonus += player.rampingAttack;
    gameMessage.textContent += `永恆怒火使你攻擊力提升 ${player.rampingAttack}！ `;
  }
  const effectiveStats = getPlayerEffectiveStats();
  if (player.turnStartHeal > 0) {
      player.hp = Math.min(effectiveStats.maxHp, player.hp + player.turnStartHeal);
      showFloatingText(`+${player.turnStartHeal}`, playerChar, 'heal');
      gameMessage.textContent += `霸者之證為你回復了 ${player.turnStartHeal} 生命！ `;
  }
  if (currentEnemy.name === "魔王方塊") { turnsAgainstBoss++; }
  let playerAction = 'attack';
  if (!(activeTrial && activeTrial.id === 'shortLivedTrial')) { 
    if (player.isDrawingSword) { playerAction = 'drawSwordAttack'; } else { const priorityAbilityName = player.priorityAbility; if (priorityAbilityName && player.abilities[priorityAbilityName]?.learned && player.abilities[priorityAbilityName].currentPP > 0) { currentTurnAbilityApplied = priorityAbilityName; if (priorityAbilityName === '拔刀斬') { playerAction = 'drawSwordCharge'; } else if (priorityAbilityName === '劍光') { playerAction = 'swordLightAttack'; } } }
  }
  if (player.questTracking?.questId === 'variantTransfer' && currentTurnAbilityApplied !== '防禦姿態') {
      if (player.questTracking.conditionMet) {
          gameMessage.textContent += " (轉職任務失敗：未使用防禦姿態！) ";
      }
      player.questTracking.conditionMet = false;
  }
  if (currentTurnAbilityApplied) { 
      const abilityDef = allAbilities[currentTurnAbilityApplied]; 
      const playerAbility = player.abilities[currentTurnAbilityApplied]; 
      if (playerAction === 'drawSwordCharge' || (currentTurnAbilityApplied !== '拔刀斬')) { 
          gameMessage.textContent += `你使用了「${currentTurnAbilityApplied}」！`; 
          playerAbility.currentPP--; 

          // Track quest progress for ability usage
          const phantomBladeQuest = activeTransferQuests.find(q => q.id === 'phantomBladeTransfer' && !q.completed);
          if (phantomBladeQuest && currentTurnAbilityApplied === '拔刀斬') {
              phantomBladeQuest.currentProgress++;
              updateQuestDisplay();
          }

          if (currentTurnAbilityApplied === '狂暴') { 
              player.tempAttackMin += abilityDef.getAttackBoost(playerAbility.level); 
              player.tempAttackMax += abilityDef.getAttackBoost(playerAbility.level); 
              player.tempSpeed += abilityDef.getSpeedBoost(playerAbility.level); 
          } else if (currentTurnAbilityApplied === '猛擊') { 
              player.tempAttackToMax = true; 
              player.tempCritChance += abilityDef.getCritChanceBoost(playerAbility.level); 
              player.canTakeDamagePenalty = true; 
          } else if (currentTurnAbilityApplied === '治癒') { 
              player.isHealingTurn = true; 
          } else if (currentTurnAbilityApplied === '防禦姿態') {
              const shieldAmount = Math.round(effectiveStats.maxHp * abilityDef.getShieldPercent());
              player.shield += shieldAmount;
              player.damagePenaltyPercent = abilityDef.getDamagePenalty();
              gameMessage.textContent += ` 你獲得了 ${shieldAmount} 點護盾！`;
          } else if (currentTurnAbilityApplied === '攻擊姿態') {
              player.tempDamageMultiplier = abilityDef.getDamageMultiplier();
              player.tempIncomingDamageMultiplier = abilityDef.getIncomingDamageMultiplier();
          } else if (currentTurnAbilityApplied === '破財免災') {
              player.tempDamageMultiplier = abilityDef.getDamageMultiplier();
          } else if (currentTurnAbilityApplied === '高速移動') {
              player.guaranteedDodge = true;
          }}}
  if (enemyBleedStatusData && enemyBleedStatusData.turnsRemaining > 0) {
      const bleedDamage = Math.round(enemyBleedStatusData.baseDamage * (enemyBleedStatusData.damagePercentage / 100));
      currentEnemy.hp -= bleedDamage;
      showFloatingText(`-${bleedDamage}`, enemyChar, 'bleed');
      gameMessage.textContent += `${currentEnemy.name} 因流血損失了 ${bleedDamage} 點生命值！ `;
      if (currentEnemy.hp <= 0) { currentEnemy.barsRemaining--; if (currentEnemy.barsRemaining > 0) { currentEnemy.hp = currentEnemy.maxHp; gameMessage.textContent += ` ${currentEnemy.name}因流血擊破了一條血條！`; } else { currentEnemy.hp = 0; } }
      enemyBleedStatusData.turnsRemaining--;
      hitAnimation(enemyChar); updateDisplay();
      if (currentEnemy.hp <= 0 && currentEnemy.barsRemaining <= 0) { handleEnemyDefeat(currentEnemy.name, false); return; }
      await new Promise(resolve => setTimeout(resolve, 800));
  }
  let firstAttacker = (effectiveStats.speed + player.tempSpeed >= currentEnemy.speed) ? player : currentEnemy;
  let secondAttacker = (firstAttacker === player) ? currentEnemy : player;
  if (currentEnvironment && currentEnvironment.name === "原始場地" && !currentEnvironment.paused) {
      firstAttacker = currentEnemy;
      secondAttacker = player;
  }
  if (currentTurnAbilityApplied === '幻劍') {
      firstAttacker = player;
      secondAttacker = currentEnemy;
  }
  const firstAttackResult = await performAction(firstAttacker, secondAttacker, playerAction);
  if (firstAttackResult.battleOver) return;
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (firstAttackResult.enemyDefeatedOnTheirTurn){
      handleEnemyDefeat(currentEnemy.name, true,true);
      return;}
  const secondAttackResult = await performAction(secondAttacker, firstAttacker, playerAction);
  if (secondAttackResult.battleOver) return;
  if(secondAttackResult.enemyDefeatedOnTheirTurn){
      handleEnemyDefeat(currentEnemy.name, true, true);
      return;
  }
    if (currentEnvironment && currentEnvironment.name === "腐蝕沼澤" && !currentEnvironment.paused) {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (player.profession.includes("短命方塊")) {
            const lossResult = handleShortLivedBarLoss("腐蝕沼澤吞噬了你一條血條！");
            showFloatingText(`-1`, playerChar, 'bleed');
            gameMessage.textContent += lossResult.message;
            if (lossResult.battleOver) {
                updateDisplay();
                endGame(lossResult.message); 
                return;
            }
        } else {
            const playerCorrode = Math.round(getPlayerEffectiveStats().maxHp * 0.05);
            if (player.hp > playerCorrode) player.hp -= playerCorrode; else player.hp = 1;
            showFloatingText(`-${playerCorrode}`, playerChar, 'bleed');
             if (player.hp <= 1) { 
                updateDisplay();
                endGame(`你被腐蝕沼澤吞噬了。`); 
                return;
            }}
        const enemyCorrode = Math.round(currentEnemy.maxHp * 0.05);
        currentEnemy.hp -= enemyCorrode;
        showFloatingText(`-${enemyCorrode}`, enemyChar, 'bleed');
        if (!gameMessage.textContent.includes("血條")) {
            gameMessage.textContent += ` 腐蝕沼澤對雙方造成了傷害！`;
        }
        updateDisplay();
        if (currentEnemy.hp <= 0 && currentEnemy.barsRemaining <= 0) {
            handleEnemyDefeat(currentEnemy.name, false); return;
        }}
  gameMessage.textContent += ' 回合結束。'; isBattleInProgress = false; attackButton.disabled = false; updateDisplay();
}
function handleEnemyDefeat(enemyName, inOneTurn, isCounterKill = false) {
    // 交換詞綴：擊敗時標記
    if (currentEnemy.affixes) {
        currentEnemy.affixes.forEach(affix => {
            if (affix.onDefeat) {
                affix.onDefeat(currentEnemy);
            }
        });
    }
    if (currentEnemy.affixes) {
        currentEnemy.affixes.forEach(affix => {
            if (affix.onDeath) {
                affix.onDeath(currentEnemy, player);
                // 修正短命方塊被荊棘/復仇一次擊敗的問題
                if (player.hp <= 0 && player.profession && player.profession.includes("短命方塊") && player.bars > 1 && !(activeTrial && activeTrial.id === 'swordsmanAttack')) {
                    // 觸發短命方塊血條損失而非直接死亡
                    const lossResult = handleShortLivedBarLoss('你被敵人的復仇擊敗了...');
                    gameMessage.textContent += lossResult.message;
                    if (lossResult.battleOver) {
                        endGame(lossResult.message);
                        return;
                    } else {
                        player.hp = player.maxHp;
                    }
                } else if (player.hp <= 0 && !(activeTrial && activeTrial.id === 'swordsmanAttack')) {
                    endGame('你被敵人的復仇擊敗了...');
                    return;
                }
            }
        });
    }
    if (player.hp <= 0) return;

    if (enemyName === "最終boss") {
        handleFinalBossDefeat();
        return;
    }
    let specialRewardMessage = '';
    if (enemyName === "時間操縱者"){
        if (Math.random()<0.7){
            currentWave+=50;
            specialRewardMessage = `\n時間操縱者死亡的能量將時間線快轉了 50 波！`;
        }else{
            currentWave = Math.max(1, currentWave - 50);
            specialRewardMessage = `\n時間操縱者死亡的能量將時間線倒轉了 50 波！`;
        }
    }
    if (enemyName === "暴虐者") {
        let tyrantRewardMsg = "\n暴虐者的能量四散，你獲得了：";
        let gotReward = false;
        if (Math.random() < 0.05) {
            addItemToBackpack("月見 III", 2);
            tyrantRewardMsg += "【月見 III】x2！ ";
            gotReward = true;
        }
        if (Math.random() < 0.20) {
            addItemToBackpack("月見 II", 2);
            tyrantRewardMsg += "【月見 II】x2！ ";
            gotReward = true;
        }
        if (Math.random() < 0.50) {
            addItemToBackpack("月見 I", 2);
            tyrantRewardMsg += "【月見 I】x2！ ";
            gotReward = true;
        }
        if (gotReward) {
            specialRewardMessage += tyrantRewardMsg;
        } else {
            specialRewardMessage += "\n暴虐者的能量消散了，你沒有獲得任何特殊獎勵。";
        }
    }

    checkFutureEvents(true);
    checkTemporaryWeapon();
    checkAllQuestProgress(enemyName, inOneTurn);
    let xpGained = currentEnemy.xpReward;
    if (enemyName === "持劍者") {
        if (player.profession.includes("劍士")) {
            xpGained *= 2;
        } else if (player.profession.includes("盾士")) {
            xpGained = Math.round(xpGained * 0.5);
        }}
    let fragmentMultiplier = (currentEnemy.affixes && currentEnemy.affixes.length > 0) ? 2 : 1;
    const effectiveStats = getPlayerEffectiveStats();
    let moneyGained = Math.round(currentEnemy.moneyReward * gameDifficulty.moneyMultiplier * (1 + effectiveStats.moneyBonusPercent / 100 + (player.weaponMoneyBonus || 0)));
    // 交換詞綴：擊敗時交換金錢與經驗
    if (currentEnemy.exchangeReward) {
        const tmp = moneyGained;
        moneyGained = xpGained;
        xpGained = tmp;
        gameMessage.textContent += ' [交換] 詞綴觸發，金錢與經驗已交換！';
    }
    if (currentEnvironment && currentEnvironment.name === "原始場地") {
        moneyGained = Math.round(moneyGained * 1.3);
    }
    if (isCounterKill){moneyGained=Math.round(moneyGained * 0.5);}
    let message = `恭喜你！你擊敗了${enemyName}`;
    if (currentTurnAbilityApplied === '破財免災' && (!activeTrial || activeTrial.id !== 'shortLivedTrial')) {
        player.bars++;
        player.maxBars++;
        message += `，你用「破財免災」獻祭了金錢，換來了一條新的血條！`;
    } else {
        currentMoney += moneyGained;
        if (moneyGained > 0) message += `，獲得了 ${moneyGained} 金錢` + (isCounterKill ? " (反制擊殺-50%)" : "");
    }
    message+=`！`;
    if (specialRewardMessage) {
        message += specialRewardMessage;
    }
    const relicMessage = gainRandomRelic();
    if(relicMessage){message+=`\n${relicMessage}`;}
    let originalEnemyName = enemyName.replace("熔岩強化的 ", "").replace(/ II$/, "").replace(/ III$/, "");
    if (originalEnemyName === "過去的幻影") originalEnemyName = "精英方塊";
    let fragmentToDrop;
    if (enemyName.endsWith(" III")) {
        fragmentToDrop = `${originalEnemyName}碎片 III`;
    } else if (enemyName.endsWith(" II")) {fragmentToDrop = `${originalEnemyName}碎片 II`;
    }else{fragmentToDrop=`${originalEnemyName}碎片`;}
    if (fragmentStats[fragmentToDrop]) {
        addItemToBackpack(fragmentToDrop, fragmentMultiplier);
        message+=`獲得了${fragmentMultiplier}個【${fragmentToDrop}】！`;
        if ((player.extraFragmentChance || 0) > 0 && Math.random() < player.extraFragmentChance) {
            addItemToBackpack(fragmentToDrop, 1);
            message+=`你幸運地額外獲得了1個【${fragmentToDrop}】！`;
        }}
    if (currentEnemy.specialDrop && Math.random() < currentEnemy.specialDrop.chance) {
        addItemToBackpack(currentEnemy.specialDrop.item, 1);
        message += `\n你發現了稀有材料：【${currentEnemy.specialDrop.item}】！`;
    }
    if (enemyName === "持劍者") {
        let specialRewardMessage = "";
        if (Math.random() < 0.05) {
            addItemToBackpack("劍刃", 10);
            specialRewardMessage += "\n你獲得了特殊獎勵：【劍刃】 x10！";
        }
        if (Math.random() < 0.05) {
            addItemToBackpack("碎刃", 10);
            specialRewardMessage += "\n你獲得了特殊獎勵：【碎刃】 x10！";
        }
        if(specialRewardMessage) {
            message += specialRewardMessage;
        }
        player.swordHolderFightState = null;
        player.tempAttackMultiplier = 0.5;
        addFutureEvent({
            wave: currentWave + 3,
            isEffect: true,
            endEffect: () => {
                player.tempAttackMultiplier = 1.0;
                gameMessage.textContent = "脫力效果消失了，你恢復了正常的力量。";
                updateDisplay();
            }});
        message += "\n戰鬥結束後你感到極度脫力，接下來3波攻擊力降低50%！";}
    if (player.volcanoEruption && player.volcanoEruption.duration > 0) {
        const fragmentTypes = ["遠古方塊碎片", "遠古巨獸方塊碎片"];
        const fragmentFound = fragmentTypes[Math.floor(Math.random() * fragmentTypes.length)];
        addItemToBackpack(fragmentFound, 1);
        message += `\n你從熔岩中獲得了額外的【${fragmentFound}】！`;
        player.volcanoEruption.duration--;
    }
    const powerfulEnemies = ["史前暴虐方塊", "量子糾纏方塊", "神劍方塊", "神盾方塊", "魔王方塊"];
    if (powerfulEnemies.includes(originalEnemyName)) {
        player.defeatedEnemies.add(originalEnemyName);
    }
    if (player.rampingAttackBonus > 0) {
        player.attackMin -= player.rampingAttackBonus;
        player.attackMax -= player.rampingAttackBonus;
        player.rampingAttackBonus = 0;
        message += " 永恆怒火的力量平息了。";
    }
    if (player.profession.includes("短命方塊") && (!activeTrial || activeTrial.id !== 'shortLivedTrial')) {
        const milestone = Math.floor(currentWave / 50);
        const lastMilestone = Math.floor((player.lastBarGainWave || 0) / 50);
        if (milestone > lastMilestone) {
            const barsGained = 10 * (milestone - lastMilestone);
            player.bars += barsGained;
            player.maxBars += barsGained;
            player.lastBarGainWave = currentWave;
            message += `\n你跨越了新的里程碑！獲得了 ${barsGained} 條額外血條！`;
        }}
    if(enemyName==="過去的幻影"){gainXP(Math.round(getNextLevelXP(player.level - 10) * 0.5));}else{gainXP(xpGained);}
    endGame(message);
    currentWave++;
    let eventChance = 0.15 + (player.eventChanceBonus || 0);
    if (currentDimension === 'ancient' || currentDimension === 'future') eventChance += 0.15;
    if (currentDimension === 'shattered' || currentDimension === 'shattered_2' || currentDimension === 'shattered_3') eventChance += 0.35;
    if (Math.random() < eventChance) {
        setTimeout(triggerRandomEvent, 1000);
    }else{setTimeout(() => generateEnemy(), 1000);}}
async function performAction(actor, target, playerAction) { 
    let message;
    let result = { battleOver: false, enemyDefeatedOnTheirTurn: false };
    if (actor === player && player.stunTurns > 0) {
        if (currentEnvironment && currentEnvironment.name === "雷電場地") {
            message = "雷電場地保護了你，免於暈眩！";
            player.stunTurns = 0;
        } else {
            player.stunTurns--; 
            message = "你被擊暈了，無法行動！";
            gameMessage.textContent += message;
            updateDisplay();
            return result; 
        }
    }
    if (actor === currentEnemy && actor.isDisrupted) {
        actor.isDisrupted = false;
        message = `${actor.name}從時空錯亂中恢復，跳過了本回合！`;
        gameMessage.textContent += message;
        updateDisplay();
        return result;
    }
    if (actor === player) { 
        if (target.affixes) {
            target.affixes.forEach(affix => {
                if (affix.onTakeDamage) {
                    affix.onTakeDamage(0, actor);
                }
            });
        }
        if (player.hp <= 0) {
            // 修正短命方塊被荊棘等反傷一次擊敗的問題
            if (player.profession && player.profession.includes("短命方塊") && player.bars > 1 && !(activeTrial && activeTrial.id === 'swordsmanAttack')) {
                const lossResult = handleShortLivedBarLoss('你被敵人的反傷擊敗了。');
                gameMessage.textContent += lossResult.message;
                if (lossResult.battleOver) {
                    checkFutureEvents(false);
                    endGame(lossResult.message);
                    result.battleOver = true;
                    updateDisplay();
                    return result;
                } else {
                    player.hp = player.maxHp;
                    updateDisplay();
                }
            } else {
                checkFutureEvents(false);
                endGame(`你被敵人的反傷擊敗了。`);
                result.battleOver = true;
                updateDisplay();
                return result;
            }
        }
        message = performPlayerAttack(target, playerAction); 
    } else { 
        const enemyAttackResult = performEnemyAttack(target);
        message = enemyAttackResult.message;
        if(enemyAttackResult.enemyKilled) {
             result.enemyDefeatedOnTheirTurn = true;
        }}
    const isPlayerDefeated = player.hp <= 0; 
    const isEnemyDefeated = target === currentEnemy && target.hp <= 0 && target.barsRemaining <= 0; 
    if (target.hp < 0 && target.barsRemaining > 0) { } 
    else if (target.hp < 0) { target.hp = 0; } 
    hitAnimation(target === player ? playerChar : enemyChar); 
    if(actor.hp < 0) actor.hp = 0; 
    if (target === player && player.reflectDamage > 0) hitAnimation(enemyChar); 
    gameMessage.textContent += message; 
    updateDisplay(); 
    if (isPlayerDefeated) { 
        checkFutureEvents(false); 
        endGame(`很抱歉！你被敵人擊敗了。`); 
        result.battleOver = true;
    } else if (isEnemyDefeated) { 
        handleEnemyDefeat(currentEnemy.name, isBattleInProgress, result.enemyDefeatedOnTheirTurn); 
        result.battleOver = true;
    }return result;}
function performPlayerAttack(defender, action) {
  let message = '';
  const effectiveStats = getPlayerEffectiveStats();
  if (defender.evasion && Math.random() * 100 < defender.evasion) {
      showFloatingText('閃避!', enemyChar, 'miss');
      // 反制詞綴觸發
      if (defender.affixes) {
          defender.affixes.forEach(affix => {
              if (affix.onEvade) {
                  affix.onEvade(defender, player);
              }
          });
      }
      return `你的攻擊被${defender.name}閃避了！`;
  }
  if (action === "drawSwordAttack") {
      const damage = Math.round(effectiveStats.attackMax * allAbilities["拔刀斬"].getDamagePercentage(player.abilities["拔刀斬"].level));
      defender.hp -= damage;
      showFloatingText(`-${damage}`, enemyChar, 'crit');
      message += `你揮舞拔刀斬，對${defender.name}造成了 ${damage} 點巨大傷害！`;
      player.isDrawingSword = false;
  } else if (currentTurnAbilityApplied === '幻劍') {
      const abilityDef = allAbilities['幻劍'];
      const playerAbility = player.abilities['幻劍'];
      const damage = Math.round(((effectiveStats.attackMin + effectiveStats.attackMax) / 2) * abilityDef.getDamageMultiplier(playerAbility.level));
      defender.hp -= damage;
      showFloatingText(`-${damage}`, enemyChar, 'damage');
      message += `幻影之刃穿過敵人，造成了 ${damage} 點傷害！`;
      if (Math.random() < 0.3) {
          defender.stunTurns = 2;
          message += ` ${defender.name}被劍氣震懾，陷入暈眩！`;
      }}
  else if (action === "drawSwordCharge") {
      player.isDrawingSword = true;
      message += ` 你開始蓄力，本回合不攻擊！`;
  }
    else if (action === "swordLightAttack") {
      const damage = Math.round(effectiveStats.attackMin * allAbilities["劍光"].getDamagePercentage(player.abilities["劍光"].level));
      defender.hp -= damage;
      showFloatingText(`-${damage}`, enemyChar, 'damage');
      message += `一道劍光閃過，對${defender.name}造成了 ${damage} 點傷害！`;
      if (defender.hp <= 0 && defender.barsRemaining <= 1) {
          player.nextWaveSpeedBoost = allAbilities["劍光"].getSpeedBoost(player.abilities["劍光"].level);
          message += ` 你用劍光終結了敵人！`;
      }
  } else if (currentTurnAbilityApplied === '高速移動') {
      const abilityDef = allAbilities['高速移動'];
      const baseAtk = (effectiveStats.attackMin + effectiveStats.attackMax) / 2;
      const damage = Math.round(baseAtk * abilityDef.getDamageMultiplier(effectiveStats.speed));
      defender.hp -= damage;
      showFloatingText(`-${damage}`, enemyChar, 'damage');
      message += `你以肉眼難見的速度移動，對${defender.name}造成了 ${damage} 點傷害！`;
  } else {
    let baseMinAttack = effectiveStats.attackMin + player.tempAttackMin + player.bonusMinAttack;
      if (player.profession.includes("刺客") && (player.minDamageBonusPercentOfMax || 0) > 0) {
        baseMinAttack += Math.round(effectiveStats.attackMax * player.minDamageBonusPercentOfMax);
      }
    let baseDamage = player.tempAttackToMax ? (effectiveStats.attackMax + player.tempAttackMax) : getRandomDamage(baseMinAttack, effectiveStats.attackMax + player.tempAttackMax);
      if (currentTurnAbilityApplied === '猛擊') {
          baseDamage *= allAbilities['猛擊'].getDamageMultiplier(player.abilities['猛擊'].level);
      }
    let finalDamage = baseDamage;
      let isCrit = false;
      if (isCriticalHit(effectiveStats.critChance + player.tempCritChance)) {
          finalDamage *= (effectiveStats.critDamage + (player.bonusCritDamage || 0));
          message += ` 💥 爆擊！`;
          isCrit = true;
      }
      if ((player.executeDamageBonus || 0) > 0 && (defender.hp / defender.maxHp <= 0.3)) {
          finalDamage *= (1 + player.executeDamageBonus);
          message += ` (乘勝追擊!)`;
      }
      if (player.tempDamageMultiplier > 1.0) {
        finalDamage *= player.tempDamageMultiplier;
        if (currentTurnAbilityApplied === '攻擊姿態') message += ` (攻擊姿態!)`;
        if (currentTurnAbilityApplied === '破財免災') message += ` (破財免災!)`;
      }
      if (activeTrial && activeTrial.id === 'swordsmanAttack') {
          if (player.hp === 1) {
              message += ' (極限狀態!)';
          } else {
              finalDamage *= 2;
              message += ' (試煉之力!)';
          }}
      finalDamage = Math.round(finalDamage);

      if (defender.affixes) {
          defender.affixes.forEach(affix => {
              if (affix.applyIncomingDamage) {
                  finalDamage = affix.applyIncomingDamage(finalDamage);
              }
          });
      }
      // 不屈詞綴：致死傷害時剩1hp
      if (defender.affixes && finalDamage >= defender.hp) {
          let undyingTriggered = false;
          defender.affixes.forEach(affix => {
              if (affix.onTakeFatalDamage && affix.onTakeFatalDamage(defender, finalDamage)) {
                  undyingTriggered = true;
              }
          });
          if (undyingTriggered) {
              finalDamage = defender.hp - 1;
          }
      }

      if (player.damagePenaltyPercent > 0) {
          finalDamage = Math.round(finalDamage * (1 - player.damagePenaltyPercent));
          message += ` (傷害降低)`;
      }
      if (player.isHealingTurn) {
          let healAmount = Math.round(finalDamage * allAbilities['治癒'].getHealMultiplier(player.abilities['治癒'].level));
          if (currentEnvironment && currentEnvironment.name === "魔法湧泉" && !currentEnvironment.paused) {
            healAmount *= 2;
          }
          player.hp = Math.min(effectiveStats.maxHp, player.hp + healAmount);
          showFloatingText(`+${healAmount}`, playerChar, 'heal');
          message += ` 你治療了自身 ${healAmount} 點生命值！`;
      } else {
          let initialDefenderHp = defender.hp;
          defender.hp -= finalDamage;
          showFloatingText(`-${finalDamage}`, enemyChar, isCrit ? 'crit' : 'damage');
          message += ` 你對${defender.name}造成了 ${finalDamage} 點傷害！`;

          if (player.piercingSpillover && initialDefenderHp < finalDamage && defender.barsRemaining > 1) {
              let remainingDamage = finalDamage - initialDefenderHp;
              let barsBroken = 0;
              const maxSpillover = 100; // Safety limit
              while(remainingDamage > 0 && defender.barsRemaining > 1 && barsBroken < maxSpillover) {
                  defender.barsRemaining--;
                  barsBroken++;
                  remainingDamage *= 0.75; // 25% damage reduction per pierce
                  remainingDamage = Math.round(remainingDamage);
                  if (remainingDamage >= defender.maxHp) {
                      remainingDamage -= defender.maxHp;
                      defender.hp = 0; // Prepare for next loop
                  } else {
                      defender.hp = defender.maxHp - remainingDamage;
                      remainingDamage = 0;
                  }
              }
              if (barsBroken > 0) {
                  message += ` 【貫穿】效果觸發，額外擊破了 ${barsBroken} 條血條！`;
              }
          } 
          else if (player.damageSpillover && initialDefenderHp < finalDamage && defender.barsRemaining > 1) {
              let remainingDamage = finalDamage - initialDefenderHp;
              let barsBroken = 0;
              const maxSpillover = 100;
              while (remainingDamage > 0 && defender.barsRemaining > 1 && barsBroken < maxSpillover) {
                  defender.barsRemaining--;
                  barsBroken++;
                  if (remainingDamage >= defender.maxHp) {
                      remainingDamage -= defender.maxHp;
                      defender.hp = 0;
                  } else {
                      defender.hp = defender.maxHp - remainingDamage;
                      remainingDamage = 0;
                  }}
              if (barsBroken > 0) {
                  message += ` 【澗月】效果觸發，額外擊破了 ${barsBroken} 條血條！`;
              }}

          if (currentTurnAbilityApplied === '吸取') {
              const healedAmount = Math.round(finalDamage * allAbilities['吸取'].getHealPercentage(player.abilities['吸取'].level));
              player.hp = Math.min(effectiveStats.maxHp, player.hp + healedAmount);
              showFloatingText(`+${healedAmount}`, playerChar, 'heal');
              message += ` 你吸取了 ${healedAmount} 點生命值！`;
          }
          if (player.profession.includes("劍士") && isBleedTriggered(effectiveStats.bleedChance)) {
              if (!defender.affixes || !defender.affixes.some(a => a.name === '韌性')) {
                  enemyBleedStatusData = { baseDamage: finalDamage, damagePercentage: player.bleedDamagePercentage, turnsRemaining: 3 };
                  // 時緩詞綴：負面狀態只持續一回合
                  if (defender.affixes) {
                      defender.affixes.forEach(affix => {
                          if (affix.onStatusApply) {
                              affix.onStatusApply(defender, enemyBleedStatusData);
                          }
                      });
                  }
                  message += ` ${defender.name}開始流血了！`;
              } else {
                  message += ` ${defender.name}的[韌性]抵抗了流血！`;
              }
          }
          if ((player.turnSkipChance || 0) > 0 && Math.random() < player.turnSkipChance) {
              if (!defender.affixes || !defender.affixes.some(a => a.name === '韌性')) {
                  defender.isDisrupted = true;
                  message += ` ${defender.name}陷入時空錯亂！`;
              } else {
                  message += ` ${defender.name}的[韌性]抵抗了時空錯亂！`;
              }
          }
          if (player.recoilDamagePercent > 0) {
              const recoil = Math.max(1, Math.round(finalDamage * player.recoilDamagePercent));
              player.hp = Math.max(1, player.hp - recoil);
              showFloatingText(`-${recoil}`, playerChar, 'damage');
              message += ` 你受到了 ${recoil} 點反噬傷害！`;
          }
          if (player.damageToShield > 0) {
              player.shield = Math.round(finalDamage * player.damageToShield);
              message += ` 你將傷害轉化為 ${player.shield} 點護盾！`;
          }}}
    if (defender.hp <= 0 && defender.barsRemaining > 0) {
            defender.barsRemaining--;
            if (defender.barsRemaining > 0) {
                    defender.hp = defender.maxHp;
                    if (!message.includes("額外擊破") && !message.includes("貫穿")) {
                        message += ` 你擊破了${defender.name}的一條血條！`;
                    }}
    }
    // 反制詞綴：本回合需反擊
    if (defender.counterAttackThisTurn) {
            defender.counterAttackThisTurn = false;
            message += ` ${defender.name}發動了反制！`;
            const result = performEnemyAttack(player);
            message += result.message;
    }
    return message;}
function performEnemyAttack(defender) {
    let message = '';
    const effectiveStats = getPlayerEffectiveStats();
    let survivedWithOneHP = false;
    let result = { message: '', enemyKilled: false };
    if (currentTurnAbilityApplied === '盾反') {
        const abilityDef = allAbilities['盾反'];
        const playerAbility = player.abilities['盾反'];
        const successChance = abilityDef.getSuccessChance(playerAbility.level);
        if (Math.random() < successChance) {
            currentEnemy.barsRemaining--;
            result.message = `【盾反】成功！你精準地預判了攻擊，直接擊破了敵人一條血條！`;
            if (currentEnemy.barsRemaining > 0) {
                currentEnemy.hp = currentEnemy.maxHp;
            } else {
                currentEnemy.hp = 0;
                result.enemyKilled = true;
            }
            return result;
        } else {
            const failureMultiplier = abilityDef.getFailureMultiplier(playerAbility.level);
            let damage = getRandomDamage(currentEnemy.attackMin, currentEnemy.attackMax);
            damage = Math.round(damage * failureMultiplier);
            defender.hp -= damage;
            showFloatingText(`-${damage}`, playerChar, 'crit');
            result.message = `【盾反】失敗！你暴露了巨大的破綻，受到了 ${damage} 點懲罰性傷害！`;
            return result;
        }}
    if (defender.guaranteedDodge) {
        defender.guaranteedDodge = false;
        showFloatingText('閃避!', playerChar, 'miss');
        result.message = `${currentEnemy.name}的攻擊被你輕易地閃避了！`;
        return result;
    }
    if(activeTrial&&activeTrial.id==='swordsmanAttack'&&defender.hp===effectiveStats.maxHp){survivedWithOneHP=true;}
    if(currentEnemy.name === "時間操縱者" && currentEnemy.turnCounter > 0 && currentEnemy.turnCounter % 3 === 0) {
        currentEnemy.hp = currentEnemy.maxHp;
        showFloatingText(`+${currentEnemy.maxHp}`, enemyChar, 'heal');
        message += `時間操縱者扭轉了時間，將當前生命值完全回復！ `;
    }
    let currentEvasion = effectiveStats.evasion;
    if (activeTrial && activeTrial.id === 'shortLivedTrial') { currentEvasion = 0; }
    if ((defender.lastStandEvasionBonus || 0) > 0 && (defender.hp / defender.maxHp <= 0.25)) {
        currentEvasion += defender.lastStandEvasionBonus;
    }
    if (Math.random() * 100 < currentEvasion) {
        showFloatingText('閃避!', playerChar, 'miss');
        result.message = `${currentEnemy.name}的攻擊被你閃避了！`;
        return result;
    }
    let damage = getRandomDamage(currentEnemy.attackMin, currentEnemy.attackMax);
    // 波動詞綴修正
    if (currentEnemy.affixes) {
        currentEnemy.affixes.forEach(affix => {
            if (affix.modifyDamage) {
                damage = affix.modifyDamage(damage, currentEnemy);
            }
        });
    }
    if (activeTrial && activeTrial.id === 'swordsmanAttack') {
        damage = 99999;
    }
    if (defender.tempIncomingDamageMultiplier > 1.0) {
        damage *= defender.tempIncomingDamageMultiplier;
        damage = Math.round(damage);
        message += ` (你處於攻擊姿態，受到額外傷害！)`;
    }
    damage -= (defender.flatDamageReduction || 0);
    if (damage < 1) damage = 1;
    if (survivedWithOneHP && (damage >= defender.hp)) {
        const damageTaken = defender.hp - 1;
        defender.hp = 1;
        showFloatingText(`-${damageTaken}`, playerChar, 'damage');
        message += `${currentEnemy.name}對你造成了致命一擊，但你勉強存活了下來！`;
        result.message = message;
        return result;
    }
    if (defender.shield > 0) {
        const blockedDamage = Math.min(defender.shield, damage);
        defender.shield -= blockedDamage;
        damage -= blockedDamage;
        message += ` 你的護盾抵擋了 ${blockedDamage} 點傷害！`;
    }
    if (defender.canTakeDamagePenalty) {
        const penaltyDamage = Math.round(effectiveStats.maxHp * 0.2);
        defender.hp = Math.max(1, defender.hp - penaltyDamage);
        showFloatingText(`-${penaltyDamage}`, playerChar, 'damage');
        message += `(猛擊副作用：額外損失 ${penaltyDamage} 生命！) `;
    }
    if (damage > 0) {
        defender.hp -= damage;
        if (currentEnemy.affixes) {
            currentEnemy.affixes.forEach(affix => {
                if (affix.onDealDamage) {
                    affix.onDealDamage(damage, currentEnemy, defender);
                }
            });
        }
    }
    showFloatingText(`-${damage}`, playerChar, 'damage');
    message += `${currentEnemy.name}對你造成了 ${damage} 點傷害！`;
    if (defender === player && defender.hp <= 0 && defender.bars > 1) {
        const lossResult = handleShortLivedBarLoss("你的血條被擊破了！");
        message += lossResult.message;
        if (lossResult.battleOver) {
            endGame(lossResult.message);
            result.battleOver = true;
        } else {
            defender.hp = defender.maxHp;
        }
    }
    if (currentEnemy.name === "時間操縱者" && Math.random() < 0.15) {
        defender.stunTurns = 2;
        message += ` 你被時間之力擊暈了，接下來 2 回合無法行動！`;
    }
    if (effectiveStats.reflectDamage > 0) {
        const reflectedDamage = Math.round(damage * (effectiveStats.reflectDamage / 100));
        let initialEnemyHp = currentEnemy.hp;
        currentEnemy.hp -= reflectedDamage;
        defender.totalReflectedDamage += reflectedDamage;
        showFloatingText(`-${reflectedDamage}`, enemyChar, 'damage');
        message += ` 你反彈了 ${reflectedDamage} 點傷害！`;

        if (player.reflectSpillover && initialEnemyHp < reflectedDamage && currentEnemy.barsRemaining > 1) {
            let remainingReflect = reflectedDamage - initialEnemyHp;
            let barsBroken = 0;
            const maxSpillover = 100;
             while(remainingReflect > 0 && currentEnemy.barsRemaining > 1 && barsBroken < maxSpillover) {
                currentEnemy.barsRemaining--;
                barsBroken++;
                remainingReflect *= 0.75; // 25% damage reduction
                remainingReflect = Math.round(remainingReflect);

                if (remainingReflect >= currentEnemy.maxHp) {
                    remainingReflect -= currentEnemy.maxHp;
                    currentEnemy.hp = 0;
                } else {
                    currentEnemy.hp = currentEnemy.maxHp - remainingReflect;
                    remainingReflect = 0;
                }
            }
            if (barsBroken > 0) {
                message += ` 【反傷貫穿】觸發，額外擊破了 ${barsBroken} 條血條！`;
                if(currentEnemy.hp <= 0 && currentEnemy.barsRemaining <= 0) {
                    result.enemyKilled = true;
                }
            }
        } 
        else if (currentEnemy.hp <= 0 && currentEnemy.barsRemaining > 0) {
            currentEnemy.barsRemaining--;
            const quest = activeTransferQuests.find(q => q.id === 'phantomShieldTransfer' && !q.completed);
            if (quest) {
                quest.currentProgress++;
                updateQuestDisplay();
            }
            if (currentEnemy.barsRemaining > 0) {
                currentEnemy.hp = currentEnemy.maxHp;
                message += ` ${currentEnemy.name}因反傷擊破了一條血條！`;
            } else {
                 currentEnemy.hp = 0;
                 result.enemyKilled = true;
            }}}
    if (currentEnemy.healOnAttack) {
        let healedAmount = Math.round(damage * currentEnemy.healOnAttack);
        if (currentEnvironment && currentEnvironment.name === "魔法湧泉" && !currentEnvironment.paused) {
            healedAmount *= 2;
        }
        currentEnemy.hp = Math.min(currentEnemy.maxHp, currentEnemy.hp + healedAmount);
        showFloatingText(`+${healedAmount}`, enemyChar, 'heal');
        message += ` ${currentEnemy.name}回復了 ${healedAmount} 點生命值！`;
    }
    result.message = message;
    return result;
}
function gainXP(amount) { 
    const effectiveStats = getPlayerEffectiveStats();
    player.xp += Math.round(amount * (1 + effectiveStats.xpBonusPercent / 100)); 
    checkLevelUp(); 
}
function checkLevelUp() { 
    let nextLevelXP = getNextLevelXP(player.level); 
    while (player.xp >= nextLevelXP) { 
        player.xp -= nextLevelXP; 
        player.level++; 
        const spGained = 1 + (player.bonusSPOnLevelUp || 0);
        player.sp += spGained; 
        gameMessage.textContent = `恭喜你！升級了！目前等級 ${player.level}！獲得 ${spGained} 技能點！`; 
        
        if (!player.profession.includes("短命方塊")) {
            player.maxHp += 10; 
            player.hp = Math.min(player.hp + 10, player.maxHp);
        }
        if (!player.profession.includes("刺客")) player.attackMin += 2; 
        player.attackMax += 2; 
        player.speed += 0.5; 
        generateMultipleQuests(true); 
        nextLevelXP = getNextLevelXP(player.level); 
    }}
function getRandomDamage(min, max) { 
    if (min > max) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}
function isCriticalHit(critChance) { 
    if (activeTrial && activeTrial.id === 'shortLivedTrial') return false;
    return !player.profession.includes("刺客") && Math.random() * 100 < critChance; 
}
function isBleedTriggered(bleedChance) { return Math.random() * 100 < bleedChance; }
function gainRandomRelic() {
    if (!allRelics || allRelics.length === 0) return '';
    
    let availableRelics = allRelics;

    if (player.profession.includes("短命方塊")) {
        availableRelics = allRelics.filter(relic => relic.stat !== 'maxHp');
    }

    if (availableRelics.length === 0) return '';

    const relicTemplate = availableRelics[Math.floor(Math.random() * availableRelics.length)];
    const bonusRange = relicTemplate.maxBonus - relicTemplate.minBonus;
    const rolledBonus = relicTemplate.minBonus + Math.random() * bonusRange;
    const newRelic = {
        ...relicTemplate,
        rarity: 0,
        bonus: parseFloat(rolledBonus.toFixed(2))
    };
    player.relics.push(newRelic);
    return `你獲得了遺物【${newRelic.name}】並放入了背包！`;
}
function hitAnimation(charElement) { charElement.classList.add('hit'); setTimeout(() => charElement.classList.remove('hit'), 100); }
function useLightningCard() {
    if (isBattleInProgress) {
        gameMessage.textContent = "戰鬥中無法使用物品！";
        return;
    }
    if ((player.backpack["雷電顯示卡"] || 0) < 1) {
        gameMessage.textContent = "你沒有雷電顯示卡！";
        return;
    }
    player.backpack["雷電顯示卡"]--;
    if (player.backpack["雷電顯示卡"] <= 0) {
        delete player.backpack["雷電顯示卡"];
    }
    currentEnvironment = { ...battlefieldEnvironments.LightningField };
    gameMessage.textContent = "你啟動了雷電顯示卡，周圍的空氣充滿了電離子！獲得『雷電場地』效果！";
    updateAllDisplays();
}
function usePrimalSeed() {
    if (isBattleInProgress) {
        gameMessage.textContent = "戰鬥中無法使用物品！";
        return;
    }
    if ((player.backpack["原始種子"] || 0) < 1) {
        gameMessage.textContent = "你沒有原始種子！";
        return;
    }
    player.backpack["原始種子"]--;
    if (player.backpack["原始種子"] <= 0) {
        delete player.backpack["原始種子"];
    }
    currentEnvironment = { ...battlefieldEnvironments.PrimalField };
    gameMessage.textContent = "你種下了原始種子，古老的植物瞬間覆蓋了戰場！獲得『原始場地』效果！";
    updateAllDisplays();
}