function updateAllDisplays() {
  updateShopItemsForProfession();
  updateDisplay();
  updateQuestDisplay();
  renderTalentTree();
  if(tabSynthesis.classList.contains('active')) renderSynthesisRecipes();
}

function renderTalentTree() {
    talentTreeContainer.innerHTML = '';
    for (const branchKey in talentTreeData) {
        if (player.profession.includes("短命方塊") && branchKey === 'defense') {
            continue;
        }

        const branch = talentTreeData[branchKey];
        const branchDiv = document.createElement('div');
        branchDiv.classList.add('talent-branch');
        branchDiv.innerHTML = `<h4>${branch.name}</h4>`;

        branch.talents.forEach(talent => {
            if (talent.description.includes("【劍士專屬】") && !player.profession.includes("劍士")) return;
            if (talent.description.includes("【盾士專屬】") && !player.profession.includes("盾士")) return;
            if (talent.description.includes("【刺客專屬】") && !player.profession.includes("刺客")) return;
            if (talent.id === 'defense1' && player.profession.includes("短命方塊")) return;

            const node = document.createElement('div');
            node.classList.add('talent-node');
            const currentLevel = player.talents[talent.id] || 0;
            let isLocked = false;
            if (talent.requires) {
                const requiredTalentLevel = player.talents[talent.requires.id] || 0;
                if (requiredTalentLevel < talent.requires.level) {
                    isLocked = true;
                }
            }

            if (isLocked) {
                node.classList.add('locked');
            } else if (currentLevel >= talent.maxLevel) {
                node.classList.add('maxed-out');
            } else if (player.sp >= talent.cost) {
                node.classList.add('available');
            }

            node.innerHTML = `
                <h5>${talent.name}</h5>
                <p>${talent.description}</p>
                <p><span class="talent-level">等級: ${currentLevel}/${talent.maxLevel}</span> | 花費: ${talent.cost} SP</p>
            `;
            
            if (!isLocked && currentLevel < talent.maxLevel) {
                node.onclick = () => learnTalent(talent.id);
            }
            branchDiv.appendChild(node);
        });
        talentTreeContainer.appendChild(branchDiv);
    }
}

function showFloatingText(text, targetElement, type = 'damage') {
    const textElement = document.createElement('span');
    textElement.textContent = text;
    textElement.className = `floating-text ${type}`;
    
    const rect = targetElement.getBoundingClientRect();
    const containerRect = battleArea.getBoundingClientRect();

    textElement.style.left = `${rect.left - containerRect.left + rect.width / 2 - 20}px`;
    textElement.style.top = `${rect.top - containerRect.top - 20}px`;
    
    battleArea.appendChild(textElement);
    
    setTimeout(() => {
        textElement.remove();
    }, 1450);
}

function updateShopItemsForProfession() { 
    // Reset all shop items to be visible before applying rules
    document.querySelectorAll('#contentUpgrades .shop-item').forEach(item => {
        item.style.display = 'flex';
    });

    document.querySelectorAll('#contentUpgrades .shop-item').forEach(item => {
        const button = item.querySelector('button');
        const costSpan = item.querySelector('.shop-item-cost');
        const descriptionP = item.querySelector('p');
        
        if (button && costSpan && descriptionP) {
            const baseId = button.id.replace('buy', '').toLowerCase();
            let itemKey = null;

            if (baseId === 'attack') itemKey = 'attackUpgrade';
            else if (baseId === 'maxhp') itemKey = 'maxHPUpgrade';
            else {
                itemKey = Object.keys(baseItemValues).find(k => k.toLowerCase().startsWith(baseId));
            }

            if(itemKey) {
                const itemData = currentItemCosts[itemKey] || baseItemValues[itemKey];
                costSpan.textContent = `${getDiscountedCost(itemData.cost)} 金錢`;
                descriptionP.textContent = itemData.description;
            }
        }
    });

    if (player.profession.includes("盾士")) { reflectDamageShopItem.style.display = 'flex'; playerReflectDamageDisplay.style.display = 'block'; bleedShopItem.style.display = 'none'; playerBleedDisplay.style.display = 'none'; } 
    else if (player.profession.includes("劍士")) { bleedShopItem.style.display = 'flex'; playerBleedDisplay.style.display = 'block'; reflectDamageShopItem.style.display = 'none'; playerReflectDamageDisplay.style.display = 'none'; } 
    else { reflectDamageShopItem.style.display = 'none'; playerReflectDamageDisplay.style.display = 'none'; bleedShopItem.style.display = 'none'; playerBleedDisplay.style.display = 'none'; } 
    if (player.profession.includes("刺客")) { critDamageShopItem.style.display = 'none'; playerCritChanceDisplay.style.display = 'none'; playerCritDamageDisplay.style.display = 'none'; } 
    else { critDamageShopItem.style.display = 'flex'; playerCritChanceDisplay.style.display = 'block'; playerCritDamageDisplay.style.display = 'block'; } 

    // Hide incompatible upgrades for Short-Lived Cube
    if (player.profession.includes("短命方塊")) {
        document.getElementById('maxHPUpgradeShopItem').style.display = 'none';
        document.getElementById('healShopItem').style.display = 'none';
        document.getElementById('evasionShopItem').style.display = 'none';
    }

    // --- TRIAL MODE SHOP RESTRICTIONS (Overrides profession settings) ---
    if (activeTrial && activeTrial.id === 'swordsmanAttack') {
        // In this trial, ONLY Attack, Heal and XP are available.
        document.getElementById('randomUpgradeShopItem').style.display = 'none';
        document.getElementById('maxHPUpgradeShopItem').style.display = 'none';
        document.getElementById('speedUpgradeShopItem').style.display = 'none';
        document.getElementById('evasionShopItem').style.display = 'none';
        document.getElementById('critDamageShopItem').style.display = 'none';
        document.getElementById('reflectDamageShopItem').style.display = 'none';
        document.getElementById('bleedShopItem').style.display = 'none';
    } else if (activeTrial && activeTrial.id === 'assassinChaos') {
        // In this trial, ONLY the random upgrade is available.
        document.querySelectorAll('#contentUpgrades .shop-item:not(#randomUpgradeShopItem)').forEach(item => {
            item.style.display = 'none';
        });
        document.getElementById('randomUpgradeShopItem').style.display = 'flex';
    } else if (activeTrial && activeTrial.id === 'shortLivedTrial') {
        // 短命試煉，禁用爆傷和閃避
        document.getElementById('critDamageShopItem').style.display = 'none';
        document.getElementById('evasionShopItem').style.display = 'none';
        document.getElementById('randomUpgradeShopItem').style.display = 'none';
    } else {
        // In normal mode, ensure random upgrade is hidden.
        document.getElementById('randomUpgradeShopItem').style.display = 'none';
    }
}

