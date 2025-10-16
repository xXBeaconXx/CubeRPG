function addFutureEvent(event) {futureEvents.push(event);}
function checkFutureEvents(isVictory) {
    futureEvents.forEach(event => {
        if (event.wave === currentWave && event.action && !event.isQuest) {
            event.action();
        }});
    futureEvents = futureEvents.filter(event => {
        if (event.isEffect && currentWave >= event.wave) {
            if(event.endEffect) event.endEffect();
            return false;}
        if (event.isQuest && event.wave === currentWave) {
            if (isVictory) {
                if(event.action) event.action();
            } else if (event.onFail) {
                event.onFail();
            }return false;}
        if (event.action && currentWave > event.wave && !event.isEffect){
           return false;
        }return true;});}
function forceStartBattle(enemyTypeName, isMirror = false, forceWaveLevel = 0) {
  if (!enemyTypeName) {
      generateEnemy();
      return;
  }
  let enemyPools = {...normalEnemyTypes.tier1, ...normalEnemyTypes.tier2, ...normalEnemyTypes.tier3, ...normalEnemyTypes.boss, ...ancientEnemyTypes.tier1, ...ancientEnemyTypes.tier2, ...ancientEnemyTypes.tier3, ...futureEnemyTypes.tier1, ...futureEnemyTypes.tier2, ...futureEnemyTypes.tier3};
  let enemyToSpawn;
  let waveForCalc = forceWaveLevel > 0 ? forceWaveLevel : currentWave;
  if (enemyTypeName === "過去的幻影") {
      const pastLevel = Math.max(1, player.level - 10);
      const pastHp = Math.round(player.maxHp * 0.5); 
      const pastAtk = Math.round(player.attackMax * 0.5);
      enemyToSpawn = {
          name: "過去的幻影",
          hpPerBar: pastHp,
          bars: 1,
          attackMin: Math.round(pastAtk * 0.8),
          attackMax: pastAtk,
          speed: Math.round(player.speed * 0.7),
          evasion: Math.round(player.evasion * 0.5),
          moneyReward: 0,
          xpReward: 0 
      };
  } else if (isMirror) {
      enemyToSpawn = {
          name: "鏡中之影",
          hpPerBar: player.maxHp,
          bars: 1,
          attackMin: Math.round(player.attackMin * 0.8),
          attackMax: Math.round(player.attackMax * 0.8),
          speed: player.speed,
          evasion: player.evasion,
          moneyReward: Math.round(currentMoney * 0.5),
          xpReward: Math.round(getNextLevelXP(player.level) * 0.5)
      };
  } else if (enemyPools[enemyTypeName]) {
      enemyToSpawn = enemyPools[enemyTypeName];
  } else { 
      enemyToSpawn = { ...normalEnemyTypes.tier2["強壯方塊"], name: enemyTypeName, moneyReward: 150, xpReward: 100 };
  }
  const growthFactor = (enemyTypeName === "過去的幻影") ? 1 : 1 + (Math.floor((waveForCalc - 1) / 10) * 0.1);
  currentEnemy = { ...enemyToSpawn };
  currentEnemy.maxHp = Math.round((enemyToSpawn.hpPerBar || 100) * growthFactor * gameDifficulty.enemyMultiplier);
  currentEnemy.hp = currentEnemy.maxHp;
  currentEnemy.barsRemaining = enemyToSpawn.bars || 1;
  currentEnemy.totalBars = enemyToSpawn.bars || 1;
  currentEnemy.attackMin = Math.round((enemyToSpawn.attackMin || 5) * growthFactor * gameDifficulty.enemyMultiplier);
  currentEnemy.attackMax = Math.round((enemyToSpawn.attackMax || 10) * growthFactor * gameDifficulty.enemyMultiplier);
  currentEnemy.evasion = enemyToSpawn.evasion || 0;
  enemyBleedStatusData = null;
  for (const abilityName in player.abilities) {
    if (player.abilities[abilityName].learned) {
      const abilityDef = allAbilities[abilityName];
      const playerAbility = player.abilities[abilityName];
      playerAbility.maxPP = abilityDef.basePP + (abilityDef.getIncreasedPP(playerAbility.level) || 0);
      playerAbility.currentPP = playerAbility.maxPP;
    }
  }
  gameMessage.textContent = `${currentEnemy.name} 出現了！點擊「攻擊」開始戰鬥！`;
  attackButton.disabled = false;
  updateDisplay();
}
function triggerRandomEvent() {
    isBattleInProgress = true;
    attackButton.disabled = true;
    let eventPool;
    switch(currentDimension) {
        case 'ancient': eventPool = ancientRandomEvents; break;
        case 'future': eventPool = futureRandomEvents; break;
        case 'shattered': eventPool = shatteredRandomEvents; break;
        case 'shattered_2': eventPool = shattered2RandomEvents; break;
        default: eventPool = normalRandomEvents; break;
    }
    const availableEvents = eventPool.filter(event => !event.isAvailable || event.isAvailable());
    if (availableEvents.length === 0) {
        gameMessage.textContent = "你繼續前進，沒有發生任何特別的事。";
        eventOverlay.style.display = 'none';
        isBattleInProgress = false;
        attackButton.disabled = false;
        updateDisplay();
        setTimeout(generateEnemy, 2000);
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    const event = availableEvents[randomIndex];
    eventTitle.textContent = event.name;
    eventDescription.textContent = event.description;
    eventOptions.innerHTML = '';
    event.options.forEach(option => {
        if (option.isAvailable && !option.isAvailable()) return;
        const button = document.createElement('button');
        button.textContent = typeof option.text === 'function' ? option.text() : option.text;
        button.onclick = () => {
            const resultMessage = option.onSelect();
            gameMessage.textContent = resultMessage;
            eventOverlay.style.display = 'none';
            const isBattleOrDimensionTrigger = 
                resultMessage.includes("向你發起了攻擊") ||
                resultMessage.includes("守護著這條路") ||
                resultMessage.includes("面對過去的自己") ||
                resultMessage.includes("守衛出現了") ||
                resultMessage.includes("回響出現了") ||
                resultMessage.includes("進入了") ||
                resultMessage.includes("來到一個") ||
                resultMessage.includes("返回了初始世界") ||
                resultMessage.includes("回到了破碎次元");
            if (isBattleOrDimensionTrigger) {
                isBattleInProgress = false; 
            } else {
                isBattleInProgress = false;
                attackButton.disabled = false;
                updateDisplay();
                setTimeout(generateEnemy, 2000);
            }
        };
        eventOptions.appendChild(button);
    });
    if (eventOptions.childElementCount === 0) {
        const leaveButton = document.createElement('button');
        leaveButton.textContent = "離開";
        leaveButton.onclick = () => {
            gameMessage.textContent = "你沒有發現任何可以做的事，於是繼續前進了。";
            eventOverlay.style.display = 'none';
            isBattleInProgress = false;
            attackButton.disabled = false;
            updateDisplay();
            setTimeout(generateEnemy, 2000);
        };
        eventOptions.appendChild(leaveButton);
    }
    eventOverlay.style.display = 'flex';
}