function updateDisplay() {
  const effectiveStats = getPlayerEffectiveStats();

  const hpBonus = effectiveStats.maxHp - player.maxHp;
  let hpText = `${player.hp}/${effectiveStats.maxHp}`;
  if (player.bars > 1) {
    hpText += ` (x${player.bars})`;
  }
  hpText += (hpBonus !== 0 ? ` (${hpBonus > 0 ? '+' : ''}${hpBonus})` : '');
  playerHPElement.textContent = hpText;
  
  const minAtkBonus = effectiveStats.attackMin - player.attackMin;
  const maxAtkBonus = effectiveStats.attackMax - player.attackMax;
  const effectiveMinAtk = effectiveStats.attackMin + player.tempAttackMin + player.bonusMinAttack + (player.profession.includes("刺客") ? Math.round(effectiveStats.attackMax * (player.minDamageBonusPercentOfMax || 0)) : 0);
  playerMinATKElement.textContent = effectiveMinAtk + (minAtkBonus !== 0 ? ` (${minAtkBonus > 0 ? '+' : ''}${minAtkBonus})` : '');
  playerMaxATKElement.textContent = effectiveStats.attackMax + player.tempAttackMax + (maxAtkBonus !== 0 ? ` (${maxAtkBonus > 0 ? '+' : ''}${maxAtkBonus})` : '');

  const speedBonus = parseFloat((effectiveStats.speed - player.speed).toFixed(1));
  playerSpeedElement.textContent = (effectiveStats.speed + player.tempSpeed).toFixed(1) + (speedBonus !== 0 ? ` (${speedBonus > 0 ? '+' : ''}${speedBonus})` : '');
  
  const critChanceBonus = effectiveStats.critChance - player.critChance;
  playerCritChanceElement.textContent = (effectiveStats.critChance + player.tempCritChance).toFixed(2) + (critChanceBonus !== 0 ? ` (${critChanceBonus > 0 ? '+' : ''}${critChanceBonus.toFixed(2)})` : '');
  
  const critDmgBonus = parseFloat((effectiveStats.critDamage - player.critDamage).toFixed(1));
  playerCritDamageElement.textContent = effectiveStats.critDamage.toFixed(1) + (critDmgBonus !== 0 ? ` (${critDmgBonus > 0 ? '+' : ''}${critDmgBonus})` : '');

  const evasionBonus = effectiveStats.evasion - player.evasion;
  playerEvasionElement.textContent = effectiveStats.evasion.toFixed(2) + (evasionBonus !== 0 ? ` (${evasionBonus > 0 ? '+' : ''}${evasionBonus.toFixed(2)})` : '');
  
  const reflectBonus = effectiveStats.reflectDamage - player.reflectDamage;
  playerReflectDamageElement.textContent = effectiveStats.reflectDamage.toFixed(2) + (reflectBonus !== 0 ? ` (${reflectBonus > 0 ? '+' : ''}${reflectBonus.toFixed(2)})` : '');
  
  const bleedBonus = effectiveStats.bleedChance - player.bleedChance;
  playerBleedChanceElement.textContent = effectiveStats.bleedChance.toFixed(2) + (bleedBonus !== 0 ? ` (${bleedBonus > 0 ? '+' : ''}${bleedBonus.toFixed(2)})` : '');
  
  playerBleedDamageElement.textContent = player.bleedDamagePercentage;
  playerLevelElement.textContent = player.level;
  playerSPElement.textContent = player.sp;
  playerXPElement.textContent = player.xp;
  playerNextLevelXPElement.textContent = getNextLevelXP(player.level);
  playerProfessionTitle.textContent = player.profession;
  enemyNameElement.textContent = currentEnemy.name || '敵人方塊';
  
  if (currentEnemy.hp !== undefined) {
    let hpDisplay = `${currentEnemy.hp}/${currentEnemy.maxHp}`;
    if (currentEnemy.totalBars > 1) { hpDisplay += ` (x${currentEnemy.barsRemaining})`; }
    enemyHPElement.textContent = hpDisplay;
    enemyHPElement.style.color = currentEnemy.hp <= currentEnemy.maxHp * 0.2 ? 'red' : 'green';
  }

  enemyMinATKElement.textContent = currentEnemy.attackMin || 0;
  enemyMaxATKElement.textContent = currentEnemy.attackMax || 0;
  enemySpeedElement.textContent = currentEnemy.speed || 0;

  switch(currentDimension) {
      case 'ancient': dimensionDisplayElement.textContent = '(遠古維度)'; break;
      case 'future': dimensionDisplayElement.textContent = '(未來維度)'; break;
      case 'shattered': dimensionDisplayElement.textContent = '(破碎次元)'; break;
      case 'shattered_2': dimensionDisplayElement.textContent = '(破碎次元II)'; break;
      case 'shattered_3': dimensionDisplayElement.textContent = '(破碎次元III)'; break;
      default: dimensionDisplayElement.textContent = ''; break;
  }

    const affixesContainer = document.getElementById('enemyAffixesContainer');
    if (currentEnemy.affixes && currentEnemy.affixes.length > 0) {
        affixesContainer.style.display = 'block';
        affixesContainer.innerHTML = '';
        currentEnemy.affixes.forEach(affix => {
            const affixElement = document.createElement('div');
            affixElement.classList.add('affix-item');
            affixElement.innerHTML = `<strong>[${affix.name}]</strong>: ${affix.description}`;
            affixesContainer.appendChild(affixElement);
        });
    } else {
        affixesContainer.style.display = 'none';
    }

  if (currentEnemy.evasion > 0) {
      enemyEvasionDisplay.style.display = 'block';
      enemyEvasionElement.textContent = currentEnemy.evasion;
  } else {
      enemyEvasionDisplay.style.display = 'none';
  }

  if (enemyBleedStatusData && enemyBleedStatusData.turnsRemaining > 0) {
    enemyBleedStatus.style.display = 'block';
    enemyBleedTurns.textContent = enemyBleedStatusData.turnsRemaining;
    const bleedDamageValue = Math.round(enemyBleedStatusData.baseDamage * (enemyBleedStatusData.damagePercentage / 100));
    enemyBleedDamageApplied.textContent = bleedDamageValue;
  } else {
    enemyBleedStatus.style.display = 'none';
  }

  currentMoneyElement.textContent = currentMoney;
  currentWaveElement.textContent = currentWave;
  
    const environmentDisplay = document.getElementById('environmentDisplay');
    const environmentName = document.getElementById('environmentName');
    const environmentDetailBtn = document.getElementById('environmentDetailBtn');
    if (currentEnvironment && currentEnvironment.duration > 0 && !currentEnvironment.paused) {
        environmentDisplay.style.display = 'flex';
        environmentDetailBtn.style.display = 'inline-block';
        environmentName.textContent = `戰場: ${currentEnvironment.name} (${currentEnvironment.duration}波)`;
    } else {
        environmentDisplay.style.display = 'none';
        environmentDetailBtn.style.display = 'none';
    }

  // Update game mode display
  let difficultyText = '';
  switch(selectedDifficulty) {
      case 'easy': difficultyText = '簡單'; break;
      case 'normal': difficultyText = '普通'; break;
      case 'hard': difficultyText = '困難'; break;
  }
  document.getElementById('gameModeDisplay').textContent = `${difficultyText} | ${activeTrial ? activeTrial.name : '經典模式'}`;


  const isPlayerLowHealth = player.hp <= effectiveStats.maxHp * 0.2;
  playerHPElement.style.color = isPlayerLowHealth ? 'red' : 'green';
  
  if (isPlayerLowHealth) {
    document.body.classList.add('player-low-health');
  } else {
    document.body.classList.remove('player-low-health');
  }

  if (currentEnemy.name === "持劍者" && player.swordHolderFightState) {
      if (isPlayerLowHealth && !player.swordHolderFightState.wasLowLastUpdate) {
          player.swordHolderFightState.lowHealthCount++;
          player.swordHolderFightState.wasLowLastUpdate = true;
          if (player.swordHolderFightState.lowHealthCount >= 3 && !player.swordHolderFightState.battleWillActive) {
              player.swordHolderFightState.battleWillActive = true;
              player.tempAttackMultiplier = 1.4;
              gameMessage.textContent = "你感受到了無盡的戰意，力量湧現！攻擊力提升40%！";
          }
      } else if (!isPlayerLowHealth) {
          player.swordHolderFightState.wasLowLastUpdate = false;
      }
  }

  if (player.swordHolderFightState?.battleWillActive) {
      document.body.classList.add('battle-will-active');
  } else {
      document.body.classList.remove('battle-will-active');
  }

  if (player.tempAttackMultiplier < 1.0) {
      document.body.classList.add('exhausted');
  } else {
      document.body.classList.remove('exhausted');
  }

  if (player.stunTurns > 0) {
      document.body.classList.add('player-stunned');
  } else {
      document.body.classList.remove('player-stunned');
  }
  
  const playerShieldStatus = document.getElementById('playerShieldStatus');
  const playerShieldElement = document.getElementById('playerShield');
  if (player.shield > 0) {
      playerShieldStatus.style.display = 'block';
      playerShieldElement.textContent = player.shield;
  } else {
      playerShieldStatus.style.display = 'none';
  }

  updateShopItemsForProfession();
  document.querySelectorAll('#contentUpgrades .shop-item button:not(#buyRandomUpgrade)').forEach(button => {
    const costSpan = button.previousElementSibling;
    if (costSpan && costSpan.classList.contains('shop-item-cost')) {
        const cost = parseInt(costSpan.textContent);
        button.disabled = currentMoney < cost;
    }
  });

  buyHealButton.disabled = currentMoney < getDiscountedCost(currentItemCosts.heal.cost) || player.hp >= effectiveStats.maxHp || (player.profession.includes("刺客") && currentItemCosts.heal.cost > 10000);
  buyCritDamageButton.disabled = currentMoney < getDiscountedCost(baseItemValues.critDamageUpgrade.cost) || player.profession.includes("刺客");
  
  // This logic is now mostly handled by hiding items in updateShopItemsForProfession
  let evasionCap = player.profession.includes("刺客") ? 70 : 50;
  buyEvasionButton.disabled = currentMoney < getDiscountedCost(baseItemValues.evasionUpgrade.cost) || player.evasion >= evasionCap;
  
  // --- TRIAL MODE SHOP BUTTON STATES ---
  if (activeTrial && activeTrial.id === 'assassinChaos') {
      buyRandomUpgradeButton.disabled = currentMoney < 50;
  }
  // --- END OF TRIAL RESTRICTIONS ---


  const tabRelics = document.getElementById('tabRelics');
  if (tabAbilities.classList.contains('active')) renderAbilityShopItems();
  if (tabBackpack.classList.contains('active')) renderBackpack();
  if (tabTalents.classList.contains('active')) renderTalentTree();
  if (tabSynthesis.classList.contains('active')) renderSynthesisRecipes();
  if (tabRelics.classList.contains('active')) renderRelics();
  
  updateQuestDisplay();
  if (currentEnvironment && !currentEnvironment.paused) {
      if (currentEnvironment.name === "雷電場地") {
          document.body.classList.add('lightning-field');
      } else if (currentEnvironment.name === "原始場地") {
          document.body.classList.add('primal-field');
      }
    }
    
  if (currentEnemy && currentEnemy.name === "最終boss") {
    document.body.classList.add('final-boss-battle');
  } else {
    document.body.classList.remove('final-boss-battle');
  }}
function renderBackpack() { 
    contentBackpack.innerHTML = ''; 
    const isShortLived = player.profession.includes("短命方塊");
    const backpackItems = Object.keys(player.backpack); 
    const fragmentItems = backpackItems.filter(itemName => fragmentStats[itemName] && !["暗影碎片", "青光劍柄"].includes(itemName));
    const specialItems = backpackItems.filter(itemName => !fragmentStats[itemName] || ["暗影碎片", "青光劍柄"].includes(itemName));
    
    let specialItemsHTML = '';
    if (specialItems.length > 0) {
        specialItems.sort().forEach(itemName => {
            const itemCount = Array.isArray(player.backpack[itemName]) ? player.backpack[itemName].length : player.backpack[itemName];
            if(itemCount > 0) {
                let itemHTML;
                if (itemName === "月見晶石") {
                    itemHTML = `<div class="backpack-item">
                                    <div>
                                        <span class="backpack-item-name">${itemName}</span> (擁有: ${itemCount})
                                    </div>
                                    <button class="use-item-btn" onclick="summonFinalBoss()">使用</button>
                                </div>`;
                } else if (itemName === "神刃") {
                    itemHTML = `<div class="backpack-item">
                                    <div>
                                        <span class="backpack-item-name">${itemName}</span> (擁有: ${itemCount})
                                    </div>
                                    <button class="use-item-btn" onclick="summonSwordHolderBoss()">使用</button>
                                </div>`;
                } else if (itemName === "時空石") {
                    itemHTML = `<div class="backpack-item">
                                    <div>
                                        <span class="backpack-item-name">${itemName}</span> (擁有: ${itemCount})
                                    </div>
                                    <button class="use-item-btn" onclick="summonTimeManipulatorBoss()">使用</button>
                                </div>`;
                } else if (itemName === "遠古核心") {
                    itemHTML = `<div class="backpack-item">
                                    <div>
                                        <span class="backpack-item-name">${itemName}</span> (擁有: ${itemCount})
                                    </div>
                                    <button class="use-item-btn" onclick="summonTyrantBoss()">使用</button>
                                </div>`;
                } else if (itemName === "雷電顯示卡") { // <-- 新增區塊開始
                    itemHTML = `<div class="backpack-item">
                                    <div>
                                        <span class="backpack-item-name">${itemName}</span> (擁有: ${itemCount})
                                    </div>
                                    <button class="use-item-btn" onclick="useLightningCard()">使用</button>
                                </div>`;
                } else if (itemName === "原始種子") {
                    itemHTML = `<div class="backpack-item">
                                    <div>
                                        <span class="backpack-item-name">${itemName}</span> (擁有: ${itemCount})
                                    </div>
                                    <button class="use-item-btn" onclick="usePrimalSeed()">使用</button>
                                </div>`;
                } else {
                     itemHTML = `<div class="backpack-item"><span class="backpack-item-name">${itemName}</span><span class="backpack-item-quantity">${itemCount}</span></div>`;
                }
                specialItemsHTML += itemHTML;
            }
        });
    } else {
        specialItemsHTML = "<p>你沒有任何特殊物品。</p>";
    }
    
    const newSpecialMaterials = ["魔王之心", "遠古龍鱗", "暴虐之爪", "高頻刀刃", "量子核心"];
    newSpecialMaterials.forEach(mat => {
        if (player.backpack[mat] > 0 && !fragmentItems.includes(mat)) {
             fragmentItems.push(mat);
        }
    });

    let fragmentInputsHTML = ''; 
    if (fragmentItems.length > 0) { 
        fragmentItems.sort().forEach(itemName => {
            if(player.backpack[itemName] > 0) fragmentInputsHTML += `<div class="crafting-selection-item"><span>${itemName} (擁有: ${player.backpack[itemName]})</span><input type="number" class="craft-input" data-item-name="${itemName}" value="0" min="0" max="${player.backpack[itemName]}"></div>`; 
        }); 
    }
    
    const shadowFragmentCount = player.backpack["暗影碎片"] || 0;
    if(shadowFragmentCount > 0){
        fragmentInputsHTML += `<div class="crafting-selection-item"><span>暗影碎片 (擁有: ${shadowFragmentCount})</span><input type="number" class="craft-input" data-item-name="暗影碎片" value="0" min="0" max="${shadowFragmentCount}"></div>`;
    }

    const craftableMaterials = ["黃晶", "綠晶", "紅晶", "月見 I", "月見 II", "月見 III", "月見晶石", "劍刃", "碎刃", "神刃", "時空刃", "時空石", "遠古核心"]; 
    craftableMaterials.forEach(matName => {
        const matCount = player.backpack[matName] || 0;
        if (matCount > 0 && !fragmentItems.includes(matName) && !specialItems.includes(matName)) {
            fragmentInputsHTML += `<div class="crafting-selection-item"><span>${matName} (擁有: ${matCount})</span><input type="number" class="craft-input" data-item-name="${matName}" value="0" min="0" max="${matCount}"></div>`;
        }
    });

    if (fragmentInputsHTML === '') {
        fragmentInputsHTML = '<p>你沒有任何碎片可以打造。</p>';
    }

    const hiltOwned = player.backpack["青光劍柄"] || 0; 
    
    const recipeHints = specialRecipes.map(r => {
        const ingredientsString = Object.entries(r.composition).map(([key, val]) => {
            if (player.discoveredRecipes && player.discoveredRecipes[r.name] && player.discoveredRecipes[r.name][key]) {
                return `${key} x${val}`; 
            } else {
                return `？？？ x${val}`; 
            }
        }).join(', ');
        return `<li><b>${r.name}:</b> ${ingredientsString}</li>`;
    }).join('');
    
    const weaponHpDisplay = isShortLived ? '' : `<p>HP+: <span id="weapon-hp-bonus">${player.weaponStats.hp}</span></p>`;
    const previewHpDisplay = isShortLived ? '' : `<p>HP+: <span id="preview-hp">0</span></p>`;

    contentBackpack.innerHTML = `
        <h3>我的物品</h3>
        ${specialItemsHTML}
        <div id="weaponArea">
            <h3>目前武器</h3>
            <h4 id="weapon-name-display" style="color: #3498db; margin-top: -5px; margin-bottom: 10px; text-align: center;">${player.weaponStats.name}</h4>
            <div class="crafting-preview" style="margin-top:0; border-color: #aed6f1; background-color: #eaf2f8;">
                ${weaponHpDisplay}
                <p>ATK+: <span id="weapon-atk-bonus">${player.weaponStats.atk}</span></p>
                <p>SPD+: <span id="weapon-spd-bonus">${player.weaponStats.spd}</span></p>
            </div>
        </div>
        <div id="craftingArea">
            <h3>武器打造</h3>
            <div class="crafting-selection-item" style="padding: 10px; background-color: #eaf2f8;">
                <label for="use-hilt-checkbox">使用青光劍柄 (擁有: ${hiltOwned})</label>
                <input type="checkbox" id="use-hilt-checkbox" ${hiltOwned > 0 ? '' : 'disabled'}>
            </div>
            <div id="crafting-selection">${fragmentInputsHTML}</div>
            <div class="crafting-preview">
                <h4>預覽屬性:</h4>
                ${previewHpDisplay}
                <p>ATK+: <span id="preview-atk">0</span></p>
                <p>SPD+: <span id="preview-spd">0</span></p>
                <p>使用物品數: <span id="preview-fragments">0</span></p>
            </div>
            <button id="craft-weapon-button" class="buy-btn" disabled>打造武器</button>
        </div> 
        <div class="crafting-preview" style="margin-top: 20px;">
            <h4>特殊配方提示:</h4>
            <ul style="font-size: 0.8em; padding-left: 20px; margin: 0;">${recipeHints}</ul>
        </div>`; 
}

function renderAbilityShopItems() {
    contentAbilities.innerHTML = '';
    if (activeTrial && activeTrial.id === 'shortLivedTrial') {
        contentAbilities.innerHTML = '<p>短命試煉中無法使用招式。</p>';
        return;
    }
    for (const abilityName in allAbilities) {
        const abilityDef = allAbilities[abilityName];

        let isExclusiveAndNotAllowed = false;
        if (abilityDef.exclusiveTo) {
            if (Array.isArray(abilityDef.exclusiveTo)) {
                if (!abilityDef.exclusiveTo.includes(player.profession)) {
                    isExclusiveAndNotAllowed = true;
                }
            } else if (typeof abilityDef.exclusiveTo === 'string') {
                if (!player.profession.includes(abilityDef.exclusiveTo)) { // Changed to includes for "短命方塊 | 改"
                    isExclusiveAndNotAllowed = true;
                }
            }
        }

        if (
            (abilityDef.isConditional && !player.abilities[abilityName]?.learned) ||
            isExclusiveAndNotAllowed ||
            (abilityDef.forbiddenTo && abilityDef.forbiddenTo.includes(player.profession))
        ) {
            continue;
        }

        const playerAbility = player.abilities[abilityName];
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('shop-item');
        
        const itemInfoDiv = document.createElement('div');
        itemInfoDiv.classList.add('shop-item-info');
        
        const title = document.createElement('h3');
        title.textContent = abilityDef.name;
        
        const description = document.createElement('p');
        const levelReq = document.createElement('p');
        const costSpan = document.createElement('span');

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('shop-item-buttons');

        if (playerAbility?.learned) {
            const isMaxLevel = (abilityDef.maxLevel !== undefined && playerAbility.level >= abilityDef.maxLevel);

            const currentLevelSpan = document.createElement('span');
            currentLevelSpan.classList.add('shop-item-current-level');
            currentLevelSpan.textContent = isMaxLevel ? ` (Lv.MAX)` : ` (Lv.${playerAbility.level})`;
            title.appendChild(currentLevelSpan);

            const ppSpan = document.createElement('span');
            ppSpan.classList.add('shop-item-uses');
            ppSpan.textContent = ` (PP: ${playerAbility.currentPP}/${playerAbility.maxPP})`;
            title.appendChild(ppSpan);

            description.textContent = abilityDef.getEffectDescription(playerAbility.level);
            
            if (isMaxLevel) {
                 levelReq.textContent = `已達最高等級`;
                 costSpan.style.display = 'none';

                 const priorityButton = document.createElement('button');
                 priorityButton.textContent = (player.priorityAbility === abilityName) ? '取消優先' : '設為優先';
                 priorityButton.classList.add('priority-btn-main');
                 if (player.priorityAbility === abilityName) priorityButton.classList.add('active');
                 priorityButton.onclick = () => togglePriorityAbility(abilityName);
                 buttonsContainer.appendChild(priorityButton);

            } else {
                if (abilityDef.maxLevel) {
                    levelReq.textContent = `最高等級: ${abilityDef.maxLevel}`;
                } else {
                    levelReq.textContent = `可無限升級`;
                }
                costSpan.classList.add('shop-item-sp-cost');
                costSpan.textContent = `${abilityDef.upgradeCostSP} 技能點`;

                const upgradeButton = document.createElement('button');
                upgradeButton.textContent = '升級';
                upgradeButton.classList.add('upgrade-btn');
                upgradeButton.disabled = player.sp < abilityDef.upgradeCostSP;
                upgradeButton.onclick = () => upgradeAbility(abilityName);
                buttonsContainer.appendChild(upgradeButton);

                const priorityButton = document.createElement('button');
                priorityButton.classList.add('priority-btn-main');
                priorityButton.textContent = (player.priorityAbility === abilityName) ? '取消優先' : '設為優先';
                if (player.priorityAbility === abilityName) priorityButton.classList.add('active');
                priorityButton.onclick = () => togglePriorityAbility(abilityName);
                buttonsContainer.appendChild(priorityButton);
            }
        } else {
            description.textContent = abilityDef.description;
            levelReq.textContent = `等級需求: ${abilityDef.levelRequired}`;
            costSpan.classList.add('shop-item-sp-cost');
            costSpan.textContent = `${abilityDef.spCost} 技能點`;
            
            const learnButton = document.createElement('button');
            learnButton.textContent = '學習';
            learnButton.classList.add('buy-btn');
            learnButton.disabled = player.sp < abilityDef.spCost || player.level < abilityDef.levelRequired;
            learnButton.onclick = () => learnAbility(abilityName);
            buttonsContainer.appendChild(learnButton);
        }

        itemInfoDiv.appendChild(title);
        itemInfoDiv.appendChild(description);
        itemInfoDiv.appendChild(levelReq);
        
        itemDiv.appendChild(itemInfoDiv);
        itemDiv.appendChild(costSpan);
        itemDiv.appendChild(buttonsContainer); 
        
        contentAbilities.appendChild(itemDiv);
    }
}

function renderSynthesisRecipes() {
    contentSynthesis.innerHTML = '<p>將 10 個相同的碎片合成為 1 個暗影碎片。</p>';
    let foundSynthOption = false;
    const synthCost = getDiscountedCost(100);

    for (const itemName in player.backpack) {
        if (itemName.endsWith('碎片') && itemName !== '暗影碎片' && player.backpack[itemName] >= 10) {
            foundSynthOption = true;
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('synthesis-item');
            recipeDiv.innerHTML = `
                <div class="synthesis-output">合成: 暗影碎片 x 1</div>
                <div class="synthesis-ingredients"><span>- ${itemName} x 10</span></div>
                <div class="synthesis-cost">花費: ${synthCost} 金錢</div>
                <button class="buy-btn" onclick="synthesizeItem('shadow_fragment', '${itemName}')" ${currentMoney < synthCost ? 'disabled' : ''}>合成</button>
            `;
            contentSynthesis.appendChild(recipeDiv);
        }
    }

    if (!foundSynthOption) {
        contentSynthesis.innerHTML += '<p>你沒有足夠的碎片來合成暗影碎片。</p>';
    }
}

function equipRelic(relicIndex) {
    if (relicIndex < 0 || relicIndex >= player.relics.length) return;
    
    const relicToEquip = player.relics.splice(relicIndex, 1)[0];

    if (player.equippedRelic) {
        player.relics.push(player.equippedRelic);
    }
    
    player.equippedRelic = relicToEquip;
    updateAllDisplays();
}

function unequipRelic() {
    if (!player.equippedRelic) return;
    
    player.relics.push(player.equippedRelic);
    player.equippedRelic = null;
    updateAllDisplays();
}

function synthesizeRelic(relicName, relicRarity) {
    const rarityData = RELIC_RARITY_DATA[relicRarity + 1];
    if (!rarityData) {
        gameMessage.textContent = "此遺物已達最高品級！";
        return;
    }

    const relicsToSynthesize = player.relics.filter(r => r.name === relicName && r.rarity === relicRarity);
    if (relicsToSynthesize.length < 3) {
        gameMessage.textContent = "材料不足！";
        return;
    }
    let removedCount = 0;
    player.relics = player.relics.filter(r => {
        if (r.name === relicName && r.rarity === relicRarity && removedCount < 3) {
            removedCount++;
            return false;}return true;});
    const baseRelic = allRelics.find(r => r.name === relicName);
    const newRarity = relicRarity + 1;
    const multiplier = RELIC_RARITY_MULTIPLIERS[newRarity];
    const newBonus = (baseRelic.minBonus + baseRelic.maxBonus) / 2 * multiplier;

    const newRelic = {
        ...baseRelic,
        rarity: newRarity,
        bonus: parseFloat(newBonus.toFixed(2))
    };
    player.relics.push(newRelic);
    
    gameMessage.textContent = `成功合成【${rarityData.name}的 ${relicName}】！`;
    updateAllDisplays();
}


function renderRelics() {
    const contentRelics = document.getElementById('contentRelics');
    contentRelics.innerHTML = '';
    let equippedHTML = '<div class="equipped-relic-area"><h3>目前裝備</h3>';
    if (player.equippedRelic) {
        const relic = player.equippedRelic;
        const rarityInfo = RELIC_RARITY_DATA[relic.rarity];
        const template = allRelics.find(t => t.id === relic.id);
        const description = template.description.replace('{bonus}', relic.bonus);
        equippedHTML += `
            <div class="relic-item ${rarityInfo.class}">
                <div class="relic-info">
                    <span class="relic-name">[${rarityInfo.name}] ${relic.name}</span>
                    <span class="relic-effect">${description}</span>
                </div>
                <button class="relic-btn unequip-btn" onclick="unequipRelic()">卸下</button>
            </div>`;
    } else {
        equippedHTML += '<p>沒有裝備任何遺物。</p>';
    }
    equippedHTML += '</div>';
    contentRelics.innerHTML += equippedHTML;
    const groupedRelics = player.relics.reduce((acc, relic) => {
        const key = `${relic.name}_${relic.rarity}`;
        if (!acc[key]) {
            acc[key] = { ...relic, count: 0 };
        }
        acc[key].count++;
        return acc;
    }, {});
    
    let synthesisHTML = '<div class="relic-synthesis-area"><h3>遺物合成</h3>';
    let foundSynthOption = false;
    for (const key in groupedRelics) {
        const group = groupedRelics[key];
        if (group.count >= 3 && group.rarity < Object.keys(RELIC_RARITY_DATA).length - 1) {
            foundSynthOption = true;
            const currentRarityInfo = RELIC_RARITY_DATA[group.rarity];
            const nextRarityInfo = RELIC_RARITY_DATA[group.rarity + 1];
            synthesisHTML += `
                <div class="relic-item ${currentRarityInfo.class}">
                    <div class="relic-info">
                        <span class="relic-name">合成: [${nextRarityInfo.name}] ${group.name}</span>
                        <span class="relic-effect">需要: [${currentRarityInfo.name}] ${group.name} x3 (擁有:${group.count})</span>
                    </div>
                    <button class="relic-btn synth-btn" onclick="synthesizeRelic('${group.name}', ${group.rarity})">合成</button>
                </div>`;
        }
    }
    if (!foundSynthOption) {
        synthesisHTML += '<p>沒有可合成的遺物。</p>';
    }
    synthesisHTML += '</div>';
    contentRelics.innerHTML += synthesisHTML;
    let backpackHTML = '<div class="relic-backpack-area"><h3>遺物背包</h3>';
    if (player.relics.length > 0) {
        player.relics.forEach((relic, index) => {
            const rarityInfo = RELIC_RARITY_DATA[relic.rarity];
            const template = allRelics.find(t => t.id === relic.id);
            const description = template.description.replace('{bonus}', relic.bonus);
            backpackHTML += `
                <div class="relic-item ${rarityInfo.class}">
                    <div class="relic-info">
                        <span class="relic-name">[${rarityInfo.name}] ${relic.name}</span>
                        <span class="relic-effect">${description}</span>
                    </div>
                    <button class="relic-btn equip-btn" onclick="equipRelic(${index})">裝備</button>
                </div>`;
        });
    } else {
        backpackHTML += '<p>背包是空的。</p>';
    }
    backpackHTML += '</div>';
    contentRelics.innerHTML += backpackHTML;}

// --- Custom Modal System ---
const customModalOverlay = document.getElementById('customModalOverlay');
const customModalTitle = document.getElementById('customModalTitle');
const customModalMessage = document.getElementById('customModalMessage');
const customModalOptions = document.getElementById('customModalOptions');

function showCustomAlert(message, title = "提示") {
    customModalTitle.textContent = title;
    customModalMessage.textContent = message;
    customModalOptions.innerHTML = '';

    const okButton = document.createElement('button');
    okButton.textContent = "確定";
    okButton.classList.add('btn-green'); 
    okButton.onclick = hideCustomModal;
    customModalOptions.appendChild(okButton);
    
    customModalOverlay.style.display = 'flex';
}

function showCustomConfirm(message, onConfirm, onCancel = null, options = {}) {
    customModalTitle.textContent = options.title || "請確認";
    customModalMessage.textContent = message;
    customModalOptions.innerHTML = '';

    const confirmButton = document.createElement('button');
    confirmButton.textContent = options.confirmText || "確定";
    confirmButton.classList.add('btn-green'); 
    confirmButton.onclick = () => {
        hideCustomModal();
        if (onConfirm) onConfirm();
    };
    const cancelButton = document.createElement('button');
    cancelButton.textContent = options.cancelText || "取消";
    cancelButton.classList.add('btn-red'); 
    cancelButton.onclick = () => {
        hideCustomModal();
        if (onCancel) onCancel();
    };
    customModalOptions.appendChild(cancelButton);
    customModalOptions.appendChild(confirmButton);
    
    customModalOverlay.style.display = 'flex';
}

function hideCustomModal() {
    customModalOverlay.style.display = 'none';
}